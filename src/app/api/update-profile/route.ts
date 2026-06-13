import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Columns that were in the original schema and are safe to always upsert.
// Extended columns are tried first; if Supabase rejects with a missing-column error,
// we fall back to core-only so the save always completes.
function buildCorePayload(userId: string, body: Record<string, unknown>) {
  return {
    clerk_user_id:          userId,
    activo:                 true,
    nombre:                 (body.nombre         as string)   ?? null,
    telefono:               (body.telefono        as string)   ?? null,
    whatsapp:               (body.esWhatsapp      as boolean)  ?? true,
    descripcion:            (body.descripcion     as string)   ?? null,
    especialidades:         (body.especialidades  as string[]) ?? [],
    ciudades:               (body.comunas         as string[]) ?? [],
    horarios:               body.horario          ?? null,
    foto_url:               (body.fotoUrl         as string)   ?? null,
    anos_experiencia:       (body.experiencia     as number)   ?? null,
    atiende_urgencias:      (body.atiendeUrgencias as boolean) ?? false,
    especialidades_urgencia: (body.especialidadesUrgencia as string[]) ?? [],
    // frase_destacada and modalidad_cobro are in migration 011 — always safe to upsert
    frase_destacada:        (body.fraseDestacada as string)   ?? null,
    modalidad_cobro:        (body.modalidades    as string[]) ?? ((body.modalidad as string) ? [body.modalidad as string] : []),
    social: {
      whatsapp:  (body.redes as Record<string, string> | null)?.whatsapp  ?? null,
      instagram: (body.redes as Record<string, string> | null)?.instagram ?? null,
      facebook:  (body.redes as Record<string, string> | null)?.facebook  ?? null,
      tiktok:    (body.redes as Record<string, string> | null)?.tiktok    ?? null,
    },
  };
}

function buildExtendedPayload(userId: string, body: Record<string, unknown>) {
  return {
    ...buildCorePayload(userId, body),
    rut:              (body.rut            as string)   ?? null,
    dias_disponibles: (body.diasDisponibles as string[]) ?? (body.horario as Record<string, unknown> | null)?.dias ?? [],
    formas_pago:      (body.formasPago     as string[]) ?? [],
    modalidad_cobro:  (body.modalidades    as string[]) ?? ((body.modalidad as string) ? [body.modalidad as string] : []),
    frase_destacada:  (body.fraseDestacada as string)   ?? null,
    como_llego:       (body.comoLlego      as string) ?? null,
    como_llego_otro:  (body.comoLlegoOtro as string) ?? null,
    referido_rut:     (body.referidoRut   as string) ?? null,
    video_url:        (body.videoUrl      as string) || null,
  };
}

