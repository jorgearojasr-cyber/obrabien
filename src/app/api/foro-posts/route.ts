import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const POSTS_PER_HOUR = 10;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Debes iniciar sesión para publicar" }, { status: 401 });

  // Rate limit: max 10 posts per hour per user
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentPosts } = await getSupabaseAdmin()
    .from("foro_posts")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", userId)
    .gte("created_at", oneHourAgo);
  if ((recentPosts ?? 0) >= POSTS_PER_HOUR) {
    return NextResponse.json(
      { error: `Has alcanzado el límite de ${POSTS_PER_HOUR} publicaciones por hora. Intenta más tarde.` },
      { status: 429 },
    );
  }

  const body = await req.json();
  const { titulo, contenido, categoria, tags, quien_responde, foto_url } = body;

  if (!titulo || titulo.trim().length < 10)
    return NextResponse.json({ error: "El título debe tener al menos 10 caracteres" }, { status: 400 });
  if (titulo.trim().length > 200)
    return NextResponse.json({ error: "El título no puede superar los 200 caracteres" }, { status: 400 });
  if (!contenido || contenido.trim().length < 30)
    return NextResponse.json({ error: "El contenido debe tener al menos 30 caracteres" }, { status: 400 });
  if (contenido.trim().length > 5000)
    return NextResponse.json({ error: "El contenido no puede superar los 5.000 caracteres" }, { status: 400 });
  if (!categoria)
    return NextResponse.json({ error: "Debes seleccionar una categoría" }, { status: 400 });

  const tagsArray = tags
    ? String(tags).split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const { data, error } = await getSupabaseAdmin()
    .from("foro_posts")
    .insert({
      clerk_user_id: userId,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      categoria,
      tags: tagsArray,
      quien_responde: quien_responde ?? "todos",
      foto_url: foto_url ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[foro-posts] Supabase error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
