// Validación del destino de /api/imagen-proxy (hotfix de privacidad 19A.1).
//
// Antes el endpoint hacía `fetch(url)` sobre CUALQUIER dirección recibida, sin sesión: un proxy abierto (SSRF hacia la red interna,
// el servicio de metadatos del proveedor o sitios arbitrarios) que además respondía con `Access-Control-Allow-Origin: *`.
// El único uso legítimo es traer la foto de perfil (Cloudinary) para generar la tarjeta descargable. Ahora solo se permite:
//   https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/image/upload/...   (entrega pública de imágenes de la propia cuenta)
// y se rechaza todo lo demás, incluidas las carpetas de documentos de identidad y cualquier tipo de entrega no pública.

export const MAX_PROXY_BYTES = 6 * 1024 * 1024;
export const PROXY_TIMEOUT_MS = 8000;

export type ProxyTarget = { ok: true; url: URL } | { ok: false; reason: string };

const FORBIDDEN_SEGMENTS = [/\/cedulas?(\/|$)/i, /\/authenticated\//i, /\/private\//i, /\/verificacion/i, /\/documentos?(\/|$)/i, /selfie/i];

export function validateProxyTarget(raw: string | null | undefined, cloudName: string | undefined): ProxyTarget {
  if (!raw) return { ok: false, reason: "missing" };
  if (raw.length > 2048) return { ok: false, reason: "too_long" };
  const cloud = (cloudName ?? "").trim();
  if (!cloud) return { ok: false, reason: "not_configured" };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "protocol" };
  if (url.username || url.password) return { ok: false, reason: "credentials" };
  if (url.port && url.port !== "443") return { ok: false, reason: "port" };
  if (url.hostname.toLowerCase() !== "res.cloudinary.com") return { ok: false, reason: "host" };

  // Se decodifica para detectar `..` o separadores codificados; la comparación se hace sobre la ruta decodificada.
  let decoded: string;
  try {
    decoded = decodeURIComponent(url.pathname);
  } catch {
    return { ok: false, reason: "bad_encoding" };
  }
  if (decoded.includes("..") || decoded.includes("\\") || decoded.includes("\u0000")) return { ok: false, reason: "path_traversal" };
  if (!decoded.startsWith(`/${cloud}/image/upload/`)) return { ok: false, reason: "path" };
  if (FORBIDDEN_SEGMENTS.some((rx) => rx.test(decoded))) return { ok: false, reason: "private_folder" };
  return { ok: true, url };
}
