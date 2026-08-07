// Solicitud de Trabajo — servicio compartido de datos.
//
// Diseño funcional: Sprints 15-16. Esquema: supabase/migrations/023_solicitudes.sql
// y 024_solicitud_mensajes.sql (Sprint 21).
//
// RESPONSABILIDAD
//   Único punto de acceso a las tablas solicitudes / solicitud_destinatarios /
//   solicitud_archivos / solicitud_mensajes, y única fuente de las reglas de
//   negocio y transiciones de estado (Sprint 21, regla permanente reiterada en
//   cada sprint desde entonces). Sin lógica de UI ni de rutas HTTP — cada
//   función retorna datos tipados o lanza un Error; el manejo de esa excepción
//   (qué status HTTP devolver, qué mostrar) es responsabilidad de quien la
//   llame (las rutas en src/app/api/solicitudes/), no de este archivo.
//
// HISTORIAL DE FASES
//   Sprint 17 (JOB-012/013): crear, obtener, listar.
//   Sprint 20 (JOB-036): primera transición de estado — marcar "vista".
//   Sprint 21 (JOB-038/039/040/041/042): responder, aceptar/rechazar,
//   historial de mensajes, notificaciones al cliente, y las reglas de
//   negocio que controlan cuándo cada transición es válida.
//   Sprint 22 (JOB-043/044/045/046/047): vista del cliente — listado con
//   indicadores agregados, historial de TODOS los destinatarios de una
//   solicitud (a diferencia del maestro, que solo ve el suyo), e identidad
//   básica de cada maestro para distinguir sus hilos. Sin transiciones
//   nuevas — el cliente solo lee en este sprint.
//   Sprint 23 (JOB-048/049/050/052): primera transición iniciada por el
//   CLIENTE (no el maestro) — asignar el trabajo a uno de los destinatarios
//   en "aceptada". Cierra `solicitudes.estado` (nunca escrito hasta ahora) y
//   mueve a "no_seleccionado" a cualquier otro destinatario que no haya
//   quedado ya en "rechazada"/"expirada", sin importar en qué estado
//   intermedio estuviera — decisión de negocio explícita: una vez asignado
//   el trabajo no quedan oportunidades abiertas para nadie más.
//
// PUNTO DE EXTENSIÓN AÚN PENDIENTE
//   Cierre del trabajo, cotizaciones y cancelación por el cliente —
//   explícitamente fuera de alcance del Sprint 23.

import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ── Tipos ──────────────────────────────────────────────────────────────────

export type SolicitudEstado =
  | "borrador"
  | "enviada"
  | "en_conversacion"
  | "con_propuesta"
  | "cerrada_asignado"
  | "cerrada_sin_resultado"
  | "cancelada";

export type SolicitudDestinatarioEstado =
  | "enviado"
  | "vista"
  | "respondida"
  | "aceptada"
  | "rechazada"
  | "expirada"
  | "no_seleccionado";

export interface Solicitud {
  id: string;
  clienteClerkUserId: string;
  titulo: string | null;
  descripcion: string | null;
  especialidad: string | null;
  region: string | null;
  comuna: string | null;
  estado: SolicitudEstado;
  maestroAsignadoId: string | null;
  createdAt: string;
  enviadaAt: string | null;
  updatedAt: string;
}

export interface SolicitudDestinatario {
  id: string;
  solicitudId: string;
  maestroId: string;
  estado: SolicitudDestinatarioEstado;
  vistaAt: string | null;
  respondidaAt: string | null;
  resueltaAt: string | null;
  createdAt: string;
}

export interface SolicitudArchivo {
  id: string;
  solicitudId: string;
  url: string;
  descripcion: string | null;
  createdAt: string;
}

export type SolicitudMensajeAutorTipo = "cliente" | "maestro";

export interface SolicitudMensaje {
  id: string;
  solicitudDestinatarioId: string;
  autorTipo: SolicitudMensajeAutorTipo;
  autorClerkUserId: string;
  texto: string;
  createdAt: string;
}

/** Forma de conveniencia para detalle/creación — no es una tabla, se arma acá. */
export interface SolicitudConDestinatarios extends Solicitud {
  destinatarios: SolicitudDestinatario[];
  archivos: SolicitudArchivo[];
}

/** Forma de conveniencia para el listado del maestro: su copia + el trabajo original.
 *  archivosCount y clienteNombre (Sprint 20, JOB-033) se calculan acá mismo con
 *  queries agregadas — ninguna pantalla necesita tocar Supabase para tenerlos. */
