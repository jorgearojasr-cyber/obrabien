import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const role = body.role as string;

  if (role !== "maestro" && role !== "cliente") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jorge.arojasr@gmail.com").toLowerCase().trim();
    const userEmail = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
    if (userEmail && userEmail === adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await clerk.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata, role },
    });
  } catch (err) {
    console.error("[set-role] clerkClient error:", err);
    return NextResponse.json({ error: "Failed to save role" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
