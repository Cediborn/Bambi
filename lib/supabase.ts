import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client — env-gated.
 *
 * BAMBI runs fully as a guest without Supabase: `getSupabase()` returns
 * null until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * exist, and every auth screen degrades gracefully to guest mode. Drop
 * the keys into `.env.local` to switch accounts on — no other code changes.
 */
let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // Email-confirmation links arrive as URL params — honour them.
          detectSessionInUrl: true,
        },
      }
    );
  }
  return client;
}