export interface SolicitudDestinatarioConSolicitud {
  destinatario: SolicitudDestinatario;
  solicitud: Solicitud;
  archivosCount: number;
  clienteNombre: string | null;
}

/** Forma de conveniencia para "Mis solicitudes" del cliente (Sprint 22, JOB-043/046).
 *  destinatariosEstados es un estado por destinatario (para pintar EstadoBadge
 *  en la lista); respondidos cuenta destinatarios con al menos un mensaje;
 *  propuestas cuenta destinatarios en estado "aceptada". Todo calculado acá
 *  con queries agregadas, igual criterio que SolicitudDestinatarioConSolicitud. */
export interface SolicitudConResumen extends Solicitud {
  destinatariosEstados: SolicitudDestinatarioEstado[];
  respondidos: number;
  propuestas: number;
}

// ── Row mappers (snake_case DB → camelCase TS, mismo criterio que rowToMaster) ──

type SolicitudRow = {
  id: string;
  cliente_clerk_user_id: string;
  titulo: string | null;
  descripcion: string | null;
  especialidad: string | null;
  region: string | null;
  comuna: string | null;
  estado: SolicitudEstado;
  maestro_asignado_id: string | null;
  created_at: string;
  enviada_at: string | null;
  updated_at: string;
};

type SolicitudDestinatarioRow = {
  id: string;
  solicitud_id: string;
  maestro_id: string;
  estado: SolicitudDestinatarioEstado;
  vista_at: string | null;
  respondida_at: string | null;
  resuelta_at: string | null;
  created_at: string;
};

type SolicitudArchivoRow = {
  id: string;
  solicitud_id: string;
  url: string;
  descripcion: string | null;
  created_at: string;
};

type SolicitudMensajeRow = {
  id: string;
  solicitud_destinatario_id: string;
  autor_tipo: SolicitudMensajeAutorTipo;
  autor_clerk_user_id: string;
  texto: string;
  created_at: string;
};

function rowToSolicitud(row: SolicitudRow): Solicitud {
  return {
    id: row.id,
    clienteClerkUserId: row.cliente_clerk_user_id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    especialidad: row.especialidad,
    region: row.region,
    comuna: row.comuna,
    estado: row.estado,
    maestroAsignadoId: row.maestro_asignado_id,
    createdAt: row.created_at,
    enviadaAt: row.enviada_at,
    updatedAt: row.updated_at,
  };
}

function rowToDestinatario(row: SolicitudDestinatarioRow): SolicitudDestinatario {
  return {
    id: row.id,
    solicitudId: row.solicitud_id,
    maestroId: row.maestro_id,
    estado: row.estado,
    vistaAt: row.vista_at,
    respondidaAt: row.respondida_at,
    resueltaAt: row.resuelta_at,
    createdAt: row.created_at,
  };
}

function rowToArchivo(row: SolicitudArchivoRow): SolicitudArchivo {
  return {
    id: row.id,
    solicitudId: row.solicitud_id,
    url: row.url,
    descripcion: row.descripcion,
    createdAt: row.created_at,
  };
}

function rowToMensaje(row: SolicitudMensajeRow): SolicitudMensaje {
  return {
    id: row.id,
    solicitudDestinatarioId: row.solicitud_destinatario_id,
    autorTipo: row.autor_tipo,
    autorClerkUserId: row.autor_clerk_user_id,
    texto: row.texto,
    createdAt: row.created_at,
  };
}

// ── Validación de negocio (JOB-022) ─────────────────────────────────────────
// "Borrador" puede estar incompleto a propósito (ver migración 023 — todos
// los campos de contenido son NULLABLE en el esquema). Los campos mínimos
// para "enviada" son una regla de negocio, no una restricción SQL, así que
// vive acá. Lista mínima según el diseño funcional (Sprints 15-16): una
// solicitud no significa nada sin descripción, ubicación y al menos un
// destinatario — el resto (título, especialidad, comuna, fotos) es
// enriquecimiento opcional. Ajustable si el producto define otro mínimo.
export class SolicitudValidationError extends Error {
  constructor(message: string, public campos: string[]) {
    super(message);
    this.name = "SolicitudValidationError";
  }
}

// Sprint 21 (JOB-042): error específico para transiciones de estado inválidas
// (responder/aceptar/rechazar en un estado que no lo permite) — distinto de
// SolicitudValidationError, que es sobre el CONTENIDO del formulario. Ambos
// son errores "esperados" del negocio (400), no fallas del sistema (500);
// separarlos deja más claro en las rutas qué pasó y por qué.
export class SolicitudTransicionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SolicitudTransicionError";
  }
}

