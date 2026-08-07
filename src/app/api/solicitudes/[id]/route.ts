// GET /api/solicitudes/[id] — obtener el detalle de una Solicitud de Trabajo.
// Sprint 18 (JOB-020/021). Solo el cliente que la creó o alguno de sus
// maestros destinatarios puede verla — cualquier otro usuario recibe 404
// (no 403: evita confirmar/negar la existencia de solicitudes ajenas).
//
// JOB-023 — punto de extensión para transiciones de estado futuras: asignar/
// cancelar irían en src/app/api/solicitudes/[id]/asignar|cancelar/route.ts
// (POST, scoped al cliente dueño), mismo patrón de autorización que este
// archivo. responder/aceptar/rechazar (Sprint 21, JOB-038/039) ya existen en
// src/app/api/solicitudes/[id]/responder|aceptar|rechazar/route.ts.
//
// Sprint 22 (JOB-044/045): la rama del cliente agrega `mensajesPorDestinatario`
// (historial de TODOS sus destinatarios, agrupado) y `maestros` (identidad
// básica para distinguir cada hilo) — el cliente sí ve todo, a diferencia del
// maestro, que solo ve su propia copia (ver el filtro más abajo).

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  obtenerSolicitud,
  resolverMaestroIdPorClerkUserId,
  marcarVistaSiEsPrimeraApertura,
  listarMensajes,
  listarMensajesPorSolicitud,
  obtenerIdentidadMaestros,
  obtenerResenaDeSolicitud,
} from "@/lib/solicitudes";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  let solicitud = await obtenerSolicitud(id);
  if (!solicitud) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const esCliente = solicitud.clienteClerkUserId === userId;
  let esDestinatario = false;
  let maestroId: string | null = null;
  if (!esCliente) {
    maestroId = await resolverMaestroIdPorClerkUserId(userId);
    esDestinatario = !!maestroId && solicitud.destinatarios.some(d => d.maestroId === maestroId);
  }

  if (!esCliente && !esDestinatario) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // JOB-036: la primera apertura del maestro marca su copia como "vista".
  // Toda la lógica de la transición vive en solicitudes.ts — acá solo se
  // decide CUÁNDO llamarla (el destinatario es quien abre, no el cliente).
  let mensajes: Awaited<ReturnType<typeof listarMensajes>> = [];
  if (esDestinatario && maestroId) {
    await marcarVistaSiEsPrimeraApertura(id, maestroId);
    solicitud = (await obtenerSolicitud(id)) ?? solicitud;

    // Un maestro solo debe ver su propia copia — obtenerSolicitud() trae
    // TODOS los destinatarios (necesario para la vista del cliente, que sí
    // debe comparar respuestas entre varios maestros), pero exponerle esa
    // lista completa a un maestro filtraría la identidad y el estado de
    // otros maestros invitados a la misma solicitud.
    solicitud = { ...solicitud, destinatarios: solicitud.destinatarios.filter(d => d.maestroId === maestroId) };

    // JOB-040: historial de ESTE destinatario únicamente — nunca de otros
    // maestros invitados a la misma solicitud (mismo criterio de privacidad
    // de arriba). No se pide para el cliente en este sprint (sin pantalla
    // de cliente todavía).
    const propio = solicitud.destinatarios[0];
    if (propio) mensajes = await listarMensajes(propio.id);
  }

  // JOB-044/045: el cliente ve el historial de cada destinatario que invitó,
  // más la identidad básica de cada maestro para poder distinguirlos.
  // Sprint 24 (JOB-057): también necesita saber si ya dejó la reseña
  // verificada de este trabajo, para mostrar "Calificar maestro" o "Ya fue
  // enviada" — no aplica al maestro, que no tiene ninguna acción nueva
  // sobre la reseña (JOB-058).
  let mensajesPorDestinatario: Awaited<ReturnType<typeof listarMensajesPorSolicitud>> = {};
  let maestros: Awaited<ReturnType<typeof obtenerIdentidadMaestros>> = {};
  let resena: Awaited<ReturnType<typeof obtenerResenaDeSolicitud>> = null;
  if (esCliente) {
    [mensajesPorDestinatario, maestros, resena] = await Promise.all([
      listarMensajesPorSolicitud(id),
      obtenerIdentidadMaestros(solicitud.destinatarios.map(d => d.maestroId)),
      obtenerResenaDeSolicitud(id),
    ]);
  }

  return NextResponse.json({ solicitud, mensajes, mensajesPorDestinatario, maestros, resena });
}
