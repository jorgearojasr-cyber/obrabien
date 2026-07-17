import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";

/**
 * E2E: sistema de referidos de maestros, de punta a punta (migración 022 —
 * maestro_referidos, referido_por_maestro_id, procesar_referido, acreditar_referido).
 *
 * Requiere que la migración 022 ya esté aplicada en la base de Supabase contra
 * la que corre el test (local dev usa la misma base que producción) — el
 * preflight check falla temprano y con un mensaje claro si no lo está.
 *
 * Dos desviaciones deliberadas respecto al enunciado, documentadas aquí igual
 * que las de registro-completo.spec.ts:
 *
 *  - El "referente" se crea vía signup real de Clerk + registro-basico (no un
 *    INSERT directo en maestros) porque el punto 8 exige ver SU dashboard real
 *    (/dashboard/maestro), lo que requiere una sesión de Clerk válida. Lo que
 *    SÍ se hace "vía service-role" (como pide el enunciado) es saltarse el
 *    flujo de aprobación por UI: se fuerza perfil_estado='completo' con un
 *    UPDATE directo, porque la aprobación del referente no es lo que este
 *    spec prueba — la del maestro nuevo sí, y esa se hace 100% por UI real.
 *
 *  - [bridge] Para el paso 4 ("Guarda el wizard") y para el ciclo de
 *    rechazo/reenvío del caso borde, se llama a POST /api/update-profile
 *    directamente en vez de completar los ~15 campos del wizard por UI
 *    (foto, galería, horarios, etc.) — exactamente el mismo bridge documentado
 *    en registro-completo.spec.ts. Antes de cada bridge, sí se navega por la
 *    UI real hasta la sección "¿Cómo llegaste a ObraBien?" para verificar la
 *    precarga y el lookup en vivo (puntos 3 y 5), que es el corazón de lo que
 *    este spec debe probar. /admin/revision-perfiles solo lista perfiles con
 *    perfil_estado='pendiente_revision', así que el ciclo rechazar→reenviar→
 *    aprobar del caso borde también necesita el bridge entre rechazo y
 *    reaprobación (igual que el Bridge 7.5 del spec anterior).
 *
 * Cuentas de prueba: modo test de Clerk (+clerk_test, código fijo 424242).
 * Limpieza en afterAll: Clerk (referente + nuevo) + filas en maestros y
 * maestro_referidos en Supabase.
 */

const OTP_CODE = "424242";
const PASSWORD = "ObraBien-e2e-2026!";
const STAMP = Date.now();
const EMAILS = {
  referente: `obrabien+clerk_test_${STAMP}_ref@example.com`,
  nuevo:     `obrabien+clerk_test_${STAMP}_nuevo@example.com`,
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();

// ── RUT helpers (mismo algoritmo mod-11 que maestro-shared.ts) ───────────────

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

// Debe mantenerse equivalente a normalizeRut() en src/lib/maestro-shared.ts —
// sin puntos, guion antes del verificador, K en mayúscula.
function normalizeRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

function randomPhoneDigits(): string {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999)).slice(0, 8);
}

const RUT_REFERENTE = generateValidRut();
const RUT_NUEVO = generateValidRut();
const RUT_REFERENTE_NORM = normalizeRut(RUT_REFERENTE);

const NOMBRE_REFERENTE = `Maestro Referente E2E ${STAMP}`;
const NOMBRE_NUEVO = `Maestro Nuevo E2E ${STAMP}`;

// ── Clerk backend helpers (mismo patrón que registro-completo.spec.ts) ───────

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
      "SUPABASE_SERVICE_ROLE_KEY no está en .env.local — este spec verifica maestro_referidos y " +
      "referido_por_maestro_id directo en Supabase, sin superficie de UI para eso."
    );
  }
  assertServiceRoleKey(key);
  return { url, key };
}

async function sbFetch(path: string, init?: RequestInit): Promise<Response> {
  const { url, key } = supabaseCreds();
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation", ...(init?.headers ?? {}) },
  });
}

// Preflight: la migración 022 debe estar aplicada — si no, todo lo demás falla
// con errores confusos ("relation does not exist" / "function not found").
async function assertMigracion022Aplicada(): Promise<void> {
  const res = await sbFetch("maestro_referidos?select=id&limit=1");
  if (res.status === 404 || res.status === 400) {
    throw new Error(
      "La tabla maestro_referidos no existe — la migración 022_maestro_referidos.sql no está aplicada. " +
      "Córrela manualmente en el SQL Editor de Supabase antes de correr este spec."
    );
  }
  if (!res.ok) throw new Error(`Preflight de migración 022 falló: ${res.status} ${await res.text()}`);
}

