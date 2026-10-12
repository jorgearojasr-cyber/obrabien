import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!isAdminUser(user)) {
    console.error("[verificar] Forbidden — llamada de un usuario que no es administrador");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { maestroId, accion } = body;
  if (!maestroId || !["aprobar", "rechazar"].includes(accion)) {
    return NextResponse.json({ error: "Invalid request: missing maestroId or accion" }, { status: 400 });
  }

  const update = accion === "aprobar"
    ? { verificado: true, verificacion_estado: "aprobado" }
    : { verificado: false, verificacion_estado: "rechazado" };

  const { error, data } = await getSupabaseAdmin()
    .from("maestros")
    .update(update)
    .eq("id", maestroId)
    .select("id");

  if (error) {
    console.error("[verificar] Supabase error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.warn("[verificar] No row updated — maestroId not found:", maestroId);
    return NextResponse.json({ error: "Maestro not found" }, { status: 404 });
  }

  console.log("[verificar] OK —", accion, "maestroId:", maestroId);
  return NextResponse.json({ ok: true });
}
