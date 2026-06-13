import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const rut = req.nextUrl.searchParams.get("rut");
  if (!rut) return NextResponse.json({ error: "rut required" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("id, nombre")
    .eq("rut", rut.trim())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, nombre: data.nombre });
}
