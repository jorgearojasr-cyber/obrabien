// Lectura administrativa de documentos de identidad (hotfix de privacidad 19A.1).
//
// El administrador nunca recibe la referencia ni una URL permanente: pide `/api/admin/documento?maestro=<id>&campo=frente|reverso|selfie`,
// el servidor comprueba que es el administrador (src/lib/authz.ts) y responde con una redirección a una URL de descarga FIRMADA y de
// vida corta (Admin API de Cloudinary: `private_download_url` con `expires_at`). La respuesta no se almacena en caché.
import { DOCUMENT_COLUMN, DOCUMENT_FIELDS, type DocumentField } from "./cloudinary-docs";

/** Vida de la URL de descarga, en segundos. Suficiente para abrir la imagen; no sirve para compartir el enlace. */
export const DOCUMENT_LINK_TTL_SECONDS = 120;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type DocumentRequest = { ok: true; maestroId: string; field: DocumentField; column: (typeof DOCUMENT_COLUMN)[DocumentField] } | { ok: false };

export function parseDocumentRequest(params: URLSearchParams): DocumentRequest {
  const maestroId = params.get("maestro") ?? "";
  const field = params.get("campo") ?? "";
  if (!UUID_RE.test(maestroId)) return { ok: false };
  if (!(DOCUMENT_FIELDS as readonly string[]).includes(field)) return { ok: false };
  const typed = field as DocumentField;
  return { ok: true, maestroId: maestroId.toLowerCase(), field: typed, column: DOCUMENT_COLUMN[typed] };
}

export function documentLinkExpiry(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000) + DOCUMENT_LINK_TTL_SECONDS;
}

/** Enlace interno que ve el administrador en la lista de verificaciones (nunca la URL de Cloudinary). */
export function adminDocumentLink(maestroId: string, field: DocumentField): string {
  return `/api/admin/documento?maestro=${encodeURIComponent(maestroId)}&campo=${field}`;
}
