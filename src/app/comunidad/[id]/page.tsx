export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getPost, type ForumReply } from "@/lib/forum";
import { rowToForumPost, formatForoTime } from "@/lib/foro-utils";
import PostDetail from "./PostDetail";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ── Seed post (non-UUID id like "p-001") ─────────────────────────────────
  if (!UUID_RE.test(id)) {
    const post = getPost(id);
    if (!post) notFound();
    return <PostDetail post={post} existingReplies={post.seedReplies} />;
  }

  // ── Real DB post ─────────────────────────────────────────────────────────
  const { data: row } = await getSupabaseAdmin()
    .from("foro_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  // Look up author name
  const { data: maestro } = await getSupabaseAdmin()
    .from("maestros")
    .select("nombre, verificado")
    .eq("clerk_user_id", row.clerk_user_id as string)
    .maybeSingle();

  const post = rowToForumPost(
    row as Record<string, unknown>,
    (maestro?.nombre as string) ?? "Usuario",
    !!(maestro?.verificado as boolean),
    !!maestro, // tiene fila en maestros → "maestro"; si no, "cliente"
  );

  // Fetch existing replies
  const { data: replyRows } = await getSupabaseAdmin()
    .from("foro_replies")
    .select("id, autor_nombre, autor_rol, autor_especialidad, contenido, votos_utiles, created_at, foto_url")
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  const existingReplies: ForumReply[] = (replyRows ?? []).map(r => ({
    id:       r.id as string,
    author:   {
      name:      r.autor_nombre as string,
      initials:  String(r.autor_nombre).split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase(),
      role:      (r.autor_rol as "maestro" | "cliente") ?? "cliente",
      specialty: (r.autor_especialidad as string) || undefined,
      verified:  false,
    },
    content:  r.contenido as string,
    time:     formatForoTime(new Date(r.created_at as string)),
    useful:   (r.votos_utiles as number) ?? 0,
    foto_url: (r.foto_url as string) || undefined,
  }));

  return <PostDetail post={post} existingReplies={existingReplies} />;
}
