import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
  if (!email || email !== ADMIN_EMAIL) {
    console.error("[verificar] Forbidden — caller:", email, "expected:", ADMIN_EMAIL);
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
