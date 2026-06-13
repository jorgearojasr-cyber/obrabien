import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "La foto es demasiado grande o el formato es inválido (máx. 4 MB)" }, { status: 413 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const type = new URL(req.url).searchParams.get("type");
  const maxSize = type === "recurso-pdf" ? 10 * 1024 * 1024 : 4 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: type === "recurso-pdf" ? "El PDF no puede superar 10 MB" : "La foto no puede superar 4 MB" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const folder = type === "perfil"
    ? `ObraBien/perfiles/${userId}`
    : type === "cedula"
      ? `ObraBien/cedulas/${userId}`
      : type === "foro"
        ? `ObraBien/foro`
        : type === "marketplace"
          ? `ObraBien/marketplace`
          : type === "recurso-pdf"
            ? `ObraBien/recursos/pdfs`
            : type === "recurso-imagen"
              ? `ObraBien/recursos/imagenes`
              : `ObraBien/trabajos/${userId}`;

  if (type === "recurso-pdf") {
    try {
      const result = await cloudinary.uploader.upload(dataUri, { folder, resource_type: "raw" });
      return NextResponse.json({ url: result.secure_url });
    } catch (err) {
      console.error("[upload-foto] Cloudinary PDF error:", err);
      return NextResponse.json({ error: "Error al subir el PDF" }, { status: 500 });
    }
  }

  const transformation = type === "perfil"
    ? [{ width: 400, height: 400, crop: "fill" as const, gravity: "face" as const, quality: "auto:good" as const }]
    : [{ width: 1600, height: 1200, crop: "limit" as const, quality: "auto:good" as const }];

  try {
    const result = await cloudinary.uploader.upload(dataUri, { folder, transformation });
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload-foto] Cloudinary error:", err);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
