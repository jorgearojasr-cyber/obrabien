import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const existing = (user.publicMetadata || {}) as Record<string, unknown>;

  await clerk.users.updateUser(userId, {
    publicMetadata: {
      ...existing,
      profile: {
        especialidades: body.especialidades ?? [],
        zona: body.zona ?? "",
        descripcion: body.descripcion ?? "",
        experiencia: body.experiencia ?? 0,
        updatedAt: new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
