import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("*, fotos_trabajos(id, url, descripcion)")
    .eq("clerk_user_id", userId)
    .single();

  // PGRST116 = no rows found — that's fine for first-time users
  if (error && error.code !== "PGRST116") {
    console.error("[get-profile] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}
