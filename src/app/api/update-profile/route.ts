import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  console.log("[update-profile] userId:", userId);
  console.log("[update-profile] supabase url set:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[update-profile] service key set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("[update-profile] nombre:", body.nombre, "especialidades:", body.especialidades);

  // 1. Upsert maestro row
  const { data: maestroRow, error: sbError } = await getSupabaseAdmin()
    .from("maestros")
    .upsert(
      {
        clerk_user_id:  userId,
        nombre:         body.nombre         ?? null,
        rut:            body.rut            ?? null,
        telefono:       body.telefono       ?? null,
        whatsapp:       body.esWhatsapp     ?? true,
        descripcion:    body.descripcion    ?? null,
        especialidades: body.especialidades ?? [],
        ciudades:       body.comunas        ?? [],
        horarios:       body.horario        ?? null,
        social: {
          whatsapp:  body.redes?.whatsapp  ?? null,
          instagram: body.redes?.instagram ?? null,
          facebook:  body.redes?.facebook  ?? null,
          tiktok:    body.redes?.tiktok    ?? null,
        },
      },
      { onConflict: "clerk_user_id" }
    )
    .select("id")
    .single();

  if (sbError) {
    console.error("[update-profile] Supabase upsert failed — code:", sbError.code, "message:", sbError.message);
    return NextResponse.json(
      { error: "Error al guardar en Supabase", supabaseError: { code: sbError.code, message: sbError.message } },
      { status: 500 }
    );
  }

  console.log("[update-profile] Supabase upsert succeeded, maestro id:", maestroRow.id);

  // 2. Replace fotos_trabajos: delete existing, then insert current set
  const fotos = (body.fotoUrls ?? []) as { url: string; descripcion: string }[];

  await getSupabaseAdmin().from("fotos_trabajos").delete().eq("maestro_id", maestroRow.id);

  if (fotos.length > 0) {
    const rows = fotos
      .filter(f => f.url)
      .map(f => ({ maestro_id: maestroRow.id, url: f.url, descripcion: f.descripcion || null }));
    if (rows.length > 0) {
      const { error: fotosError } = await getSupabaseAdmin().from("fotos_trabajos").insert(rows);
      if (fotosError) console.error("[update-profile] fotos_trabajos insert failed:", fotosError.message);
      else console.log("[update-profile] fotos_trabajos inserted:", rows.length, "rows");
    }
  }

  // 3. Save to Clerk publicMetadata (includes maestroId so dashboard link works)
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const existing = (user.publicMetadata || {}) as Record<string, unknown>;
    const existingProfile = (existing.profile as Record<string, unknown>) ?? {};

    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...existing,
        profile: {
          ...existingProfile,
          nombre:          body.nombre          ?? "",
          rut:             body.rut             ?? "",
          telefono:        body.telefono        ?? "",
          esWhatsapp:      body.esWhatsapp      ?? false,
          redes:           body.redes           ?? { whatsapp: "", instagram: "", facebook: "", tiktok: "" },
          especialidades:  body.especialidades  ?? [],
          region:          body.region          ?? "",
          comunas:         body.comunas         ?? [],
          horario:         body.horario         ?? "",
          descripcion:     body.descripcion     ?? "",
          experiencia:     body.experiencia     ?? 0,
          formasPago:      body.formasPago      ?? [],
          modalidad:       body.modalidad       ?? "",
          galeriaCount:    body.galeriaCount    ?? 0,
          galeriaCaptions: body.galeriaCaptions ?? [],
          maestroId:       maestroRow.id,
          updatedAt:       new Date().toISOString(),
        },
      },
    });
    console.log("[update-profile] Clerk write succeeded, maestroId:", maestroRow.id);
  } catch (err) {
    console.error("[update-profile] Clerk write failed:", err);
    return NextResponse.json({ error: "Error al guardar en Clerk" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, maestroId: maestroRow.id });
}
