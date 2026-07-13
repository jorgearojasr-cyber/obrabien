import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

// ── Email templates (same visual style as send-reminder/route.ts) ────────────

function emailShell(inner: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #DCD9CF;">
  <div style="background:#14375F;padding:14px 24px;">
    <span style="color:#E86C1C;font-weight:900;font-size:17px;letter-spacing:0.06em;">ObraBien</span>
  </div>
  <div style="padding:32px 24px;">
${inner}
  </div>
  <div style="padding:16px 24px;border-top:1px solid #DCD9CF;background:#F6F4EF;">
    <p style="color:#6B7C8F;font-size:11px;margin:0;line-height:1.6;">
      Recibiste este correo porque tienes un perfil en ObraBien.
      Si tienes preguntas, escríbenos a contacto@obrabien.cl.
    </p>
  </div>
</div>
</body>
</html>`;
}

function htmlAprobado(nombre: string | null, maestroId: string): string {
  return emailShell(`
    <h1 style="font-size:21px;color:#14375F;margin:0 0 16px;font-weight:900;">
      ¡Felicitaciones${nombre ? `, ${nombre}` : ""}! 🎉
    </h1>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 14px;">
      Tu perfil fue revisado y aprobado por el equipo de ObraBien.
      <strong>Ya está público</strong> y los clientes pueden encontrarte y contactarte.
    </p>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Un perfil con foto, especialidades y fotos de trabajos recibe muchos más contactos —
      manténlo al día desde tu panel.
    </p>
    <a href="https://obrabien.cl/maestro/${maestroId}"
      style="display:inline-block;background:#E86C1C;color:#fff;padding:13px 28px;text-decoration:none;font-weight:700;font-size:15px;">
      Ver mi perfil público →
    </a>`);
}

function htmlRechazado(nombre: string | null, motivo: string): string {
  return emailShell(`
    <h1 style="font-size:21px;color:#14375F;margin:0 0 16px;font-weight:900;">
      Hola${nombre ? `, ${nombre}` : ""}
    </h1>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 14px;">
      Revisamos tu perfil en ObraBien y necesita algunos ajustes antes de poder publicarse.
    </p>
    <div style="background:#FEF2F2;border:1px solid #FCA5A5;padding:14px 16px;margin:0 0 20px;">
      <p style="color:#991B1B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">
        Motivo
      </p>
      <p style="color:#7F1D1D;font-size:14.5px;line-height:1.6;margin:0;">${motivo}</p>
    </div>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Corrige lo indicado y vuelve a enviar tu perfil — lo revisaremos nuevamente dentro de 24 horas.
    </p>
    <a href="https://obrabien.cl/dashboard/maestro/completar-perfil"
      style="display:inline-block;background:#E86C1C;color:#fff;padding:13px 28px;text-decoration:none;font-weight:700;font-size:15px;">
      Corregir y reenviar mi perfil →
    </a>`);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? "").toLowerCase().trim();
  if (!email || email !== ADMIN_EMAIL) {
    console.error("[revisar-perfil] Forbidden — caller:", email, "expected:", ADMIN_EMAIL);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { maestroId, accion, motivo } = body;
  if (!maestroId || !["aprobar", "rechazar"].includes(accion)) {
    return NextResponse.json({ error: "Invalid request: missing maestroId or accion" }, { status: 400 });
  }

  if (accion === "rechazar" && !(typeof motivo === "string" && motivo.trim())) {
    return NextResponse.json({ error: "Debes indicar el motivo del rechazo" }, { status: 400 });
  }

  const update = accion === "aprobar"
    ? { perfil_estado: "completo", rechazo_motivo: null }
    : { perfil_estado: "rechazado", rechazo_motivo: (motivo as string).trim() };

  const { error, data } = await getSupabaseAdmin()
    .from("maestros")
    .update(update)
    .eq("id", maestroId)
    .select("id, nombre, clerk_user_id");

  if (error) {
    console.error("[revisar-perfil] Supabase error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.warn("[revisar-perfil] No row updated — maestroId not found:", maestroId);
    return NextResponse.json({ error: "Maestro not found" }, { status: 404 });
  }

  console.log("[revisar-perfil] OK —", accion, "maestroId:", maestroId);

  // ── Email al maestro — best-effort ─────────────────────────────────────────
  // Any failure here (RESEND_API_KEY missing/invalid, Clerk lookup, no email)
  // is logged and swallowed: the approve/reject above is already saved and
  // must never be rolled back or blocked by a notification problem.
  try {
    const row = data[0] as { id: string; nombre: string | null; clerk_user_id: string | null };

    if (!process.env.RESEND_API_KEY) {
      console.warn("[revisar-perfil] RESEND_API_KEY no configurada — no se envió email de", accion);
    } else if (!row.clerk_user_id) {
      console.warn("[revisar-perfil] maestro sin clerk_user_id — no se envió email:", maestroId);
    } else {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(row.clerk_user_id);
      const maestroEmail =
        clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

      if (!maestroEmail) {
        console.warn("[revisar-perfil] maestro sin email en Clerk — no se envió email:", maestroId);
      } else {
        const primerNombre = (row.nombre ?? "").split(" ")[0] || null;
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM || "ObraBien <onboarding@resend.dev>",
          to: maestroEmail,
          subject: accion === "aprobar"
            ? "¡Tu perfil en ObraBien fue aprobado! 🎉"
            : "Tu perfil en ObraBien necesita ajustes",
          html: accion === "aprobar"
            ? htmlAprobado(primerNombre, row.id)
            : htmlRechazado(primerNombre, (motivo as string).trim()),
        });
        if (emailError) {
          console.error("[revisar-perfil] Resend error (no-fatal):", JSON.stringify(emailError));
        } else {
          console.log("[revisar-perfil] email de", accion, "enviado a", maestroEmail);
        }
      }
    }
  } catch (err) {
    console.error("[revisar-perfil] fallo no-fatal al enviar email:", err);
  }

  return NextResponse.json({ ok: true });
}
