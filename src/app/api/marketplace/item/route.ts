import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ITEM_SELECT, toPublicItem } from "@/lib/public-marketplace";

// Respuesta pública de una publicación: lista blanca de campos (N1). Nunca devuelve clerk_user_id, payment_status ni campos administrativos.
export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_items")
    .select(ITEM_SELECT)
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
  const row = data as unknown as Record<string, unknown>;

  // Resolve seller role and photo from maestros table
  let sellerRole: "maestro" | "cliente" = "cliente";
  let sellerFotoUrl: string | null = null;
  if (row.clerk_user_id) {
    const { data: maestro } = await getSupabaseAdmin()
      .from("maestros")
      .select("id, foto_url")
      .eq("clerk_user_id", row.clerk_user_id as string)
      .maybeSingle();
    if (maestro) {
      sellerRole    = "maestro";
      sellerFotoUrl = (maestro.foto_url as string) || null;
    }
  }

  // Sesión opcional: solo para indicar al navegador si quien mira es el vendedor (sin enviarle el identificador).
  const { userId } = await auth();
  return NextResponse.json({ item: toPublicItem(row, { sellerRole, sellerFotoUrl, viewerUserId: userId }) });
}
