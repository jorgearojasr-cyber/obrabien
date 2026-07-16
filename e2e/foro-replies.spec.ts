import { test, expect, type Page } from "@playwright/test";
import { setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * E2E: responder a un post real del foro, de punta a punta.
 *
 * Contexto: la tabla foro_replies no existía en producción (migración 003
 * nunca corrida) y responder fallaba. Tras aplicar 003+004 (verificado:
 * tabla y columna foto_url existen), este spec valida el flujo completo:
 * cuenta nueva → post real → respuesta vía UI → fila persistida en
 * foro_replies → visible en el detalle tras recargar.
 *
 * Detalle no obvio del formulario: para usuarios logueados, el nombre NO es
 * un input — es un div de solo lectura autollenado desde Clerk (firstName /
 * publicMetadata.profile.nombre), y el botón queda deshabilitado si el
 * nombre tiene <2 caracteres. Una cuenta email+contraseña nace sin nombre,
 * así que el setup le asigna first_name/last_name vía la API de Clerk.
 *
 * El post de prueba se crea directo en Supabase (service-role) — la creación
 * de posts vía UI ya está cubierta por foro-fixes.spec.ts. La respuesta es a
 * su propio post, así que el endpoint no genera notificación (autor ==
 * respondedor), y no hay contenido real de terceros involucrado.
 */

const OTP_CODE = "424242";
const PASSWORD = "ObraBien-e2e-2026!";
const STAMP = Date.now();
const EMAIL = `obrabien+clerk_test_${STAMP}_reply@example.com`;
const TITULO_POST = `Post E2E replies ${STAMP}`;
const CONTENIDO_POST = "Post de prueba E2E para verificar respuestas del foro. Se elimina al final del test.";
const CONTENIDO_REPLY = `Respuesta E2E ${STAMP} — verificando que foro_replies persiste y se muestra al recargar.`;

// ── Key validation (mismo guard que los specs anteriores) ────────────────────

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
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=representation", "Content-Type": "application/json", ...(init?.headers ?? {}) },
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

async function clerkSetName(userId: string, firstName: string, lastName: string): Promise<void> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, {
    method: "PATCH",
    headers: clerkHeaders(),
    body: JSON.stringify({ first_name: firstName, last_name: lastName }),
  });
  if (!res.ok) throw new Error(`No se pudo asignar nombre al usuario de prueba: ${res.status} ${await res.text()}`);
}

async function clerkDeleteUser(userId: string): Promise<boolean> {
  const res = await fetch(`${CLERK_API}/users/${userId}`, { method: "DELETE", headers: clerkHeaders() });
  return res.ok;
}

