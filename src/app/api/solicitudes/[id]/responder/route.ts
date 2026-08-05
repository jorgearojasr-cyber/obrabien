// POST /api/solicitudes/[id]/responder — el maestro responde al cliente.
// Sprint 21 (JOB-038). Ruta pre-anunciada desde el Sprint 18 (JOB-023).
// Toda la regla de negocio (qué estados permiten responder, el mensaje, la
// notificación) vive en solicitudes.ts — acá solo se autentica, se resuelve
// la identidad y se traduce el resultado a HTTP.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  responderSolicitud,
  resolverMaestroIdPorClerkUserId,
  SolicitudValidationError,
  SolicitudTransicionError,
} from "@/lib/solicitudes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const maestroId = await resolverMaestroIdPorClerkUserId(userId);
  if (!maestroId) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const resultado = await responderSolicitud({
      solicitudId: id,
      maestroId,
      autorClerkUserId: userId,
      texto: typeof body.texto === "string" ? body.texto : "",
    });
    return NextResponse.json(resultado);
  } catch (err) {
    if (err instanceof SolicitudValidationError) {
      return NextResponse.json({ error: err.message, campos: err.campos }, { status: 400 });
    }
    if (err instanceof SolicitudTransicionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/solicitudes/[id]/responder] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
