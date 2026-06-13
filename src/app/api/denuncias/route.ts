import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Debes iniciar sesión para enviar una alerta" }, { status: 401 });

  const body = await req.json();
  const { denunciado_nombre, denunciado_rut, denunciado_region, descripcion, fotos_evidencia, denunciante_nombre } = body;

  if (!denunciado_nombre?.trim())
    return NextResponse.json({ error: "El nombre del denunciado es requerido" }, { status: 400 });
  if (!denunciado_region?.trim())
    return NextResponse.json({ error: "La región es requerida" }, { status: 400 });
  if (!descripcion?.trim() || descripcion.trim().length < 100)
    return NextResponse.json({ error: "La descripción debe tener al menos 100 caracteres" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("denuncias")
    .insert({
      denunciante_clerk_id: userId,
      denunciante_nombre:   (denunciante_nombre as string)?.trim() || "Usuario",
      denunciado_nombre:    (denunciado_nombre as string).trim(),
      denunciado_rut:       (denunciado_rut as string)?.trim() || null,
      denunciado_region:    (denunciado_region as string).trim(),
      descripcion:          (descripcion as string).trim(),
      fotos_evidencia:      Array.isArray(fotos_evidencia) ? fotos_evidencia.filter(Boolean) : [],
      estado:               "pendiente",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[denuncias] insert error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

  const body = await req.json();
  const { id, descargo } = body;

  if (!id)
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  if (!descargo?.trim() || descargo.trim().length < 30)
    return NextResponse.json({ error: "El descargo debe tener al menos 30 caracteres" }, { status: 400 });

  const { data: d } = await getSupabaseAdmin()
    .from("denuncias")
    .select("id, estado, respuesta_descargo")
    .eq("id", id)
    .single();

  if (!d)
    return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 });
  if (d.estado !== "aprobado")
    return NextResponse.json({ error: "La denuncia no está publicada" }, { status: 400 });
  if (d.respuesta_descargo)
    return NextResponse.json({ error: "Ya existe un descargo para esta denuncia" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("denuncias")
    .update({ respuesta_descargo: (descargo as string).trim(), descargo_aprobado: false })
    .eq("id", id);

  if (error) {
    console.error("[denuncias] descargo error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
