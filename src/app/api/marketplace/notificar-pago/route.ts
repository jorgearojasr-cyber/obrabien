import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const { listing_id, plan, contact_name, amount, receipt } = body;

  if (!listing_id || !plan || !contact_name) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "ObraBien <onboarding@resend.dev>",
    to:   "obrabiencl@gmail.com",
    subject: `Transferencia Plan ${plan as string} - ${contact_name as string}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #DCD9CF;">

  <div style="background:#14375F;padding:14px 24px;">
    <span style="color:#E86C1C;font-weight:900;font-size:17px;letter-spacing:0.06em;">ObraBien</span>
    <span style="color:rgba(255,255,255,0.6);font-size:12px;margin-left:12px;">Marketplace</span>
  </div>

  <div style="padding:32px 24px;">
    <h1 style="font-size:20px;color:#14375F;margin:0 0 6px;font-weight:900;">
      Nueva transferencia notificada
    </h1>
    <p style="font-size:13px;color:#6B7C8F;margin:0 0 24px;font-family:monospace;">
      ID publicación: ${listing_id as string}
    </p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #DCD9CF;">
        <td style="padding:10px 0;color:#6B7C8F;width:140px;">Nombre</td>
        <td style="padding:10px 0;color:#14375F;font-weight:700;">${contact_name as string}</td>
      </tr>
      <tr style="border-bottom:1px solid #DCD9CF;">
        <td style="padding:10px 0;color:#6B7C8F;">Plan</td>
        <td style="padding:10px 0;color:#14375F;font-weight:700;">${plan as string}</td>
      </tr>
      <tr style="border-bottom:1px solid #DCD9CF;">
        <td style="padding:10px 0;color:#6B7C8F;">Monto</td>
        <td style="padding:10px 0;color:#E86C1C;font-weight:700;font-size:16px;">$${(amount as number).toLocaleString("es-CL")}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6B7C8F;">Comprobante</td>
        <td style="padding:10px 0;color:#14375F;">${receipt ? (receipt as string) : "<em style='color:#6B7C8F'>No ingresado</em>"}</td>
      </tr>
    </table>

    <a href="https://obrabien.cl/admin/marketplace"
      style="display:inline-block;background:#E86C1C;color:#fff;padding:12px 26px;text-decoration:none;font-weight:700;font-size:14px;">
      Activar publicación →
    </a>
  </div>

  <div style="padding:14px 24px;border-top:1px solid #DCD9CF;background:#F6F4EF;">
    <p style="color:#6B7C8F;font-size:11px;margin:0;">
      Notificación automática enviada desde ObraBien Marketplace.
    </p>
  </div>

</div>
</body>
</html>`,
  });

  if (error) {
    console.error("[marketplace/notificar-pago] Resend error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
