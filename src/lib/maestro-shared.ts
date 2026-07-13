// Shared constants/helpers used by both the full profile wizard
// (dashboard/maestro/completar-perfil) and the basic registration form
// (dashboard/maestro/registro-basico). Keep values in sync with completar-perfil/page.tsx.

export const ESPECIALIDADES = [
  "Albañilería", "Gasfitería", "Electricidad", "Carpintería", "Pintura",
  "Techumbres", "Climatización / AC", "Cerrajería", "Pisos y revestimientos",
  "Impermeabilización", "Enlucidos", "Enfierradura y Soldadura",
  "Paneles Solares", "Jardín / Paisajismo", "Demolición",
  "Instalación de ventanas", "Tabiquería / Drywall", "Fumigación",
];

export const PHONE_PREFIX = "+56 9 ";

export function formatPhone(raw: string): string {
  if (!raw.startsWith(PHONE_PREFIX)) return PHONE_PREFIX;
  const digits = raw.slice(PHONE_PREFIX.length).replace(/\D/g, "").slice(0, 8);
  return PHONE_PREFIX + digits;
}

export function phoneComplete(val: string): boolean {
  return val.slice(PHONE_PREFIX.length).replace(/\D/g, "").length === 8;
}

export function formatRUT(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  const dotted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dotted}-${verifier}`;
}

export function validateRUT(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return verifier === expected;
}

// Canonical format for storing/comparing RUTs: no dots, no spaces, dash before
// the verifier digit, uppercase K — e.g. "12.345.678-k" → "12345678-K".
// Must stay equivalent to the SQL normalization in migration 020's unique indexes.
export function normalizeRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

export const MSG_RUT_DUPLICADO =
  "Este RUT ya está registrado en ObraBien. Si es tu cuenta, intenta iniciar sesión.";
export const MSG_TELEFONO_DUPLICADO =
  "Este número de teléfono ya está registrado en otra cuenta de ObraBien.";

// Used server-side by registro-basico and update-profile after calling the
// check_maestro_duplicado RPC (migration 020) to build a user-facing message.
export type DuplicadoRow = { campo: string; clerk_user_id: string };

export function mensajeDuplicado(duplicados: DuplicadoRow[]): string {
  const campos = new Set(duplicados.map(d => d.campo));
  // If both collide, the RUT message wins — its "try logging in" hint is the useful one.
  if (campos.has("rut")) return MSG_RUT_DUPLICADO;
  return MSG_TELEFONO_DUPLICADO;
}

// Fallback for when the unique index itself rejects the write (Postgres 23505,
// e.g. two requests racing past the RPC pre-check). The Postgres error message
// names the violated index — idx_maestros_rut_normalizado_unique or
// idx_maestros_telefono_normalizado_unique — so match on that.
export function mensajeDesde23505(pgMessage: string | null | undefined): string {
  const msg = pgMessage ?? "";
  if (msg.includes("rut")) return MSG_RUT_DUPLICADO;
  if (msg.includes("telefono")) return MSG_TELEFONO_DUPLICADO;
  return "Este RUT o teléfono ya está registrado en otra cuenta de ObraBien.";
}
