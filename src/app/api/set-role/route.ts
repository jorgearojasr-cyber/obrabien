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

  const clerk = await clerkClient();
  await clerk.users.updateUser(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ ok: true });
}
