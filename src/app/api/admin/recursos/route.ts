import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "jorge.arojasr@gmail.com"
).toLowerCase().trim();

async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;
  const email = (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase().trim();
  return email === ADMIN_EMAIL;
}

function buildFields(body: Record<string, unknown>) {
  return {
    titulo:         body.titulo,
    descripcion:    body.descripcion   || null,
    contenido:      body.contenido     || null,
    tipo:           body.tipo,
    categoria:      body.categoria,
    url:            body.url           || null,
    video_url:      body.video_url     || null,
    pdf_url:        body.pdf_url       || null,
    pdfs:           Array.isArray(body.pdfs) ? body.pdfs : [],
    imagenes_extra: Array.isArray(body.imagenes_extra) ? (body.imagenes_extra as string[]).filter(Boolean) : [],
    imagen_url:     body.imagen_url    || null,
    para_quien:     body.para_quien    ?? "todos",
    destacado:      body.destacado     ?? false,
    estado:         body.estado        ?? "proximamente",
  };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("recursos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;

  const { data, error } = await getSupabaseAdmin()
    .from("recursos")
    .insert(buildFields(body))
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("recursos")
    .update(buildFields(body))
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("recursos")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
