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
    await clerk.users.updateUser(userId, {
      publicMetadata: { ...user.publicMetadata, role },
    });
  } catch (err) {
    console.error("[set-role] clerkClient error:", err);
    return NextResponse.json({ error: "Failed to save role" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
