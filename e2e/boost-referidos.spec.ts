import { test, expect, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * E2E: boost de referidos en el ordenamiento de /buscar (sort "relevantes") y
 * en "Maestros destacados" de la home, más el fix del sort "recientes".
 *
 * A diferencia de referidos.spec.ts, ningún maestro de este spec necesita una
 * cuenta real de Clerk — se insertan directo en `maestros` vía service-role
 * (clerk_user_id es un string único falso, nunca se usa para loguearse). La
 * única sesión de Clerk real es la del admin, para aprobar por UI real como
 * pide el enunciado. Esto simplifica la limpieza: no hay usuarios de Clerk que
 * borrar, solo filas de Supabase.
 *
 * Desviación deliberada — punto 4 (home): "Maestros destacados" solo muestra
 * los primeros 10 de TODOS los maestros activos, y sin duda propia el sort
 * empata a 0 referidos/0 reseñas entre el maestro de control B y cualquier
 * maestro real ya en la base (a la fecha de este spec, 9). Array.prototype.sort
 * es estable, así que ese empate preserva el orden en que Postgres devolvió las
 * filas — no garantizado por una query sin ORDER BY, y en la práctica probable
 * que ubique las filas recién insertadas (B) al final del bloque empatado,
 * fuera del corte de 10. Por eso el maestro C (el que se aprueba) se crea con
 * activo=false — no necesita estar activo para aparecer en
 * /admin/revision-perfiles ni para acreditarse, y así no sube el ruido del
 * empate. Aun así, no hay forma de garantizar matemáticamente que B sobreviva
 * el corte de 10 sin tocar datos reales de producción. La aserción del punto 4
 * por lo tanto es asimétrica a propósito: A (con el referido) SIEMPRE debe
 * aparecer — su referidosCount=1 le gana a cualquier empate, así que su
 * presencia en el top 10 es 100% determinística — y SI B también aparece, se
 * exige que A esté antes. Si B no aparece, se deja constancia explícita en el
 * log en vez de fallar el test por un límite de la sección "destacados" que no
 * es parte del bug que este spec verifica (el punto 3, sobre /buscar, no tiene
 * ese límite y prueba el mismo criterio de forma totalmente determinística).
 */

const STAMP = Date.now();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim();

const NOMBRE_A = `Boost Control A ${STAMP}`;
const NOMBRE_B = `Boost Control B ${STAMP}`;
const NOMBRE_C = `Boost Referido ${STAMP}`;
const NOMBRE_D = `Boost Reciente ${STAMP}`;

// ── RUT/teléfono helpers (mismo algoritmo mod-11 que maestro-shared.ts) ──────

function generateValidRut(): string {
  const body = String(Math.floor(10_000_000 + Math.random() * 15_000_000));
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rem = 11 - (sum % 11);
  const verifier = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return `${body}${verifier}`; // sin puntos/guion — se inserta ya normalizado
}

function randomPhoneDigits(): string {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999)).slice(0, 8);
}

// ── Supabase helpers (mismo patrón que referidos.spec.ts) ───────────────────

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
    }
  }
}

function supabaseCreds() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está en .env.local — este spec inserta maestros de prueba directo en Supabase.");
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

async function assertMigracion022Aplicada(): Promise<void> {
  const res = await sbFetch("maestro_referidos?select=id&limit=1");
  if (res.status === 404 || res.status === 400) {
    throw new Error(
      "La tabla maestro_referidos no existe — la migración 022_maestro_referidos.sql no está aplicada en esta base."
    );
  }
  if (!res.ok) throw new Error(`Preflight de migración 022 falló: ${res.status} ${await res.text()}`);
}

