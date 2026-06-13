import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cedulaFrente, cedulaReverso, selfieCedula } = await req.json();

  if (!cedulaFrente || !cedulaReverso || !selfieCedula) {
    return NextResponse.json({ error: "Se requieren los 3 documentos" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("maestros")
    .update({
      cedula_frente:       cedulaFrente,
      cedula_reverso:      cedulaReverso,
      selfie_cedula:       selfieCedula,
      verificacion_estado: "pendiente",
    })
    .eq("clerk_user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
