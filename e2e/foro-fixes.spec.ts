import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * E2E: los 5 fixes del foro de comunidad.
 *
 *  1. FORUM_POSTS (fixtures hardcodeados) ya no aparece en /comunidad.
 *  2. El botón "Cargar más discusiones" ya no existe en el DOM.
 *  3. Un post creado por una cuenta cliente (sin fila en maestros) muestra
 *     badge "Cliente", coherente con Supabase.
 *  4. Publicar → click "Ver el foro" (navegación cliente) muestra el post
 *     nuevo sin recargar — valida revalidatePath("/comunidad").
 *  5. La página de detalle /comunidad/[id] de un post real carga sin errores.
 *
 * IMPORTANTE: este spec debe correr contra el DEV SERVER LOCAL (modo por
 * defecto, sin E2E_BASE_URL) mientras los fixes no estén desplegados — contra
 * producción probaría el código viejo. El dev server local usa la MISMA base
 * de Supabase y la misma instancia dev de Clerk que producción, así que el
 * patrón +clerk_test / 424242 funciona igual y la limpieza es obligatoria.
 */

const OTP_CODE = "424242";
const PASSWORD = "ObraBien-e2e-2026!";
const STAMP = Date.now();
const EMAIL_CLIENTE = `obrabien+clerk_test_${STAMP}_foro@example.com`;

const TITULO_A = `Post E2E badge cliente ${STAMP}`;
const TITULO_B = `Post E2E revalidate ${STAMP}`;
const CONTENIDO =
  "Contenido de prueba E2E generado automáticamente para verificar los fixes del foro. Se elimina al final del test.";

// Nombres que SOLO existen en los fixtures FORUM_POSTS (los "Roberto M." /
// "Pedro R." abreviados del sidebar hardcodeado son strings distintos y no
// colisionan con estas aserciones de ausencia).
const SEED_MARKERS = ["Roberto Muñoz", "Luis Fuentes", "Pedro Rojas", "malla acma"];

// ── Key validation (mismo guard que registro-completo.spec.ts) ───────────────

function assertServiceRoleKey(key: string): void {
  if (key.startsWith("sb_secret_")) return;
  if (key.startsWith("sb_publishable_")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY parece ser la key 'publishable' (anon), no la 'secret' (service_role).");
  }
  const parts = key.split(".");
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as { role?: string };
    if (payload.role && payload.role !== "service_role") {
      throw new Error(`SUPABASE_SERVICE_ROLE_KEY tiene role="${payload.role}" — se esperaba "service_role".`);
    }
  }
}

function supabaseCreds() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local");
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

// ── Clerk backend helpers ─────────────────────────────────────────────────────

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

// ── UI helpers ────────────────────────────────────────────────────────────────

