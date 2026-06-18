/**
 * lib/types/domain.ts — FishAI ドメイン型定義（正規版）
 *
 * このファイルが全体のソース・オブ・トゥルース。
 * DB スキーマ（supabase/schema.sql）・データファイル・API は
 * ここで定義した型に従う。
 *
 * 設計方針
 * - snake_case は DB 専用。TypeScript 内は camelCase。
 * - id は TEXT スラッグ（"chigasaki-surf"）。UUID は DB 内部用。
 * - JSONB カラムは TypeScript 型で厳密に定義。
 * - 将来の全国展開・有料化・船宿連携を想定して Region/Plan を最初から入れる。
 */

/* ══════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════ */

export type WindDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type TideType = "大潮" | "中潮" | "小潮" | "長潮" | "若潮";
export type TidePhase = "incoming" | "outgoing" | "both" | "slack";
export type SpotType = "surf" | "port" | "shore" | "river" | "offshore";
export type FootholdType =
  | "sandy_beach"       // 砂浜
  | "rocky"             // 磯
  | "concrete_pier"     // コンクリート護岸・堤防
  | "stone_breakwater"  // テトラ・石積み
  | "river_bank"        // 河川敷
  | "mixed";            // 複合

export type CrowdLevel = "low" | "medium" | "high" | "very_high";
export type ParkingType = "free" | "paid" | "none";
export type ToiletType = "year_round" | "seasonal" | "nearby" | "none";

export type FishCategory = "回遊魚" | "根魚" | "フラット" | "小物" | "大物";

export type UserPlan = "free" | "pro" | "premium";

export type DecisionType = "行くべき" | "朝だけ行く" | "場所を変える" | "やめる";
export type SafetyLevel  = "安全" | "注意" | "危険";

export type NotificationChannel = "push" | "email" | "line";
export type NotificationType =
  | "score_above_threshold"   // 釣果スコアが閾値を超えた
  | "sunrise_warning"         // 日の出まで30分
  | "safety_alert"            // 安全レベルが変化
  | "fish_score_spike"        // 特定魚種のスコア急上昇
  | "tomorrow_forecast"       // 翌日の予報通知
  | "favorite_spot_good";     // お気に入りスポットが好条件

/* ══════════════════════════════════════════════════
   REGION
   将来の全国展開基盤。湘南=1リージョン。
══════════════════════════════════════════════════ */

export interface Region {
  /** スラッグ: "shonan" / "miura" / "chiba-kujukuri" など */
  id: string;
  name: string;           // "湘南"
  nameEn: string;         // "Shonan"
  prefecture: string;     // "神奈川県"
  description: string;
  lat: number;
  lng: number;
  timezone: string;       // "Asia/Tokyo"
  /** 公開済みか */
  active: boolean;
  /** 有料リージョンか（将来用）*/
  premiumOnly: boolean;
  /** 公開日 */
  launchDate?: string;    // ISO date "2024-06-01"
  spotIds: string[];
}

/* ══════════════════════════════════════════════════
   SPOT — スポット（ポイント）
══════════════════════════════════════════════════ */

export interface TimeRange {
  start: string;                          // "05:00"
  end:   string;                          // "07:30"
  label: string;                          // "朝マズメ"
  quality: "excellent" | "good" | "fair";
}

export interface WindConditions {
  /** 向いている風向き（オフショアなど）*/
  bestDirs: WindDirection[];
  /** 向いていない風向き（オンショアなど）*/
  worstDirs: WindDirection[];
  /** この風速（m/s）を超えると釣り困難 */
  maxSafeSpeedMs: number;
  notes?: string;
}

export interface TideConditions {
  /** 向いている潮型 */
  bestTypes: TideType[];
  /** 向いていない潮型 */
  worstTypes?: TideType[];
  /** 上げ潮/下げ潮どちらが良いか */
  bestPhase: TidePhase;
  notes?: string;
}

export interface ParkingInfo {
  available: boolean;
  type: ParkingType;
  capacity?: number;        // 台数
  cost?: string;            // "無料" | "500円/日"
  hours?: string;           // "6:00〜22:00"
  notes?: string;
  lat?: number;             // 駐車場の位置（地図連携用）
  lng?: number;
}

export interface ToiletInfo {
  type: ToiletType;
  notes?: string;
}

/** スポット×魚種の組み合わせ情報 */
export interface SpotFishProfile {
  fishId: string;
  /** 最盛期の月 (1-12) */
  peakMonths: number[];
  bestTideTypes: TideType[];
  bestTidePhase?: TidePhase;
  /** 有効な釣り方 */
  techniques: string[];
  /** 一般的なサイズレンジ */
  avgSizeCm: { min: number; max: number };
  notes: string;
}

/** メインのスポット型 */
export interface Spot {
  /** スラッグ: "chigasaki-surf" */
  id: string;
  regionId: string;
  name: string;
  nameKana?: string;
  type: SpotType;
  icon: string;

  /* ─ 位置情報 ─ */
  lat: number;
  lng: number;
  address: string;

  /* ─ アクセス ─ */
  access: string;
  parking: ParkingInfo;
  toilet: ToiletInfo;
  foothold: FootholdType;

  /* ─ 向き不向き ─ */
  beginnerFriendly: boolean;
  beginnerNote?: string;
  crowdLevel: CrowdLevel;

  /* ─ 気象条件 ─ */
  windConditions: WindConditions;
  tideConditions: TideConditions;
  /** 1日の中でのおすすめ時間帯 */
  bestHours: TimeRange[];

  /* ─ 魚種プロフィール ─ */
  fishProfiles: SpotFishProfile[];

