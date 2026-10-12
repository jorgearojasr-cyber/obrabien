// Utilidades de privacidad (hotfix 19A.1).

/** «Juan Pérez González» → «Juan P.»: suficiente para que alguien confirme a quién refiere, sin entregar el nombre completo. */
export function shortName(full: string | null | undefined): string {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Límite de intentos en memoria, por clave (p. ej. «lookup-rut:<userId>»). Es de MEJOR ESFUERZO: en serverless cada instancia tiene su propia
 * memoria, así que reduce la enumeración pero no es una barrera absoluta. La barrera real es exigir sesión y devolver lo mínimo.
 */
export function allowRequest(key: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Solo para pruebas. */
export function resetRateLimits(): void {
  buckets.clear();
}
