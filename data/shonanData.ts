/**
 * data/shonanData.ts — 湘南エリア スポット・魚種 マスターデータ
 *
 * FishAI MVP対応エリア: 湘南限定
 * 対応ポイント: 茅ヶ崎サーフ / 平塚 / 江ノ島 / 相模川河口 / 大磯
 */

/* ─── スポット ─────────────────────────────────── */

export type SpotType = "surf" | "port" | "shore" | "river";

export interface ShonanSpot {
  id: string;
  name: string;
  type: SpotType;
  area: string;
  lat: number;
  lng: number;
  /** 狙える魚種 (優先順) */
  targetFish: string[];
  description: string;
  icon: string;
  /** 難易度 1=初心者〜3=上級者 */
  difficulty: 1 | 2 | 3;
}

export const SHONAN_SPOTS: ShonanSpot[] = [
  {
    id: "chigasaki_surf",
    name: "茅ヶ崎サーフ",
    type: "surf",
    area: "茅ヶ崎",
    lat: 35.3275,
    lng: 139.4058,
    targetFish: ["ヒラメ", "マゴチ", "シロギス", "青物"],
    description: "広大なサーフ。ヒラメ・マゴチのトップポイント。",
    icon: "🏖️",
    difficulty: 2,
  },
  {
    id: "hiratsuka",
    name: "平塚海岸",
    type: "surf",
    area: "平塚",
    lat: 35.3240,
    lng: 139.3481,
    targetFish: ["シロギス", "ヒラメ", "マゴチ", "青物"],
    description: "シロギスの聖地。遠浅サーフで投げ釣り入門にも最適。",
    icon: "🏄",
    difficulty: 1,
  },
  {
    id: "enoshima",
    name: "江ノ島",
    type: "shore",
    area: "藤沢",
    lat: 35.3020,
    lng: 139.4803,
    targetFish: ["カサゴ", "クロダイ", "アジ", "サバ", "シーバス"],
    description: "磯・堤防・港の複合ポイント。魚種の多様さが最大の魅力。",
    icon: "⛩️",
    difficulty: 2,
  },
  {
    id: "sagami_river",
    name: "相模川河口",
    type: "river",
    area: "平塚",
    lat: 35.3260,
    lng: 139.3550,
    targetFish: ["シーバス", "クロダイ", "タチウオ"],
    description: "シーバス・クロダイの超有名ポイント。タチウオも回遊。",
    icon: "🌊",
    difficulty: 2,
  },
  {
    id: "oiso",
    name: "大磯",
    type: "shore",
    area: "大磯",
    lat: 35.3081,
    lng: 139.3122,
    targetFish: ["青物", "アジ", "サバ", "カサゴ"],
    description: "釣り公園も隣接。ファミリーから上級者まで楽しめる万能ポイント。",
    icon: "🎣",
    difficulty: 1,
  },
];

/* ─── 魚種 ─────────────────────────────────────── */

export interface ShonanFish {
  name: string;
  emoji: string;
  category: string;
  catColor: string;   // CSS color
  catBg: string;      // CSS rgba background
  cardTopBg: string;  // CSS gradient for score card top
  /** 釣れる月 1–12 */
  peakMonths: number[];
  sizeRange: string;
  methods: string[];
  bestSpots: string[];
  /** 初心者向けワンポイント */
  beginnerTip: string;
}

