import { NextRequest, NextResponse } from "next/server";
import { MAX_PROXY_BYTES, PROXY_TIMEOUT_MS, validateProxyTarget } from "@/lib/image-proxy-guard";

// Trae una foto pública de Cloudinary para la tarjeta descargable del perfil (evita CORS en Safari/iOS).
// Hotfix 19A.1: ya no es un proxy abierto. Solo https://res.cloudinary.com/<cuenta>/image/upload/..., sin redirecciones,
// solo imágenes, con tamaño y tiempo máximos. Ver src/lib/image-proxy-guard.ts.
export async function GET(request: NextRequest) {
  const target = validateProxyTarget(request.nextUrl.searchParams.get("url"), process.env.CLOUDINARY_CLOUD_NAME);
  if (!target.ok) {
    // Mismo código para todo rechazo: no se explica qué regla falló.
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    const response = await fetch(target.url, { redirect: "manual", signal: AbortSignal.timeout(PROXY_TIMEOUT_MS) });
    if (!response.ok) return new NextResponse("Fetch failed", { status: 502 });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) return new NextResponse("Unsupported media", { status: 415 });

    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > MAX_PROXY_BYTES) return new NextResponse("Too large", { status: 413 });

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_PROXY_BYTES) return new NextResponse("Too large", { status: 413 });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 502 });
  }
}