function isColumnError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  // PGRST204 = column not found in schema cache
  // 42703     = PostgreSQL "column does not exist"
  if (err.code === "PGRST204" || err.code === "42703") return true;
  const msg = (err.message ?? "").toLowerCase();
  return (msg.includes("column") && (msg.includes("does not exist") || msg.includes("not found")));
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;

  console.log("[update-profile] userId:", userId);
  console.log("[update-profile] nombre:", body.nombre, "especialidades:", (body.especialidades as unknown[])?.length ?? 0);
  console.log("[update-profile] fraseDestacada:", body.fraseDestacada, "modalidades:", JSON.stringify(body.modalidades));
  console.log("[update-profile] videoUrl:", body.videoUrl);

  // Log photos payload for debugging
  const rawFotoUrls = (body.fotoUrls ?? []) as unknown[];
  console.log("[update-profile] fotoUrls count:", rawFotoUrls.length, "sample:", JSON.stringify(rawFotoUrls[0] ?? null));

  // Normalize photos: each item must be { url: string, descripcion: string }
  const normalizedFotos = rawFotoUrls
    .map(f => {
      if (typeof f === "string") return { url: f, descripcion: "" };
      if (f && typeof f === "object") {
        const o = f as Record<string, unknown>;
        const url = typeof o.url === "string" ? o.url : null;
        return url ? { url, descripcion: (typeof o.descripcion === "string" ? o.descripcion : "") } : null;
      }
      return null;
    })
    .filter((f): f is { url: string; descripcion: string } => f !== null && !!f.url);

  console.log("[update-profile] normalized fotos:", normalizedFotos.length);

  // 1. Upsert maestro row — try extended payload first, fall back to core if column error
  const extendedPayload = buildExtendedPayload(userId, body);
  console.log("[update-profile] attempting extended upsert, keys:", Object.keys(extendedPayload).join(", "));

  let { data: maestroRow, error: upsertError } = await getSupabaseAdmin()
    .from("maestros")
    .upsert(extendedPayload, { onConflict: "clerk_user_id" })
    .select("id")
    .single();

  if (upsertError && isColumnError(upsertError)) {
    console.warn("[update-profile] extended upsert rejected (column error):", upsertError.code, upsertError.message);
    console.warn("[update-profile] retrying with core columns only…");

    const corePayload = buildCorePayload(userId, body);
    const { data: coreRow, error: coreError } = await getSupabaseAdmin()
      .from("maestros")
      .upsert(corePayload, { onConflict: "clerk_user_id" })
      .select("id")
      .single();

    if (coreError) {
      console.error("[update-profile] core upsert also failed — code:", coreError.code, "message:", coreError.message, "details:", coreError.details);
      return NextResponse.json(
        { error: "Error al guardar en Supabase", supabaseError: { code: coreError.code, message: coreError.message } },
        { status: 500 }
      );
    }

    maestroRow = coreRow;
    upsertError = null;
    console.log("[update-profile] core upsert succeeded, maestroId:", maestroRow?.id);

    // Attempt to save video_url separately — column may now exist even if schema cache was stale
    if (maestroRow?.id && body.videoUrl !== undefined) {
      const { error: videoError } = await getSupabaseAdmin()
        .from("maestros")
        .update({ video_url: (body.videoUrl as string) || null })
        .eq("id", maestroRow.id);
      if (videoError) {
        console.warn("[update-profile] video_url column missing — run: ALTER TABLE maestros ADD COLUMN IF NOT EXISTS video_url text;");
      } else {
        console.log("[update-profile] video_url saved via separate update:", body.videoUrl);
      }
    }
  } else if (upsertError) {
    console.error("[update-profile] upsert failed — code:", upsertError.code, "message:", upsertError.message, "details:", upsertError.details, "hint:", upsertError.hint);
    return NextResponse.json(
      { error: "Error al guardar en Supabase", supabaseError: { code: upsertError.code, message: upsertError.message } },
      { status: 500 }
    );
  } else {
    console.log("[update-profile] extended upsert succeeded, maestroId:", maestroRow?.id);
  }

  if (!maestroRow?.id) {
    console.error("[update-profile] upsert returned no row id");
    return NextResponse.json({ error: "No se obtuvo el ID del maestro" }, { status: 500 });
  }

  // 2. Replace fotos_trabajos: delete existing rows, then insert normalized set
  const { error: deleteError } = await getSupabaseAdmin()
    .from("fotos_trabajos")
    .delete()
    .eq("maestro_id", maestroRow.id);

  if (deleteError) {
    console.error("[update-profile] fotos_trabajos delete failed:", deleteError.code, deleteError.message);
  }

  if (normalizedFotos.length > 0) {
    const rows = normalizedFotos.map(f => ({
      maestro_id:  maestroRow!.id,
      url:         f.url,
      descripcion: f.descripcion || null,
    }));

    console.log("[update-profile] inserting fotos_trabajos, sample:", JSON.stringify(rows[0]));
    const { error: fotosError } = await getSupabaseAdmin().from("fotos_trabajos").insert(rows);
    if (fotosError) {
      console.error("[update-profile] fotos_trabajos insert failed:", fotosError.code, fotosError.message, "sample row:", JSON.stringify(rows[0]));
    } else {
      console.log("[update-profile] fotos_trabajos inserted:", rows.length, "rows");
    }
  } else {
    console.log("[update-profile] gallery empty — fotos_trabajos cleared");
  }

  // 3. Save secondary data to Clerk publicMetadata — non-fatal
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
          nombre:                (body.nombre          as string) ?? "",
          rut:                   (body.rut             as string) ?? "",
          telefono:              (body.telefono        as string) ?? "",
          esWhatsapp:            (body.esWhatsapp      as boolean) ?? false,
          redes:                 body.redes            ?? { whatsapp: "", instagram: "", facebook: "", tiktok: "" },
          especialidades:        (body.especialidades  as string[]) ?? [],
          region:                (body.region          as string) ?? "",
          comunas:               (body.comunas         as string[]) ?? [],
          horario:               body.horario          ?? "",
          descripcion:           (body.descripcion     as string) ?? "",
          experiencia:           (body.experiencia     as number) ?? 0,
          formasPago:            (body.formasPago      as string[]) ?? [],
          modalidades:           (body.modalidades     as string[]) ?? [],
          diasDisponibles:       (body.diasDisponibles as string[]) ?? [],
          fraseDestacada:        (body.fraseDestacada  as string) ?? "",
          atiendeUrgencias:      (body.atiendeUrgencias      as boolean) ?? false,
          especialidadesUrgencia:(body.especialidadesUrgencia as string[]) ?? [],
          galeriaCount:          (body.galeriaCount    as number) ?? 0,
          galeriaCaptions:       (body.galeriaCaptions as string[]) ?? [],
          maestroId:             maestroRow.id,
          updatedAt:             new Date().toISOString(),
        },
      },
    });
    console.log("[update-profile] Clerk write succeeded, maestroId:", maestroRow.id);
  } catch (err) {
    // Non-fatal: primary data already saved to Supabase
    console.error("[update-profile] Clerk write failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true, maestroId: maestroRow.id });
}