async function signUpCliente(page: Page, email: string): Promise<void> {
  await setupClerkTestingToken({ page });
  await page.goto("/registro?tab=cliente");
  await page.getByPlaceholder("tu@correo.cl").fill(email);
  await page.getByPlaceholder("Crea tu contraseña").fill(PASSWORD);
  await page.getByPlaceholder("Repite tu contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: /Crear cuenta/ }).click();
  await page.getByPlaceholder("123456").fill(OTP_CODE);
  await page.getByRole("button", { name: /Verificar y crear cuenta/ }).click();
  await page.waitForURL(u => !u.pathname.startsWith("/registro"), { timeout: 60_000 });
}

async function fillAndSubmitPost(page: Page, titulo: string): Promise<void> {
  await page.getByPlaceholder(/porcelanato/).fill(titulo);
  await page.locator("select.ob-select").selectOption("consultas");
  await page.getByPlaceholder(/Describe tu situación/).fill(CONTENIDO);
  await page.getByRole("button", { name: /Publicar en el foro/ }).click();
  await expect(page.getByText("¡Publicación enviada!")).toBeVisible({ timeout: 30_000 });
}

// Tarjeta del listado que contiene un título dado
function cardFor(page: Page, titulo: string) {
  return page.locator(".post-card", { hasText: titulo });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("fixes del foro de comunidad", () => {
  test.setTimeout(300_000); // dev server local: la primera compilación de cada ruta es lenta

  let clerkId: string | null = null;
  let postAId: string | null = null;

  test("los 5 fixes", async ({ page }) => {
    supabaseCreds(); // valida la key ANTES de crear nada

    await test.step("1. FORUM_POSTS (fixtures) no aparece en /comunidad", async () => {
      await page.goto("/comunidad");
      await expect(page.getByText("Foro de Maestros")).toBeVisible({ timeout: 60_000 });
      for (const marker of SEED_MARKERS) {
        await expect(page.getByText(marker), `"${marker}" es contenido de fixtures y no debe renderizarse`).toHaveCount(0);
      }
      console.log("[OK] Paso 1 — sin rastro de los 32 posts hardcodeados");
    });

    await test.step("2. Botón 'Cargar más discusiones' no existe en el DOM", async () => {
      await expect(page.getByText("Cargar más discusiones")).toHaveCount(0);
      console.log("[OK] Paso 2 — botón de paginación muerta eliminado del DOM");
    });

    await test.step("3. Post de cuenta cliente muestra badge 'Cliente' (coherente con Supabase)", async () => {
      await signUpCliente(page, EMAIL_CLIENTE);
      clerkId = await clerkFindUserId(EMAIL_CLIENTE);
      expect(clerkId, "la cuenta de prueba debe existir en Clerk").toBeTruthy();

      // (b) sin fila en maestros — la condición que el badge debe reflejar
      const res = await sbFetch(`maestros?clerk_user_id=eq.${clerkId}&select=id`);
      const maestroRows = (await res.json()) as unknown[];
      expect(maestroRows.length, "una cuenta cliente no debe tener fila en maestros").toBe(0);

      // Publicar post A
      await page.goto("/comunidad/nueva");
      await fillAndSubmitPost(page, TITULO_A);

      // (a) badge en el listado — carga fresca de página
      await page.goto("/comunidad");
      const card = cardFor(page, TITULO_A);
      await expect(card).toBeVisible({ timeout: 30_000 });
      await expect(card.getByText("Cliente", { exact: true }).first()).toBeVisible();
      await expect(card.getByText("Maestro", { exact: true })).toHaveCount(0);
      await expect(card.getByText("✓ Maestro verificado")).toHaveCount(0);
      console.log("[OK] Paso 3 — badge 'Cliente' correcto, 0 filas en maestros para", clerkId);
    });

    await test.step("4. Publicar → 'Ver el foro' (nav cliente) muestra el post sin recargar", async () => {
      // La visita a /comunidad del paso 3 dejó esa ruta en el Router Cache del
      // browser — exactamente el escenario que revalidatePath debe invalidar.
      await page.getByRole("link", { name: /Nueva pregunta/ }).first().click();
      await page.waitForURL(/\/comunidad\/nueva/, { timeout: 30_000 });
      await fillAndSubmitPost(page, TITULO_B);

      // Click en el Link de la pantalla de confirmación — navegación cliente,
      // igual que un usuario real. SIN page.reload() en ningún momento.
      await page.getByRole("link", { name: /Ver el foro/ }).click();
      await page.waitForURL(u => u.pathname === "/comunidad", { timeout: 30_000 });
      await expect(cardFor(page, TITULO_B), "el post recién publicado debe verse sin recargar").toBeVisible({ timeout: 30_000 });
      console.log("[OK] Paso 4 — post visible tras navegación cliente, revalidatePath funcionando");
    });

    await test.step("5. Detalle /comunidad/[id] de un post real carga sin errores", async () => {
      const res = await sbFetch(`foro_posts?titulo=eq.${encodeURIComponent(TITULO_A)}&select=id`);
      const rows = (await res.json()) as { id: string }[];
      expect(rows.length, "el post A debe existir en foro_posts").toBe(1);
      postAId = rows[0].id;

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const NOISE = ["favicon", "clerk has been loaded with development keys", "turnstile", "429"];
      page.on("pageerror", err => pageErrors.push(err.message));
      page.on("console", msg => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (NOISE.some(n => text.toLowerCase().includes(n))) return;
        consoleErrors.push(text);
      });

      await page.goto(`/comunidad/${postAId}`);
      await expect(page.getByText(TITULO_A)).toBeVisible({ timeout: 60_000 });
      // Autor cliente sin fila en maestros → nombre fallback "Usuario" + badge "Cliente"
      await expect(page.getByText("Usuario", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("Cliente", { exact: true }).first()).toBeVisible();

      expect(pageErrors, `excepciones no capturadas en la página: ${JSON.stringify(pageErrors)}`).toHaveLength(0);
      expect(consoleErrors, `errores de consola (filtrado ruido conocido): ${JSON.stringify(consoleErrors)}`).toHaveLength(0);
      console.log("[OK] Paso 5 — detalle carga con autor/badge correctos, sin errores de consola");
    });
  });

  test.afterAll(async () => {
    // 1. Posts de prueba en foro_posts — con verificación antes/después
    if (clerkId) {
      const before = await sbFetch(`foro_posts?clerk_user_id=eq.${clerkId}&select=id`);
      const existing = (await before.json()) as { id: string }[];
      const del = await sbFetch(`foro_posts?clerk_user_id=eq.${clerkId}`, { method: "DELETE" });
      const deleted = del.ok ? ((await del.json()) as unknown[]) : [];
      if (existing.length > 0 && deleted.length === 0) {
        console.error(`[cleanup] LIMPIEZA FALLÓ: ${existing.length} post(s) de prueba siguen en foro_posts:`, JSON.stringify(existing));
      } else {
        console.log(`[cleanup] foro_posts: ${deleted.length} fila(s) borradas (${existing.length} esperadas)`);
      }

      // 2. Resguardo: filas accidentales en maestros/clientes (0 esperadas)
      for (const table of ["maestros", "clientes"] as const) {
        const col = table === "maestros" ? "clerk_user_id" : "user_id";
        const r = await sbFetch(`${table}?${col}=eq.${clerkId}`, { method: "DELETE" });
        const d = r.ok ? ((await r.json()) as unknown[]).length : "ERROR";
        console.log(`[cleanup] ${table}: ${d} fila(s) borradas (0 esperadas)`);
      }
    }

    // 3. Usuario de prueba en Clerk
    const id = clerkId ?? (await clerkFindUserId(EMAIL_CLIENTE));
    if (id) {
      const ok = await clerkDeleteUser(id);
      console.log(`[cleanup] Clerk ${EMAIL_CLIENTE}: ${ok ? "eliminado" : "ERROR al eliminar"}`);
    } else {
      console.log(`[cleanup] Clerk ${EMAIL_CLIENTE}: no existe (nada que borrar)`);
    }
  });
});
