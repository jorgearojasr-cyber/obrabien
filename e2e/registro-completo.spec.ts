import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";

/**
 * E2E: flujo completo de Fase 1 — registro básico → dedup de RUT → búsqueda
 * pública → cola de revisión admin → rechazo → reenvío → aprobación.
 *
 * Dos desviaciones deliberadas respecto al enunciado original de 8 pasos,
 * necesarias por cómo funciona realmente el state machine de perfil_estado
 * (documentadas también en el reporte final, no son bugs, son el diseño
 * actual de la app):
 *
 *  - Bridge 3.5 (tras el paso 5): registro-basico deja perfil_estado='basico',
 *    NO 'pendiente_revision'. Para que el paso 6 (aparece en
 *    /admin/revision-perfiles, que filtra por pendiente_revision) tenga
 *    sentido, se simula un reenvío del wizard completo vía POST autenticado
 *    a /api/update-profile (mismos datos + comunas), que es lo que la UI del
 *    wizard haría — no se llenan las ~15 pantallas del wizard por UI.
 *  - Bridge 7.5 (tras el paso 7): el botón "Aprobar" solo existe para filas
 *    en pendiente_revision — el panel no tiene forma de aprobar un perfil ya
 *    rechazado sin que el maestro reenvíe primero (eso es correcto, no un
 *    hueco). Se repite el mismo bridge de reenvío antes del paso 8 para que
 *    la aprobación se pueda ejercer vía la UI real del admin.
 *
 * Verificación de Resend (aprobación/rechazo): best-effort vía `vercel logs`
 * en background durante la acción — no bloquea el resultado del test si es
 * inconcluyente, se reporta aparte.
 *
 * Cuentas de prueba: modo test de Clerk (+clerk_test, código fijo 424242).
 * Limpieza en afterAll: Clerk (ambos usuarios) + fila de maestros en Supabase.
 */

