export type ItemCategory = "必須" | "あると便利" | "安全";

export interface ChecklistItem {
  item:     string;
  category: ItemCategory;
  note?:    string;
}

export interface FishingChecklist {
  id:         string;
  type:       string;
  icon:       string;
  color:      string;
  bg:         string;
  targetFish: string[];
  items:      ChecklistItem[];
}

export const CHECKLISTS: FishingChecklist[] = [
  {
    id:   "surf",
    type: "サーフ",
    icon: "🏖️",
    color: "#f59e0b",
    bg:   "rgba(245,158,11,.12)",
    targetFish: ["ヒラメ", "マゴチ", "青物", "シロギス"],
    items: [
      { item: "サーフロッド（9〜11フィート）",        category: "必須" },
      { item: "スピニングリール（3000〜4000番）",      category: "必須" },
      { item: "PEライン（1〜1.5号）",                  category: "必須" },
      { item: "リーダー（フロロ20〜30lb）",            category: "必須" },
      { item: "メタルジグ各種（28〜40g）",             category: "必須" },
      { item: "ジグヘッド＋ワーム（14〜21g）",         category: "必須" },
      { item: "ランディングネット",                    category: "必須" },
      { item: "フィッシュグリップ",                    category: "必須" },
      { item: "クーラーボックス（氷入り）",            category: "必須" },
      { item: "ウェーダー or 長靴",                    category: "あると便利", note: "足元が濡れると寒い" },
      { item: "偏光サングラス",                        category: "あると便利", note: "離岸流の確認に役立つ" },
      { item: "帽子・日焼け止め",                      category: "あると便利" },
      { item: "ライフジャケット",                      category: "安全",       note: "波が高い日は必須" },
    ],
  },
  {
    id:   "sabiki",
    type: "サビキ釣り",
    icon: "🎣",
    color: "#22d3ee",
    bg:   "rgba(34,211,238,.12)",
    targetFish: ["アジ", "サバ", "イワシ"],
    items: [
      { item: "サビキ竿（3〜4m）",                    category: "必須" },
      { item: "リール（スピニング2000番）",            category: "必須" },
      { item: "ナイロンライン（3〜4号）",              category: "必須" },
      { item: "サビキ仕掛けセット（6〜8号）",         category: "必須" },
      { item: "アミエビ（コマセ）",                    category: "必須", note: "現地購入かスーパーで冷凍を" },
      { item: "コマセカゴ",                            category: "必須" },
      { item: "バケツ",                                category: "必須", note: "コマセ混ぜ・魚入れに使う" },
      { item: "クーラーボックス（氷入り）",            category: "必須" },
      { item: "タモ（玉網）",                          category: "あると便利", note: "大型アジが来た時に" },
      { item: "雑巾・手洗い水",                        category: "あると便利", note: "コマセは臭いので必携" },
    ],
  },
  {
    id:   "lure_light",
    type: "ライト五目",
    icon: "🌙",
    color: "#a78bfa",
    bg:   "rgba(167,139,250,.12)",
    targetFish: ["アジ", "メバル", "カサゴ", "セイゴ"],
    items: [
      { item: "ライトゲームロッド（6〜7フィート）",    category: "必須" },
      { item: "リール（スピニング2000番）",            category: "必須" },
      { item: "PEライン（0.3〜0.6号）",               category: "必須" },
      { item: "リーダー（フロロ4〜8lb）",              category: "必須" },
      { item: "ジグヘッド（0.5〜3g各種）",             category: "必須" },
      { item: "アジング用ワーム各種",                  category: "必須" },
      { item: "ヘッドライト",                          category: "必須",       note: "夜釣りに必須" },
      { item: "クーラーボックス",                      category: "必須" },
      { item: "フィッシュグリップ",                    category: "あると便利" },
      { item: "虫除けスプレー",                        category: "あると便利", note: "夏の夜は特に" },
    ],
  },
  {
    id:   "fukase",
    type: "フカセ釣り",
    icon: "🪝",
    color: "#06b6d4",
    bg:   "rgba(6,182,212,.12)",
    targetFish: ["クロダイ", "メジナ"],
    items: [
      { item: "磯竿（1〜1.5号 5.3m）",               category: "必須" },
      { item: "スピニングリール（3000番）",            category: "必須" },
      { item: "道糸（ナイロン2〜3号）",               category: "必須" },
      { item: "ハリス（フロロ1.5〜2号）",              category: "必須" },
      { item: "チヌ針（3〜5号）",                     category: "必須" },
      { item: "ウキ（00〜0号）",                      category: "必須" },
      { item: "オキアミ（エサ）",                     category: "必須" },
      { item: "配合エサ（集魚剤）",                   category: "必須" },
      { item: "コマセバッカン",                       category: "必須" },
      { item: "ヒシャク（エサ撒き用）",               category: "必須" },
      { item: "タモ（60cm以上）",                     category: "必須" },
      { item: "磯靴（スパイク付き）",                 category: "安全",       note: "磯での転倒防止に必須" },
      { item: "ライフジャケット",                      category: "安全" },
    ],
  },
  {
    id:   "nage",
    type: "投げ釣り",
    icon: "🎯",
    color: "#10b981",
    bg:   "rgba(16,185,129,.12)",
    targetFish: ["シロギス", "カレイ", "ハゼ"],
    items: [
      { item: "投げ竿（4〜4.5m）",                    category: "必須" },
      { item: "スピニングリール（大型）",              category: "必須" },
      { item: "ナイロンライン（3〜4号）",              category: "必須" },
      { item: "天秤（L型15〜20cm）",                  category: "必須" },
      { item: "おもり（20〜30号）",                   category: "必須" },
      { item: "キス仕掛け（針5〜7号）",               category: "必須" },
      { item: "エサ（イシゴカイ/ジャリメ）",          category: "必須" },
      { item: "竿立て（砂浜用）",                      category: "あると便利" },
      { item: "エサ箱（クーラー付き）",               category: "あると便利" },
      { item: "クーラーボックス",                      category: "必須" },
    ],
  },
  {
    id:   "seabass",
    type: "シーバス",
    icon: "🌊",
    color: "#38bdf8",
    bg:   "rgba(56,189,248,.12)",
    targetFish: ["シーバス", "ヒラメ"],
    items: [
      { item: "シーバスロッド（9〜10フィート）",      category: "必須" },
      { item: "スピニングリール（3000〜4000番）",      category: "必須" },
      { item: "PEライン（1〜1.5号）",                  category: "必須" },
      { item: "リーダー（フロロ20〜30lb）",            category: "必須" },
      { item: "シンキングペンシル各種",               category: "必須" },
      { item: "バイブレーション各種",                 category: "必須" },
      { item: "フィッシュグリップ",                   category: "必須",       note: "歯が鋭い" },
      { item: "ヘッドライト",                         category: "必須",       note: "夜釣りメイン" },
      { item: "ライフジャケット",                      category: "安全" },
      { item: "クーラーボックス",                      category: "必須" },
    ],
  },
];

export const CATEGORY_COLOR: Record<ItemCategory, string> = {
  "必須":       "#ef4444",
  "あると便利": "#f59e0b",
  "安全":       "#10b981",
};

export const CATEGORY_BG: Record<ItemCategory, string> = {
  "必須":       "rgba(239,68,68,.15)",
  "あると便利": "rgba(245,158,11,.15)",
  "安全":       "rgba(16,185,129,.15)",
};

export function getChecklistById(id: string): FishingChecklist | undefined {
  return CHECKLISTS.find((c) => c.id === id);
}
