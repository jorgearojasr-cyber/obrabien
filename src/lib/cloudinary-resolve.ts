// Resolución SEGURA de un documento de identidad en Cloudinary (corrección 19A.2R).
//
// Dado el valor guardado en la base y el dueño esperado (clerk_user_id del maestro), devuelve el identificador REAL que confirma la API de
// Cloudinary. Reglas: (1) el identificador sale del valor guardado sin alterar mayúsculas; (2) la carpeta debe pertenecer al dueño;
// (3) la API debe devolver exactamente ese public_id; (4) cualquier error distinto de «no existe» cierra en falso (no se prueba otro tipo a ciegas).
import { documentOwner, documentRefFromStored } from "./cloudinary-docs";

export type DeliveryType = "authenticated" | "upload";
export type CloudResource = { public_id: string; format: string; bytes?: number };
export interface ResourceApi {
  /** Debe lanzar un error con `http_code: 404` si no existe; cualquier otro error significa fallo de la API. */
  resource(publicId: string, opts: { type: DeliveryType; resource_type: "image" }): Promise<CloudResource>;
}

export type Resolved =
  | { ok: true; publicId: string; type: DeliveryType; format: string }
  | { ok: false; reason: "unrecognized" | "wrong_owner" | "not_found" | "id_mismatch" | "api_error" };

/** «No existe» según Cloudinary. El SDK real rechaza con `{ error: { http_code: 404 } }` (código ANIDADO, comprobado en 19A.5R contra la API);
 *  se acepta también `http_code` en el primer nivel. Cualquier otra forma o código cuenta como fallo de la API (cierra en falso). */
export const isCloudinaryNotFound = (e: unknown): boolean => {
  const x = e as { http_code?: unknown; error?: { http_code?: unknown } | null } | null | undefined;
  return x?.http_code === 404 || x?.error?.http_code === 404;
};
const isNotFound = isCloudinaryNotFound;

export async function resolveDocument(api: ResourceApi, stored: unknown, ownerClerkId: string, cloudName: string | undefined): Promise<Resolved> {
  const requested = documentRefFromStored(stored, cloudName);
  if (!requested) return { ok: false, reason: "unrecognized" };
  if (!ownerClerkId || documentOwner(requested) !== ownerClerkId) return { ok: false, reason: "wrong_owner" };
  // Los documentos nuevos son «authenticated»; los anteriores a la corrección siguen como «upload» hasta migrarlos.
  for (const type of ["authenticated", "upload"] as const) {
    try {
      const res = await api.resource(requested, { type, resource_type: "image" });
      if (res.public_id !== requested) return { ok: false, reason: "id_mismatch" }; // Cloudinary devolvió otro recurso: no se opera
      return { ok: true, publicId: res.public_id, type, format: res.format };
    } catch (e) {
      if (!isNotFound(e)) return { ok: false, reason: "api_error" };
    }
  }
  return { ok: false, reason: "not_found" };
}
