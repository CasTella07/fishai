/**
 * lib/supabase-client.ts — ブラウザ専用 Supabase クライアント
 * Server Component からは使わないこと（lib/supabase.ts を使う）
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}
