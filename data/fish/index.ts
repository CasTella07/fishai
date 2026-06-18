/**
 * data/fish/index.ts — 魚種マスターデータ
 *
 * lib/types/domain.ts の Fish 型に準拠。
 * ID はスラッグ（英小文字ハイフン）で統一。
 * 将来 Supabase に移行した際も同じ id を使う。
 */

import type { Fish } from "@/lib/types/domain";

export const FISH_MASTER: Fish[] = [
  {
    id: "hirame",
    name: "ヒラメ",
    nameEn: "Olive Flounder",
    emoji: "🐟",
    category: "フラット",
    peakMonths: [10, 11, 12, 1, 2],
    habitatDepth: "底層（砂地）",
    minLegalSizeCm: 30,
    categoryColor: "#f59e0b",
    categoryBg: "rgba(245,158,11,.12)",
    beginnerTip:
      "活きイワシか15cmシンキングミノーを底付近でゆっくりリトリーブ。朝マズメの波打ち際5〜20mが狙い目。",
    description:
      "湘南サーフの最高峰ターゲット。砂浜から狙えるフラットフィッシュの王様。秋冬にかけてイワシの接岸に合わせて浅場に入ってくる。",
  },
  {
    id: "seabass",
    name: "シーバス",
    nameEn: "Japanese Sea Bass",
    emoji: "🐠",
    category: "大物",
    peakMonths: [4, 5, 9, 10, 11],
    habitatDepth: "表層〜中層",
    categoryColor: "#8b5cf6",
    categoryBg: "rgba(139,92,246,.12)",
    beginnerTip:
      "河口や港湾の常夜灯周り、サーフのブレイクラインを中層系ミノーやバイブで探る。ナイトゲームが有利。",
    description:
      "湘南を代表するルアーターゲット。相模川・引地川の河口から湘南港まで幅広く狙える。ランカーサイズ（80cm超）も夢ではない。",
  },
  {
    id: "aji",
    name: "アジ",
    nameEn: "Japanese Jack Mackerel",
    emoji: "🐡",
    category: "回遊魚",
    peakMonths: [5, 6, 7, 8, 9, 10],
    habitatDepth: "中層〜底層",
    categoryColor: "#0ea5e9",
    categoryBg: "rgba(14,165,233,.12)",
    beginnerTip:
      "1.5〜2gのジグヘッドにワームをセットしてアジング。常夜灯の明暗の境を丁寧に探ると反応が出やすい。",
    description:
      "湘南港・大磯港で周年楽しめる人気ターゲット。夏は数釣り、秋になると大型の「尺アジ」が回ってくる。",
  },
  {
    id: "shirogisu",
    name: "シロギス",
    nameEn: "Whiting",
    emoji: "🐟",
    category: "小物",
    peakMonths: [5, 6, 7, 8, 9],
    habitatDepth: "底層（砂地）",
    categoryColor: "#10b981",
    categoryBg: "rgba(16,185,129,.12)",
    beginnerTip:
      "砂浜から投げ釣り。ちょい投げセット（10〜20号のおもり）に青イソメをつけて丁寧に引きずる。あたりはコンコンと明確。",
    description:
      "茅ヶ崎サーフで夏の定番。投げ釣りで狙う人気ターゲット。数釣りができ、天ぷらにすると絶品。",
  },
  {
    id: "kasago",
    name: "カサゴ",
    nameEn: "Marbled Rockfish",
    emoji: "🦈",
    category: "根魚",
    peakMonths: [1, 2, 3, 10, 11, 12],
    habitatDepth: "底層（岩礁）",
    categoryColor: "#ef4444",
    categoryBg: "rgba(239,68,68,.12)",
    beginnerTip:
      "3〜5gジグヘッド+ワームをテトラや岩陰に落とすだけ。穴釣りにも対応し、初心者でも安定して釣れる。",
    description:
      "磯や港の常連。テトラや岩礁に潜む根魚の入門種。年間を通じて狙えるが、冬〜春が特に良型が出やすい。",
  },
  {
    id: "magochi",
    name: "マゴチ",
    nameEn: "Flathead",
    emoji: "🐡",
    category: "フラット",
    peakMonths: [5, 6, 7, 8, 9],
    habitatDepth: "底層（砂地）",
    categoryColor: "#f59e0b",
    categoryBg: "rgba(245,158,11,.12)",
    beginnerTip:
      "ヒラメと同じサーフで狙えるが、より夏が本番。底を這わせるようにジグヘッドリグをスローに引く。日中でも釣れる。",
    description:
      "夏のサーフのターゲット。ヒラメと並ぶフラットフィッシュ2トップ。食味は絶品で、刺身や薄造りが人気。",
  },
  {
    id: "saba",
    name: "サバ",
    nameEn: "Chub Mackerel",
    emoji: "🐟",
    category: "回遊魚",
    peakMonths: [8, 9, 10, 11],
    habitatDepth: "表層〜中層",
    categoryColor: "#0ea5e9",
    categoryBg: "rgba(14,165,233,.12)",
    beginnerTip:
      "サビキ仕掛けで港から狙うか、メタルジグのただ巻きで。回遊があれば爆発的に数が釣れる。鮮度が命なので即絞め。",
    description:
      "秋の湘南港を沸かせる回遊魚。イワシと一緒に接岸することが多く、爆釣も珍しくない。青物入門にも最適。",
  },
  {
    id: "kurodai",
    name: "クロダイ",
    nameEn: "Black Sea Bream",
    emoji: "🐠",
    category: "大物",
    peakMonths: [3, 4, 5, 10, 11],
    habitatDepth: "底層〜中層",
    categoryColor: "#8b5cf6",
    categoryBg: "rgba(139,92,246,.12)",
    beginnerTip:
      "港の護岸際や河口の流れがあたるポイントを狙う。ウキ釣り・ダンゴ釣り・チニングルアーで狙える。引きが強くファイトが楽しい。",
    description:
      "湘南港や河口で狙えるゲームフィッシュ。50cmを超える「年無し」も出る本格ターゲット。ルアーで狙うチニングも人気。",
  },
  {
    id: "inada",
    name: "イナダ",
    nameEn: "Young Yellowtail",
    emoji: "🐟",
    category: "回遊魚",
    peakMonths: [8, 9, 10, 11],
    habitatDepth: "表層",
    categoryColor: "#0ea5e9",
    categoryBg: "rgba(14,165,233,.12)",
    beginnerTip:
      "ナブラ（鳥山）を見つけてキャスト。20〜40gのメタルジグをただ巻きかワンピッチジャークで。ヒットしたらドラグに注意。",
    description:
      "秋の青物シーズンのメインターゲット。ブリの若魚で、30〜50cm前後。ショアから大型青物に挑む入門に最適。",
  },
  {
    id: "tachiuo",
    name: "タチウオ",
    nameEn: "Largehead Hairtail",
    emoji: "🐠",
    category: "回遊魚",
    peakMonths: [9, 10, 11],
    habitatDepth: "中層",
    categoryColor: "#0ea5e9",
    categoryBg: "rgba(14,165,233,.12)",
    beginnerTip:
      "日没後の常夜灯周りをテンヤ仕掛け（ドジョウ付き）でゆっくり巻く。指3〜5本の大型を狙う。歯が鋭いので扱いに注意。",
    description:
      "秋〜冬の夜釣りの主役。銀色に輝く刀のような魚体が特徴。湘南港での夜釣りで人気。塩焼き・ムニエルが絶品。",
  },
];

/** スラッグから魚を引く */
export function getFishById(id: string): Fish | undefined {
  return FISH_MASTER.find((f) => f.id === id);
}

/** 日本語名からスラッグを引く */
export function getFishIdByName(name: string): string | undefined {
  return FISH_MASTER.find((f) => f.name === name)?.id;
}
