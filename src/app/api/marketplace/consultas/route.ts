import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const item_id = new URL(req.url).searchParams.get("item_id");
  if (!item_id) return NextResponse.json({ consultas: [] });

  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_consultas")
    .select("id, nombre, pregunta, respuesta, created_at")
    .eq("item_id", item_id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[marketplace/consultas] GET error:", error.message);
    return NextResponse.json({ consultas: [] });
  }

  return NextResponse.json({ consultas: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { item_id, nombre, pregunta } = body;

  if (!item_id || !nombre || !pregunta) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("marketplace_consultas")
    .insert({ item_id, nombre, pregunta })
    .select("id")
    .single();

  if (error) {
    console.error("[marketplace/consultas] POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify item owner
  const { data: item } = await supabase
    .from("marketplace_items")
    .select("clerk_user_id, titulo")
    .eq("id", item_id)
    .maybeSingle();

  if (item?.clerk_user_id) {
    const titulo = String(item.titulo ?? "tu publicación").slice(0, 60);
    await supabase.from("notificaciones").insert({
      user_id: item.clerk_user_id,
      tipo:    "marketplace_consulta",
      mensaje: `Nueva consulta en tu publicación "${titulo}"`,
      link:    `/marketplace/${item_id}`,
      leida:   false,
    });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
