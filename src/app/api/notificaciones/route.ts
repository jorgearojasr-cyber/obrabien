import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// GET  — returns unread list, or { count } when ?count=true
// POST — marks all unread as read
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ count: 0, data: [] });

  const isCount = new URL(req.url).searchParams.get("count") === "true";

  if (isCount) {
    const { count, error } = await getSupabaseAdmin()
      .from("notificaciones")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("leida", false);
    if (error) return NextResponse.json({ count: 0 });
    return NextResponse.json({ count: count ?? 0 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("notificaciones")
    .select("id, tipo, mensaje, link, created_at")
    .eq("user_id", userId)
    .eq("leida", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest) {
  void req;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await getSupabaseAdmin()
    .from("notificaciones")
    .update({ leida: true })
    .eq("user_id", userId)
    .eq("leida", false);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({})) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await getSupabaseAdmin()
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id)
    .eq("user_id", userId);

  return NextResponse.json({ ok: true });
}
