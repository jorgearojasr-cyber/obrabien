import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("marketplace_items")
    .select("id, tipo, categoria, titulo, descripcion, precio, precio_unit, region, ciudad, whatsapp, contact_name, foto_url, plan, created_at")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[marketplace/listings] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = data ?? [];

  // Attach consulta counts in a single query
  let countMap: Record<string, number> = {};
  if (items.length > 0) {
    const ids = items.map(i => i.id as string);
    const { data: cdata } = await supabase
      .from("marketplace_consultas")
      .select("item_id")
      .in("item_id", ids);
    countMap = (cdata ?? []).reduce<Record<string, number>>((acc, r) => {
      const key = r.item_id as string;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }

  const withCounts = items.map(i => ({ ...i, consulta_count: countMap[i.id as string] ?? 0 }));
  return NextResponse.json({ items: withCounts });
}
