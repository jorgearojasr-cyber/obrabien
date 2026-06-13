import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  const body = await req.json().catch(() => ({}));
  const {
    tipo, categoria, titulo, descripcion,
    precio, precio_unit, region, ciudad,
    whatsapp, contact_name, fotos_urls,
  } = body as Record<string, unknown>;

  const fotosArr = Array.isArray(fotos_urls) ? (fotos_urls as string[]).filter(Boolean) : [];
  const foto_url = fotosArr[0] ?? null;

  if (!titulo || !tipo || !whatsapp) {
    return NextResponse.json({ error: "Faltan datos requeridos (título, tipo, WhatsApp)" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_items")
    .insert({
      clerk_user_id:  userId     ?? null,
      tipo,
      categoria:      categoria  ?? null,
      titulo,
      descripcion:    descripcion ?? null,
      precio:         precio     ?? null,
      precio_unit:    precio_unit ?? "unidad",
      region:         region     ?? null,
      ciudad:         ciudad     ?? null,
      whatsapp,
      contact_name:   contact_name ?? null,
      foto_url,
      fotos_urls:     fotosArr.length > 0 ? fotosArr : [],
      plan:           "gratis",
      activo:         false,
      payment_status: "revision",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[marketplace/publicar] Supabase error:", error.message, error.details);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify admin via email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const tituloStr      = String(titulo).slice(0, 100);
      const tipoStr        = String(tipo);
      const categoriaStr   = categoria ? String(categoria) : "—";
      const precioStr      = precio ? `$${Number(precio).toLocaleString("es-CL")}` : "A convenir";
      const contactoStr    = contact_name ? String(contact_name) : "—";
      const regionStr      = region ? String(region) : "—";
      const listingId      = data.id as string;

      await resend.emails.send({
        from:    process.env.RESEND_FROM ?? "ObraBien <onboarding@resend.dev>",
        to:      "obrabiencl@gmail.com",
        subject: `Nueva publicación en revisión: ${tituloStr}`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F6F4EF;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #DCD9CF;">
  <div style="background:#14375F;padding:14px 24px;">
    <span style="color:#E86C1C;font-weight:900;font-size:17px;letter-spacing:0.06em;">ObraBien</span>
    <span style="color:rgba(255,255,255,0.6);font-size:12px;margin-left:12px;">Marketplace — Revisión</span>
  </div>
  <div style="padding:32px 24px;">
    <h1 style="font-size:20px;color:#14375F;margin:0 0 6px;font-weight:900;">Nueva publicación pendiente de revisión</h1>
    <p style="font-size:13px;color:#6B7C8F;margin:0 0 24px;font-family:monospace;">ID: ${listingId}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #DCD9CF;"><td style="padding:10px 0;color:#6B7C8F;width:140px;">Título</td><td style="padding:10px 0;color:#14375F;font-weight:700;">${tituloStr}</td></tr>
      <tr style="border-bottom:1px solid #DCD9CF;"><td style="padding:10px 0;color:#6B7C8F;">Tipo</td><td style="padding:10px 0;color:#14375F;font-weight:700;">${tipoStr}</td></tr>
      <tr style="border-bottom:1px solid #DCD9CF;"><td style="padding:10px 0;color:#6B7C8F;">Categoría</td><td style="padding:10px 0;color:#14375F;">${categoriaStr}</td></tr>
      <tr style="border-bottom:1px solid #DCD9CF;"><td style="padding:10px 0;color:#6B7C8F;">Precio</td><td style="padding:10px 0;color:#E86C1C;font-weight:700;">${precioStr}</td></tr>
      <tr style="border-bottom:1px solid #DCD9CF;"><td style="padding:10px 0;color:#6B7C8F;">Contacto</td><td style="padding:10px 0;color:#14375F;">${contactoStr}</td></tr>
      <tr><td style="padding:10px 0;color:#6B7C8F;">Región</td><td style="padding:10px 0;color:#14375F;">${regionStr}</td></tr>
    </table>
    <a href="https://obrabien.cl/admin/marketplace" style="display:inline-block;background:#E86C1C;color:#fff;padding:12px 26px;text-decoration:none;font-weight:700;font-size:14px;">
      Revisar en el admin →
    </a>
  </div>
  <div style="padding:14px 24px;border-top:1px solid #DCD9CF;background:#F6F4EF;">
    <p style="color:#6B7C8F;font-size:11px;margin:0;">Notificación automática de ObraBien Marketplace.</p>
  </div>
</div>
</body>
</html>`,
      });
    } catch (emailErr) {
      console.error("[marketplace/publicar] email error:", emailErr);
    }
  }

  return NextResponse.json({ ok: true, id: data.id });
}
