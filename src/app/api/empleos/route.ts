import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo   = searchParams.get("tipo") || "oferta";
  const region = searchParams.get("region");
  const count  = searchParams.get("count") === "true";

  const supabase = getSupabaseAdmin();

  if (count) {
    let q = supabase
      .from("empleos")
      .select("*", { count: "exact", head: true })
      .eq("activo", true)
      .eq("tipo", tipo);
    if (region) q = q.eq("region", region);
    const { count: n, error } = await q;
    if (error) return NextResponse.json({ count: 0 });
    return NextResponse.json({ count: n ?? 0 });
  }

  let q = supabase
    .from("empleos")
    .select("id, tipo, titulo, descripcion, especialidades, region, ciudad, modalidad, rango_sueldo, contacto_nombre, contacto_whatsapp, created_at")
    .eq("activo", true)
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(60);

  if (region) q = q.eq("region", region);

  const { data, error } = await q;
  if (error) {
    console.error("[empleos] GET error:", error.message);
    return NextResponse.json({ empleos: [] });
  }

  return NextResponse.json({ empleos: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const {
    tipo, titulo, descripcion, especialidades,
    region, ciudad, modalidad, rango_sueldo,
    contacto_nombre, contacto_whatsapp,
  } = body;

  if (!tipo || !titulo || !descripcion || !region) {
    return NextResponse.json({ error: "Faltan campos requeridos (tipo, título, descripción, región)" }, { status: 400 });
  }
  if (tipo !== "oferta" && tipo !== "maestro_disponible") {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("empleos")
    .insert({
      clerk_user_id:     userId ?? null,
      tipo,
      titulo:            String(titulo).trim().slice(0, 120),
      descripcion:       String(descripcion).trim().slice(0, 2000),
      especialidades:    Array.isArray(especialidades) ? especialidades : [],
      region,
      ciudad:            ciudad ?? null,
      modalidad:         modalidad ?? null,
      rango_sueldo:      rango_sueldo ?? null,
      contacto_nombre:   contacto_nombre ?? null,
      contacto_whatsapp: contacto_whatsapp ?? null,
      activo:            true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[empleos] POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
