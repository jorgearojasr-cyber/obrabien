import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { maestro_id } = body as { maestro_id?: string };

  if (!maestro_id || typeof maestro_id !== "string") {
    return NextResponse.json({ error: "maestro_id required" }, { status: 400 });
  }

  const visitorIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
                 ?? req.headers.get("x-real-ip")
                 ?? "unknown";

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recent } = await getSupabaseAdmin()
    .from("contactos_clicks")
    .select("id", { count: "exact", head: true })
    .eq("maestro_id", maestro_id)
    .eq("visitor_ip", visitorIp)
    .gte("clicked_at", since24h);

  if ((recent ?? 0) === 0) {
    await getSupabaseAdmin()
      .from("contactos_clicks")
      .insert({ maestro_id, visitor_ip: visitorIp });
  }

  return NextResponse.json({ ok: true });
}
