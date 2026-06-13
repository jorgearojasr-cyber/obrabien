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
    console.error("[toggle-activo] Forbidden — caller:", email);
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
