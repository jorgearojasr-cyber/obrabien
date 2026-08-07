// POST /api/solicitudes/[id]/resena — el cliente deja la reseña verificada
// del trabajo terminado. Sprint 24 (JOB-055/056). Nunca recibe un maestroId
// en el body: la reseña siempre apunta al maestro asignado de la propia
// solicitud — esa regla vive en crearResenaVerificada() (solicitudes.ts),
// esta ruta solo autentica, valida tipos básicos y delega.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { crearResenaVerificada, SolicitudValidationError, SolicitudTransicionError } from "@/lib/solicitudes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const calificacion = typeof body.calificacion === "number" ? body.calificacion : NaN;
  const comentario = typeof body.comentario === "string" ? body.comentario : "";

  const { id } = await params;

  try {
    const resena = await crearResenaVerificada({
      solicitudId: id,
      clienteClerkUserId: userId,
      calificacion,
      comentario,
    });
    return NextResponse.json({ resena }, { status: 201 });
  } catch (err) {
    if (err instanceof SolicitudValidationError) {
      return NextResponse.json({ error: err.message, campos: err.campos }, { status: 400 });
    }
    if (err instanceof SolicitudTransicionError) {
      const status = err.message === "No encontrada" ? 404 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[api/solicitudes/[id]/resena] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
