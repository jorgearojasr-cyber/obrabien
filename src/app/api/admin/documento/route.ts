import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdminUser } from "@/lib/authz";
import { resolveDocument } from "@/lib/cloudinary-resolve";
import { documentLinkExpiry, parseDocumentRequest } from "@/lib/admin-documents";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" };

// Lectura de un documento de identidad por el ADMINISTRADOR: redirección a una URL firmada que caduca en 2 minutos.
// Sin sesión de administrador no hay respuesta con datos. No se registra el contenido, solo quién y qué documento (auditoría).
// 19A.2R: el identificador sale del valor guardado sin alterar mayúsculas, la carpeta debe pertenecer al maestro y lo confirma la API de Cloudinary.
export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: PRIVATE_HEADERS });

  const parsed = parseDocumentRequest(req.nextUrl.searchParams);
  if (!parsed.ok) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400, headers: PRIVATE_HEADERS });

  const { data, error } = await getSupabaseAdmin().from("maestros").select(`clerk_user_id, ${parsed.column}`).eq("id", parsed.maestroId).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "No encontrado" }, { status: 404, headers: PRIVATE_HEADERS });

  const row = data as unknown as Record<string, unknown>;
  const resolved = await resolveDocument(cloudinary.api, row[parsed.column], String(row.clerk_user_id ?? ""), process.env.CLOUDINARY_CLOUD_NAME);
  if (!resolved.ok) {
    console.error("[admin/documento] no resuelto", JSON.stringify({ maestro: parsed.maestroId, campo: parsed.field, motivo: resolved.reason }));
    return NextResponse.json({ error: resolved.reason === "api_error" ? "Servicio no disponible" : "No encontrado" }, { status: resolved.reason === "api_error" ? 502 : 404, headers: PRIVATE_HEADERS });
  }

  const url = cloudinary.utils.private_download_url(resolved.publicId, resolved.format, {
    resource_type: "image",
    type: resolved.type,
    expires_at: documentLinkExpiry(),
  });
  console.info("[admin/documento] acceso", JSON.stringify({ admin: user?.id, maestro: parsed.maestroId, campo: parsed.field }));
  return NextResponse.redirect(url, { status: 302, headers: PRIVATE_HEADERS });
}
