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
        nombre:        body.nombre        ?? "",
        rut:           body.rut           ?? "",
        telefono:      body.telefono      ?? "",
        esWhatsapp:    body.esWhatsapp    ?? false,
        redes:         body.redes         ?? { whatsapp:"", instagram:"", facebook:"", tiktok:"" },
        especialidades:body.especialidades ?? [],
        region:        body.region        ?? "",
        comunas:       body.comunas       ?? [],
        horario:       body.horario       ?? "",
        descripcion:   body.descripcion   ?? "",
        experiencia:   body.experiencia   ?? 0,
        formasPago:    body.formasPago    ?? [],
        modalidad:     body.modalidad     ?? "",
        galeriaCount:  body.galeriaCount  ?? 0,
        galeriaCaptions: body.galeriaCaptions ?? [],
        updatedAt:     new Date().toISOString(),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
