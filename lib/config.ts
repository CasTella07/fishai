/**
 * lib/config.ts — FishAI アプリ設定・機能フラグ
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  現在の構成                                                       │
 * │  ─────────────────────────────────────────────────────────────  │
 * │  Vercel Hobby         : 無料 (100GB帯域 / 月)                    │
 * │  Anthropic API        : 従量課金 (claude-sonnet-4-6)             │
 * │  Supabase             : 接続済み (DB + Storage)                  │
 * │  潮汐データ           : tide736.net 実API (江ノ島局ほか)          │
 * │  天気データ           : Open-Meteo + Open-Meteo Marine (無料)    │
 * │  決済 (Stripe等)      : 未実装                                   │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 有料機能を追加するときは .env.local に環境変数を追加するだけ。
 * コードの変更は各サービスの実装ファイル内だけで完結するよう設計。
 */

/* ─── Anthropic ─────────────────────────────── */
//
// ANTHROPIC_API_KEY の設定方法:
//   1. https://console.anthropic.com/settings/keys でキーを発行
//   2. .env.local に以下を追加:
//        ANTHROPIC_API_KEY=sk-ant-...
//
// 未設定の場合:
//   - AIチャット機能 (/ai-chat) が動作しません
//   - 写真AI魚判定機能 (釣果記録タブ) が動作しません
//   → フォームに手動入力すれば保存自体は可能です
//
export const anthropicConfig = {
  apiKey:    process.env.ANTHROPIC_API_KEY ?? "",
  model:     "claude-sonnet-4-6",
  maxTokens: 2048,
} as const;

/* ─── Supabase（将来） ────────────────────────
 * 有効化: .env.local に以下を追加するだけ
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 * 無料枠: 500MB DB / 1GB Storage / 50,000 MAU
 */
export const supabaseConfig = {
  enabled:
    !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  url:     process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

/* ─── 潮汐API（将来） ─────────────────────────
 * 有効化: .env.local に以下を追加するだけ
 *   TIDE_API_PROVIDER=stormglass   # or: worldtides / jma
 *   STORMGLASS_API_KEY=xxx
 *
 * 未設定 → "dummy" → lib/tideApi.ts がダミーデータを返す
 */
export type TideApiProvider = "dummy" | "stormglass" | "worldtides" | "jma";

export const tideConfig = {
  provider:       (process.env.TIDE_API_PROVIDER ?? "dummy") as TideApiProvider,
  stormglassKey:  process.env.STORMGLASS_API_KEY  ?? "",
  worldtidesKey:  process.env.WORLDTIDES_API_KEY  ?? "",
} as const;

/* ─── 機能フラグ（将来の段階的リリース用） ────
 * NEXT_PUBLIC_FEATURE_xxx=true を .env.local に追加すると有効になる
 */
export const featureFlags = {
  /** Supabase に釣果を保存する機能 */
  catchLogDb:   process.env.NEXT_PUBLIC_FEATURE_CATCH_LOG_DB   === "true",
  /** リアルタイム潮汐API */
  liveTide:     process.env.NEXT_PUBLIC_FEATURE_LIVE_TIDE       === "true",
  /** 決済・プレミアムプラン (Stripe) */
  payments:     process.env.NEXT_PUBLIC_FEATURE_PAYMENTS        === "true",
  /** ソーシャル機能（釣果シェア等） */
  social:       process.env.NEXT_PUBLIC_FEATURE_SOCIAL          === "true",
} as const;
