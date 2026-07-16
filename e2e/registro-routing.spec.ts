import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";
import fs from "fs";

/**
 * E2E: routing de registro de maestro (fixes de commits 8912664 / ff55dfb).
 *
 * Usa el modo test de Clerk (instancia de desarrollo pk_test): los emails que
 * contienen "+clerk_test" no envían correo real y aceptan el código 424242.
 *
 * Ningún caso envía el formulario de registro-basico, así que NUNCA se crean
 * filas en la tabla maestros de Supabase. El teardown igualmente hace un
 * delete de resguardo por clerk_user_id (no-op esperado) y elimina los
 * usuarios de prueba de Clerk.
 */

const OTP_CODE = "424242";
const PASSWORD = "ObraBien-e2e-2026!";
const STAMP = Date.now();
const EMAILS = {
  caso1: `obrabien+clerk_test_${STAMP}_1@example.com`,
  caso2: `obrabien+clerk_test_${STAMP}_2@example.com`,
  caso3: `obrabien+clerk_test_${STAMP}_3@example.com`,
};

const RESULTS_DIR = "e2e-results";

// ── Clerk backend helpers (dev instance, secret key from .env.local) ─────────

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

async function clerkGetPublicMetadata(userId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, { headers: clerkHeaders() });
  if (!res.ok) throw new Error(`No se pudo leer el usuario: ${res.status} ${await res.text()}`);
  const user = (await res.json()) as { public_metadata: Record<string, unknown> };
  return user.public_metadata ?? {};
}

async function clerkClearPublicMetadata(userId: string): Promise<void> {
  // Clerk's PATCH /metadata does a SHALLOW MERGE, not a replace — sending {}
  // is a no-op. Existing keys must be explicitly set to null to unset them.
  const res = await fetch(`${CLERK_API}/users/${userId}/metadata`, {
    method: "PATCH",
    headers: clerkHeaders(),
    body: JSON.stringify({ public_metadata: { role: null } }),
  });
  if (!res.ok) throw new Error(`No se pudo limpiar publicMetadata: ${res.status} ${await res.text()}`);

  // Diagnostic-only: confirm the clear actually propagated on Clerk's side
  // before the test navigates. Clerk's Backend API can have a brief
  // eventual-consistency window right after a write; polling here is a
  // TEST-HARNESS correctness step, not a workaround for app behavior.
  for (let i = 0; i < 8; i++) {
    const md = await clerkGetPublicMetadata(userId);
    if (!md.role) return;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error("clerkClearPublicMetadata: el rol seguía presente tras 4s de polling (posible retraso de propagación en Clerk)");
}

async function clerkDeleteUser(userId: string): Promise<boolean> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, { method: "DELETE", headers: clerkHeaders() });
  return res.ok;
}

// ── Supabase safety cleanup (service role) ────────────────────────────────────

async function supabaseDeleteMaestroRows(clerkUserIds: string[]): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || clerkUserIds.length === 0) return "skip (sin credenciales o sin ids)";
  const filter = clerkUserIds.map(id => `"${id}"`).join(",");
  const res = await fetch(`${url}/rest/v1/maestros?clerk_user_id=in.(${filter})`, {
    method: "DELETE",
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation" },
  });
  if (!res.ok) return `ERROR ${res.status}`;
  const deleted = (await res.json()) as unknown[];
  return `${deleted.length} fila(s) borradas (0 esperadas — los tests no envían el formulario)`;
}

// ── UI helper: signup de maestro vía /registro?tab=maestro ────────────────────