const OTP_CODE = "424242";
const PASSWORD = "ObraBien-e2e-2026!";
const STAMP = Date.now();
const EMAILS = {
  principal: `obrabien+clerk_test_${STAMP}_a@example.com`,
  duplicado: `obrabien+clerk_test_${STAMP}_b@example.com`,
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();

// ── RUT válido generado (mismo algoritmo mod-11 que maestro-shared.ts) ───────

function generateValidRut(): string {
  const body = String(Math.floor(10_000_000 + Math.random() * 15_000_000));
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rem = 11 - (sum % 11);
  const verifier = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  const dotted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dotted}-${verifier}`;
}

function randomPhoneDigits(): string {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999)).slice(0, 8);
}

const RUT_COMPARTIDO = generateValidRut();

// ── Clerk backend helpers (mismo patrón que registro-routing.spec.ts) ────────

const CLERK_API = "https://api.clerk.com/v1";
function clerkHeaders() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("CLERK_SECRET_KEY no está en el entorno (¿.env.local?)");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function clerkFindUserId(email: string): Promise<string | null> {
  const res = await fetch(`${CLERK_API}/users?email_address=${encodeURIComponent(email)}`, { headers: clerkHeaders() });
  if (!res.ok) return null;
  const users = (await res.json()) as Array<{ id: string }>;
  return users[0]?.id ?? null;
}

async function clerkDeleteUser(userId: string): Promise<boolean> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, { method: "DELETE", headers: clerkHeaders() });
  return res.ok;
}

// ── Supabase helpers (requieren SUPABASE_SERVICE_ROLE_KEY en .env.local) ─────

// Detecta si la key configurada es realmente 'service_role' y no 'anon'/
// 'publishable' — un anon key puede SELECT (hay política pública de lectura
// para /buscar) pero no DELETE, y Supabase reporta eso como "0 filas
// afectadas" en vez de un error explícito. Verificado en vivo: exactamente
// este caso dejó una fila de prueba huérfana en producción.
function assertServiceRoleKey(key: string): void {
  if (key.startsWith("sb_secret_")) return;
  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY parece ser la key 'publishable' (anon), no la 'secret' (service_role). " +
      "Cópiala de nuevo desde Settings → API en el dashboard de Supabase — la fila marcada 'service_role', no 'anon'/'public'."
    );
  }
  const parts = key.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as { role?: string };
      if (payload.role && payload.role !== "service_role") {
        throw new Error(
          `SUPABASE_SERVICE_ROLE_KEY tiene role="${payload.role}" en el JWT — se esperaba "service_role". ` +
          "Cópiala de nuevo desde Settings → API — la fila 'service_role', no 'anon'."
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("service_role")) throw err;
      // JWT con formato inesperado: no bloquear por esto, solo la validación de rol importa.
    }
  }
}

function supabaseCreds() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está en .env.local — este spec verifica columnas " +
      "(terminos_aceptados, rechazo_motivo, perfil_estado) que no tienen ninguna superficie de UI."
    );
  }
  assertServiceRoleKey(key);
  return { url, key };
}

async function supabaseSelectMaestro(clerkUserId: string): Promise<Record<string, unknown> | null> {
  const { url, key } = supabaseCreds();
  const res = await fetch(`${url}/rest/v1/maestros?clerk_user_id=eq.${encodeURIComponent(clerkUserId)}&select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`Supabase select falló: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows[0] ?? null;
}

async function supabaseDeleteMaestroRows(clerkUserIds: string[]): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || clerkUserIds.length === 0) return "skip (sin credenciales o sin ids)";
  const filter = clerkUserIds.map(id => `"${id}"`).join(",");

  // Contar cuántas filas existen ANTES de borrar. Un DELETE que responde 200
  // pero no borra nada (por ejemplo, key sin permisos de escritura) debe
  // tratarse como fallo explícito, no como "0 fila(s) borradas" silencioso.
  const before = await fetch(`${url}/rest/v1/maestros?clerk_user_id=in.(${filter})&select=id`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const existing = before.ok ? ((await before.json()) as { id: string }[]) : [];

  const res = await fetch(`${url}/rest/v1/maestros?clerk_user_id=in.(${filter})`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" },
  });
  if (!res.ok) return `ERROR ${res.status}`;
  const deleted = (await res.json()) as unknown[];

  if (existing.length > 0 && deleted.length === 0) {
    throw new Error(
      `LIMPIEZA FALLÓ: había ${existing.length} fila(s) de prueba en maestros pero el DELETE borró 0 — ` +
      `probable key sin permisos de escritura (revisa que SUPABASE_SERVICE_ROLE_KEY sea 'service_role', no 'anon'). ` +
      `Fila(s) huérfana(s), borrar manualmente: ${JSON.stringify(existing)}`
    );
  }
  return `${deleted.length} fila(s) borradas`;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

async function signUpMaestro(page: Page, email: string): Promise<void> {
  await setupClerkTestingToken({ page });
  await page.goto("/registro?tab=maestro");
  await page.getByPlaceholder("tu@correo.cl").fill(email);
  await page.getByPlaceholder("Crea tu contraseña").fill(PASSWORD);
  await page.getByPlaceholder("Repite tu contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: /Crear cuenta/ }).click();
  await page.getByPlaceholder("123456").fill(OTP_CODE);
  await page.getByRole("button", { name: /Verificar y crear cuenta/ }).click();
  await page.waitForURL(u => !u.pathname.startsWith("/registro"), { timeout: 45_000 });
}

type RegistroBasicoData = { nombre: string; rut: string; telefono8: string; especialidad: string };

async function fillRegistroBasico(page: Page, data: RegistroBasicoData): Promise<void> {
  await page.waitForURL(/\/dashboard\/maestro\/registro-basico/, { timeout: 20_000 });
  await page.getByPlaceholder("Ej: Juan Pérez González").fill(data.nombre);
  await page.getByPlaceholder("12.345.678-9").fill(data.rut);
  const textInputs = page.locator('form input:not([type="checkbox"])');
  await textInputs.nth(2).fill(`+56 9 ${data.telefono8}`);
  await page.locator("select").selectOption(data.especialidad);
}

// Locator seguro para la tarjeta de UN maestro específico en
// /admin/revision-perfiles, contra producción (puede haber otros perfiles
// reales pendientes al mismo tiempo). Se ancla al link "Ver perfil público"
// (href=/maestro/{id}, único por maestro) y sube al div contenedor más
// cercano que tenga botones — evitar esto habría arriesgado clickear el
// Aprobar/Rechazar de OTRO maestro real si se localizaba solo por texto.
function adminCardFor(page: Page, maestroId: string) {
  return page.locator(`xpath=//a[@href="/maestro/${maestroId}"]/ancestor::div[.//button][1]`);
}

