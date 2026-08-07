// POST /api/solicitudes/[id]/finalizar — el cliente marca oficialmente
// terminado un trabajo ya asignado. Sprint 24 (JOB-054). Toda la regla de
// negocio (qué estado de origen es válido, notificación al maestro) vive en
// solicitudes.ts — acá solo se autentica y se traduce el resultado a HTTP,
// mismo patrón que /asignar (Sprint 23).

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { finalizarTrabajo, SolicitudTransicionError } from "@/lib/solicitudes";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  try {
    const solicitud = await finalizarTrabajo({ solicitudId: id, clienteClerkUserId: userId });
    return NextResponse.json({ solicitud });
  } catch (err) {
    if (err instanceof SolicitudTransicionError) {
      const status = err.message === "No encontrada" ? 404 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/solicitudes/[id]/finalizar] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