async function signUpMaestro(page: Page, email: string): Promise<void> {
  // Testing token: permite que el browser automatizado pase la protección
  // anti-bot (Turnstile) de la instancia de Clerk durante el signup.
  await setupClerkTestingToken({ page });
  await page.goto("/registro?tab=maestro");
  await page.getByPlaceholder("tu@correo.cl").fill(email);
  await page.getByPlaceholder("Crea tu contraseña").fill(PASSWORD);
  await page.getByPlaceholder("Repite tu contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: /Crear cuenta/ }).click();
  // Paso de verificación por código (modo test de Clerk: 424242)
  await page.getByPlaceholder("123456").fill(OTP_CODE);
  await page.getByRole("button", { name: /Verificar y crear cuenta/ }).click();
  // Esperar a que salga de /registro hacia cualquier destino post-signup
  await page.waitForURL(u => !u.pathname.startsWith("/registro"), { timeout: 45_000 });
}

async function capture(page: Page, name: string): Promise<void> {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  await page.screenshot({ path: `${RESULTS_DIR}/${name}.png` });
  console.log(`[${name}] URL final: ${page.url()}`);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// NOT .serial: cada caso debe correr aunque otro falle, para que el reporte
// final cubra los 3 casos en vez de abortar en el primer fallo.
test.describe("routing de registro de maestro", () => {

  test("Caso 1: onboarding sin ?role= → Soy maestro → registro-basico", async ({ page }) => {
    // Crear la cuenta vía UI y luego BORRAR el rol de publicMetadata vía API,
    // dejando al usuario exactamente en el estado "signup que perdió ?role=".
    await signUpMaestro(page, EMAILS.caso1);
    const userId = await clerkFindUserId(EMAILS.caso1);
    expect(userId, "el usuario de prueba debe existir en Clerk").toBeTruthy();
    await clerkClearPublicMetadata(userId!);

    // Sin rol, /dashboard debe mandar a /onboarding
    await page.goto("/dashboard");
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });

    // Elegir "Soy maestro" → debe terminar en registro-basico, NO en completar-perfil
    await page.getByRole("button", { name: /Soy maestro/ }).click();
    try {
      await page.waitForURL(/\/dashboard\/maestro\/registro-basico/, { timeout: 20_000 });
    } finally {
      await capture(page, "caso1-final");
    }
    expect(page.url()).toContain("/dashboard/maestro/registro-basico");
    expect(page.url()).not.toContain("completar-perfil");
  });

  test("Caso 2: signup vía /registro?tab=maestro → registro-basico", async ({ page }) => {
    await signUpMaestro(page, EMAILS.caso2);
    try {
      await page.waitForURL(/\/dashboard\/maestro\/registro-basico/, { timeout: 20_000 });
    } finally {
      await capture(page, "caso2-final");
    }
    expect(page.url()).toContain("/dashboard/maestro/registro-basico");
    expect(page.url()).not.toContain("completar-perfil");
  });

  test("Caso 3: rol maestro sin fila en Supabase, directo a /dashboard/maestro → registro-basico", async ({ page }) => {
    await signUpMaestro(page, EMAILS.caso3);
    // Forzar la persistencia del rol pasando por el routing central una vez
    await page.goto("/dashboard?role=maestro");
    await page.waitForURL(/registro-basico|onboarding/, { timeout: 20_000 });

    // Navegar DIRECTO al dashboard de maestro: sin fila en maestros debe
    // rebotar a registro-basico (antes del fix iba a completar-perfil)
    await page.goto("/dashboard/maestro");
    try {
      await page.waitForURL(/\/dashboard\/maestro\/registro-basico/, { timeout: 20_000 });
    } finally {
      await capture(page, "caso3-final");
    }
    expect(page.url()).toContain("/dashboard/maestro/registro-basico");
    expect(page.url()).not.toContain("completar-perfil");
  });

  test.afterAll(async () => {
    // Limpieza: usuarios de prueba de Clerk + resguardo en Supabase
    const ids: string[] = [];
    for (const email of Object.values(EMAILS)) {
      const id = await clerkFindUserId(email);
      if (id) {
        ids.push(id);
        const ok = await clerkDeleteUser(id);
        console.log(`[cleanup] Clerk ${email}: ${ok ? "eliminado" : "ERROR al eliminar"}`);
      } else {
        console.log(`[cleanup] Clerk ${email}: no existe (nada que borrar)`);
      }
    }
    console.log(`[cleanup] Supabase maestros: ${await supabaseDeleteMaestroRows(ids)}`);
  });
});
