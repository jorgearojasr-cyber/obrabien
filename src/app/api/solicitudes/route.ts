// POST /api/solicitudes — crear una Solicitud de Trabajo (borrador o enviada).
// Sprint 18 (JOB-020/021/022). Consume exclusivamente src/lib/solicitudes.ts
// — ninguna consulta a Supabase vive en esta ruta.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { crearSolicitud, SolicitudValidationError } from "@/lib/solicitudes";

function parseArchivos(value: unknown): { url: string; descripcion?: string }[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .filter((a): a is { url: string; descripcion?: unknown } => typeof a.url === "string")
    .map(a => ({
      url: a.url as string,
      descripcion: typeof a.descripcion === "string" ? a.descripcion : undefined,
    }));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const solicitud = await crearSolicitud({
      // clienteClerkUserId SIEMPRE viene de la sesión, nunca del body — evita
      // que alguien cree una solicitud a nombre de otro usuario (JOB-021).
      clienteClerkUserId: userId,
      titulo: typeof body.titulo === "string" ? body.titulo : undefined,
      descripcion: typeof body.descripcion === "string" ? body.descripcion : undefined,
      especialidad: typeof body.especialidad === "string" ? body.especialidad : undefined,
      region: typeof body.region === "string" ? body.region : undefined,
      comuna: typeof body.comuna === "string" ? body.comuna : undefined,
      maestroIds: Array.isArray(body.maestroIds)
        ? body.maestroIds.filter((x): x is string => typeof x === "string")
        : undefined,
      archivos: parseArchivos(body.archivos),
    });
    return NextResponse.json({ solicitud }, { status: 201 });
  } catch (err) {
    if (err instanceof SolicitudValidationError) {
      return NextResponse.json({ error: err.message, campos: err.campos }, { status: 400 });
    }
    console.error("[api/solicitudes] error creando solicitud:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
