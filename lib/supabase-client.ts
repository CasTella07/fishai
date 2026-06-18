/**
 * lib/supabase-client.ts — ブラウザ専用 Supabase クライアント
 * 環境変数が未設定の場合は null を返す。
 * Server Component からは使わないこと（lib/supabase.ts を使う）
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}
