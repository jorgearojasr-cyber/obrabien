import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const email = (user?.primaryEmailAddress?.emailAddress ?? "").toLowerCase().trim();
  if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.RESEND_API_KEY) {
    console.error("[send-reminder] RESEND_API_KEY is not set. Add it to Vercel environment variables.");
    return NextResponse.json(
      { error: "Email service not configured. Add RESEND_API_KEY to environment variables." },
      { status: 500 }
    );
  }

  const { maestroId } = await req.json();
  if (!maestroId) return NextResponse.json({ error: "Missing maestroId" }, { status: 400 });

  const { data: maestro, error: dbError } = await getSupabaseAdmin()
    .from("maestros")
    .select("nombre, clerk_user_id, verificacion_estado")
    .eq("id", maestroId)
    .single();

  if (dbError || !maestro) {
    console.error("[send-reminder] maestro not found:", dbError?.message);
    return NextResponse.json({ error: "Maestro not found" }, { status: 404 });
  }

  if (!maestro.clerk_user_id) {
    return NextResponse.json({ error: "Maestro has no Clerk user ID" }, { status: 400 });
  }

  let maestroEmail: string | undefined;
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(maestro.clerk_user_id as string);
    maestroEmail = clerkUser.emailAddresses[0]?.emailAddress;
  } catch (err) {
    console.error("[send-reminder] Clerk lookup failed:", err);
    return NextResponse.json({ error: "No se pudo obtener el email del maestro" }, { status: 500 });
  }

  if (!maestroEmail) {
    return NextResponse.json({ error: "No email found for maestro" }, { status: 400 });
  }

  const nombre = (maestro.nombre as string | null)?.split(" ")[0] ?? null;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM || "ObraBien <onboarding@resend.dev>",
    to: maestroEmail,
    subject: "Completa tu perfil en ObraBien",
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #DCD9CF;">

  <div style="background:#14375F;padding:14px 24px;">
    <span style="color:#E86C1C;font-weight:900;font-size:17px;letter-spacing:0.06em;">ObraBien</span>
  </div>

  <div style="padding:32px 24px;">
    <h1 style="font-size:21px;color:#14375F;margin:0 0 16px;font-weight:900;">
      Hola${nombre ? `, ${nombre}` : ""}
    </h1>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 14px;">
      Te recordamos que tienes documentos pendientes de enviar para verificar tu identidad en ObraBien.
    </p>
    <p style="color:#2D4258;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Completa tu perfil en:
      <a href="https://obrabien.cl/dashboard" style="color:#E86C1C;font-weight:700;">obrabien.cl/dashboard</a>
    </p>
    <a href="https://obrabien.cl/dashboard/maestro/completar-perfil"
      style="display:inline-block;background:#E86C1C;color:#fff;padding:13px 28px;text-decoration:none;font-weight:700;font-size:15px;">
      Completar perfil →
    </a>
  </div>

  <div style="padding:16px 24px;border-top:1px solid #DCD9CF;background:#F6F4EF;">
    <p style="color:#6B7C8F;font-size:11px;margin:0;line-height:1.6;">
      Recibiste este correo porque tienes un perfil activo en ObraBien.
      Si tienes preguntas, escríbenos a contacto@obrabien.cl.
    </p>
  </div>

</div>
</body>
</html>`,
  });

  if (emailError) {
    console.error("[send-reminder] Resend error:", JSON.stringify(emailError));
    return NextResponse.json({ error: emailError.message }, { status: 500 });
  }

  console.log("[send-reminder] email sent to", maestroEmail);
  return NextResponse.json({ ok: true, email: maestroEmail });
}
