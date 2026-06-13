import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerk = await clerkClient();
    const user  = await clerk.users.getUser(userId);

    const currentRole = user.publicMetadata?.role as string | undefined;
    if (currentRole === "maestro") {
      return NextResponse.json({ error: "Ya tienes una cuenta de maestro" }, { status: 400 });
    }

    await clerk.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata, role: "maestro" },
    });

    await getSupabaseAdmin()
      .from("clientes")
      .delete()
      .eq("user_id", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[migrate-to-maestro] error:", err);
    return NextResponse.json({ error: "Error al migrar la cuenta" }, { status: 500 });
  }
}
