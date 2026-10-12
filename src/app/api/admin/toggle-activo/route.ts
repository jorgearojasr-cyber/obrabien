import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!isAdminUser(user)) {
    console.error("[toggle-activo] Forbidden — llamada de un usuario que no es administrador");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { maestroId, activo } = await req.json();
  if (!maestroId || typeof activo !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("maestros")
    .update({ activo })
    .eq("id", maestroId);

  if (error) {
    console.error("[toggle-activo] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
