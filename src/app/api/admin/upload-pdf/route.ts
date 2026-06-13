import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const email = (
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      ""
    ).toLowerCase().trim();
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "El archivo es demasiado grande (máx. 10 MB)" }, { status: 413 });
    }

    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });

    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Solo se aceptan archivos PDF" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El PDF no puede superar 10 MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create the bucket if it doesn't exist — ignore error if it already exists
    const { error: bucketErr } = await supabase.storage.createBucket("recursos", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (bucketErr && !bucketErr.message.toLowerCase().includes("already exists")) {
      console.warn("[upload-pdf] bucket create warning:", bucketErr.message);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `pdfs/${Date.now()}-${safeName}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from("recursos")
      .upload(path, bytes, {
        contentType: "application/pdf",
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
