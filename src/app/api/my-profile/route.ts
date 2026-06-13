import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({});

  const supabase = getSupabaseAdmin();

  // Try maestros first
  const { data: maestro } = await supabase
    .from("maestros")
    .select("id, nombre, telefono, social, foto_url")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (maestro) {
    const row    = maestro as Record<string, unknown>;
    const social = row.social as { whatsapp?: string } | null;
    return NextResponse.json({
      nombre:    (row.nombre    as string | null) ?? null,
      fotoUrl:   (row.foto_url  as string | null) ?? null,
      maestroId: (row.id        as string | null) ?? null,
      whatsapp:  social?.whatsapp ?? (row.telefono as string | null) ?? null,
    });
  }

  // Fall back to clientes table (uses user_id, not clerk_user_id)
  const { data: cliente } = await supabase
    .from("clientes")
    .select("nombre, telefono, foto_perfil")
    .eq("user_id", userId)
    .maybeSingle();

  if (cliente) {
    const row = cliente as Record<string, unknown>;
    return NextResponse.json({
      nombre:   (row.nombre      as string | null) ?? null,
      fotoUrl:  (row.foto_perfil as string | null) ?? null,
      whatsapp: (row.telefono    as string | null) ?? null,
    });
  }

  return NextResponse.json({});
}