async function supabaseSelectMaestro(clerkUserId: string): Promise<Record<string, unknown> | null> {
  const res = await sbFetch(`maestros?clerk_user_id=eq.${encodeURIComponent(clerkUserId)}&select=*`);
  if (!res.ok) throw new Error(`Supabase select falló: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Record<string, unknown>[];
  return rows[0] ?? null;
}

async function supabaseMarcarCompleto(maestroId: string): Promise<void> {
  const res = await sbFetch(`maestros?id=eq.${maestroId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfil_estado: "completo" }),
  });
  if (!res.ok) throw new Error(`No se pudo marcar al referente como completo: ${res.status} ${await res.text()}`);
}

async function supabaseSelectReferidos(maestroId: string, referidoMaestroId?: string): Promise<Record<string, unknown>[]> {
  const filtro = referidoMaestroId
    ? `maestro_referidos?maestro_id=eq.${maestroId}&referido_maestro_id=eq.${referidoMaestroId}&select=*`
    : `maestro_referidos?maestro_id=eq.${maestroId}&select=*`;
  const res = await sbFetch(filtro);
  if (!res.ok) throw new Error(`Supabase select maestro_referidos falló: ${res.status} ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>[];
}

async function supabaseDeleteMaestroRows(clerkUserIds: string[]): Promise<string> {
  if (clerkUserIds.length === 0) return "skip (sin ids)";
  const filter = clerkUserIds.map(id => `"${id}"`).join(",");

  const before = await sbFetch(`maestros?clerk_user_id=in.(${filter})&select=id`);
  const existing = before.ok ? ((await before.json()) as { id: string }[]) : [];

  const res = await sbFetch(`maestros?clerk_user_id=in.(${filter})`, { method: "DELETE" });
  if (!res.ok) return `ERROR ${res.status}`;
  const deleted = (await res.json()) as unknown[];

  if (existing.length > 0 && deleted.length === 0) {
    throw new Error(
      `LIMPIEZA FALLÓ: había ${existing.length} fila(s) de prueba en maestros pero el DELETE borró 0 — ` +
      `probable key sin permisos de escritura. Fila(s) huérfana(s), borrar manualmente: ${JSON.stringify(existing)}`
    );
  }
  return `${deleted.length} fila(s) borradas (${existing.length} esperadas)`;
}

async function supabaseDeleteReferidosRows(maestroId: string | null, referidoMaestroId: string | null): Promise<string> {
  if (!maestroId || !referidoMaestroId) return "skip (sin ids)";
  const before = await sbFetch(`maestro_referidos?maestro_id=eq.${maestroId}&referido_maestro_id=eq.${referidoMaestroId}&select=id`);
  const existing = before.ok ? ((await before.json()) as { id: string }[]) : [];

  const res = await sbFetch(`maestro_referidos?maestro_id=eq.${maestroId}&referido_maestro_id=eq.${referidoMaestroId}`, { method: "DELETE" });
  if (!res.ok) return `ERROR ${res.status}`;
  const deleted = (await res.json()) as unknown[];

  if (existing.length > 0 && deleted.length === 0) {
    throw new Error(
      `LIMPIEZA FALLÓ: había ${existing.length} fila(s) en maestro_referidos pero el DELETE borró 0. ` +
      `Fila(s) huérfana(s): ${JSON.stringify(existing)}`
    );
  }
  return `${deleted.length} fila(s) borradas (${existing.length} esperadas)`;
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
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: /Crear mi perfil/ }).click();
  await page.waitForURL(/\/dashboard\/maestro(?!\/)/, { timeout: 20_000 });
}

// Bridge — mismo POST que handleNext() en completar-perfil/page.tsx enviaría,
// sin pasar por la subida real de foto/galería (ver nota de cabecera).
async function bridgeGuardarWizard(page: Page, opts: { nombre: string; rut: string; referidoRut: string | null }): Promise<void> {
  const res = await page.request.post("/api/update-profile", {
    data: {
      nombre: opts.nombre, rut: opts.rut, telefono: `+56 9 ${randomPhoneDigits()}`,
      especialidades: ["Electricidad"], comunas: ["Santiago"], descripcion: "Perfil de prueba E2E — referidos",
      comoLlego: opts.referidoRut ? "Me lo recomendó un maestro" : null,
      referidoRut: opts.referidoRut,
    },
  });
  expect(res.ok(), `update-profile debe responder 2xx, dio ${res.status()}`).toBeTruthy();
}

// Locator seguro para la tarjeta de UN maestro específico en
// /admin/revision-perfiles (mismo patrón que registro-completo.spec.ts).
function adminCardFor(page: Page, maestroId: string) {
  return page.locator(`xpath=//a[@href="/maestro/${maestroId}"]/ancestor::div[.//button][1]`);
}

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe("Sistema de referidos de maestros", () => {
  test.setTimeout(300_000);

  let clerkIdReferente: string | null = null;
  let clerkIdNuevo: string | null = null;
  let referenteMaestroId: string | null = null;
  let nuevoMaestroId: string | null = null;

  test("flujo de referidos de punta a punta", async ({ page, browser }) => {
    expect(ADMIN_EMAIL, "ADMIN_EMAIL debe estar configurado para el paso de admin").toBeTruthy();
    await assertMigracion022Aplicada(); // valida rol de la key + que la migración exista, antes de crear nada

    await test.step("[setup] Crear referente ya aprobado (perfil_estado=completo vía service-role)", async () => {
      await signUpMaestro(page, EMAILS.referente);
      clerkIdReferente = await clerkFindUserId(EMAILS.referente);
      expect(clerkIdReferente, "cuenta del referente debe existir en Clerk").toBeTruthy();

      await fillRegistroBasico(page, {
        nombre: NOMBRE_REFERENTE, rut: RUT_REFERENTE, telefono8: randomPhoneDigits(), especialidad: "Electricidad",
      });

      const row = await supabaseSelectMaestro(clerkIdReferente!);
      expect(row, "debe existir fila del referente en maestros").toBeTruthy();
      referenteMaestroId = row!.id as string;

      // "vía service-role", como pide el enunciado — se salta la aprobación por
      // UI porque no es lo que este spec prueba (la del maestro nuevo sí lo es).
      await supabaseMarcarCompleto(referenteMaestroId);
      const rowActualizado = await supabaseSelectMaestro(clerkIdReferente!);
      expect(rowActualizado!.perfil_estado).toBe("completo");
      console.log("[OK] setup — referente creado y aprobado, id:", referenteMaestroId, "rut:", RUT_REFERENTE_NORM);
    });

    await test.step("2. /registro?ref=<rut-referente> guarda localStorage.obrabien_ref", async () => {
      await page.context().clearCookies();
      await page.goto(`/registro?tab=maestro&ref=${RUT_REFERENTE_NORM}`);
      const stored = await page.evaluate(() => localStorage.getItem("obrabien_ref"));
      expect(stored, "obrabien_ref debe existir en localStorage").toBeTruthy();
      const parsed = JSON.parse(stored!) as { rut?: string; ts?: number };
      expect(parsed.rut).toBe(RUT_REFERENTE_NORM);
      expect(parsed.ts).toBeGreaterThan(Date.now() - 5_000);
      console.log("[OK] Paso 2 — localStorage.obrabien_ref:", stored);
    });

    await test.step("3. Cuenta nueva + registro-basico + wizard: RUT precargado y lookup correcto", async () => {
      // signUpMaestro navega de nuevo a /registro?tab=maestro (sin ?ref=) — el
      // localStorage del paso 2 sobrevive porque persiste por origen, no por navegación.
      await signUpMaestro(page, EMAILS.nuevo);
      clerkIdNuevo = await clerkFindUserId(EMAILS.nuevo);
      expect(clerkIdNuevo, "cuenta del nuevo maestro debe existir en Clerk").toBeTruthy();

      await fillRegistroBasico(page, {
        nombre: NOMBRE_NUEVO, rut: RUT_NUEVO, telefono8: randomPhoneDigits(), especialidad: "Gasfitería",
      });

      const row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row, "debe existir fila del nuevo maestro en maestros").toBeTruthy();
      nuevoMaestroId = row!.id as string;
      expect(row!.perfil_estado).toBe("basico");

      await page.goto("/dashboard/maestro/completar-perfil");
      await expect(page.getByText("Completa tu perfil profesional")).toBeVisible({ timeout: 20_000 });

      // Salta directo al paso "04. Publicar" — hasExistingProfile ya es true
      // (la fila de registro-basico existe), así que el tab es clickeable sin
      // pasar por los pasos 1-3 del wizard.
      await page.locator(".step-tab", { hasText: "Publicar" }).click();

      const rutInput = page.getByPlaceholder("12.345.678-9");
      await expect(rutInput, "el RUT del referente debe venir precargado desde localStorage").toHaveValue(RUT_REFERENTE, { timeout: 10_000 });
      await expect(page.locator("select")).toHaveValue("Me lo recomendó un maestro");
      await expect(page.getByText(`✓ ${NOMBRE_REFERENTE}`), "el lookup en vivo debe mostrar el nombre del referente").toBeVisible({ timeout: 10_000 });
      console.log("[OK] Paso 3 — RUT precargado y lookup mostrando:", NOMBRE_REFERENTE);
    });

    await test.step("[bridge] Guardar wizard → pendiente_revision", async () => {
      await bridgeGuardarWizard(page, { nombre: NOMBRE_NUEVO, rut: RUT_NUEVO, referidoRut: RUT_REFERENTE });
      const row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("pendiente_revision");
    });

    await test.step("4. Atribución fijada en Supabase, sin crédito todavía", async () => {
      const row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.referido_por_maestro_id, "referido_por_maestro_id debe apuntar al referente").toBe(referenteMaestroId);

      const referidos = await supabaseSelectReferidos(referenteMaestroId!, nuevoMaestroId!);
      expect(referidos, "maestro_referidos no debe tener fila para este par todavía (sin crédito antes de aprobar)").toHaveLength(0);
      console.log("[OK] Paso 4 — referido_por_maestro_id:", row!.referido_por_maestro_id, "| maestro_referidos: 0 filas (esperado)");
    });

    await test.step("5. Recarga completar-perfil: campo de referido en solo lectura", async () => {
      await page.goto("/dashboard/maestro/completar-perfil");
      await expect(page.getByText("Completa tu perfil profesional")).toBeVisible({ timeout: 20_000 });
      await page.locator(".step-tab", { hasText: "Publicar" }).click();

      await expect(page.getByText(`Fuiste referido por: ${NOMBRE_REFERENTE}`), "debe mostrarse de solo lectura").toBeVisible({ timeout: 10_000 });
      await expect(page.getByPlaceholder("12.345.678-9"), "el input editable ya no debe existir").toHaveCount(0);
      await expect(page.locator("select"), "el select 'Cómo nos conociste' ya no debe existir").toHaveCount(0);
      console.log("[OK] Paso 5 — campo de referido inmutable y de solo lectura");
    });

    // ── Sesión de admin en un contexto separado ──
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/");
    await clerk.loaded({ page: adminPage });
    await clerk.signIn({ page: adminPage, emailAddress: ADMIN_EMAIL });

    await test.step("6. Aprobar vía UI real de /admin/revision-perfiles", async () => {
      await adminPage.goto("/admin/revision-perfiles");
      const card = adminCardFor(adminPage, nuevoMaestroId!);
      await expect(card).toBeVisible({ timeout: 15_000 });
      await card.getByRole("button", { name: /Aprobar/ }).click();
      await adminPage.waitForTimeout(1500); // router.refresh() puede reemplazar la fila antes de que el badge se observe

      const row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("completo");
      console.log("[OK] Paso 6 — aprobado vía UI, perfil_estado=completo");
    });

    await test.step("7. maestro_referidos ahora tiene la fila de crédito", async () => {
      const referidos = await supabaseSelectReferidos(referenteMaestroId!, nuevoMaestroId!);
      expect(referidos, "debe existir exactamente 1 fila de crédito").toHaveLength(1);
      expect(referidos[0].maestro_id).toBe(referenteMaestroId);
      expect(referidos[0].referido_maestro_id).toBe(nuevoMaestroId);
      console.log("[OK] Paso 7 — maestro_referidos:", JSON.stringify(referidos[0]));
    });

    // ── Sesión del referente en un contexto separado ──
    const referenteContext = await browser.newContext();
    const referentePage = await referenteContext.newPage();
    await referentePage.goto("/");
    await clerk.loaded({ page: referentePage });
    await clerk.signIn({ page: referentePage, emailAddress: EMAILS.referente });

    await test.step("8. Dashboard del referente: contador=1 y link con RUT normalizado", async () => {
      await referentePage.goto("/dashboard/maestro");
      await expect(referentePage.getByText("Invita a otros maestros")).toBeVisible({ timeout: 20_000 });
      await expect(referentePage.getByText("1 referido", { exact: true })).toBeVisible();
      await expect(referentePage.locator("code")).toContainText(`ref=${RUT_REFERENTE_NORM}`);
      console.log("[OK] Paso 8 — contador=1, link con ref=", RUT_REFERENTE_NORM);
    });

    await test.step("9. /admin/maestros muestra el nombre del referente validado", async () => {
      await adminPage.goto("/admin/maestros");
      const fila = adminPage.locator(`xpath=//a[@href="/maestro/${nuevoMaestroId}"]/parent::div`);
      await expect(fila).toBeVisible({ timeout: 15_000 });
      await expect(fila, "debe mostrar el nombre validado del referente").toContainText(`ref: ${NOMBRE_REFERENTE}`);
      await expect(fila, "no debe mostrar el RUT crudo sin validar").not.toContainText("sin validar");
      console.log("[OK] Paso 9 — admin/maestros muestra ref:", NOMBRE_REFERENTE, "(validado)");
    });

    await test.step("10. Caso borde: rechazar y reaprobar no duplica el crédito", async () => {
      // [bridge] reenvío antes de rechazar — revisar-perfil ya lo puso en 'completo',
      // y /admin/revision-perfiles solo lista 'pendiente_revision'.
      await bridgeGuardarWizard(page, { nombre: NOMBRE_NUEVO, rut: RUT_NUEVO, referidoRut: RUT_REFERENTE });
      let row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("pendiente_revision");
      expect(row!.referido_por_maestro_id, "la atribución sigue inmutable en el reenvío").toBe(referenteMaestroId);

      await adminPage.goto("/admin/revision-perfiles");
      const motivo = "Motivo de prueba E2E — caso borde de referidos.";
      let card = adminCardFor(adminPage, nuevoMaestroId!);
      await expect(card).toBeVisible({ timeout: 15_000 });
      await card.getByRole("button", { name: /Rechazar/ }).click();
      await card.locator("textarea").fill(motivo);
      await card.getByRole("button", { name: /Confirmar rechazo/ }).click();
      await adminPage.waitForTimeout(1500);

      row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("rechazado");

      // [bridge] segundo reenvío → pendiente_revision de nuevo
      await bridgeGuardarWizard(page, { nombre: NOMBRE_NUEVO, rut: RUT_NUEVO, referidoRut: RUT_REFERENTE });
      row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("pendiente_revision");

      await adminPage.goto("/admin/revision-perfiles");
      card = adminCardFor(adminPage, nuevoMaestroId!);
      await expect(card).toBeVisible({ timeout: 15_000 });
      await card.getByRole("button", { name: /Aprobar/ }).click();
      await adminPage.waitForTimeout(1500);

      row = await supabaseSelectMaestro(clerkIdNuevo!);
      expect(row!.perfil_estado).toBe("completo");

      const referidos = await supabaseSelectReferidos(referenteMaestroId!, nuevoMaestroId!);
      expect(referidos, "no debe duplicarse la fila de crédito tras rechazar/reaprobar").toHaveLength(1);

      await referentePage.reload();
      await expect(referentePage.getByText("1 referido", { exact: true }), "el contador no debe subir a 2").toBeVisible({ timeout: 20_000 });
      await expect(referentePage.getByText("2 referidos")).toHaveCount(0);
      console.log("[OK] Paso 10 — 1 sola fila en maestro_referidos tras rechazar/reaprobar, contador sigue en 1");
    });

    await adminContext.close();
    await referenteContext.close();
  });

  test.afterAll(async () => {
    console.log(`[cleanup] maestro_referidos: ${await supabaseDeleteReferidosRows(referenteMaestroId, nuevoMaestroId)}`);

    const ids: string[] = [];
    for (const [label, clerkId] of Object.entries({ referente: clerkIdReferente, nuevo: clerkIdNuevo })) {
      if (clerkId) {
        ids.push(clerkId);
        const ok = await clerkDeleteUser(clerkId);
        console.log(`[cleanup] Clerk ${label}: ${ok ? "eliminado" : "ERROR al eliminar"}`);
      } else {
        console.log(`[cleanup] Clerk ${label}: no se creó (nada que borrar)`);
      }
    }
    console.log(`[cleanup] Supabase maestros: ${await supabaseDeleteMaestroRows(ids)}`);
  });
});