// ── UI helper ─────────────────────────────────────────────────────────────────

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

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe("responder a un post real del foro", () => {
  test.setTimeout(240_000);

  let clerkId: string | null = null;
  let postId: string | null = null;

  test("flujo completo de respuesta", async ({ page }) => {
    supabaseCreds(); // valida la key ANTES de crear nada

    await test.step("setup: cuenta cliente con nombre + post real en Supabase", async () => {
      await signUpCliente(page, EMAIL);
      clerkId = await clerkFindUserId(EMAIL);
      expect(clerkId).toBeTruthy();
      // Sin nombre, el form de respuesta deja el botón deshabilitado (el campo
      // es de solo lectura para usuarios logueados) — se asigna vía API.
      await clerkSetName(clerkId!, "Cliente", "E2E");

      const res = await sbFetch("foro_posts", {
        method: "POST",
        body: JSON.stringify({
          clerk_user_id: clerkId,
          titulo: TITULO_POST,
          contenido: CONTENIDO_POST,
          categoria: "consultas",
          tags: [],
          quien_responde: "todos",
        }),
      });
      expect(res.ok, `insert de post falló: ${res.status}`).toBeTruthy();
      const [row] = (await res.json()) as { id: string }[];
      postId = row.id;
      console.log("[OK] Setup — cuenta", clerkId, "| post", postId);
    });

    await test.step("responder vía UI en /comunidad/[id]", async () => {
      await page.goto(`/comunidad/${postId}`);
      await expect(page.getByText(TITULO_POST)).toBeVisible({ timeout: 30_000 });

      // El nombre autollenado desde Clerk debe aparecer en el campo de solo lectura
      await expect(page.getByText("Cliente E2E", { exact: true })).toBeVisible({ timeout: 15_000 });

      await page.locator("textarea.ob-textarea").fill(CONTENIDO_REPLY);
      const submitBtn = page.getByRole("button", { name: /Publicar respuesta/ });
      await expect(submitBtn, "el botón debe habilitarse con nombre y contenido válidos").toBeEnabled({ timeout: 10_000 });
      await submitBtn.click();

      await expect(page.getByText("¡Respuesta publicada!")).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText(CONTENIDO_REPLY).first()).toBeVisible();
      console.log("[OK] Respuesta enviada — banner de éxito visible");
    });

    await test.step("la respuesta persistió en foro_replies", async () => {
      const res = await sbFetch(`foro_replies?post_id=eq.${postId}&select=id,autor_nombre,autor_rol,contenido,clerk_user_id`);
      const rows = (await res.json()) as Record<string, unknown>[];
      expect(rows.length, "debe existir exactamente 1 respuesta").toBe(1);
      expect(rows[0].contenido).toBe(CONTENIDO_REPLY);
      expect(rows[0].autor_nombre).toBe("Cliente E2E");
      expect(rows[0].autor_rol).toBe("cliente");
      expect(rows[0].clerk_user_id).toBe(clerkId);
      console.log("[OK] Fila en foro_replies:", rows[0].id);
    });

    await test.step("la respuesta se muestra al recargar (datos del servidor)", async () => {
      await page.reload();
      await expect(page.getByText(TITULO_POST)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(CONTENIDO_REPLY).first(),
        "tras recargar, la respuesta debe venir del servidor (foro_replies), no del estado local").toBeVisible({ timeout: 15_000 });
      console.log("[OK] Respuesta visible tras recarga — persistencia real confirmada");
    });
  });

  test.afterAll(async () => {
    // Orden: replies → post (FK) → filas colaterales → usuario Clerk.
    if (clerkId) {
      for (const [table, col] of [["foro_replies", "clerk_user_id"], ["foro_posts", "clerk_user_id"]] as const) {
        const before = await sbFetch(`${table}?${col}=eq.${clerkId}&select=id`);
        const existing = (await before.json()) as unknown[];
        const del = await sbFetch(`${table}?${col}=eq.${clerkId}`, { method: "DELETE" });
        const deleted = del.ok ? ((await del.json()) as unknown[]) : [];
        if (existing.length > 0 && deleted.length === 0) {
          console.error(`[cleanup] LIMPIEZA FALLÓ en ${table}: ${existing.length} fila(s) siguen ahí`);
        } else {
          console.log(`[cleanup] ${table}: ${deleted.length} fila(s) borradas (${existing.length} esperadas)`);
        }
      }
      for (const [table, col] of [["notificaciones", "user_id"], ["maestros", "clerk_user_id"], ["clientes", "user_id"]] as const) {
        const r = await sbFetch(`${table}?${col}=eq.${clerkId}`, { method: "DELETE" });
        const d = r.ok ? ((await r.json()) as unknown[]).length : "ERROR";
        console.log(`[cleanup] ${table}: ${d} fila(s) borradas (0 esperadas)`);
      }
    }
    const id = clerkId ?? (await clerkFindUserId(EMAIL));
    if (id) {
      const ok = await clerkDeleteUser(id);
      console.log(`[cleanup] Clerk ${EMAIL}: ${ok ? "eliminado" : "ERROR al eliminar"}`);
    } else {
      console.log(`[cleanup] Clerk ${EMAIL}: no existe (nada que borrar)`);
    }
  });
});