export const SHONAN_FISH: ShonanFish[] = [
  {
    name: "ヒラメ",
    emoji: "🐡",
    category: "底物",
    catColor: "#fbbf24",
    catBg: "rgba(251,191,36,.18)",
    cardTopBg: "linear-gradient(145deg,#3d1a00,#0d0600)",
    peakMonths: [10, 11, 12, 1, 2, 3],
    sizeRange: "40–80cm",
    methods: ["ミノー", "泳がせ"],
    bestSpots: ["茅ヶ崎サーフ", "平塚海岸"],
    beginnerTip: "サーフ底付近をゆっくりリトリーブ",
  },
  {
    name: "シーバス",
    emoji: "🐠",
    category: "スズキ系",
    catColor: "#38bdf8",
    catBg: "rgba(56,189,248,.18)",
    cardTopBg: "linear-gradient(145deg,#0b1e2e,#030810)",
    peakMonths: [4, 5, 6, 7, 8, 9, 10],
    sizeRange: "40–90cm",
    methods: ["ミノー", "ワーム"],
    bestSpots: ["相模川河口", "江ノ島"],
    beginnerTip: "河口の流れに乗せて流下させる",
  },
  {
    name: "青物",
    emoji: "🐟",
    category: "青物",
    catColor: "#34d399",
    catBg: "rgba(52,211,153,.18)",
    cardTopBg: "linear-gradient(145deg,#022c1e,#000c07)",
    peakMonths: [6, 7, 8, 9, 10],
    sizeRange: "50–100cm",
    methods: ["メタルジグ", "ポッパー"],
    bestSpots: ["茅ヶ崎サーフ", "大磯"],
    beginnerTip: "ナブラを見つけたらキャスト優先",
  },
  {
    name: "アジ",
    emoji: "🐟",
    category: "回遊魚",
    catColor: "#60a5fa",
    catBg: "rgba(96,165,250,.18)",
    cardTopBg: "linear-gradient(145deg,#0a1f3a,#030a10)",
    peakMonths: [4, 5, 6, 7, 8, 9, 10],
    sizeRange: "20–35cm",
    methods: ["サビキ", "アジング"],
    bestSpots: ["江ノ島", "大磯"],
    beginnerTip: "サビキ仕掛けにアミエビを使う",
  },
  {
    name: "シロギス",
    emoji: "🐟",
    category: "砂底魚",
    catColor: "#e2e8f0",
    catBg: "rgba(226,232,240,.14)",
    cardTopBg: "linear-gradient(145deg,#1a2535,#07090f)",
    peakMonths: [5, 6, 7, 8, 9],
    sizeRange: "15–30cm",
    methods: ["チョイ投げ", "投げ釣り"],
    bestSpots: ["平塚海岸", "茅ヶ崎サーフ"],
    beginnerTip: "投げてゆっくり引き釣りが基本",
  },
  {
    name: "タチウオ",
    emoji: "🐟",
    category: "回遊魚",
    catColor: "#c4b5fd",
    catBg: "rgba(196,181,253,.18)",
    cardTopBg: "linear-gradient(145deg,#1e0d40,#080316)",
    peakMonths: [8, 9, 10, 11],
    sizeRange: "指3–6本",
    methods: ["テンヤ", "ワインド"],
    bestSpots: ["相模川河口", "江ノ島"],
    beginnerTip: "夕マズメ後の暗い時間帯がピーク",
  },
  {
    name: "カサゴ",
    emoji: "🐠",
    category: "根魚",
    catColor: "#a78bfa",
    catBg: "rgba(167,139,250,.18)",
    cardTopBg: "linear-gradient(145deg,#1a1040,#080412)",
    peakMonths: [1, 2, 3, 4, 10, 11, 12],
    sizeRange: "15–30cm",
    methods: ["穴釣り", "ライトゲーム"],
    bestSpots: ["江ノ島", "大磯"],
    beginnerTip: "岩の隙間・穴を狙う穴釣りが有効",
  },
  {
    name: "クロダイ",
    emoji: "🐟",
    category: "堤防魚",
    catColor: "#94a3b8",
    catBg: "rgba(148,163,184,.18)",
    cardTopBg: "linear-gradient(145deg,#141e2b,#05080e)",
    peakMonths: [3, 4, 5, 9, 10, 11],
    sizeRange: "30–60cm",
    methods: ["フカセ", "ヘチ釣り"],
    bestSpots: ["相模川河口", "江ノ島"],
    beginnerTip: "堤防際のヘチを丁寧に探る",
  },
  {
    name: "マゴチ",
    emoji: "🐡",
    category: "底物",
    catColor: "#fbbf24",
    catBg: "rgba(251,191,36,.15)",
    cardTopBg: "linear-gradient(145deg,#2d1500,#0d0500)",
    peakMonths: [5, 6, 7, 8, 9],
    sizeRange: "40–70cm",
    methods: ["ルアー", "泳がせ"],
    bestSpots: ["茅ヶ崎サーフ", "平塚海岸"],
    beginnerTip: "夏のサーフ底層を狙う",
  },
  {
    name: "サバ",
    emoji: "🐟",
    category: "回遊魚",
    catColor: "#60a5fa",
    catBg: "rgba(96,165,250,.15)",
    cardTopBg: "linear-gradient(145deg,#0a1630,#030608)",
    peakMonths: [5, 6, 7, 8, 9, 10],
    sizeRange: "25–50cm",
    methods: ["サビキ", "ジグサビキ"],
    bestSpots: ["江ノ島", "大磯"],
    beginnerTip: "表層から中層をスピーディに探る",
  },
];
