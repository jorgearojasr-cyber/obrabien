import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BASE_URL = "https://www.obrabien.cl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  // Mismos filtros que usan las páginas reales: /buscar (activo=true) y
  // /recursos/[id] (estado != 'borrador', incluyendo estado=null).
  const [{ data: maestros }, { data: recursos }] = await Promise.all([
    supabase.from("maestros").select("id, updated_at").eq("activo", true),
    supabase.from("recursos").select("id, created_at").or("estado.is.null,estado.neq.borrador"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/buscar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/recursos`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const maestroEntries: MetadataRoute.Sitemap = (maestros ?? []).map(m => ({
    url: `${BASE_URL}/maestro/${m.id}`,
    lastModified: m.updated_at ? new Date(m.updated_at as string) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const recursoEntries: MetadataRoute.Sitemap = (recursos ?? []).map(r => ({
    url: `${BASE_URL}/recursos/${r.id}`,
    lastModified: r.created_at ? new Date(r.created_at as string) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...maestroEntries, ...recursoEntries];
}
