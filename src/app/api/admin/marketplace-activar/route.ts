import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress ?? "").toLowerCase().trim();
  if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as {
    listing_id?: string;
    action?: "aprobar" | "rechazar";
    motivo?: string;
  };
  const { listing_id, action = "aprobar", motivo } = body;
  if (!listing_id) return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Fetch item to get seller and title for notification
  const { data: item } = await supabase
    .from("marketplace_items")
    .select("titulo, clerk_user_id")
    .eq("id", listing_id)
    .maybeSingle();

  if (action === "aprobar") {
    const { error } = await supabase
      .from("marketplace_items")
      .update({ activo: true, payment_status: "aprobado" })
      .eq("id", listing_id);

    if (error) {
      console.error("[admin/marketplace-activar] approve error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (item?.clerk_user_id) {
      const titulo = String(item.titulo ?? "tu publicación").slice(0, 80);
      await supabase.from("notificaciones").insert({
        user_id: item.clerk_user_id,
        tipo:    "marketplace_aprobado",
        mensaje: `Tu publicación "${titulo}" fue aprobada y ya está visible en el marketplace ✅`,
        link:    `/marketplace/${listing_id}`,
        leida:   false,
      });
    }
  } else {
    const { error } = await supabase
      .from("marketplace_items")
      .update({ activo: false, payment_status: "rechazado" })
      .eq("id", listing_id);

    if (error) {
      console.error("[admin/marketplace-activar] reject error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (item?.clerk_user_id) {
      const titulo   = String(item.titulo ?? "tu publicación").slice(0, 80);
      const motivoTx = motivo?.trim() ? ` Motivo: ${motivo.trim()}` : "";
      await supabase.from("notificaciones").insert({
        user_id: item.clerk_user_id,
        tipo:    "marketplace_rechazado",
        mensaje: `Tu publicación "${titulo}" fue rechazada.${motivoTx}`,
        link:    `/marketplace/publicar`,
        leida:   false,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
