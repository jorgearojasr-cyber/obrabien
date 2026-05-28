import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

// Service role client — bypasses RLS. Only use in server-side code (API routes, server components).
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    // Return anon client as fallback so build doesn't crash — writes will fail due to RLS
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    return createClient(url ?? "", anonKey, { auth: { persistSession: false } });
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
