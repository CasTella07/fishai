/**
 * data/mockCatchData.ts
 * 昨日の釣果・精度統計・ユーザープロフィールのモックデータ
 * 後でAPI/DBに差し替えやすい構造にしている
 */

/* ── 釣果レポート ──────────────────────────────── */

export interface CatchReport {
  id: string;
  fishName: string;
  fishEmoji: string;
  spotName: string;
  sizeCm: number;
  timeLabel: string;   // "6:20"
  method: string;
}

export interface TopFishCount {
  name: string;
  emoji: string;
  count: number;
}

export const YESTERDAY_CATCHES: CatchReport[] = [
  { id: "y1", fishName: "ヒラメ",   fishEmoji: "🐟", spotName: "茅ヶ崎サーフ", sizeCm: 58, timeLabel: "6:20",  method: "メタルジグ" },
  { id: "y2", fishName: "シーバス", fishEmoji: "🐠", spotName: "相模川河口",   sizeCm: 72, timeLabel: "5:45",  method: "バイブレーション" },
  { id: "y3", fishName: "アジ",     fishEmoji: "🐡", spotName: "江ノ島",       sizeCm: 26, timeLabel: "17:30", method: "アジング" },
  { id: "y4", fishName: "シロギス", fishEmoji: "🐟", spotName: "平塚海岸",     sizeCm: 19, timeLabel: "9:15",  method: "投げ釣り" },
];

export const YESTERDAY_TOP_FISH: TopFishCount[] = [
  { name: "アジ",    emoji: "🐡", count: 24 },
  { name: "シーバス", emoji: "🐠", count: 11 },
  { name: "ヒラメ",   emoji: "🐟", count: 6  },
  { name: "シロギス", emoji: "🐟", count: 6  },
];

export const YESTERDAY_TOTAL = 47;

/* ── 精度統計 ──────────────────────────────────── */

export const ACCURACY_RATE = 81; // 過去30日の予測精度 (%)

/* ── 釣れている魚リスト（図鑑ロック解除に使用）── */

export const CAUGHT_FISH_NAMES = [
  "ヒラメ", "シーバス", "アジ", "シロギス",
  "カサゴ", "マゴチ", "サバ", "クロダイ",
];

/* ── ユーザープロフィール（マイページ）────────── */

export interface UserMission {
  id: string;
  text: string;
  icon: string;
  xp: number;
  progress: number;
  total: number;
  done: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  earned: boolean;
}

export interface UserTitle {
  name: string;
  icon: string;
  minLevel: number;
  color: string;
}

export const USER_PROFILE = {
  name: "アングラー",
  level: 7,
  xp: 2340,
  nextLevelXp: 3000,
  currentTitle: "湘南アングラー",
  currentTitleColor: "#0ea5e9",
  currentTitleIcon: "🌊",
  fishingTrips: 23,
  fishSpeciesCount: 8,
  maxFishCm: 68,
  maxFishName: "ヒラメ",
  catchTotal: 156,
  favoriteSpot: "茅ヶ崎サーフ",
};

export const USER_TITLES: UserTitle[] = [
  { name: "見習い",           icon: "🎣", minLevel: 1,   color: "#64748b" },
  { name: "湘南アングラー",   icon: "🌊", minLevel: 5,   color: "#0ea5e9" },
  { name: "サーフハンター",   icon: "🏄", minLevel: 10,  color: "#06b6d4" },
  { name: "ライト五目キング", icon: "👑", minLevel: 20,  color: "#f59e0b" },
  { name: "ヒラメマスター",   icon: "🎯", minLevel: 30,  color: "#10b981" },
  { name: "船長",             icon: "⚓", minLevel: 50,  color: "#a78bfa" },
  { name: "レジェンド",       icon: "🌟", minLevel: 100, color: "#f59e0b" },
];

export const USER_MISSIONS: UserMission[] = [
  { id: "m1", text: "今週ヒラメを1匹釣る",        icon: "🎯", xp: 100, progress: 0, total: 1, done: false },
  { id: "m2", text: "新しいポイントで釣果登録",   icon: "📍", xp: 50,  progress: 0, total: 1, done: false },
  { id: "m3", text: "3魚種を記録する",             icon: "🐟", xp: 80,  progress: 2, total: 3, done: false },
  { id: "m4", text: "朝まずめに釣果登録する",     icon: "🌅", xp: 60,  progress: 1, total: 1, done: true  },
  { id: "m5", text: "釣った魚のレシピを1つ見る",  icon: "🍽️", xp: 30,  progress: 1, total: 1, done: true  },
];

export const USER_BADGES: UserBadge[] = [
  { id: "b1", name: "初釣り",   icon: "🎣", desc: "初回釣果記録",        earned: true  },
  { id: "b2", name: "早起き",   icon: "🌅", desc: "朝まずめに釣果登録",  earned: true  },
  { id: "b3", name: "多魚種",   icon: "🐟", desc: "5魚種以上記録",       earned: true  },
  { id: "b4", name: "グルメ",   icon: "🍽️", desc: "レシピを5つ閲覧",    earned: true  },
  { id: "b5", name: "大物師",   icon: "📏", desc: "60cm以上を記録",      earned: false },
  { id: "b6", name: "連続釣行", icon: "📅", desc: "3週連続で釣果記録",   earned: false },
  { id: "b7", name: "嵐の漁師", icon: "⛈️", desc: "悪天候でも釣果記録", earned: false },
  { id: "b8", name: "師匠",     icon: "🏆", desc: "全魚種を記録",        earned: false },
];
