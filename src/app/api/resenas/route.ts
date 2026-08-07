// Required Supabase migrations:
// ALTER TABLE resenas ADD COLUMN IF NOT EXISTS clerk_user_id text;
// ALTER TABLE resenas ADD COLUMN IF NOT EXISTS tags text[];
// ALTER TABLE resenas ADD COLUMN IF NOT EXISTS tipo_trabajo text;
// ALTER TABLE resenas ADD COLUMN IF NOT EXISTS fotos text[];
// ALTER TABLE resenas ADD COLUMN IF NOT EXISTS tags_negativos text[];
//
// Este endpoint (reseña libre, sin verificar) se mantiene por compatibilidad,
// pero queda congelado: ninguna pantalla nueva debe usarlo. El flujo nuevo es
// la reseña verificada, originada exclusivamente desde una Solicitud de
// Trabajo con estado "trabajo_terminado" — ver crearResenaVerificada() en
// src/lib/solicitudes.ts y supabase/migrations/025_trabajo_terminado_resenas_verificadas.sql
// (Sprint 24, JOB-054/055/056). Esa migración agregó resenas.solicitud_id y
// ELIMINÓ el índice único resenas_user_maestro_unique que antes limitaba a
// una reseña por (maestro_id, clerk_user_id) para siempre — la unicidad ahora
// es por solicitud_id (una reseña por trabajo real). Las filas ya existentes,
// creadas por este endpoint, no se tocaron ni se migraron: conviven con las
// reseñas verificadas nuevas (solicitud_id queda NULL en las históricas).

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const maestroId = new URL(req.url).searchParams.get("maestroId");
  if (!maestroId) return NextResponse.json({ error: "maestroId required" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("resenas")
    .select("cliente_nombre, calificacion, comentario, created_at, tags, tags_negativos, tipo_trabajo, fotos")
    .eq("maestro_id", maestroId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const count = data.length;
  const avg   = count > 0 ? data.reduce((s, r) => s + r.calificacion, 0) / count : 0;

  return NextResponse.json({ data, avg: Math.round(avg * 10) / 10, count });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { maestroId, nombre, calificacion, comentario, tags, tags_negativos, tipo_trabajo, fotos } = await req.json();

  if (!maestroId || !calificacion || !comentario?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Server-side self-review guard
  const { data: maestro } = await getSupabaseAdmin()
    .from("maestros").select("clerk_user_id").eq("id", maestroId).single();

  if (maestro?.clerk_user_id === userId) {
    return NextResponse.json({ error: "No puedes reseñar tu propio perfil" }, { status: 403 });
  }

  // One review per user per maestro
  const { data: existing } = await getSupabaseAdmin()
    .from("resenas")
    .select("id")
    .eq("maestro_id", maestroId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Ya dejaste una reseña para este maestro" }, { status: 409 });
  }

  const { error: insertError } = await getSupabaseAdmin()
    .from("resenas")
    .insert({
      maestro_id:     maestroId,
      clerk_user_id:  userId,
      cliente_nombre: nombre || null,
      calificacion,
      comentario:     comentario.trim(),
      tags:           tags ?? null,
      tags_negativos: tags_negativos ?? null,
      tipo_trabajo:   tipo_trabajo ?? null,
      fotos:          fotos ?? null,
    });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, ...(await getStats(maestroId)) });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { maestroId, nombre, calificacion, comentario, tags, tags_negativos, tipo_trabajo, fotos } = await req.json();

  if (!maestroId || !calificacion || !comentario?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error: updateError } = await getSupabaseAdmin()
    .from("resenas")
    .update({
      cliente_nombre: nombre || null,
      calificacion,
      comentario:     comentario.trim(),
      tags:           tags ?? null,
      tags_negativos: tags_negativos ?? null,
      tipo_trabajo:   tipo_trabajo ?? null,
      fotos:          fotos ?? null,
    })
    .eq("maestro_id", maestroId)
    .eq("clerk_user_id", userId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, ...(await getStats(maestroId)) });
}

async function getStats(maestroId: string) {
  const { data: all } = await getSupabaseAdmin()
    .from("resenas").select("calificacion").eq("maestro_id", maestroId);
  const count = all?.length ?? 0;
  const avg   = count > 0 ? (all ?? []).reduce((s, r) => s + r.calificacion, 0) / count : 0;
  return { avg: Math.round(avg * 10) / 10, count };
}
