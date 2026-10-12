// Proyección explícita de la tabla `maestros` (hotfix de privacidad 19A.1).
//
// Antes: el buscador y el perfil público hacían `select("*")` con la clave service-role, así que cualquier cambio futuro que
// pasara la fila completa a un componente de cliente habría filtrado RUT, identificadores de Clerk y documentos de identidad.
// Ahora las consultas públicas piden SOLO estas columnas. La lista es la fuente de verdad y tiene pruebas negativas
// (tests/security/public-maestro.test.ts): ninguna columna privada puede entrar sin que fallen.

/** Columnas que el sitio público necesita para listar y mostrar un perfil (el teléfono es contacto público por diseño del producto). */
export const PUBLIC_MAESTRO_COLUMNS = [
  "id",
  "nombre",
  "foto_url",
  "descripcion",
  "especialidades",
  "ciudades",
  "horarios",
  "social",
  "telefono",
  "whatsapp",
  "anos_experiencia",
  "atiende_urgencias",
  "especialidades_urgencia",
  "dias_disponibles",
  "formas_pago",
  "modalidad_cobro",
  "frase_destacada",
  "video_url",
  "disponibilidad",
  "verificado",
  "verificacion_estado", // solo en servidor: se reduce a un booleano `verified`; nunca se envía tal cual al navegador
  "perfil_estado",
  "created_at",
  "activo",
] as const;

/** Columnas que NUNCA deben salir en una consulta pública. */
export const PRIVATE_MAESTRO_COLUMNS = [
  "rut",
  "referido_rut",
  "clerk_user_id",
  "cedula_frente",
  "cedula_reverso",
  "selfie_cedula",
  "rechazo_motivo",
  "terminos_aceptados",
  "terminos_aceptados_at",
  "referido_por_maestro_id",
  "como_llego",
  "como_llego_otro",
  "updated_at",
] as const;

/**
 * Lista para `.select(...)` del buscador (sin relaciones). Es un literal (no un `join`) para que el cliente de Supabase tipifique el resultado;
 * una prueba comprueba que coincide EXACTAMENTE con PUBLIC_MAESTRO_COLUMNS.
 */
export const PUBLIC_MAESTRO_SELECT = "id, nombre, foto_url, descripcion, especialidades, ciudades, horarios, social, telefono, whatsapp, anos_experiencia, atiende_urgencias, especialidades_urgencia, dias_disponibles, formas_pago, modalidad_cobro, frase_destacada, video_url, disponibilidad, verificado, verificacion_estado, perfil_estado, created_at, activo";

/** Perfil público: columnas públicas + galería. Se añade `clerk_user_id` SOLO donde se compara con la sesión (isOwnProfile) y nunca sale del servidor. */
export const PUBLIC_PROFILE_SELECT = "id, nombre, foto_url, descripcion, especialidades, ciudades, horarios, social, telefono, whatsapp, anos_experiencia, atiende_urgencias, especialidades_urgencia, dias_disponibles, formas_pago, modalidad_cobro, frase_destacada, video_url, disponibilidad, verificado, verificacion_estado, perfil_estado, created_at, activo, clerk_user_id, fotos_trabajos(url, descripcion)";

/** Quita de una fila cualquier columna privada (defensa en profundidad antes de serializar). */
export function stripPrivateMaestroFields<T extends Record<string, unknown>>(row: T): Omit<T, (typeof PRIVATE_MAESTRO_COLUMNS)[number]> {
  const copy: Record<string, unknown> = { ...row };
  for (const key of PRIVATE_MAESTRO_COLUMNS) delete copy[key];
  return copy as Omit<T, (typeof PRIVATE_MAESTRO_COLUMNS)[number]>;
}
