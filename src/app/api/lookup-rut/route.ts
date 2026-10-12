import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeRut } from "@/lib/maestro-shared";
import { allowRequest, shortName } from "@/lib/privacy";

// Confirma que el RUT de quien te refirió existe (formulario «completar perfil»).
// Hotfix 19A.1: antes era público y devolvía el NOMBRE COMPLETO asociado a cualquier RUT (un oráculo de identidad).
// Ahora: exige sesión, limita los intentos y devuelve solo nombre de pila + inicial («Juan P.»).
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!allowRequest(`lookup-rut:${userId}`, 20, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  }

  const rut = req.nextUrl.searchParams.get("rut");
  if (!rut) return NextResponse.json({ error: "rut required" }, { status: 400 });

  // Compara contra el RUT normalizado (sin puntos/guiones, mismo formato que se guarda en maestros.rut).
  const { data, error } = await getSupabaseAdmin()
    .from("maestros")
    .select("nombre")
    .eq("rut", normalizeRut(rut))
    .maybeSingle();

  if (error) return NextResponse.json({ error: "No se pudo verificar" }, { status: 500 });
  if (!data) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, nombre: shortName(data.nombre) });
}
