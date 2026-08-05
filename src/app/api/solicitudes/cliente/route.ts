// GET /api/solicitudes/cliente — lista las Solicitudes creadas por el
// usuario autenticado. Sprint 18 (JOB-020/021).
//
// No acepta ningún identificador por query param a propósito: el destinatario
// de la consulta es siempre "el usuario de la sesión actual", nunca uno
// elegible desde el cliente — así no existe forma de pedir las solicitudes de
// otra persona (JOB-021: "no permitir acceder a solicitudes ajenas").

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listarSolicitudesPorCliente } from "@/lib/solicitudes";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const solicitudes = await listarSolicitudesPorCliente(userId);
    return NextResponse.json({ solicitudes });
  } catch (err) {
    console.error("[api/solicitudes/cliente] error listando:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
