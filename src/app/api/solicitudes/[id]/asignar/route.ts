// POST /api/solicitudes/[id]/asignar — el cliente asigna el trabajo a uno de
// los maestros que aceptó la solicitud. Sprint 23 (JOB-048/049/050). Ruta
// pre-anunciada desde el Sprint 18 (JOB-023). Toda la regla de negocio (qué
// destinatarios pueden asignarse, qué pasa con el resto, notificaciones) vive
// en solicitudes.ts — acá solo se autentica y se traduce el resultado a HTTP.
// La verificación de que quien pide la asignación es el dueño de la
// solicitud ocurre DENTRO de asignarTrabajo(), no acá — mismo criterio que
// las otras transiciones (responder/aceptar/rechazar verifican pertenencia
// dentro de solicitudes.ts, no en la ruta).

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { asignarTrabajo, SolicitudTransicionError } from "@/lib/solicitudes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const maestroId = typeof body.maestroId === "string" ? body.maestroId : "";
  if (!maestroId) return NextResponse.json({ error: "Falta indicar a qué maestro asignar el trabajo." }, { status: 400 });

  const { id } = await params;

  try {
    const resultado = await asignarTrabajo({ solicitudId: id, clienteClerkUserId: userId, maestroId });
    return NextResponse.json(resultado);
  } catch (err) {
    if (err instanceof SolicitudTransicionError) {
      // "No encontrada" evita confirmar/negar solicitudes ajenas (mismo
      // criterio que GET /api/solicitudes/[id]); el resto de los mensajes
      // son reglas de negocio legítimas sobre una solicitud que sí es tuya.
      const status = err.message === "No encontrada" ? 404 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/solicitudes/[id]/asignar] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
