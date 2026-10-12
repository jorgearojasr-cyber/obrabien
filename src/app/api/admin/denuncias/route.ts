import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


async function assertAdmin() {
  const user = await currentUser();
  if (!user) return null;
  return isAdminUser(user) ? user : null;
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