// ── Resend verification (best-effort, non-blocking) ──────────────────────────

async function checkResendViaVercelLogs(matchText: string): Promise<{ checked: boolean; ok: boolean | null; detail: string }> {
  try {
    const { spawn } = await import("child_process");
    const chunks: Buffer[] = [];
    const child = spawn("npx", ["vercel", "logs", "--environment", "production"], { shell: true });
    child.stdout.on("data", d => chunks.push(d));
    child.stderr.on("data", d => chunks.push(d));
    await new Promise(resolve => {
      child.on("close", resolve);
      setTimeout(() => { child.kill(); resolve(null); }, 15_000);
    });
    const out = Buffer.concat(chunks).toString("utf8");
    if (out.includes(matchText)) return { checked: true, ok: true, detail: `log encontrado: "${matchText}"` };
    if (out.includes("Resend error")) return { checked: true, ok: false, detail: "se encontró un log de error de Resend" };
    return { checked: false, ok: null, detail: "vercel logs no mostró la línea esperada en la ventana de captura (retención/latencia de logs, no concluyente)" };
  } catch (err) {
    return { checked: false, ok: null, detail: `no se pudo ejecutar vercel logs: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe("Fase 1 — flujo completo de registro de maestro", () => {
  test.setTimeout(180_000);

  let clerkIdPrincipal: string | null = null;
  let clerkIdDuplicado: string | null = null;
  let maestroRowId: string | null = null;
  const resendResults: Record<string, { checked: boolean; ok: boolean | null; detail: string }> = {};

  test("flujo completo", async ({ page, browser }) => {
    expect(ADMIN_EMAIL, "ADMIN_EMAIL debe estar configurado para el paso de admin").toBeTruthy();
    supabaseCreds(); // falla temprano y claro si falta la key, antes de crear cuentas

    await test.step("1. Signup nuevo llega a registro-basico", async () => {
      await signUpMaestro(page, EMAILS.principal);
      // signUpMaestro solo espera "salir de /registro" — la cadena de redirects
      // del servidor (…/dashboard?role=maestro → …/dashboard/maestro/registro-basico)
      // puede seguir en curso al volver. Se espera el destino final explícitamente.
      await page.waitForURL(/\/dashboard\/maestro\/registro-basico/, { timeout: 20_000 });
      clerkIdPrincipal = await clerkFindUserId(EMAILS.principal);
      expect(clerkIdPrincipal).toBeTruthy();
      expect(page.url()).toContain("/dashboard/maestro/registro-basico");
      console.log("[OK] Paso 1 — URL:", page.url());
    });

    await test.step("2. Enviar sin marcar T&C → banner de error, no se envía", async () => {
      await fillRegistroBasico(page, { nombre: "Maestro Prueba E2E", rut: RUT_COMPARTIDO, telefono8: randomPhoneDigits(), especialidad: "Electricidad" });
      await page.getByRole("button", { name: /Crear mi perfil/ }).click();
      await expect(page.getByText("Debes aceptar los Términos y Condiciones para registrarte.")).toBeVisible({ timeout: 5_000 });
      expect(page.url()).toContain("/dashboard/maestro/registro-basico");
      console.log("[OK] Paso 2 — banner de error visible, sin enviar");
    });

    await test.step("3. Enviar completo con T&C aceptado → redirige y guarda terminos_aceptados", async () => {
      await page.locator('input[type="checkbox"]').check();
      await page.getByRole("button", { name: /Crear mi perfil/ }).click();
      await page.waitForURL(/\/dashboard\/maestro(?!\/)/, { timeout: 20_000 });
      expect(page.url()).not.toContain("registro-basico");

      const row = await supabaseSelectMaestro(clerkIdPrincipal!);
      expect(row, "debe existir una fila en maestros").toBeTruthy();
      maestroRowId = row!.id as string;
      expect(row!.terminos_aceptados).toBe(true);
      expect(row!.terminos_aceptados_at).toBeTruthy();
      expect(row!.perfil_estado).toBe("basico");
      console.log("[OK] Paso 3 — URL:", page.url(), "| terminos_aceptados=true | maestroId:", maestroRowId);
    });

    await test.step("4. Segunda cuenta con el mismo RUT → 409 duplicado", async () => {
      const page2 = await browser.newPage();
      await signUpMaestro(page2, EMAILS.duplicado);
      clerkIdDuplicado = await clerkFindUserId(EMAILS.duplicado);
      expect(clerkIdDuplicado).toBeTruthy();

      await fillRegistroBasico(page2, { nombre: "Maestro Duplicado E2E", rut: RUT_COMPARTIDO, telefono8: randomPhoneDigits(), especialidad: "Gasfitería" });
      await page2.locator('input[type="checkbox"]').check();
      await page2.getByRole("button", { name: /Crear mi perfil/ }).click();
      await expect(page2.getByText("Este RUT ya está registrado en ObraBien")).toBeVisible({ timeout: 10_000 });
      expect(page2.url()).toContain("/dashboard/maestro/registro-basico");
      console.log("[OK] Paso 4 — 409 duplicado mostrado correctamente");
      await page2.close();
    });

    await test.step("5. El perfil aparece en la búsqueda pública", async () => {
      await page.goto("/buscar");
      await expect(page.getByText("Maestro Prueba E2E").first()).toBeVisible({ timeout: 20_000 });
      console.log("[OK] Paso 5 — perfil visible en /buscar");
    });

    await test.step("[bridge] reenvío del wizard → pendiente_revision", async () => {
      const res = await page.request.post("/api/update-profile", {
        data: {
          nombre: "Maestro Prueba E2E", rut: RUT_COMPARTIDO, telefono: `+56 9 ${randomPhoneDigits()}`,
          especialidades: ["Electricidad"], comunas: ["Santiago"], descripcion: "Perfil de prueba E2E",
        },
      });
      expect(res.ok(), `update-profile debe responder 2xx, dio ${res.status()}`).toBeTruthy();
      const row = await supabaseSelectMaestro(clerkIdPrincipal!);
      expect(row!.perfil_estado).toBe("pendiente_revision");
    });

    // ── Sesión de admin en un contexto de browser separado, sin tocar la sesión del maestro ──
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await test.step("6. Admin ve el perfil en /admin/revision-perfiles", async () => {
      await adminPage.goto("/");
      await clerk.loaded({ page: adminPage });
      await clerk.signIn({ page: adminPage, emailAddress: ADMIN_EMAIL });
      await adminPage.goto("/admin/revision-perfiles");
      await expect(adminCardFor(adminPage, maestroRowId!)).toBeVisible({ timeout: 15_000 });
      console.log("[OK] Paso 6 — perfil visible en /admin/revision-perfiles");
    });

    await test.step("7. Rechazar con motivo → perfil_estado=rechazado, rechazo_motivo guardado", async () => {
      const motivo = "Motivo de prueba E2E — datos incompletos.";
      const logCheckPromise = checkResendViaVercelLogs(`email de rechazar enviado a ${EMAILS.principal}`);

      const card = adminCardFor(adminPage, maestroRowId!);
      await card.getByRole("button", { name: /Rechazar/ }).click();
      await card.locator("textarea").fill(motivo);
      await card.getByRole("button", { name: /Confirmar rechazo/ }).click();
      // No se afirma sobre el badge "✕ Rechazado": el propio componente llama
      // router.refresh() tras la acción, que puede reemplazar la fila (la
      // query del servidor ya no la incluye al dejar de ser pendiente) antes
      // de que el badge llegue a observarse — timing no confiable. La fuente
      // de verdad real es la fila en Supabase.
      await adminPage.waitForTimeout(1500);

      const dbRow = await supabaseSelectMaestro(clerkIdPrincipal!);
      expect(dbRow!.perfil_estado).toBe("rechazado");
      expect(dbRow!.rechazo_motivo).toBe(motivo);

      resendResults.rechazar = await logCheckPromise;
      console.log("[OK] Paso 7 — perfil_estado=rechazado, rechazo_motivo guardado");
    });

    await test.step("[bridge] segundo reenvío tras rechazo → pendiente_revision de nuevo", async () => {
      const res = await page.request.post("/api/update-profile", {
        data: {
          nombre: "Maestro Prueba E2E", rut: RUT_COMPARTIDO, telefono: `+56 9 ${randomPhoneDigits()}`,
          especialidades: ["Electricidad"], comunas: ["Santiago"], descripcion: "Perfil de prueba E2E — reenviado",
        },
      });
      expect(res.ok()).toBeTruthy();
      const row = await supabaseSelectMaestro(clerkIdPrincipal!);
      expect(row!.perfil_estado).toBe("pendiente_revision");
      expect(row!.rechazo_motivo, "rechazo_motivo debe limpiarse al reenviar").toBeNull();
      console.log("[OK] Bridge 7.5 — perfil_estado=pendiente_revision de nuevo, rechazo_motivo limpio");
    });

    await test.step("8. Aprobar vía UI real del admin → perfil_estado=completo", async () => {
      const logCheckPromise = checkResendViaVercelLogs(`email de aprobar enviado a ${EMAILS.principal}`);

      await adminPage.goto("/admin/revision-perfiles");
      const card = adminCardFor(adminPage, maestroRowId!);
      await expect(card).toBeVisible({ timeout: 15_000 });
      await card.getByRole("button", { name: /Aprobar/ }).click();
      await adminPage.waitForTimeout(1500); // misma razón que en el paso 7

      const dbRow = await supabaseSelectMaestro(clerkIdPrincipal!);
      expect(dbRow!.perfil_estado).toBe("completo");
      expect(dbRow!.rechazo_motivo).toBeNull();

      resendResults.aprobar = await logCheckPromise;

      // Recheck de búsqueda pública post-aprobación. Nota: /buscar solo filtra
      // por `activo`, no por perfil_estado, así que esto no es una aserción
      // NUEVA respecto al paso 5 — se reporta igual por completitud.
      await page.goto("/buscar");
      await expect(page.getByText("Maestro Prueba E2E").first()).toBeVisible({ timeout: 20_000 });
      console.log("[OK] Paso 8 — perfil_estado=completo, visible en /buscar");
    });

    await adminContext.close();

    console.log("[resend-check] rechazar:", JSON.stringify(resendResults.rechazar));
    console.log("[resend-check] aprobar:", JSON.stringify(resendResults.aprobar));
  });

  test.afterAll(async () => {
    const ids: string[] = [];
    for (const [label, email] of Object.entries(EMAILS)) {
      const id = await clerkFindUserId(email);
      if (id) {
        ids.push(id);
        const ok = await clerkDeleteUser(id);
        console.log(`[cleanup] Clerk ${label} (${email}): ${ok ? "eliminado" : "ERROR al eliminar"}`);
      } else {
        console.log(`[cleanup] Clerk ${label} (${email}): no existe (nada que borrar)`);
      }
    }
    console.log(`[cleanup] Supabase maestros: ${await supabaseDeleteMaestroRows(ids)}`);
  });
});
