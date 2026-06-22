/**
 * data/shonanConditions.ts
 * 湘南釣り判断AIトップ画面用の根拠データ
 * 後から外部APIや投稿データに差し替えやすい構造
 */

/* ── 根拠パネル ─────────────────────────────────── */
export interface ConditionItem {
  key:   string;
  icon:  string;
  label: string;
  value: string;
  note:  string;
  /** "good" | "ok" | "caution" | "danger" */
  level: "good" | "ok" | "caution" | "danger";
}

/** 実データから生成される。仮データはshonanForecastで使うので、
 *  ここは型定義のみ。実際のデータはpage.tsxでDailyForecastから組み立てる。
 *  ただし水色・ベイト気配はモック。 */
export interface MockCondition {
  waterColor: {
    label: string;  // "やや濁り" / "クリア" / "激濁り"
    level: "good" | "ok" | "caution" | "danger";
    note:  string;
  };
  bait: {
    label: string;  // "気配あり" / "確認なし" / "回遊中"
    level: "good" | "ok" | "caution" | "danger";
    note:  string;
  };
}

/* ── エリアランキング用根拠テキスト ──────────────── */
export interface AreaRankingReason {
  spotId:   string;
  reasons:  string[];  // 最大3つ程度。"下げ始め" "濁り" "ベイト" など
  caution?: string;    // "波高め" / "単独禁止" など
}

export const AREA_RANKING_REASONS: AreaRankingReason[] = [
  {
    spotId: "sagami_river",
    reasons: ["下げ始め", "濁り有利", "ベイト"],
    caution: undefined,
  },
  {
    spotId: "chigasaki_surf",
    reasons: ["夕まずめ", "波安定", "離岸流"],
    caution: undefined,
  },
  {
    spotId: "enoshima",
    reasons: ["常夜灯", "根魚", "アジ回遊"],
    caution: "磯場注意",
  },
  {
    spotId: "hiratsuka",
    reasons: ["サビキ可", "ファミリー向け", "青物"],
    caution: undefined,
  },
  {
    spotId: "oiso",
    reasons: ["ヒラメ実績", "穴場感"],
    caution: "波高め注意",
  },
];

/* ── エリア速報カード用詳細条件 ──────────────────── */
export interface AreaConditionDetail {
  spotId:       string;
  condTags:     string[];  // 条件根拠タグ。"下げ潮" "濁り" "ベイト気配" など
  targetFish:   string[];
  aiComment:    string;
}

export const AREA_CONDITION_DETAILS: AreaConditionDetail[] = [
  {
    spotId: "chigasaki_surf",
    condTags: ["離岸流ポイント", "朝まずめ強"],
    targetFish: ["シーバス", "マゴチ", "ヒラメ"],
    aiComment: "波打ち際の離岸流を見つけてミノーを丁寧に流すのが定石。今日は波が安定しているサーフ狙い日和。",
  },
  {
    spotId: "sagami_river",
    condTags: ["下げ潮", "濁り有利", "流れ強い"],
    targetFish: ["シーバス", "マゴチ", "クロダイ"],
    aiComment: "上げ潮から下げに変わるタイミングが勝負。濁りが入る日はシーバスの活性が上がりやすい。",
  },
  {
    spotId: "enoshima",
    condTags: ["根魚", "ライトゲーム", "常夜灯"],
    targetFish: ["アジ", "メバル", "カサゴ"],
    aiComment: "裏磯は根魚の宝庫。夜〜早朝のアジング・メバリングが鉄板。外向きは波と風向きに要注意。",
  },
  {
    spotId: "oiso",
    condTags: ["ヒラメ実績", "穴場"],
    targetFish: ["ヒラメ", "シロギス", "マゴチ"],
    aiComment: "茅ヶ崎より人が少ない穴場サーフ。ヒラメの実績エリアが点在。波が落ち着いている日を狙いたい。",
  },
  {
    spotId: "hiratsuka",
    condTags: ["サビキ可", "ファミリー向け", "青物"],
    targetFish: ["アジ", "イワシ", "サバ"],
    aiComment: "港内でサビキ釣りがメイン。青物の回遊があれば大チャンス。初心者にも安心して楽しめる。",
  },
];

/* ── ローカル速報（モック → 後からDB差し替え）── */
export interface LocalReport {
  id:        string;
  timeLabel: string;
  spot:      string;
  message:   string;
  type:      "hot" | "info" | "caution";
}

export const LOCAL_REPORTS: LocalReport[] = [
  {
    id: "lr1",
    timeLabel: "07:10",
    spot: "茅ヶ崎西浜",
    message: "ベイトの気配あり。水面がざわついている。",
    type: "hot",
  },
  {
    id: "lr2",
    timeLabel: "06:40",
    spot: "相模川河口",
    message: "水色やや濁り。シーバスに有利なコンディション。",
    type: "info",
  },
  {
    id: "lr3",
    timeLabel: "昨日夕方",
    spot: "大磯サーフ",
    message: "ソゲ（小ヒラメ）30cm前後が複数出ている。",
    type: "info",
  },
  {
    id: "lr4",
    timeLabel: "昨日朝",
    spot: "江ノ島",
    message: "アジ15〜18cm。常夜灯周りで数釣り可能だった模様。",
    type: "hot",
  },
  {
    id: "lr5",
    timeLabel: "昨日夕方",
    spot: "平塚新港",
    message: "サバ30cm前後がジグに反応。青物狙いは要チェック。",
    type: "hot",
  },
];

/* ── Pro機能一覧 ──────────────────────────────────── */
export const PRO_FEATURES = [
  "ポイント別AI予測（精度向上版）",
  "魚種別の勝ち筋レポート",
  "過去釣果との比較分析",
  "1週間先の湘南予報",
  "ローカル速報の詳細と履歴",
  "ヒットルアー・仕掛け分析",
] as const;
