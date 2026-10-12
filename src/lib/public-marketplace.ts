// Respuesta PÚBLICA de una publicación del Marketplace (hallazgo N1, línea base 19A.7).
//
// Antes, /api/marketplace/item devolvía `select("*")` de marketplace_items a cualquier visitante: incluía el identificador interno de Clerk del
// vendedor (`clerk_user_id`), el estado de pago (`payment_status`) y el indicador administrativo `activo`. Ahora:
//   - la consulta pide solo columnas explícitas (todas confirmadas en el esquema de producción);
//   - la respuesta se construye con una LISTA BLANCA; cualquier columna nueva queda fuera hasta que se autorice aquí;
//   - el navegador ya no recibe el identificador del vendedor: el servidor calcula `viewer_is_seller` con la sesión.
// La autorización real para responder consultas sigue en el servidor (/api/marketplace/responder compara la sesión con el dueño).

/** Columnas públicas de marketplace_items (las que usa rowToListing). `fotos_urls` NO existe en producción: no se pide. */
export const PUBLIC_ITEM_FIELDS = [
  "id", "tipo", "categoria", "titulo", "descripcion", "precio", "precio_unit", "region", "ciudad", "whatsapp", "contact_name", "foto_url", "plan", "created_at",
] as const;

/** Columnas que la ruta necesita en el SERVIDOR (no se devuelven): dueño para resolver el vendedor y comparar con la sesión. */
export const ITEM_SELECT = [...PUBLIC_ITEM_FIELDS, "clerk_user_id"].join(", ");

export type PublicItem = Partial<Record<(typeof PUBLIC_ITEM_FIELDS)[number], unknown>> & {
  seller_role: "maestro" | "cliente";
  seller_foto_url: string | null;
  viewer_is_seller: boolean;
};

export function toPublicItem(
  row: Record<string, unknown>,
  extras: { sellerRole: "maestro" | "cliente"; sellerFotoUrl: string | null; viewerUserId: string | null },
): PublicItem {
  const out: Record<string, unknown> = {};
  for (const f of PUBLIC_ITEM_FIELDS) if (f in row) out[f] = row[f];
  const owner = typeof row.clerk_user_id === "string" ? row.clerk_user_id : "";
  return {
    ...out,
    seller_role: extras.sellerRole,
    seller_foto_url: extras.sellerFotoUrl,
    viewer_is_seller: !!extras.viewerUserId && owner !== "" && extras.viewerUserId === owner,
  };
}
