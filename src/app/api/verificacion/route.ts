import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isOwnDocumentRef } from "@/lib/cloudinary-docs";

// Envío de documentos de identidad para la verificación.
// Hotfix 19A.1: ya no se guarda cualquier texto que llegue del navegador (antes se aceptaba una URL arbitraria). Solo se aceptan
// REFERENCIAS de Cloudinary de la carpeta del propio usuario (`ObraBien/cedulas/<su clerk_user_id>/...`), que devolvió
// /api/upload-foto?type=cedula (entrega autenticada). La verificación nunca se aprueba aquí: queda «pendiente» para el administrador.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { cedulaFrente, cedulaReverso, selfieCedula } = body;

  if (!cedulaFrente || !cedulaReverso || !selfieCedula) {
    return NextResponse.json({ error: "Se requieren los 3 documentos" }, { status: 400 });
  }
  if (![cedulaFrente, cedulaReverso, selfieCedula].every((ref) => isOwnDocumentRef(ref, userId))) {
    return NextResponse.json({ error: "Documento no válido. Vuelve a subirlo." }, { status: 400 });
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

  if (error) return NextResponse.json({ error: "No se pudo guardar la verificación" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
