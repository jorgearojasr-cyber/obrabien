import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeRut } from "@/lib/maestro-shared";

export async function GET(req: NextRequest) {
  const rut = req.nextUrl.searchParams.get("rut");
  if (!rut) return NextResponse.json({ error: "rut required" }, { status: 400 });

  // Compara contra el RUT normalizado (sin puntos/guiones, mismo formato que
  // se guarda en maestros.rut desde el fix de normalización) — antes hacía
  // .eq("rut", rut.trim()) y comparaba texto exacto, que fallaba siempre que
  // el input tuviera puntos (p.ej. "12.345.678-9") contra un valor ya
  // normalizado guardado sin ellos.
  const { data, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("id, nombre")
    .eq("rut", normalizeRut(rut))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, nombre: data.nombre });
}
