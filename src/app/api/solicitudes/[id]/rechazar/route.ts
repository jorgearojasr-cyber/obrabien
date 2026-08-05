// POST /api/solicitudes/[id]/rechazar — el maestro indica que no puede
// realizar el trabajo. Sprint 21 (JOB-039). Ruta pre-anunciada desde el
// Sprint 18 (JOB-023). Toda la regla de negocio vive en solicitudes.ts — acá
// solo se autentica, se resuelve la identidad y se traduce el resultado a HTTP.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  actualizarEstadoDestinatario,
  resolverMaestroIdPorClerkUserId,
  SolicitudTransicionError,
} from "@/lib/solicitudes";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const maestroId = await resolverMaestroIdPorClerkUserId(userId);
  if (!maestroId) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const { id } = await params;

  try {
    const destinatario = await actualizarEstadoDestinatario({ solicitudId: id, maestroId, nuevoEstado: "rechazada" });
    return NextResponse.json({ destinatario });
  } catch (err) {
    if (err instanceof SolicitudTransicionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/solicitudes/[id]/rechazar] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
