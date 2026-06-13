import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Debes iniciar sesión para postular" }, { status: 401 });

  const { empleo_id, mensaje } = await req.json().catch(() => ({})) as {
    empleo_id?: string;
    mensaje?: string;
  };
  if (!empleo_id) return NextResponse.json({ error: "Falta empleo_id" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Deduplicate: check existing application
  const { data: existing } = await supabase
    .from("empleos_postulaciones")
    .select("id")
    .eq("empleo_id", empleo_id)
    .eq("maestro_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Ya te postulaste a esta oferta" }, { status: 409 });
  }

  const { error } = await supabase
    .from("empleos_postulaciones")
    .insert({
      empleo_id,
      maestro_id: userId,
      mensaje:    mensaje?.trim() || null,
    });

  if (error) {
    console.error("[empleos/postular] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the job poster
  const { data: empleo } = await supabase
    .from("empleos")
    .select("clerk_user_id, titulo")
    .eq("id", empleo_id)
    .maybeSingle();

  if (empleo?.clerk_user_id && empleo.clerk_user_id !== userId) {
    const titulo = String(empleo.titulo ?? "tu oferta").slice(0, 60);
    await supabase.from("notificaciones").insert({
      user_id: empleo.clerk_user_id,
      tipo:    "empleo_postulacion",
      mensaje: `Nueva postulación en tu oferta "${titulo}"`,
      link:    `/empleos`,
      leida:   false,
    });
  }

  return NextResponse.json({ ok: true });
}
