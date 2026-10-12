import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // referente: embed del maestro referenciado por referido_por_maestro_id (self-FK,
  // requiere el nombre de columna como hint para que PostgREST desambigüe el join).
  const { data, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("*, fotos_trabajos(id, url, descripcion), referente:referido_por_maestro_id(nombre)")
    .eq("clerk_user_id", userId)
    .single();

  // PGRST116 = no rows found — that's fine for first-time users
  if (error && error.code !== "PGRST116") {
    console.error("[get-profile] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) return NextResponse.json({ data: null });

  // Hotfix 19A.1: el dueño ve su RUT (lo necesita el formulario), pero las URL/referencias de los documentos de identidad y el
  // identificador interno de Clerk no vuelven al navegador: se informa solo si cada documento fue enviado.
  const row = data as Record<string, unknown>;
  const documentos = {
    frente:  !!row.cedula_frente,
    reverso: !!row.cedula_reverso,
    selfie:  !!row.selfie_cedula,
  };
  delete row.cedula_frente;
  delete row.cedula_reverso;
  delete row.selfie_cedula;
  delete row.clerk_user_id;

  // Merge Clerk publicMetadata as fallback for columns that may not exist in the
  // Supabase schema yet (frase_destacada, modalidad_cobro, formas_pago).
  // Supabase wins when the column is present and non-null; Clerk fills the gap otherwise.
  let merged: Record<string, unknown> = { ...row, documentos };
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const profile = ((user.publicMetadata as Record<string, unknown>)?.profile ?? {}) as Record<string, unknown>;

    merged = {
      ...merged,
      frase_destacada: merged.frase_destacada ?? profile.fraseDestacada ?? null,
      modalidad_cobro: merged.modalidad_cobro ?? profile.modalidades   ?? [],
      formas_pago:     merged.formas_pago     ?? profile.formasPago    ?? [],
    };
  } catch (err) {
    console.error("[get-profile] Clerk metadata fetch failed (non-fatal):", err);
  }

  return NextResponse.json({ data: merged });
}
