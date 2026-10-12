import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/authz";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";


export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    if (!isAdminUser(user)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "El archivo es demasiado grande (máx. 10 MB)" }, { status: 413 });
    }

    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });

    // Hotfix 19A.1: este endpoint reemplaza la subida directa con la clave anon. Mismos tipos que la pantalla de recursos.
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const CONTENT_TYPES: Record<string, string> = {
      pdf:  "application/pdf",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xls:  "application/vnd.ms-excel",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc:  "application/msword",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ppt:  "application/vnd.ms-powerpoint",
    };
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
      return NextResponse.json({ error: "Tipo de archivo no permitido (PDF, Word, Excel o PowerPoint)" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 20 MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create the bucket if it doesn't exist — ignore error if it already exists
    const { error: bucketErr } = await supabase.storage.createBucket("recursos", {
      public: true,
      fileSizeLimit: 20 * 1024 * 1024,
    });
    if (bucketErr && !bucketErr.message.toLowerCase().includes("already exists")) {
      console.warn("[upload-pdf] bucket create warning:", bucketErr.message);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${ext === "pdf" ? "pdfs" : "archivos"}/${Date.now()}-${safeName}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from("recursos")
      .upload(path, bytes, {
        contentType,
        upsert: false,
      });

    if (uploadErr) {
      console.error("[upload-pdf] Supabase upload error:", uploadErr.message);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("recursos")
      .getPublicUrl(path);

    console.log("[upload-pdf] uploaded:", path, "→", publicUrl);
    return NextResponse.json({ url: publicUrl });

  } catch (err) {
    console.error("[upload-pdf] unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir el PDF" },
      { status: 500 }
    );
  }
}
