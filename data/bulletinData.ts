/**
 * data/bulletinData.ts
 * 湘南釣り速報トップ画面用の静的モックデータ
 *
 * 将来的にAPI・ユーザー投稿・釣果DBに差し替えられるよう
 * オブジェクト配列で管理する。
 */

/* ── エリア速報カード ─────────────────────────────── */

export interface AreaReport {
  id: string;
  spotId: string;       // SHONAN_SPOTS の id にマッピング
  name: string;         // 表示名
  shortName: string;    // 短縮名（ランキング等で使用）
  typeLabel: string;    // "サーフ" / "河口" / "港" / "磯"
  typeIcon: string;
  targetFish: string[];
  /* スコアが高い（≥60）ときのタグとコメント */
  goodTags: string[];
  goodComment: string;
  /* スコアが低い（<50）ときのタグとコメント */
  badTags: string[];
  badComment: string;
  /* 常時表示するタグ */
  alwaysTags: string[];
  /* スコア中間（50〜59）のコメント */
  normalComment: string;
  beginnerOk: boolean;
  safetyNote?: string;
}

export const AREA_REPORTS: AreaReport[] = [
  {
    id: "nishihama",
    spotId: "chigasaki_surf",
    name: "茅ヶ崎西浜",
    shortName: "西浜",
    typeLabel: "サーフ",
    typeIcon: "🏖️",
    targetFish: ["シーバス", "マゴチ", "ヒラメ"],
    alwaysTags: ["サーフ", "離岸流ポイント"],
    goodTags: ["ベイト気配", "朝マズメ強"],
    goodComment:
      "今日の西浜は期待度が高い。ベイトの入りが良く、朝マズメに波打ち際をミノーで丁寧に流せば良いサイズに出会える可能性が高い。",
    badTags: ["波やや高め", "ルアー向き"],
    badComment:
      "今日は波が高め。西浜は無理せず、落ち着いたら河口や港に切り替えも検討したい。",
    normalComment:
      "西浜は離岸流を探しながら広く探ろう。朝マズメの波打ち際に実績が多く、ジグやミノーが効く。",
    beginnerOk: false,
    safetyNote: "波が高い日はサーフ初心者は無理せずに",
  },
  {
    id: "sagami_river",
    spotId: "sagami_river",
    name: "相模川河口",
    shortName: "河口",
    typeLabel: "河口",
    typeIcon: "🌊",
    targetFish: ["シーバス", "マゴチ", "クロダイ"],
    alwaysTags: ["河口", "潮通し良好"],
    goodTags: ["濁り有利", "流れ強い"],
    goodComment:
      "今日の相模川は条件が揃っている。上げ潮のタイミングでバイブレーションやミノーを通せばシーバスが出やすい。濁りが入っている日は特にチャンス。",
    badTags: ["透明度高い", "渋め"],
    badComment:
      "今日は河口の流れが緩い傾向。テトラ周りをスローに誘うか、夕マズメまで待つのが得策。",
    normalComment:
      "河口の流れが出る時間帯がチャンス。上げ潮前後に合わせて動けば、シーバスの反応が得やすい。",
    beginnerOk: false,
  },
  {
    id: "enoshima_ura",
    spotId: "enoshima",
    name: "江ノ島裏磯",
    shortName: "裏磯",
    typeLabel: "磯",
    typeIcon: "🪨",
    targetFish: ["アジ", "メバル", "カサゴ", "クロダイ"],
    alwaysTags: ["根魚", "ライトゲーム"],
    goodTags: ["アジ回遊中", "常夜灯◎"],
    goodComment:
      "今日の裏磯はアジとメバルの期待度が高い。常夜灯周りをライトゲームで狙えば数釣りもできる。",
    badTags: ["東風注意", "波に注意"],
    badComment:
      "東風が強いと裏磯は危険。磯場なので無理せず、状況が悪ければ江ノ島の港内に切り替えを。",
    normalComment:
      "裏磯は根魚の宝庫。夜〜早朝のアジング・メバリングが鉄板。外向きは波と風向きに要注意。",
    beginnerOk: false,
    safetyNote: "磯場のため転倒・波に注意。単独行動は避けること",
  },
  {
    id: "oiso",
    spotId: "oiso",
    name: "大磯サーフ",
    shortName: "大磯",
    typeLabel: "サーフ",
    typeIcon: "🏄",
    targetFish: ["ヒラメ", "シロギス", "マゴチ"],
    alwaysTags: ["サーフ", "キス投げ釣り"],
    goodTags: ["波落ち着き", "穴場感あり"],
    goodComment:
      "今日の大磯は波が落ち着いており好条件。ヒラメとシロギスを狙える。人が少ない分ゆっくり探れる。",
    badTags: ["波高め", "初心者注意"],
    badComment:
      "今日は大磯の波がやや高め。初心者は無理しないこと。ベテランでも足元に注意が必要な日。",
    normalComment:
      "大磯は波が落ち着いたタイミングを狙いたい。シロギスの投げ釣りも楽しく、ヒラメの実績エリアが点在。",
    beginnerOk: false,
  },
  {
    id: "hiratsuka_port",
    spotId: "hiratsuka",
    name: "平塚新港",
    shortName: "平塚港",
    typeLabel: "港",
    typeIcon: "⚓",
    targetFish: ["アジ", "イワシ", "サバ", "カマス"],
    alwaysTags: ["サビキ可", "ファミリー向け"],
    goodTags: ["青物回遊情報", "にぎわい中"],
    goodComment:
      "今日の平塚港は青物回遊の可能性あり。ジグやカゴ仕掛けで中層〜底を探ろう。常連のアジサビキも安定。",
    badTags: ["渋め", "サビキのみ"],
    badComment:
      "今日は港全体的に渋め。サビキでアジを数釣りするのが堅実。数より楽しさ重視で。",
    normalComment:
      "港内でサビキ釣りがメイン。青物の回遊があれば大チャンス。ファミリーや初心者にも安心して楽しめる。",
    beginnerOk: true,
  },
  {
    id: "tsujido",
    spotId: "chigasaki_surf",
    name: "辻堂海岸",
    shortName: "辻堂",
    typeLabel: "サーフ",
    typeIcon: "🌅",
    targetFish: ["ヒラメ", "シロギス", "シーバス"],
    alwaysTags: ["広大サーフ", "穴場"],
    goodTags: ["空いている", "ヒラメ実績"],
    goodComment:
      "今日の辻堂は穴場感たっぷり。人が少ない分じっくり探れる。ヒラメが出やすいタイミングで広く攻めよう。",
    badTags: ["波しぶき注意"],
    badComment:
      "今日は辻堂も波が気になる。安全確認しながら釣行を。状況次第では西浜か河口に移動を検討。",
    normalComment:
      "茅ヶ崎より人が少ない穴場サーフ。広大なフィールドを少人数でゆったり使えるのが魅力。",
    beginnerOk: false,
  },
];

/* ── ローカル速報（モック） ───────────────────────── */

export type ReportType = "hot" | "info" | "caution";

export interface LocalReport {
  id: string;
  timeLabel: string;    // "07:10" / "昨日夕方" など
  spot: string;         // エリア表示名
  message: string;
  type: ReportType;
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
    message: "ソゲ（小ヒラメ）情報あり。30cm前後が複数出ている。",
    type: "info",
  },
  {
    id: "lr4",
    timeLabel: "昨日朝",
    spot: "江ノ島",
    message: "アジ回遊。15〜18cm。常夜灯周りで数釣り可能だった模様。",
    type: "hot",
  },
  {
    id: "lr5",
    timeLabel: "昨日夕方",
    spot: "平塚新港",
    message: "サバ回遊。30cm前後がジグに反応。青物狙いは要チェック。",
    type: "hot",
  },
];

/* ── Pro 機能一覧 ─────────────────────────────────── */

export const PRO_FEATURES = [
  "ポイント別AI予測（精度向上版）",
  "魚種別の勝ち筋レポート",
  "過去釣果との比較分析",
  "1週間先の湘南予報",
  "ローカル速報の詳細と履歴",
  "ヒットルアー・仕掛け分析",
] as const;
