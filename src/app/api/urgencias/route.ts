import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { atiende_urgencias } = await req.json();
  if (typeof atiende_urgencias !== "boolean") {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("maestros")
    .update({ atiende_urgencias })
    .eq("clerk_user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
