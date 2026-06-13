import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { consulta_id, respuesta } = await req.json().catch(() => ({})) as {
    consulta_id?: string;
    respuesta?: string;
  };
  if (!consulta_id || !respuesta?.trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch the consulta to get item_id
  const { data: consulta } = await supabase
    .from("marketplace_consultas")
    .select("item_id")
    .eq("id", consulta_id)
    .single();

  if (!consulta) return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });

  // Fetch the item to verify ownership
  const { data: item } = await supabase
    .from("marketplace_items")
    .select("clerk_user_id")
    .eq("id", consulta.item_id)
    .single();

  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress ?? "").toLowerCase().trim();
  const isOwner = item?.clerk_user_id === userId;
  const isAdmin = email === ADMIN_EMAIL;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const { error } = await supabase
    .from("marketplace_consultas")
    .update({ respuesta: respuesta.trim() })
    .eq("id", consulta_id);

  if (error) {
    console.error("[marketplace/responder] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
