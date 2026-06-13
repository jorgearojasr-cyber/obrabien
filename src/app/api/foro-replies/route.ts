import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const REPLIES_PER_HOUR = 10;

export async function POST(req: NextRequest) {
  // Auth first — needed for rate limiting and notification logic
  const { userId } = await auth();

  const body = await req.json();
  const { post_id, autor_nombre, autor_rol, autor_especialidad, contenido, foto_url } = body;

  if (!post_id || !autor_nombre || !contenido || String(contenido).trim().length < 20) {
    return NextResponse.json({ error: "Datos incompletos o respuesta demasiado corta (mín. 20 caracteres)" }, { status: 400 });
  }
  if (String(contenido).trim().length > 3000) {
    return NextResponse.json({ error: "La respuesta no puede superar los 3.000 caracteres" }, { status: 400 });
  }

  // Rate limit authenticated users: max 10 replies per hour
  if (userId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentReplies } = await getSupabaseAdmin()
      .from("foro_replies")
      .select("id", { count: "exact", head: true })
      .eq("clerk_user_id", userId)
      .gte("created_at", oneHourAgo);
    if ((recentReplies ?? 0) >= REPLIES_PER_HOUR) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${REPLIES_PER_HOUR} respuestas por hora. Intenta más tarde.` },
        { status: 429 },
      );
    }
  }

  const { data: reply, error } = await getSupabaseAdmin()
    .from("foro_replies")
    .insert({
      post_id,
      clerk_user_id: userId ?? null,
      autor_nombre:       String(autor_nombre).trim().slice(0, 100),
      autor_rol:          autor_rol === "maestro" ? "maestro" : "cliente",
      autor_especialidad: autor_especialidad?.trim().slice(0, 100) || null,
      contenido:          String(contenido).trim(),
      foto_url:           foto_url || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[foro-replies] error:", error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the post author if different from commenter
  const { data: post } = await getSupabaseAdmin()
    .from("foro_posts")
    .select("clerk_user_id, titulo")
    .eq("id", post_id)
    .maybeSingle();

  if (post?.clerk_user_id && post.clerk_user_id !== userId) {
    const titulo = (post.titulo as string)?.slice(0, 60) ?? "tu pregunta";
    await getSupabaseAdmin()
      .from("notificaciones")
      .insert({
        user_id: post.clerk_user_id,
        tipo:    "respuesta_foro",
        mensaje: `Nueva respuesta en tu tema "${titulo}"`,
        link:    `/comunidad/${post_id}`,
        leida:   false,
      });
  }

  return NextResponse.json({ ok: true, id: reply.id });
}
