export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { rowToForumPost } from "@/lib/foro-utils";
import { type ForumPost } from "@/lib/forum";
import ComunidadContent from "./_content";

export default async function ComunidadPage() {
  // ── 1. Fetch all posts — no filters, newest first ──────────────────────
  const { data: rows, error } = await getSupabaseAdmin()
    .from("foro_posts")
    .select("*")
    .order("created_at", { ascending: false });

  console.log(
    "[comunidad] foro_posts query →",
    `rows: ${rows?.length ?? 0}`,
    error ? `ERROR: ${error.message}` : "ok",
  );

  if (error) {
    console.error("[comunidad] foro_posts fetch failed:", error.message, error.details, error.hint);
  }

  const postRows = rows ?? [];

  // ── 2. Author name lookup (best-effort — missing = "Usuario") ──────────
  const userIds = [...new Set(postRows.map(r => r.clerk_user_id as string).filter(Boolean))];
  const authorMap: Record<string, { nombre: string; verificado: boolean }> = {};

  if (userIds.length > 0) {
    const { data: maestros, error: mErr } = await getSupabaseAdmin()
      .from("maestros")
      .select("clerk_user_id, nombre, verificado")
      .in("clerk_user_id", userIds);

    if (mErr) {
      console.error("[comunidad] maestros lookup failed:", mErr.message);
    }

    for (const m of maestros ?? []) {
      authorMap[m.clerk_user_id as string] = {
        nombre:     (m.nombre as string) ?? "Usuario",
        verificado: !!(m.verificado as boolean),
      };
    }
  }

  // ── 3. Reply counts (best-effort — skipped if table doesn't exist yet) ─
  const postIds = postRows.map(r => r.id as string);
  const replyCountMap: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: replyRows, error: rErr } = await getSupabaseAdmin()
      .from("foro_replies")
      .select("post_id")
      .in("post_id", postIds);

    if (rErr) {
      // Table may not exist yet — non-fatal, counts default to 0
      console.warn("[comunidad] foro_replies query skipped:", rErr.message);
    } else {
      for (const r of replyRows ?? []) {
        const pid = r.post_id as string;
        replyCountMap[pid] = (replyCountMap[pid] ?? 0) + 1;
      }
    }
  }

  // ── 4. Map rows → ForumPost ────────────────────────────────────────────
  const dbPosts: ForumPost[] = postRows.map(r => {
    const auth = authorMap[r.clerk_user_id as string];
    const post = rowToForumPost(
      r as Record<string, unknown>,
      auth?.nombre     ?? "Usuario",
      auth?.verificado ?? false,
      auth !== undefined, // tiene fila en maestros → "maestro"; si no, "cliente"
    );
    post.replyCount = replyCountMap[post.id] ?? 0;
    return post;
  });

  console.log("[comunidad] dbPosts ready:", dbPosts.length);

  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <ComunidadContent dbPosts={dbPosts} />
    </Suspense>
  );
}
