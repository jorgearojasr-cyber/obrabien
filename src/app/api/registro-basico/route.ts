import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { mensajeDuplicado, mensajeDesde23505, normalizeRut } from "@/lib/maestro-shared";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const nombre = ((body.nombre as string) ?? "").trim();
  const rut = ((body.rut as string) ?? "").trim();
  const telefono = ((body.telefono as string) ?? "").trim();
  const especialidad = ((body.especialidad as string) ?? "").trim();

  if (!nombre || !rut || !telefono || !especialidad) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Backend backstop for the T&C checkbox — the form blocks submission client-side,
  // but a direct API call must not be able to skip acceptance.
  if (body.terminosAceptados !== true) {
    return NextResponse.json(
      { error: "Debes aceptar los Términos y Condiciones para registrarte." },
      { status: 400 }
    );
  }

  // Canonical format for storage and comparison — same normalization as the
  // unique indexes in migration 020.
  const rutNormalizado = normalizeRut(rut);

  // Reject a rut/telefono that already belongs to a different maestro (normalized
  // comparison — see migration 020) before attempting the write, so the user gets
  // a clear message instead of a raw database error.
  const { data: duplicados, error: dupError } = await getSupabaseAdmin()
    .rpc("check_maestro_duplicado", { p_clerk_user_id: userId, p_rut: rutNormalizado, p_telefono: telefono });

  if (dupError) {
    console.error("[registro-basico] duplicate check failed:", dupError.message);
  } else if (duplicados && duplicados.length > 0) {
    return NextResponse.json({ error: mensajeDuplicado(duplicados) }, { status: 409 });
  }

  const { data: maestroRow, error } = await getSupabaseAdmin()
    .from("maestros")
    .upsert({
      clerk_user_id: userId,
      nombre,
      rut: rutNormalizado,
      telefono,
      especialidades: [especialidad],
      perfil_estado: "basico",
      activo: true,
      terminos_aceptados: true,
      terminos_aceptados_at: new Date().toISOString(),
    }, { onConflict: "clerk_user_id" })
    .select("id")
    .single();

  if (error) {
    console.error("[registro-basico] upsert failed:", error.code, error.message);
    if (error.code === "23505") {
      return NextResponse.json({ error: mensajeDesde23505(error.message) }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Error al guardar en Supabase", supabaseError: { code: error.code, message: error.message } },
      { status: 500 }
    );
  }

  // Mirror the core fields into Clerk publicMetadata.profile — used as a best-effort
  // fallback/autofill by get-profile and PostDetail.tsx, not as a gate. Non-fatal:
  // the Supabase row (source of truth) is already saved and is what dashboard/maestro/page.tsx
  // reads to decide whether to bounce the user into the full wizard.
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
          nombre,
          rut: rutNormalizado,
          telefono,
          especialidades: [especialidad],
          maestroId: maestroRow.id,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error("[registro-basico] Clerk write failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true, maestroId: maestroRow.id });
}
