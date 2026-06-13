export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import RecursosContent from "./_content";

export default async function RecursosPage() {
  // Show publicado + proximamente; hide borrador.
  // If the estado column doesn't exist yet (migration pending), fall back to all rows.
  let recursos: unknown[] = [];

  const { data, error } = await getSupabaseAdmin()
    .from("recursos")
    .select("*")
    .neq("estado", "borrador")
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[recursos] fetch error:", error.message);
    // Column might not exist yet — fall back to all rows
    const { data: fallback } = await getSupabaseAdmin()
      .from("recursos")
      .select("*")
      .order("destacado", { ascending: false })
      .order("created_at", { ascending: false });
    recursos = fallback ?? [];
  } else {
    recursos = data ?? [];
  }

  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <RecursosContent recursos={recursos as Parameters<typeof RecursosContent>[0]["recursos"]} />
    </Suspense>
  );
}
