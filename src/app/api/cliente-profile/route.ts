// Required Supabase migration:
// CREATE TABLE clientes (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id text UNIQUE NOT NULL,
//   nombre text,
//   ciudad text,
//   telefono text,
//   foto_perfil text,
//   terminos_aceptados boolean DEFAULT false,
//   created_at timestamp DEFAULT now()
// );
// ALTER TABLE clientes ADD COLUMN IF NOT EXISTS foto_perfil text;
// ALTER TABLE clientes ADD COLUMN IF NOT EXISTS terminos_aceptados boolean DEFAULT false;

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? null });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nombre, ciudad, telefono, foto_perfil, terminos_aceptados } = await req.json();

  if (!nombre?.trim() || !ciudad?.trim()) {
    return NextResponse.json({ error: "Nombre y ciudad son obligatorios" }, { status: 400 });
  }
  if (!terminos_aceptados) {
    return NextResponse.json({ error: "Debes aceptar los términos" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("clientes")
    .upsert(
      {
        user_id:            userId,
        nombre:             nombre.trim(),
        ciudad:             ciudad.trim(),
        telefono:           telefono?.trim() || null,
        foto_perfil:        foto_perfil ?? null,
        terminos_aceptados: true,
      },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