  /* ─ 情報 ─ */
  safetyNotes: string[];
  generalNotes: string[];
  nearbyShops: string[];

  /* ─ メタ ─ */
  active: boolean;
  /** true = 有料会員のみ詳細表示 */
  premiumOnly: boolean;
  /** 表示順 */
  sortOrder: number;
  coverImageUrl?: string;
}

/* ══════════════════════════════════════════════════
   FISH — 魚種マスター
══════════════════════════════════════════════════ */

export interface Fish {
  /** スラッグ: "hirame" */
  id: string;
  name: string;             // "ヒラメ"
  nameEn: string;           // "Olive Flounder"
  emoji: string;
  category: FishCategory;
  /** 最盛期の月 */
  peakMonths: number[];
  habitatDepth: string;     // "底層" / "表層〜中層"
  /** リリースサイズ (法律・マナー) */
  minLegalSizeCm?: number;
  categoryColor: string;
  categoryBg: string;
  beginnerTip: string;
  description?: string;
}

/* ══════════════════════════════════════════════════
   USER — ユーザー（Supabase Auth 拡張）
══════════════════════════════════════════════════ */

export interface UserProfile {
  /** Supabase auth.users.id (UUID) */
  id: string;
  plan: UserPlan;
  level: number;
  xp: number;
  homeRegionId?: string;
  favoriteSpotIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  userId: string;
  fishingTrips: number;
  catchTotal: number;
  fishSpeciesCount: number;
  maxCatch: { fishId: string; sizeCm: number } | null;
  topSpotId: string | null;
}

/* ══════════════════════════════════════════════════
   CATCH LOG — 釣果記録
══════════════════════════════════════════════════ */

export interface CatchLog {
  id: string;           // UUID
  userId: string;
  spotId: string;
  fishId: string;
  sizeCm?: number;
  count: number;
  caughtAt: string;     // ISO 8601 UTC
  method?: string;
  lure?: string;
  tideType?: TideType;
  windSpeedMs?: number;
  windDir?: WindDirection;
  weatherLabel?: string;
  memo?: string;
  photoUrl?: string;
  isPublic: boolean;
  createdAt: string;
  deletedAt?: string;   // soft delete
}

/* ══════════════════════════════════════════════════
   FORECAST — 予報（計算済みキャッシュ）
══════════════════════════════════════════════════ */

export interface WeatherSnapshot {
  label: string;          // "晴れ"
  icon: string;
  tempC: number;
  waveHeightM: number;
  windSpeedMs: number;
  windDir: WindDirection;
  tideType: TideType;
  sunriseTime: string;
  sunsetTime: string;
  /** データソース識別子 */
  source: "computed" | "jma_api" | "openmeteo";
}

export interface DailyForecastRecord {
  id: string;
  spotId: string;
  date: string;           // "2024-06-11"
  goScore: number;        // 0–100
  decisionType: DecisionType;
  safetyLevel: SafetyLevel;
  topFishIds: string[];
  bestWindowStart: string; // "05:00"
  bestWindowEnd: string;   // "07:00"
  captainComment: string;
  weather: WeatherSnapshot;
  generatedAt: string;
  source: "computed" | "api";
}

/* ══════════════════════════════════════════════════
   NOTIFICATION — 通知ルール
══════════════════════════════════════════════════ */

export interface NotificationRule {
  id: string;
  userId: string;
  type: NotificationType;
  spotId?: string;
  fishId?: string;
  /** スコア閾値 (0–100) */
  threshold?: number;
  enabled: boolean;
  channel: NotificationChannel;
  createdAt: string;
}

/* ══════════════════════════════════════════════════
   BOAT YARD — 船宿（将来実装）
══════════════════════════════════════════════════ */

export interface BoatYard {
  id: string;
  regionId: string;
  name: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  targetFishIds: string[];
  priceMin: number;    // 円
  priceMax: number;
  active: boolean;
  premiumPartner: boolean;
  createdAt: string;
}

/* ══════════════════════════════════════════════════
   PLAN FEATURES — プラン定義（有料化設計）
══════════════════════════════════════════════════ */

export interface PlanFeatures {
  plan: UserPlan;
  /** 閲覧できるスポット数 */
  maxSpots: number | "unlimited";
  /** 何日先まで予報を見られるか */
  forecastDays: number;
  /** 釣果記録の上限件数 */
  catchLogLimit: number | "unlimited";
  premiumSpotsAccess: boolean;
  aiChatQuotaPerDay: number | "unlimited";
  notificationsEnabled: boolean;
  analyticsEnabled: boolean;
  exportEnabled: boolean;
}

export const PLAN_FEATURES: Record<UserPlan, PlanFeatures> = {
  free: {
    plan: "free",
    maxSpots: 3,
    forecastDays: 1,
    catchLogLimit: 30,
    premiumSpotsAccess: false,
    aiChatQuotaPerDay: 5,
    notificationsEnabled: false,
    analyticsEnabled: false,
    exportEnabled: false,
  },
  pro: {
    plan: "pro",
    maxSpots: "unlimited",
    forecastDays: 7,
    catchLogLimit: "unlimited",
    premiumSpotsAccess: true,
    aiChatQuotaPerDay: 50,
    notificationsEnabled: true,
    analyticsEnabled: true,
    exportEnabled: false,
  },
  premium: {
    plan: "premium",
    maxSpots: "unlimited",
    forecastDays: 14,
    catchLogLimit: "unlimited",
    premiumSpotsAccess: true,
    aiChatQuotaPerDay: "unlimited",
    notificationsEnabled: true,
    analyticsEnabled: true,
    exportEnabled: true,
  },
};