function validarParaEnviar(input: CrearSolicitudInput): void {
  const faltantes: string[] = [];
  if (!input.descripcion?.trim()) faltantes.push("descripcion");
  if (!input.region?.trim()) faltantes.push("region");
  if (!input.maestroIds || input.maestroIds.length === 0) faltantes.push("maestroIds");

  if (faltantes.length > 0) {
    throw new SolicitudValidationError(
      `Faltan campos obligatorios para enviar la solicitud: ${faltantes.join(", ")}`,
      faltantes
    );
  }
}

// ── Crear ──────────────────────────────────────────────────────────────────

export interface CrearSolicitudInput {
  clienteClerkUserId: string;
  titulo?: string;
  descripcion?: string;
  especialidad?: string;
  region?: string;
  comuna?: string;
  /** Si viene con al menos un id, la solicitud se crea directamente "enviada"
   *  (previa validación, ver validarParaEnviar) y se insertan sus
   *  destinatarios en el mismo llamado. Si viene vacío u omitido, la
   *  solicitud queda en "borrador" sin ninguna validación. */
  maestroIds?: string[];
  archivos?: { url: string; descripcion?: string }[];
}

export async function crearSolicitud(input: CrearSolicitudInput): Promise<SolicitudConDestinatarios> {
  const supabase = getSupabaseAdmin();
  const enviando = (input.maestroIds?.length ?? 0) > 0;
  const ahora = new Date().toISOString();

  if (enviando) validarParaEnviar(input);

  const { data: row, error } = await supabase
    .from("solicitudes")
    .insert({
      cliente_clerk_user_id: input.clienteClerkUserId,
      titulo: input.titulo ?? null,
      descripcion: input.descripcion ?? null,
      especialidad: input.especialidad ?? null,
      region: input.region ?? null,
      comuna: input.comuna ?? null,
      estado: enviando ? "enviada" : "borrador",
      enviada_at: enviando ? ahora : null,
    })
    .select()
    .single();

  if (error || !row) {
    throw new Error(`[solicitudes] error creando solicitud: ${error?.message ?? "sin datos"}`);
  }

  let destinatarios: SolicitudDestinatario[] = [];
  if (enviando && input.maestroIds) {
    const { data: destRows, error: destError } = await supabase
      .from("solicitud_destinatarios")
      .insert(input.maestroIds.map(maestroId => ({ solicitud_id: row.id, maestro_id: maestroId })))
      .select();
    if (destError) throw new Error(`[solicitudes] error creando destinatarios: ${destError.message}`);
    destinatarios = (destRows ?? []).map(rowToDestinatario);
  }

  let archivos: SolicitudArchivo[] = [];
  if (input.archivos && input.archivos.length > 0) {
    const { data: archRows, error: archError } = await supabase
      .from("solicitud_archivos")
      .insert(input.archivos.map(a => ({ solicitud_id: row.id, url: a.url, descripcion: a.descripcion ?? null })))
      .select();
    if (archError) throw new Error(`[solicitudes] error creando archivos: ${archError.message}`);
    archivos = (archRows ?? []).map(rowToArchivo);
  }

  return { ...rowToSolicitud(row as SolicitudRow), destinatarios, archivos };
}

// ── Obtener ────────────────────────────────────────────────────────────────

export async function obtenerSolicitud(id: string): Promise<SolicitudConDestinatarios | null> {
  const supabase = getSupabaseAdmin();
  const [{ data: row }, { data: destRows }, { data: archRows }] = await Promise.all([
    supabase.from("solicitudes").select("*").eq("id", id).maybeSingle(),
    supabase.from("solicitud_destinatarios").select("*").eq("solicitud_id", id),
    supabase.from("solicitud_archivos").select("*").eq("solicitud_id", id),
  ]);

  if (!row) return null;

  return {
    ...rowToSolicitud(row as SolicitudRow),
    destinatarios: (destRows ?? []).map(r => rowToDestinatario(r as SolicitudDestinatarioRow)),
    archivos: (archRows ?? []).map(r => rowToArchivo(r as SolicitudArchivoRow)),
  };
}

// ── Listar ─────────────────────────────────────────────────────────────────

/** Solicitudes creadas por un cliente — usada por "Mis solicitudes" del dashboard cliente (Sprint 22).
 *  Mismo criterio de Sprint 20 (listarSolicitudesPorMaestro): la lista base se
 *  enriquece con 2 queries agregadas (no N+1) para los indicadores de JOB-046. */
