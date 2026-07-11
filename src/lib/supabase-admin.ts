import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// Service role client — bypasses RLS. Only use in server-side code (API routes, server components).
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const faltante = !url && !key
      ? "NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no están"
      : !url
      ? "NEXT_PUBLIC_SUPABASE_URL no está"
      : "SUPABASE_SERVICE_ROLE_KEY no está";
    throw new Error(`${faltante} configurada(s). Revisa las variables de entorno en Vercel.`);
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
