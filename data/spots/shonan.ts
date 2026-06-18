/**
 * data/spots/shonan.ts — 湘南エリア スポット詳細データ
 *
 * lib/types/domain.ts の Spot 型に準拠。
 * 各フィールドは実際の釣りガイド・現地取材情報に基づく。
 * DB 移行後もここが「初期シード」として機能する。
 */

import type { Spot } from "@/lib/types/domain";

export const SHONAN_SPOTS: Spot[] = [
  /* ──────────────────────────────────
     1. 茅ヶ崎海岸（サーフ）
  ────────────────────────────────── */
  {
    id: "chigasaki-surf",
    regionId: "shonan",
    name: "茅ヶ崎海岸",
    nameKana: "ちがさきかいがん",
    type: "surf",
    icon: "🏖️",
    lat: 35.322,
    lng: 139.407,
    address: "神奈川県茅ヶ崎市中海岸",

    access: "JR茅ヶ崎駅から徒歩15分 / 駐車場あり",
    parking: {
      available: true,
      type: "paid",
      capacity: 200,
      cost: "500〜700円/日（季節変動あり）",
      hours: "7:00〜21:00（夏季延長）",
      notes: "烏帽子岩周辺の市営駐車場が便利。夏は混雑するため早朝着を推奨。",
      lat: 35.3226,
      lng: 139.4072,
    },
    toilet: {
      type: "year_round",
      notes: "海岸沿いの公衆トイレ複数あり（烏帽子岩前・西浜）",
    },
    foothold: "sandy_beach",

    beginnerFriendly: true,
    beginnerNote:
      "広大な砂浜で足場が安定しており、初心者でも安心。投げ釣りやサーフフィッシングの入門に最適。",
    crowdLevel: "high",

    windConditions: {
      bestDirs: ["NW", "W", "SW"],
      worstDirs: ["S", "SE", "E"],
      maxSafeSpeedMs: 8,
      notes:
        "南〜南東の強風（南風）は波が立ちすぎて釣りにならない。西〜北西の風は追い風になりキャストが伸びる。",
    },
    tideConditions: {
      bestTypes: ["大潮", "中潮"],
      worstTypes: ["小潮"],
      bestPhase: "incoming",
      notes:
        "上げ潮のタイミングで魚がサーフに入ってくる。大潮の朝マズメが最もスコアが高い。",
    },
    bestHours: [
      { start: "05:00", end: "07:30", label: "朝マズメ", quality: "excellent" },
      { start: "17:00", end: "19:00", label: "夕マズメ", quality: "good" },
    ],

    fishProfiles: [
      {
        fishId: "hirame",
        peakMonths: [10, 11, 12, 1, 2],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["サーフルアー", "泳がせ釣り"],
        avgSizeCm: { min: 35, max: 70 },
        notes:
          "イワシが接岸する11〜1月が最盛期。波打ち際から20m前後のブレイクを重点的に探る。",
      },
      {
        fishId: "magochi",
        peakMonths: [5, 6, 7, 8, 9],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["ジグヘッドリグ", "スピンテール"],
        avgSizeCm: { min: 30, max: 60 },
        notes: "夏のサーフのメインターゲット。日中でもボトムをしっかり探れば釣れる。",
      },
      {
        fishId: "shirogisu",
        peakMonths: [5, 6, 7, 8, 9],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["投げ釣り", "ちょい投げ"],
        avgSizeCm: { min: 15, max: 28 },
        notes: "サーフ全域で狙える。30〜50m投げれば十分。数釣りを楽しめる。",
      },
      {
        fishId: "inada",
        peakMonths: [8, 9, 10, 11],
        bestTideTypes: ["大潮"],
        bestTidePhase: "incoming",
        techniques: ["メタルジグ", "ミノー"],
        avgSizeCm: { min: 30, max: 50 },
        notes: "秋に鳥山が出ればチャンス。30〜40gのメタルジグを遠投。",
      },
    ],

    safetyNotes: [
      "離岸流（カレント）に注意。流されたら岸に平行に泳ぐ。",
      "台風・低気圧通過後は波が高く危険。天気予報を必ず確認。",
      "烏帽子岩周辺は岩が出ているため夜間は特に注意。",
    ],
    generalNotes: [
      "湘南サーフのシンボル・烏帽子岩が目印。",
      "フラットフィッシュのメッカとして関東中からアングラーが集まる。",
      "夏は海水浴客で昼間は釣りが難しいため早朝推奨。",
    ],
    nearbyShops: [
      "フィッシャーマンズマート茅ヶ崎店（駅近）",
      "上州屋 茅ヶ崎店",
    ],

    active: true,
    premiumOnly: false,
    sortOrder: 1,
  },

  /* ──────────────────────────────────
     2. 湘南港（湘南ベルマーレ前港）
  ────────────────────────────────── */
  {
    id: "shonan-port",
    regionId: "shonan",
    name: "湘南港",
    nameKana: "しょうなんこう",
    type: "port",
    icon: "⚓",
    lat: 35.3037,
    lng: 139.4776,
    address: "神奈川県藤沢市片瀬海岸2丁目",

    access: "小田急片瀬江ノ島駅から徒歩10分 / 江ノ島電鉄 江ノ島駅から徒歩12分",
    parking: {
      available: true,
      type: "paid",
      capacity: 150,
      cost: "300円/時間（上限1500円）",
      hours: "24時間",
      notes: "新江ノ島水族館周辺の有料駐車場。夏は満車になるため早着を。",
      lat: 35.3038,
      lng: 139.4783,
    },
    toilet: {
      type: "year_round",
      notes: "港内・水族館周辺に公衆トイレあり",
    },
    foothold: "concrete_pier",

    beginnerFriendly: true,
    beginnerNote:
      "護岸・堤防からの釣りで足場が安定。サビキ釣りのファミリーにも人気。アジ・サバが手軽に釣れる。",
    crowdLevel: "very_high",

    windConditions: {
      bestDirs: ["NW", "N", "W"],
      worstDirs: ["SE", "E"],
      maxSafeSpeedMs: 10,
      notes:
        "港内のため比較的風の影響を受けにくい。ただし南東の強風時は波が入り込んで危険なことがある。",
    },
    tideConditions: {
      bestTypes: ["大潮", "中潮"],
      bestPhase: "both",
      notes:
        "潮の動きが活発な大潮・中潮は特に回遊魚の動きが活発。潮が動いている時間帯（満潮前後2時間）を狙う。",
    },
    bestHours: [
      { start: "05:30", end: "07:30", label: "朝マズメ", quality: "excellent" },
      { start: "20:00", end: "22:00", label: "常夜灯ナイト", quality: "excellent" },
      { start: "17:30", end: "19:30", label: "夕マズメ", quality: "good" },
    ],

    fishProfiles: [
      {
        fishId: "aji",
        peakMonths: [5, 6, 7, 8, 9, 10],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["アジング", "サビキ釣り"],
        avgSizeCm: { min: 15, max: 35 },
        notes:
          "常夜灯周りのアジングが定番。秋は尺アジが回る。サビキならファミリーでも数釣り可能。",
      },
      {
        fishId: "seabass",
        peakMonths: [4, 5, 9, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["ミノー", "バイブレーション", "シンペン"],
        avgSizeCm: { min: 40, max: 80 },
        notes: "河口部・港の明暗の境を攻める。秋のナイトゲームで大型が出やすい。",
      },
      {
        fishId: "kurodai",
        peakMonths: [3, 4, 5, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["チニング", "ウキ釣り"],
        avgSizeCm: { min: 30, max: 50 },
        notes: "護岸際のボトムを丁寧に探る。バイブやクローワームで狙うチニングが人気。",
      },
      {
        fishId: "saba",
        peakMonths: [8, 9, 10, 11],
        bestTideTypes: ["大潮"],
        bestTidePhase: "incoming",
        techniques: ["メタルジグ", "サビキ"],
        avgSizeCm: { min: 25, max: 45 },
        notes: "秋に大群が回遊してくる。サビキ+カゴでイモ洗い状態になることも。",
      },
      {
        fishId: "tachiuo",
        peakMonths: [9, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "outgoing",
        techniques: ["テンヤ釣り", "ルアー"],
        avgSizeCm: { min: 60, max: 110 },
        notes: "日没後の常夜灯周りを電気ウキ+テンヤで攻める。指4〜5本の良型が出る。",
      },
    ],

    safetyNotes: [
      "夜間は暗い場所が多い。ヘッドライト必携。",
      "混雑時は投げ釣り禁止エリアあり。ルールを守る。",
      "台風・大雨後は流れが強くなるため要注意。",
    ],
    generalNotes: [
      "江ノ島のシンボル的釣り場。年間を通じて多くのアングラーが集まる。",
      "駐車場・トイレ完備で家族連れにも人気。",
      "近くに釣具店・コンビニ多数あり、手ぶらでも対応可能。",
    ],
    nearbyShops: [
      "上州屋 藤沢店",
      "タックルベリー 藤沢店",
      "江ノ島マリーナ売店（エサ購入可）",
    ],

    active: true,
    premiumOnly: false,
    sortOrder: 2,
  },

  /* ──────────────────────────────────
     3. 大磯港
  ────────────────────────────────── */
  {
    id: "oiso-port",
    regionId: "shonan",
    name: "大磯港",
    nameKana: "おおいそこう",
    type: "port",
    icon: "⛵",
    lat: 35.3068,
    lng: 139.3128,
    address: "神奈川県中郡大磯町大磯",

    access: "JR大磯駅から徒歩15分",
    parking: {
      available: true,
      type: "free",
      capacity: 50,
      cost: "無料",
      hours: "6:00〜21:00",
      notes: "港内の無料駐車場（台数限定）。早朝は釣り人で満車になることあり。",
      lat: 35.3072,
      lng: 139.3131,
    },
    toilet: {
      type: "year_round",
      notes: "港内にトイレあり",
    },
    foothold: "concrete_pier",

    beginnerFriendly: true,
    beginnerNote:
      "小さな港で全体が見渡せる。サビキ・ちょい投げで手軽に楽しめる。地元の釣り師も多く情報交換しやすい。",
    crowdLevel: "medium",

    windConditions: {
      bestDirs: ["NW", "N", "W"],
      worstDirs: ["SE", "E", "S"],
      maxSafeSpeedMs: 10,
      notes:
        "西側の防波堤が南〜南東の風を遮る形なので湘南港より風裏になりやすい。",
    },
    tideConditions: {
      bestTypes: ["大潮", "中潮"],
      bestPhase: "incoming",
      notes: "上げ潮でアジ・サバが港内に入ってくる。大潮の夕マズメが特に実績高い。",
    },
    bestHours: [
      { start: "05:00", end: "07:00", label: "朝マズメ", quality: "excellent" },
      { start: "17:30", end: "20:00", label: "夕〜常夜灯", quality: "excellent" },
    ],

    fishProfiles: [
      {
        fishId: "aji",
        peakMonths: [5, 6, 7, 8, 9, 10],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["アジング", "サビキ釣り"],
        avgSizeCm: { min: 15, max: 35 },
        notes:
          "湘南エリアでアジが最も釣れると言われる港のひとつ。常夜灯の明暗攻めが効果的。",
      },
      {
        fishId: "kasago",
        peakMonths: [1, 2, 3, 10, 11, 12],
        bestTideTypes: ["大潮", "中潮", "小潮"],
        bestTidePhase: "both",
        techniques: ["穴釣り", "ジグヘッド"],
        avgSizeCm: { min: 15, max: 30 },
        notes:
          "テトラや岩の隙間を狙う穴釣りが定番。冬は特に良型が出る。ガシリングも楽しい。",
      },
      {
        fishId: "kurodai",
        peakMonths: [3, 4, 5, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["ウキ釣り", "ダンゴ釣り"],
        avgSizeCm: { min: 25, max: 45 },
        notes: "港内の護岸際を流れに合わせてウキで探る。",
      },
      {
        fishId: "shirogisu",
        peakMonths: [5, 6, 7, 8, 9],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["投げ釣り", "ちょい投げ"],
        avgSizeCm: { min: 15, max: 25 },
        notes: "港から外洋向けに軽く投げるだけでも釣れる。",
      },
    ],

    safetyNotes: [
      "外側の防波堤は波をかぶることがある。立入禁止区域を守る。",
      "夜間は港内が暗いためライト必携。",
    ],
    generalNotes: [
      "湘南でも比較的空いている穴場的存在。",
      "駐車場が無料なのでコストパフォーマンスが高い。",
      "周辺に大磯ロングビーチなどの観光施設あり。",
    ],
    nearbyShops: [
      "大磯港近くの釣具店（エサ購入可）",
      "コンビニ（港から徒歩5分）",
    ],

    active: true,
    premiumOnly: false,
    sortOrder: 3,
  },

  /* ──────────────────────────────────
     4. 平塚海岸（サーフ）
  ────────────────────────────────── */
  {
    id: "hiratsuka-surf",
    regionId: "shonan",
    name: "平塚海岸",
    nameKana: "ひらつかかいがん",
    type: "surf",
    icon: "🌊",
    lat: 35.3221,
    lng: 139.346,
    address: "神奈川県平塚市千石河岸",

    access: "JR平塚駅からバス15分「千石河岸」下車 / 車なら湘南海岸公園そば",
    parking: {
      available: true,
      type: "paid",
      cost: "300〜500円/日",
      hours: "6:00〜21:00",
      notes: "湘南海岸公園駐車場を利用。平塚市総合公園駐車場も近い。",
      lat: 35.3219,
      lng: 139.3463,
    },
    toilet: {
      type: "year_round",
      notes: "湘南海岸公園内にトイレあり",
    },
    foothold: "sandy_beach",

    beginnerFriendly: true,
    beginnerNote:
      "茅ヶ崎より人が少なく釣りやすい。ヒラメ・マゴチを狙う本格サーファーも多いが、シロギスの投げ釣りなら初心者でも楽しめる。",
    crowdLevel: "medium",

    windConditions: {
      bestDirs: ["NW", "W"],
      worstDirs: ["S", "SE"],
      maxSafeSpeedMs: 8,
      notes:
        "相模湾に正面を向いたサーフ。南風が入ると波が荒れやすい。西風は向かい風だが波は落ち着く。",
    },
    tideConditions: {
      bestTypes: ["大潮", "中潮"],
      bestPhase: "incoming",
      notes:
        "相模川の影響で濁りが入りやすい。大雨後は釣果が落ちる傾向あり。",
    },
    bestHours: [
      { start: "05:00", end: "07:30", label: "朝マズメ", quality: "excellent" },
      { start: "16:30", end: "18:30", label: "夕マズメ", quality: "good" },
    ],

    fishProfiles: [
      {
        fishId: "hirame",
        peakMonths: [10, 11, 12, 1, 2],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["サーフルアー", "ミノー"],
        avgSizeCm: { min: 35, max: 65 },
        notes:
          "相模川河口に近く、ベイトが集まりやすい。河口北側を重点的に攻める。",
      },
      {
        fishId: "magochi",
        peakMonths: [5, 6, 7, 8, 9],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["ジグヘッドリグ"],
        avgSizeCm: { min: 30, max: 55 },
        notes: "夏の定番。相模川から流れ込む栄養が魚を集める。",
      },
      {
        fishId: "shirogisu",
        peakMonths: [5, 6, 7, 8],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["投げ釣り", "ちょい投げ"],
        avgSizeCm: { min: 15, max: 25 },
        notes: "サーフ全域で手軽に楽しめる。家族釣行にも最適。",
      },
      {
        fishId: "seabass",
        peakMonths: [4, 5, 9, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["ミノー", "シンペン"],
        avgSizeCm: { min: 45, max: 85 },
        notes: "相模川河口付近はシーバスの一級ポイント。河口から100m以内を攻める。",
      },
    ],

    safetyNotes: [
      "相模川の影響で河口付近は流れが複雑。泳ぎが得意でない方は注意。",
      "夏は離岸流が発生しやすい。赤白のポールがある場所は危険。",
    ],
    generalNotes: [
      "茅ヶ崎サーフより空いていて穴場的存在。",
      "相模川河口周辺はシーバス・ヒラメの一級ポイント。",
      "全長4km以上の広大なサーフで足場を選べる。",
    ],
    nearbyShops: [
      "上州屋 平塚店",
      "フィッシング平塚",
    ],

    active: true,
    premiumOnly: false,
    sortOrder: 4,
  },

  /* ──────────────────────────────────
     5. 腰越漁港
  ────────────────────────────────── */
  {
    id: "koshigoe-port",
    regionId: "shonan",
    name: "腰越漁港",
    nameKana: "こしごえぎょこう",
    type: "port",
    icon: "🎣",
    lat: 35.3011,
    lng: 139.4904,
    address: "神奈川県鎌倉市腰越2丁目",

    access: "江ノ電「腰越駅」から徒歩3分",
    parking: {
      available: true,
      type: "paid",
      cost: "500円/日",
      hours: "6:00〜20:00",
      notes: "漁港前の有料駐車場（数台のみ）。混雑時は近くのコインパーキング利用。",
      lat: 35.3012,
      lng: 139.4907,
    },
    toilet: {
      type: "nearby",
      notes: "漁港内にトイレなし。近隣のコンビニまたは腰越海水浴場のトイレを利用。",
    },
    foothold: "mixed",

    beginnerFriendly: false,
    beginnerNote:
      "小さな漁港で混雑しやすい。地元ルールや漁業者への配慮が必要。経験者の同行を推奨。",
    crowdLevel: "high",

    windConditions: {
      bestDirs: ["N", "NW", "W"],
      worstDirs: ["E", "SE"],
      maxSafeSpeedMs: 10,
      notes: "江ノ島の影に入るため、南〜南西の風は比較的影響が少ない。東風は吹き込んで波が立つ。",
    },
    tideConditions: {
      bestTypes: ["大潮", "中潮"],
      bestPhase: "incoming",
      notes:
        "小動岬沖の潮流が複雑。満潮前後2時間がベスト。引き潮は港内が浅くなる。",
    },
    bestHours: [
      { start: "05:00", end: "07:30", label: "朝マズメ", quality: "excellent" },
      { start: "19:00", end: "21:00", label: "常夜灯ナイト", quality: "good" },
    ],

    fishProfiles: [
      {
        fishId: "kasago",
        peakMonths: [1, 2, 3, 10, 11, 12],
        bestTideTypes: ["大潮", "中潮", "小潮"],
        bestTidePhase: "both",
        techniques: ["穴釣り", "ロックフィッシュ"],
        avgSizeCm: { min: 15, max: 28 },
        notes: "テトラ・岩礁帯が豊富で根魚天国。ガシリングが楽しい。",
      },
      {
        fishId: "kurodai",
        peakMonths: [3, 4, 5, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["チニング", "フカセ釣り"],
        avgSizeCm: { min: 30, max: 50 },
        notes:
          "フカセ釣りの好ポイント。クロダイ狙いの常連が多い。年無し(50cm超)の実績あり。",
      },
      {
        fishId: "aji",
        peakMonths: [5, 6, 7, 8, 9, 10],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "both",
        techniques: ["アジング", "サビキ釣り"],
        avgSizeCm: { min: 15, max: 30 },
        notes: "夜の常夜灯周りでのアジングが人気。数釣りを楽しめる。",
      },
      {
        fishId: "seabass",
        peakMonths: [4, 5, 9, 10, 11],
        bestTideTypes: ["大潮", "中潮"],
        bestTidePhase: "incoming",
        techniques: ["ミノー", "バイブレーション"],
        avgSizeCm: { min: 40, max: 75 },
        notes: "漁港の出入口付近がポイント。秋の夜間に大型が出ることも。",
      },
    ],

    safetyNotes: [
      "漁業者の作業を妨げない。出港時間帯（早朝4〜6時）は立ち入り禁止エリアあり。",
      "テトラ帯は滑りやすい。スパイクシューズ推奨。",
      "小型港のため定員に注意。満員状態での釣りは事故リスクが高い。",
    ],
    generalNotes: [
      "鎌倉エリアでは数少ない釣りポイント。",
      "江ノ電の車窓から見える風情ある漁港。",
      "地元の常連が多く、タイミングによっては入れないことも。",
    ],
    nearbyShops: [
      "腰越の釣具屋（腰越駅そば）",
      "コンビニ（駅周辺）",
    ],

    active: true,
    premiumOnly: false,
    sortOrder: 5,
  },
];

/** スラッグからスポットを引く */
export function getSpotById(id: string): Spot | undefined {
  return SHONAN_SPOTS.find((s) => s.id === id);
}

/** フリーティアで表示できるスポット（上位3件） */
export const FREE_TIER_SPOT_IDS = [
  "chigasaki-surf",
  "shonan-port",
  "oiso-port",
];