export async function listarSolicitudesPorCliente(clienteClerkUserId: string): Promise<SolicitudConResumen[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("solicitudes")
    .select("*")
    .eq("cliente_clerk_user_id", clienteClerkUserId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`[solicitudes] error listando por cliente: ${error.message}`);
  const solicitudes = (data ?? []).map(r => rowToSolicitud(r as SolicitudRow));
  if (solicitudes.length === 0) return [];

  const solicitudIds = solicitudes.map(s => s.id);
  const { data: destRows } = await supabase
    .from("solicitud_destinatarios")
    .select("id, solicitud_id, estado")
    .in("solicitud_id", solicitudIds);

  const destinatarios = (destRows ?? []) as { id: string; solicitud_id: string; estado: SolicitudDestinatarioEstado }[];
  const destIds = destinatarios.map(d => d.id);

  const { data: msgRows } = destIds.length > 0
    ? await supabase.from("solicitud_mensajes").select("solicitud_destinatario_id").in("solicitud_destinatario_id", destIds)
    : { data: [] as { solicitud_destinatario_id: string }[] };

  const destinatariosConMensaje = new Set((msgRows ?? []).map(m => m.solicitud_destinatario_id));

  const porSolicitud: Record<string, { estados: SolicitudDestinatarioEstado[]; respondidos: number; propuestas: number }> = {};
  for (const d of destinatarios) {
    const bucket = (porSolicitud[d.solicitud_id] ??= { estados: [], respondidos: 0, propuestas: 0 });
    bucket.estados.push(d.estado);
    if (destinatariosConMensaje.has(d.id)) bucket.respondidos++;
    if (d.estado === "aceptada") bucket.propuestas++;
  }

  return solicitudes.map(s => {
    const bucket = porSolicitud[s.id] ?? { estados: [], respondidos: 0, propuestas: 0 };
    return { ...s, destinatariosEstados: bucket.estados, respondidos: bucket.respondidos, propuestas: bucket.propuestas };
  });
}

/** Solicitudes recibidas por un maestro — usada por "Solicitudes recibidas" del dashboard maestro (Sprint 20). */
export async function listarSolicitudesPorMaestro(maestroId: string): Promise<SolicitudDestinatarioConSolicitud[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("solicitud_destinatarios")
    .select("*, solicitudes(*)")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`[solicitudes] error listando por maestro: ${error.message}`);

  const rows = (data ?? []).map(r => r as SolicitudDestinatarioRow & { solicitudes: SolicitudRow });
  if (rows.length === 0) return [];

  // Dos queries agregadas para todo el listado (no N+1), mismo patrón ya
  // usado en buscar/page.tsx para reseñas/referidos.
  const solicitudIds = rows.map(r => r.solicitud_id);
  const clienteIds = Array.from(new Set(rows.map(r => r.solicitudes.cliente_clerk_user_id)));

  const [{ data: archRows }, { data: clienteRows }] = await Promise.all([
    supabase.from("solicitud_archivos").select("solicitud_id").in("solicitud_id", solicitudIds),
    supabase.from("clientes").select("user_id, nombre").in("user_id", clienteIds),
  ]);

  const archivosCountMap: Record<string, number> = {};
  for (const a of (archRows ?? []) as { solicitud_id: string }[]) {
    archivosCountMap[a.solicitud_id] = (archivosCountMap[a.solicitud_id] ?? 0) + 1;
  }

  const clienteNombreMap: Record<string, string> = {};
  for (const c of (clienteRows ?? []) as { user_id: string; nombre: string | null }[]) {
    if (c.nombre) clienteNombreMap[c.user_id] = c.nombre;
  }

  return rows.map(row => ({
    destinatario: rowToDestinatario(row),
    solicitud: rowToSolicitud(row.solicitudes),
    archivosCount: archivosCountMap[row.solicitud_id] ?? 0,
    clienteNombre: clienteNombreMap[row.solicitudes.cliente_clerk_user_id] ?? null,
  }));
}

