import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Real-time hint only, called on RUT-field blur in registro-basico and completar-perfil.
// The definitive check still happens server-side on save (registro-basico/update-profile
// call the same check_maestro_duplicado RPC before writing) — this endpoint never blocks
// a save by itself, it only gives the user faster feedback.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const rut = ((body.rut as string) ?? "").trim();
  if (!rut) return NextResponse.json({ disponible: true });

  const { data: duplicados, error } = await getSupabaseAdmin()
    .rpc("check_maestro_duplicado", { p_clerk_user_id: userId, p_rut: rut, p_telefono: null });

  if (error) {
    console.error("[check-rut] duplicate check failed:", error.message);
    // Fail open: a broken check shouldn't stop the user from typing/submitting —
    // the backend save still enforces the real constraint.
    return NextResponse.json({ disponible: true });
  }

  const rutDuplicado = (duplicados ?? []).some((d: { campo: string }) => d.campo === "rut");
  if (rutDuplicado) {
    return NextResponse.json({ disponible: false, mensaje: "Ese RUT ya está registrado por otro maestro." });
  }
  return NextResponse.json({ disponible: true });
}
