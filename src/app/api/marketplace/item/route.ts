import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_items")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("[marketplace/item] Supabase error:", error.code, error.message);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve seller role and photo from maestros table
  let seller_role      = "cliente";
  let seller_foto_url: string | null = null;
  if (data.clerk_user_id) {
    const { data: maestro } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, foto_url")
      .eq("clerk_user_id", data.clerk_user_id)
      .maybeSingle();
    if (maestro) {
      seller_role     = "maestro";
      seller_foto_url = (maestro.foto_url as string) || null;
    }
  }

  return NextResponse.json({ item: { ...data, seller_role, seller_foto_url } });
}