// ── Identidad: Clerk → maestros.id ──────────────────────────────────────────
// solicitud_destinatarios.maestro_id referencia maestros(id) (uuid), no el
// clerk_user_id del maestro (ver migración 023 — FK real, a diferencia de
// empleos_postulaciones). Cualquier ruta que necesite "las solicitudes de ESTE
// maestro logueado" o "¿este usuario es uno de los destinatarios?" necesita
// resolver esa identidad primero — se centraliza acá para que ninguna ruta
// repita esta misma consulta a `maestros`.
export async function resolverMaestroIdPorClerkUserId(clerkUserId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("maestros")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

// ── Transición de estado: primera apertura (JOB-036, Sprint 20) ────────────
// Única transición de estado que existe hasta ahora — toda su lógica vive
// acá, no en la ruta ni en la UI (la UI nunca cambia estados directamente).
// El UPDATE está condicionado a `estado = 'enviado'` a propósito: es un
// upgrade atómico de un solo paso (nunca "downgrade" desde vista/respondida/
// aceptada/rechazada/expirada/no_seleccionado), y evita una carrera de
// lectura-luego-escritura si el maestro abre la misma solicitud en dos
// pestañas a la vez — el UPDATE condicional resuelve eso solo, sin necesitar
// un SELECT previo.
export async function marcarVistaSiEsPrimeraApertura(solicitudId: string, maestroId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("solicitud_destinatarios")
    .update({ estado: "vista", vista_at: new Date().toISOString() })
    .eq("solicitud_id", solicitudId)
    .eq("maestro_id", maestroId)
    .eq("estado", "enviado");

  if (error) throw new Error(`[solicitudes] error marcando como vista: ${error.message}`);
}

// ── Sprint 21: responder / aceptar / rechazar ───────────────────────────────

// Trae el destinatario y su solicitud padre en una sola consulta — lo
// necesitan las 3 transiciones de abajo para (a) confirmar que el
// destinatario pertenece al maestro que pide la acción, y (b) tener a mano
// cliente_clerk_user_id/especialidad para la notificación, sin una segunda
// consulta.
async function obtenerDestinatarioConSolicitud(
  solicitudId: string,
  maestroId: string
): Promise<(SolicitudDestinatarioRow & { solicitudes: SolicitudRow }) | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("solicitud_destinatarios")
    .select("*, solicitudes(*)")
    .eq("solicitud_id", solicitudId)
    .eq("maestro_id", maestroId)
    .maybeSingle();
  return (data as (SolicitudDestinatarioRow & { solicitudes: SolicitudRow }) | null) ?? null;
}

// JOB-041: una notificación fallida no debe tumbar la transición de estado
// que el maestro sí está esperando (aceptar/rechazar/responder ya se
// guardó) — se registra el error y se sigue, no se relanza.
async function notificarCliente(clienteClerkUserId: string, tipo: string, mensaje: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("notificaciones")
    .insert({ user_id: clienteClerkUserId, tipo, mensaje, leida: false });
  if (error) console.error(`[solicitudes] error creando notificación (${tipo}):`, error.message);
}

// JOB-038/042: responder. Válido únicamente desde "enviado"/"vista" — una vez
// "respondida" (o cualquier otro estado), el maestro no puede volver a
// responder hasta que el cliente escriba (regla explícita, chequeada además
// por el último mensaje del hilo para que sea correcta incluso cuando exista
// respuesta del cliente en un sprint futuro).
const ESTADOS_QUE_PERMITEN_RESPONDER: SolicitudDestinatarioEstado[] = ["enviado", "vista"];

