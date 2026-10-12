import { auth, currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { maestroId } = await req.json();
  if (!maestroId) return NextResponse.json({ error: "Missing maestroId" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("maestros")
    .delete()
    .eq("id", maestroId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
