// Documentos de identidad en Cloudinary (hotfix de privacidad 19A.1 / corrección 19A.2R).
//
// Antes: la cédula (frente y reverso) y la selfie se subían como `image/upload` (entrega pública por URL, sin firma) y la URL se
// guardaba en `maestros.cedula_*`, legible por la clave anon. Ahora:
//   - se suben con `type: "authenticated"` (la entrega exige una URL firmada generada en el servidor);
//   - la base guarda la REFERENCIA (public_id: `ObraBien/cedulas/<clerk_user_id>/<id>`), no una URL;
//   - solo el administrador obtiene un enlace TEMPORAL (ver /api/admin/documento).
// Los valores antiguos (URL `image/upload`) siguen entendiéndose: `documentRefFromStored` extrae el public_id de ambas formas.
//
// Mayúsculas/minúsculas (19A.2R, hallazgo B1): los 3 documentos históricos reales están en `obrabien/cedulas/<uid>/…` (minúsculas), mientras que
// el código actual sube a `ObraBien/cedulas/<uid>/…`. Cloudinary distingue mayúsculas en el public_id, así que NUNCA se reconstruye un identificador
// cambiando mayúsculas: se aceptan exactamente DOS raíces históricas (lista cerrada) y el public_id se conserva TAL CUAL viene en el valor guardado.
// La existencia y el identificador definitivo los confirma la API de Cloudinary (ver cloudinary-resolve.ts).

export const DOCUMENT_FOLDER_ROOT = "ObraBien/cedulas";
/** Raíces válidas (lista cerrada). La primera es la actual; la segunda existe en documentos históricos. Cualquier otra variante se rechaza. */
export const DOCUMENT_ROOTS = ["ObraBien/cedulas", "obrabien/cedulas"] as const;
export const DOCUMENT_FIELDS = ["frente", "reverso", "selfie"] as const;
export type DocumentField = (typeof DOCUMENT_FIELDS)[number];

/** Columna de `maestros` que guarda cada documento. */
export const DOCUMENT_COLUMN: Record<DocumentField, "cedula_frente" | "cedula_reverso" | "selfie_cedula"> = {
  frente: "cedula_frente",
  reverso: "cedula_reverso",
  selfie: "selfie_cedula",
};

const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,128}$/;
const SAFE_FILE = /^[A-Za-z0-9_-]{1,128}$/;

export function documentFolder(userId: string): string {
  return `${DOCUMENT_FOLDER_ROOT}/${userId}`;
}

function parseDocumentId(id: string): { root: string; owner: string; file: string } | null {
  const parts = id.split("/");
  if (parts.length !== 4) return null;
  const root = `${parts[0]}/${parts[1]}`;
  if (!(DOCUMENT_ROOTS as readonly string[]).includes(root)) return null;
  if (!SAFE_SEGMENT.test(parts[2]) || !SAFE_FILE.test(parts[3])) return null;
  return { root, owner: parts[2], file: parts[3] };
}

/** ¿Tiene forma de public_id de documento (`<raíz histórica>/<usuario>/<archivo>`)? */
export function isDocumentId(id: unknown): id is string {
  return typeof id === "string" && parseDocumentId(id) !== null;
}

/** Usuario dueño según la carpeta del public_id, o null si no es un identificador de documento válido. */
export function documentOwner(id: string): string | null {
  return parseDocumentId(id)?.owner ?? null;
}

/** Una referencia es válida solo si es `<raíz histórica>/<userId>/<archivo>` y la carpeta pertenece a ESE usuario. */
export function isOwnDocumentRef(ref: unknown, userId: string): boolean {
  if (typeof ref !== "string" || !SAFE_SEGMENT.test(userId)) return false;
  return parseDocumentId(ref)?.owner === userId;
}

/**
 * Devuelve el public_id a partir de lo guardado: una referencia ya válida, o una URL de Cloudinary de la propia cuenta
 * (`image/upload` o `image/authenticated`, con firma y versión opcionales). Se conserva EXACTAMENTE la capitalización guardada.
 * Null si no es reconocible.
 */
export function documentRefFromStored(value: unknown, cloudName: string | undefined): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const raw = value.trim();
  if (!raw.includes("://")) return isDocumentId(raw) ? raw : null;
  const cloud = (cloudName ?? "").trim();
  if (!cloud) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "res.cloudinary.com") return null;
  let path: string;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
  const prefix = `/${cloud}/image/`;
  if (!path.startsWith(prefix) || path.includes("..")) return null;
  const rest = path.slice(prefix.length); // "upload/v123/obrabien/..." | "authenticated/s--sig--/v123/..."
  const m = rest.match(/^(?:upload|authenticated)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  const publicId = m[1].replace(/\.[A-Za-z0-9]{2,5}$/, "");
  return isDocumentId(publicId) ? publicId : null;
}