export async function responderSolicitud(params: {
  solicitudId: string;
  maestroId: string;
  autorClerkUserId: string;
  texto: string;
}): Promise<{ mensaje: SolicitudMensaje; destinatario: SolicitudDestinatario }> {
  const { solicitudId, maestroId, autorClerkUserId, texto } = params;

  if (!texto?.trim()) {
    throw new SolicitudValidationError("El mensaje no puede estar vacío.", ["texto"]);
  }

  const supabase = getSupabaseAdmin();
  const combo = await obtenerDestinatarioConSolicitud(solicitudId, maestroId);
  if (!combo) throw new SolicitudTransicionError("No se encontró la solicitud para este maestro.");

  const destinatario = rowToDestinatario(combo);

  if (destinatario.estado === "expirada") {
    throw new SolicitudTransicionError("Esta solicitud expiró — ya no se puede responder.");
  }
  if (!ESTADOS_QUE_PERMITEN_RESPONDER.includes(destinatario.estado)) {
    throw new SolicitudTransicionError("Ya respondiste esta solicitud — espera a que el cliente escriba antes de responder de nuevo.");
  }

  const { data: ultimoMensaje } = await supabase
    .from("solicitud_mensajes")
    .select("autor_tipo")
    .eq("solicitud_destinatario_id", destinatario.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (ultimoMensaje && (ultimoMensaje as { autor_tipo: string }).autor_tipo === "maestro") {
    throw new SolicitudTransicionError("Ya respondiste esta solicitud — espera a que el cliente escriba antes de responder de nuevo.");
  }

  const { data: mensajeRow, error: mensajeError } = await supabase
    .from("solicitud_mensajes")
    .insert({
      solicitud_destinatario_id: destinatario.id,
      autor_tipo: "maestro",
      autor_clerk_user_id: autorClerkUserId,
      texto: texto.trim(),
    })
    .select()
    .single();
  if (mensajeError || !mensajeRow) {
    throw new Error(`[solicitudes] error creando mensaje: ${mensajeError?.message ?? "sin datos"}`);
  }

  const { data: destActualizado, error: updError } = await supabase
    .from("solicitud_destinatarios")
    .update({ estado: "respondida", respondida_at: new Date().toISOString() })
    .eq("id", destinatario.id)
    .select()
    .single();
  if (updError || !destActualizado) {
    throw new Error(`[solicitudes] error actualizando estado: ${updError?.message ?? "sin datos"}`);
  }

  await notificarCliente(
    combo.solicitudes.cliente_clerk_user_id,
    "solicitud_respondida",
    `Un maestro respondió tu solicitud${combo.solicitudes.especialidad ? ` de ${combo.solicitudes.especialidad}` : ""}.`
  );

  return {
    mensaje: rowToMensaje(mensajeRow as SolicitudMensajeRow),
    destinatario: rowToDestinatario(destActualizado as SolicitudDestinatarioRow),
  };
}

// JOB-039/042: aceptar o rechazar. Reglas explícitas: no aceptar después de
// rechazar, no rechazar después de aceptar, nada sobre una solicitud
// expirada o ya cerrada por el cliente (no_seleccionado — ningún código
// produce ese estado todavía, pero la regla queda lista para cuando exista
// "asignar").
export async function actualizarEstadoDestinatario(params: {
  solicitudId: string;
  maestroId: string;
  nuevoEstado: "aceptada" | "rechazada";
}): Promise<SolicitudDestinatario> {
  const { solicitudId, maestroId, nuevoEstado } = params;
  const supabase = getSupabaseAdmin();

  const combo = await obtenerDestinatarioConSolicitud(solicitudId, maestroId);
  if (!combo) throw new SolicitudTransicionError("No se encontró la solicitud para este maestro.");
  const destinatario = rowToDestinatario(combo);

  if (destinatario.estado === "expirada") {
    throw new SolicitudTransicionError("Esta solicitud expiró.");
  }
  if (destinatario.estado === "no_seleccionado") {
    throw new SolicitudTransicionError("Esta solicitud ya fue cerrada por el cliente.");
  }
  if (nuevoEstado === "aceptada" && destinatario.estado === "rechazada") {
    throw new SolicitudTransicionError("No puedes aceptar un trabajo que ya rechazaste.");
  }
  if (nuevoEstado === "rechazada" && destinatario.estado === "aceptada") {
    throw new SolicitudTransicionError("No puedes rechazar un trabajo que ya aceptaste.");
  }
  if (destinatario.estado === nuevoEstado) {
    throw new SolicitudTransicionError(`Ya ${nuevoEstado === "aceptada" ? "aceptaste" : "rechazaste"} este trabajo.`);
  }

  const { data: actualizado, error } = await supabase
    .from("solicitud_destinatarios")
    .update({ estado: nuevoEstado, resuelta_at: new Date().toISOString() })
    .eq("id", destinatario.id)
    .select()
    .single();
  if (error || !actualizado) {
    throw new Error(`[solicitudes] error actualizando estado: ${error?.message ?? "sin datos"}`);
  }

  await notificarCliente(
    combo.solicitudes.cliente_clerk_user_id,
    nuevoEstado === "aceptada" ? "solicitud_aceptada" : "solicitud_rechazada",
    nuevoEstado === "aceptada"
      ? `Un maestro aceptó tu solicitud${combo.solicitudes.especialidad ? ` de ${combo.solicitudes.especialidad}` : ""}.`
      : `Un maestro no puede realizar tu solicitud${combo.solicitudes.especialidad ? ` de ${combo.solicitudes.especialidad}` : ""}.`
  );

  return rowToDestinatario(actualizado as SolicitudDestinatarioRow);
}

// JOB-040: historial cronológico de un destinatario puntual — nunca de la
// solicitud completa, así que llamarla ya implica el filtro de privacidad
// (quien la invoca debe haber resuelto antes el solicitud_destinatario_id
// que le pertenece al maestro que pregunta; ver api/solicitudes/[id]/route.ts).
export async function listarMensajes(solicitudDestinatarioId: string): Promise<SolicitudMensaje[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("solicitud_mensajes")
    .select("*")
    .eq("solicitud_destinatario_id", solicitudDestinatarioId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`[solicitudes] error listando mensajes: ${error.message}`);
  return (data ?? []).map(r => rowToMensaje(r as SolicitudMensajeRow));
}

// ── Sprint 22: vista del cliente ────────────────────────────────────────────

// JOB-045: mismo historial que listarMensajes(), pero para TODOS los
// destinatarios de una solicitud a la vez, agrupados por destinatario — el
// cliente sí debe poder ver el hilo de cada maestro que invitó (a diferencia
// del maestro, que solo ve el suyo; ver el filtro de privacidad en
// api/solicitudes/[id]/route.ts, comentario de Sprint 20). Una sola query
// agregada, no una por destinatario.
export async function listarMensajesPorSolicitud(solicitudId: string): Promise<Record<string, SolicitudMensaje[]>> {
  const supabase = getSupabaseAdmin();
  const { data: destRows } = await supabase
    .from("solicitud_destinatarios")
    .select("id")
    .eq("solicitud_id", solicitudId);

  const destIds = (destRows ?? []).map(d => (d as { id: string }).id);
  if (destIds.length === 0) return {};

  const { data, error } = await supabase
    .from("solicitud_mensajes")
    .select("*")
    .in("solicitud_destinatario_id", destIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`[solicitudes] error listando mensajes por solicitud: ${error.message}`);

  const agrupados: Record<string, SolicitudMensaje[]> = {};
  for (const row of (data ?? []) as SolicitudMensajeRow[]) {
    const mensaje = rowToMensaje(row);
    (agrupados[mensaje.solicitudDestinatarioId] ??= []).push(mensaje);
  }
  return agrupados;
}

// JOB-044: identidad básica (nombre/foto) de los maestros de una solicitud —
// el cliente necesita saber DE QUIÉN es cada hilo del historial, ya que ve
// varios destinatarios a la vez (a diferencia del maestro, que ya sabe quién
// es). Deliberadamente NO se arma un Master ni se llama getTrustResult() acá:
// ninguno de los JOB-043 a JOB-047 pide mostrar nivel de confianza, así que
// agregarlo sería ampliar el alcance por iniciativa propia — solo identidad
// mínima. Consulta agregada, no una por maestro.
//
// Sprint 23 (JOB-052): se agregó clerkUserId a la MISMA consulta (una
// columna más en el SELECT ya existente, ninguna consulta nueva) — hace
// falta para poder notificar a un maestro por primera vez, ver
// notificarMaestro() más abajo.
export async function obtenerIdentidadMaestros(
  maestroIds: string[]
): Promise<Record<string, { nombre: string; fotoUrl: string | null; clerkUserId: string | null }>> {
  if (maestroIds.length === 0) return {};
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("maestros")
    .select("id, nombre, foto_url, clerk_user_id")
    .in("id", Array.from(new Set(maestroIds)));
  if (error) throw new Error(`[solicitudes] error obteniendo identidad de maestros: ${error.message}`);

  const mapa: Record<string, { nombre: string; fotoUrl: string | null; clerkUserId: string | null }> = {};
  for (const m of (data ?? []) as { id: string; nombre: string | null; foto_url: string | null; clerk_user_id: string | null }[]) {
    mapa[m.id] = { nombre: m.nombre ?? "Maestro", fotoUrl: m.foto_url, clerkUserId: m.clerk_user_id };
  }
  return mapa;
}

// ── Sprint 23: asignación del trabajo (cliente) ─────────────────────────────

// JOB-052: notificación hacia un MAESTRO — dirección inversa a
// notificarCliente() (Sprint 21). Se mantiene como función separada a
// propósito, mismo estilo y misma resiliencia (una notificación fallida no
// debe tumbar la asignación, que ya se guardó): decisión explícita de no
// generalizar código ya validado en producción por una sola dirección nueva.
async function notificarMaestro(maestroClerkUserId: string, tipo: string, mensaje: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("notificaciones")
    .insert({ user_id: maestroClerkUserId, tipo, mensaje, leida: false });
  if (error) console.error(`[solicitudes] error creando notificación (${tipo}):`, error.message);
}

// JOB-048/049: el cliente asigna el trabajo a un destinatario en "aceptada".
// Regla de negocio confirmada explícitamente para este sprint: al asignar,
// CUALQUIER destinatario que no sea el elegido pasa a "no_seleccionado" sin
// importar en qué estado intermedio estuviera (enviado/vista/respondida/
// aceptada) — una vez cerrado el trabajo no quedan oportunidades abiertas
// para nadie más. Los únicos que NO cambian son "rechazada" y "expirada":
// ya son estados finales por sí mismos, "no_seleccionado" no agrega
// información ahí y sobrescribirlos perdería la razón real de por qué
// quedaron fuera.
const ESTADOS_QUE_NO_CAMBIAN_AL_ASIGNAR: SolicitudDestinatarioEstado[] = ["rechazada", "expirada"];

export async function asignarTrabajo(params: {
  solicitudId: string;
  clienteClerkUserId: string;
  maestroId: string;
}): Promise<{ solicitud: Solicitud; destinatarios: SolicitudDestinatario[] }> {
  const { solicitudId, clienteClerkUserId, maestroId } = params;
  const supabase = getSupabaseAdmin();

  const { data: solicitudRow } = await supabase
    .from("solicitudes")
    .select("*")
    .eq("id", solicitudId)
    .maybeSingle();
  if (!solicitudRow) throw new SolicitudTransicionError("No encontrada");

  const solicitudActual = rowToSolicitud(solicitudRow as SolicitudRow);
  // Mismo mensaje que "no existe" a propósito: no confirmar ni negar la
  // existencia de una solicitud ajena (mismo criterio que GET /api/solicitudes/[id]).
  if (solicitudActual.clienteClerkUserId !== clienteClerkUserId) {
    throw new SolicitudTransicionError("No encontrada");
  }
  if (solicitudActual.estado === "cerrada_asignado") {
    throw new SolicitudTransicionError("Esta solicitud ya fue asignada a un maestro.");
  }

  const { data: destRows, error: destError } = await supabase
    .from("solicitud_destinatarios")
    .select("*")
    .eq("solicitud_id", solicitudId);
  if (destError) throw new Error(`[solicitudes] error obteniendo destinatarios: ${destError.message}`);
  const destinatarios = (destRows ?? []).map(r => rowToDestinatario(r as SolicitudDestinatarioRow));

  const elegido = destinatarios.find(d => d.maestroId === maestroId);
  if (!elegido) throw new SolicitudTransicionError("Ese maestro no es un destinatario de esta solicitud.");
  if (elegido.estado !== "aceptada") {
    throw new SolicitudTransicionError("Solo puedes asignar el trabajo a un maestro que haya aceptado.");
  }

  const ahora = new Date().toISOString();

  const { data: solActualizada, error: solError } = await supabase
    .from("solicitudes")
    .update({ estado: "cerrada_asignado", maestro_asignado_id: maestroId })
    .eq("id", solicitudId)
    .select()
    .single();
  if (solError || !solActualizada) {
    throw new Error(`[solicitudes] error asignando solicitud: ${solError?.message ?? "sin datos"}`);
  }

  const idsANoSeleccionar = destinatarios
    .filter(d => d.id !== elegido.id && !ESTADOS_QUE_NO_CAMBIAN_AL_ASIGNAR.includes(d.estado))
    .map(d => d.id);

  let destinatariosFinal = destinatarios;
  if (idsANoSeleccionar.length > 0) {
    const { data: movidos, error: movError } = await supabase
      .from("solicitud_destinatarios")
      .update({ estado: "no_seleccionado", resuelta_at: ahora })
      .in("id", idsANoSeleccionar)
      .select();
    if (movError) {
      throw new Error(`[solicitudes] error actualizando destinatarios no seleccionados: ${movError.message}`);
    }
    const movidosMap = new Map(
      (movidos ?? []).map(r => [(r as SolicitudDestinatarioRow).id, rowToDestinatario(r as SolicitudDestinatarioRow)])
    );
    destinatariosFinal = destinatarios.map(d => movidosMap.get(d.id) ?? d);
  }

  // Notificaciones — mismo criterio que Sprint 21: no deben tumbar la
  // asignación si fallan, ya se guardó lo importante.
  const identidades = await obtenerIdentidadMaestros(destinatarios.map(d => d.maestroId));
  const especialidadTxt = solicitudActual.especialidad ? ` de ${solicitudActual.especialidad}` : "";

  const clerkIdElegido = identidades[elegido.maestroId]?.clerkUserId;
  const notificaciones: Promise<void>[] = [];
  if (clerkIdElegido) {
    notificaciones.push(notificarMaestro(clerkIdElegido, "solicitud_asignada", `El cliente te asignó el trabajo${especialidadTxt}.`));
  }
  for (const id of idsANoSeleccionar) {
    const dest = destinatarios.find(d => d.id === id);
    const clerkId = dest ? identidades[dest.maestroId]?.clerkUserId : null;
    if (clerkId) {
      notificaciones.push(notificarMaestro(clerkId, "solicitud_no_seleccionado", `El cliente eligió a otro maestro para su solicitud${especialidadTxt}.`));
    }
  }
  await Promise.all(notificaciones);

  return { solicitud: rowToSolicitud(solActualizada as SolicitudRow), destinatarios: destinatariosFinal };
}
