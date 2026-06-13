import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

async function assertAdmin() {
  const user = await currentUser();
  if (!user) return null;
  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();
  return email === ADMIN_EMAIL ? user : null;
}

export async function PATCH(req: NextRequest) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await req.json();
  const { id, action, razon_rechazo } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const adminEmail = (
    admin.primaryEmailAddress?.emailAddress ??
    admin.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();

  switch (action) {
    case "aprobar": {
      const { error } = await getSupabaseAdmin()
        .from("denuncias")
        .update({ estado: "aprobado", aprobado_por: adminEmail, aprobado_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "rechazar": {
      const { error } = await getSupabaseAdmin()
        .from("denuncias")
        .update({ estado: "rechazado", razon_rechazo: (razon_rechazo as string) || null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "aprobar_descargo": {
      const { error } = await getSupabaseAdmin()
        .from("denuncias")
        .update({ descargo_aprobado: true })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "rechazar_descargo": {
      const { error } = await getSupabaseAdmin()
        .from("denuncias")
        .update({ respuesta_descargo: null, descargo_aprobado: false })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  }
}
