/**
 * lib/supabase.ts — Supabase クライアントラッパー
 *
 * 環境変数 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が
 * 設定されていれば自動的に有効になる（lib/config.ts の supabaseConfig.enabled）。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

/* ─── DB型定義 ──────────────────────────────────────────────────────── */

export interface CatchRecord {
  id?: string;
  user_id: string;
  date: string;            // YYYY-MM-DD
  location: string;
  fish_name: string;
  weight_g?: number;
  length_cm?: number;
  tackle?: string;
  bait?: string;
  tide_type?: string;
  note?: string;
  created_at?: string;
}

export interface TackleRecord {
  id?: string;
  user_id: string;
  name: string;
  type: "rod" | "reel" | "line" | "lure" | "other";
  brand?: string;
  model?: string;
  purchase_date?: string;
  price?: number;
  note?: string;
  created_at?: string;
}

/* ─── クライアントシングルトン ─────────────────────────────────────── */

let _client: SupabaseClient | null = null;

/**
 * Supabase クライアントを返す。
 * 環境変数が未設定の場合は null を返す。
 *
 * @example
 * const sb = getSupabaseClient();
 * if (!sb) return;
 * const { data } = await sb.from("catch_records").select("*");
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfig.enabled) return null;
  if (!_client) {
    _client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }
  return _client;
}

/** Supabase が有効かどうかを確認するユーティリティ */
export function isSupabaseEnabled(): boolean {
  return supabaseConfig.enabled;
}