async function insertMaestro(payload: Record<string, unknown>): Promise<string> {
  const res = await sbFetch("maestros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`insert maestro falló: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as { id: string }[];
  return rows[0].id;
}

async function supabaseSelectReferidos(maestroId: string, referidoMaestroId: string): Promise<Record<string, unknown>[]> {
  const res = await sbFetch(`maestro_referidos?maestro_id=eq.${maestroId}&referido_maestro_id=eq.${referidoMaestroId}&select=*`);
  if (!res.ok) throw new Error(`Supabase select maestro_referidos falló: ${res.status} ${await res.text()}`);
  return (await res.json()) as Record<string, unknown>[];
}

async function supabaseDeleteMaestroRows(ids: string[]): Promise<string> {
  if (ids.length === 0) return "skip (sin ids)";
  const filter = ids.map(id => `"${id}"`).join(",");

  const before = await sbFetch(`maestros?id=in.(${filter})&select=id`);
  const existing = before.ok ? ((await before.json()) as { id: string }[]) : [];

  const res = await sbFetch(`maestros?id=in.(${filter})`, { method: "DELETE" });
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

// Locator seguro para la tarjeta de UN maestro específico en
// /admin/revision-perfiles (mismo patrón que referidos.spec.ts).
function adminCardFor(page: Page, maestroId: string) {
  return page.locator(`xpath=//a[@href="/maestro/${maestroId}"]/ancestor::div[.//button][1]`);
}

// Índice de cada href en el orden real del DOM — funciona tanto para el
// listado vertical de /buscar como para el carrusel horizontal de la home,
// porque refleja orden de documento, no posición visual.
async function domOrderIndex(page: Page, hrefs: string[]): Promise<number[]> {
  return page.evaluate((wantedHrefs: string[]) => {
    const anchors = Array.from(document.querySelectorAll('a[href^="/maestro/"]'));
    return wantedHrefs.map(h => anchors.findIndex(a => a.getAttribute("href") === h));
  }, hrefs);
}

// ── Test ──────────────────────────────────────────────────────────────────────

test.describe("Boost de referidos en /buscar y home", () => {
  test.setTimeout(150_000);

  let idA: string | null = null;
  let idB: string | null = null;
  let idC: string | null = null;
  let idD: string | null = null;

  test("orden por referidos + sort recientes", async ({ page, browser }) => {
    expect(ADMIN_EMAIL, "ADMIN_EMAIL debe estar configurado para el paso de admin").toBeTruthy();
    await assertMigracion022Aplicada(); // valida rol de la key + que la migración exista, antes de crear nada

    await test.step("1. Crear dos maestros de control equivalentes (A y B)", async () => {
      const base = {
        especialidades: ["Electricidad"],
        ciudades: ["Santiago"],
        activo: true,
        perfil_estado: "completo",
        disponibilidad: "disponible",
      };
      idA = await insertMaestro({
        ...base,
        clerk_user_id: `e2e-boost-${STAMP}-a`,
        nombre: NOMBRE_A,
        rut: generateValidRut(),
        telefono: `+56 9 ${randomPhoneDigits()}`,
        created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
      });
      idB = await insertMaestro({
        ...base,
        clerk_user_id: `e2e-boost-${STAMP}-b`,
        nombre: NOMBRE_B,
        rut: generateValidRut(),
        telefono: `+56 9 ${randomPhoneDigits()}`,
        created_at: new Date(Date.now() - 19 * 60_000).toISOString(),
      });
      expect(idA).toBeTruthy();
      expect(idB).toBeTruthy();
      console.log("[OK] Paso 1 — A:", idA, "| B:", idB, "(mismo rating=0, mismas reseñas=0, ambos activos)");
    });

    // ── Sesión de admin en un contexto separado ──
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/");
    await clerk.loaded({ page: adminPage });
    await clerk.signIn({ page: adminPage, emailAddress: ADMIN_EMAIL });

    await test.step("2. Crear maestro referido de A, aprobar vía UI real de admin → crédito en maestro_referidos", async () => {
      idC = await insertMaestro({
        clerk_user_id: `e2e-boost-${STAMP}-c`,
        nombre: NOMBRE_C,
        rut: generateValidRut(),
        telefono: `+56 9 ${randomPhoneDigits()}`,
        especialidades: ["Electricidad"],
        ciudades: ["Santiago"],
        // Inactivo a propósito — no participa en /buscar ni en la home, así no
        // le resta cupo a B en el corte de 10 de "Maestros destacados" sin
        // necesidad de estarlo para aparecer en /admin/revision-perfiles ni
        // para acreditarse (ninguna de las dos rutas filtra por `activo`).
        activo: false,
        perfil_estado: "pendiente_revision",
        referido_por_maestro_id: idA,
        created_at: new Date(Date.now() - 18 * 60_000).toISOString(),
      });
      expect(idC).toBeTruthy();

      await adminPage.goto("/admin/revision-perfiles");
      const card = adminCardFor(adminPage, idC!);
      await expect(card).toBeVisible({ timeout: 15_000 });
      await card.getByRole("button", { name: /Aprobar/ }).click();
      await adminPage.waitForTimeout(1500); // router.refresh() puede reemplazar la fila antes de que el badge se observe

      const referidos = await supabaseSelectReferidos(idA!, idC!);
      expect(referidos, "debe existir exactamente 1 fila de crédito para A").toHaveLength(1);
      console.log("[OK] Paso 2 — C aprobado por UI, maestro_referidos acreditado a A:", JSON.stringify(referidos[0]));
    });

    await test.step("3. /buscar — sort 'relevantes' (default): A antes que B", async () => {
      await page.goto("/buscar");
      await expect(page.locator('a[href^="/maestro/"]').first()).toBeVisible({ timeout: 20_000 });

      const [idxA, idxB] = await domOrderIndex(page, [`/maestro/${idA}`, `/maestro/${idB}`]);
      expect(idxA, "A debe estar renderizado en /buscar").toBeGreaterThanOrEqual(0);
      expect(idxB, "B debe estar renderizado en /buscar").toBeGreaterThanOrEqual(0);
      expect(idxA, "A (1 referido) debe aparecer antes que B (0 referidos), mismo rating/reseñas").toBeLessThan(idxB);
      console.log("[OK] Paso 3 — /buscar orden DOM: A@", idxA, "< B@", idxB);
    });

    await test.step("4. Home — 'Maestros destacados': mismo orden (A siempre presente; B si sobrevive el top 10)", async () => {
      await page.goto("/");
      await expect(page.getByText("Maestros destacados")).toBeVisible({ timeout: 20_000 });

      const [idxA, idxB] = await domOrderIndex(page, [`/maestro/${idA}`, `/maestro/${idB}`]);
      expect(idxA, "A (1 referido) debe estar SIEMPRE en el top 10 de la home — su referidosCount es único y máximo").toBeGreaterThanOrEqual(0);

      if (idxB >= 0) {
        expect(idxA, "si B también aparece, A debe ir antes").toBeLessThan(idxB);
        console.log("[OK] Paso 4 — home orden DOM: A@", idxA, "< B@", idxB);
      } else {
        console.log(
          "[INFO] Paso 4 — A@", idxA, "presente y primero de los empatados, como se esperaba. " +
          "B no apareció entre los primeros 10 destacados: compite en empate 0-referidos/0-reseñas contra " +
          "maestros reales ya existentes en la base (fuera del alcance de este bug — /buscar, sin ese " +
          "límite de 10, ya probó el mismo criterio de forma 100% determinística en el paso 3)."
        );
      }
    });

    await test.step("5. /buscar — sort 'recientes': el maestro más nuevo aparece primero", async () => {
      idD = await insertMaestro({
        clerk_user_id: `e2e-boost-${STAMP}-d`,
        nombre: NOMBRE_D,
        rut: generateValidRut(),
        telefono: `+56 9 ${randomPhoneDigits()}`,
        especialidades: ["Electricidad"],
        ciudades: ["Santiago"],
        activo: true,
        perfil_estado: "completo",
        // En el futuro — garantiza ser el más reciente de TODA la tabla, no
        // solo entre los de prueba, sin depender de cuándo se creó cada real.
        created_at: new Date(Date.now() + 60_000).toISOString(),
      });
      expect(idD).toBeTruthy();

      await page.goto("/buscar");
      await page.locator('select:has(option[value="recientes"])').selectOption("recientes");
      await expect(page.locator('a[href^="/maestro/"]').first()).toBeVisible({ timeout: 20_000 });

      const [idxA, idxB, idxD] = await domOrderIndex(page, [`/maestro/${idA}`, `/maestro/${idB}`, `/maestro/${idD}`]);
      expect(idxD, "D debe estar renderizado en /buscar").toBeGreaterThanOrEqual(0);
      expect(idxD, "D (creado en el futuro) debe ser el primero bajo 'Recién agregados'").toBe(0);
      expect(idxD).toBeLessThan(idxA);
      expect(idxD).toBeLessThan(idxB);
      console.log("[OK] Paso 5 — /buscar 'recientes': D@0, antes que A@", idxA, "y B@", idxB);
    });

    await adminContext.close();
  });

  test.afterAll(async () => {
    console.log(`[cleanup] maestro_referidos: ${await supabaseDeleteReferidosRows(idA, idC)}`);
    console.log(`[cleanup] Supabase maestros: ${await supabaseDeleteMaestroRows([idA, idB, idC, idD].filter((x): x is string => !!x))}`);
  });
});
