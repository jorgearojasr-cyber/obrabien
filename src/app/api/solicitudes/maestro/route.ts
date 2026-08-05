// GET /api/solicitudes/maestro — lista las Solicitudes recibidas por el
// maestro autenticado. Sprint 18 (JOB-020/021).
//
// Mismo criterio que /api/solicitudes/cliente: la identidad siempre sale de
// la sesión de Clerk, nunca de un parámetro. Si el usuario autenticado no
// tiene perfil de maestro, no es un error — simplemente no tiene solicitudes
// que ver, se responde una lista vacía.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listarSolicitudesPorMaestro, resolverMaestroIdPorClerkUserId } from "@/lib/solicitudes";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const maestroId = await resolverMaestroIdPorClerkUserId(userId);
  if (!maestroId) return NextResponse.json({ solicitudes: [] });

  try {
    const solicitudes = await listarSolicitudesPorMaestro(maestroId);
    return NextResponse.json({ solicitudes });
  } catch (err) {
    console.error("[api/solicitudes/maestro] error listando:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
