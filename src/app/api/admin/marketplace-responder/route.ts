import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { consulta_id, respuesta } = await req.json().catch(() => ({})) as { consulta_id?: string; respuesta?: string };
  if (!consulta_id || !respuesta?.trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("marketplace_consultas")
    .update({ respuesta: respuesta.trim() })
    .eq("id", consulta_id);

  if (error) {
    console.error("[admin/marketplace-responder] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
