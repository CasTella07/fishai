export type CrowdLevel = "空いている" | "普通" | "混む" | "非常に混む";

export interface SpotDetail {
  id:       string;
  name:     string;
  icon:     string;
  area:     string;
  parking:  { available: boolean; detail: string; cost: string };
  toilet:   { available: boolean; detail: string };
  foothold: string;
  crowd:    { level: CrowdLevel; detail: string };
  access:   string;
  requiredTackle: string[];
  bestSeasons:    string[];
  notes:          string[];
  nearbyShops:    string[];
}

export const SPOT_DETAILS: SpotDetail[] = [
  {
    id:   "chigasaki_surf",
    name: "茅ヶ崎サーフ",
    icon: "🏖️",
    area: "茅ヶ崎市",
    parking:  { available: true,  detail: "サザンビーチ駐車場（有料）", cost: "1日1,000円前後" },
    toilet:   { available: true,  detail: "サザンビーチちがさき施設内" },
    foothold: "砂浜。波が高い時は足元が崩れることがある。長靴orウェーダー推奨。",
    crowd:    { level: "混む",     detail: "週末朝マズメは混雑。平日は比較的空いている" },
    access:   "茅ヶ崎駅南口から徒歩15分、またはバスでサザンビーチ前下車",
    requiredTackle: ["サーフロッド（9〜11フィート）", "スピニングリール（3000〜4000番）", "PE1〜1.5号", "メタルジグ or ジグヘッド"],
    bestSeasons:    ["4〜7月（ヒラメ・シロギス）", "9〜11月（青物・ヒラメ）"],
    notes: [
      "離岸流（白泡・流れの帯）周辺が好ポイント",
      "波1.5m超の日はサーフ釣りは危険",
      "テトラポッドに乗らない",
      "ゴミは必ず持ち帰ること",
    ],
    nearbyShops: ["上州屋茅ヶ崎店（車5分）"],
  },
  {
    id:   "hiratsuka",
    name: "平塚海岸・新港",
    icon: "⚓",
    area: "平塚市",
    parking:  { available: true,  detail: "平塚新港駐車場（有料）",    cost: "300〜500円/回" },
    toilet:   { available: true,  detail: "平塚新港入口付近に公衆トイレあり" },
    foothold: "堤防は安定した足場。先端は濡れると滑りやすい。",
    crowd:    { level: "普通",     detail: "早朝は混むが昼間は空いてくる" },
    access:   "平塚駅南口からバス（平塚新港行き）または車で15分",
    requiredTackle: ["投げ竿（シロギス向け）", "または万能ロッド", "仕掛けは現地購入も可"],
    bestSeasons:    ["6〜9月（シロギス）", "10〜12月（アジ・サバ・タチウオ）"],
    notes: [
      "港内は釣り禁止エリアあり。標識を必ず確認",
      "堤防先端は波をかぶることがある",
    ],
    nearbyShops: ["釣具のポイント平塚店"],
  },
  {
    id:   "enoshima",
    name: "江ノ島",
    icon: "🏝️",
    area: "藤沢市",
    parking:  { available: true,  detail: "江の島アイランドスパ周辺（有料）", cost: "1日2,000〜3,000円" },
    toilet:   { available: true,  detail: "島内に複数。無料" },
    foothold: "磯は不整地で滑りやすい。磯靴必須。堤防は比較的安定。",
    crowd:    { level: "非常に混む", detail: "観光客も多く休日は激混み。早朝（5〜7時）が狙い目" },
    access:   "小田急片瀬江ノ島駅から徒歩15分、または江ノ電江ノ島駅から徒歩20分",
    requiredTackle: ["磯靴（スパイク付き）", "ライフジャケット推奨", "フカセ or サビキ仕掛け"],
    bestSeasons:    ["通年（魚種豊富）", "特に5〜11月が活況"],
    notes: [
      "磯では磯靴（スパイク）必須。普通の靴は危険",
      "釣り禁止エリアあり（遊歩道・商業施設前）",
      "波が高い日の磯は立入禁止",
      "マナー徹底。ゴミの不法投棄で規制強化中",
    ],
    nearbyShops: ["江ノ島フィッシングセンター（橋付近）"],
  },
  {
    id:   "sagami_river",
    name: "相模川河口",
    icon: "🌊",
    area: "平塚市・茅ヶ崎市",
    parking:  { available: true,  detail: "河口周辺の路駐スポット（多い）", cost: "無料〜500円" },
    toilet:   { available: false, detail: "近くのコンビニを利用（セブン-イレブン相模川橋西店）" },
    foothold: "砂地・砂利の河川敷。歩きやすいが夜は足元注意。",
    crowd:    { level: "空いている", detail: "穴場的存在。シーバスアングラーが点在" },
    access:   "茅ヶ崎駅または平塚駅からバス・タクシー。車が便利",
    requiredTackle: ["シーバスロッド（9〜10フィート）", "スピニングリール（3000〜4000番）", "PE1〜1.5号"],
    bestSeasons:    ["通年（シーバス）", "特に10〜2月の落ちシーバスが大型"],
    notes: [
      "夜釣りはライトを必ず持参",
      "川の流れが強い日は注意",
      "護岸の一部は立入禁止区域あり",
    ],
    nearbyShops: ["上州屋茅ヶ崎店（車10分）"],
  },
  {
    id:   "oiso",
    name: "大磯港",
    icon: "⚓",
    area: "大磯町",
    parking:  { available: true,  detail: "大磯港駐車場（有料）", cost: "500円/日" },
    toilet:   { available: true,  detail: "港内にあり" },
    foothold: "堤防は安定。テトラは滑りやすい。磯靴推奨。",
    crowd:    { level: "空いている", detail: "穴場。平日はほぼ人が少ない" },
    access:   "大磯駅から徒歩15分、または車で5分",
    requiredTackle: ["穴釣り仕掛け（ブラクリ）", "または軽めのルアーロッド"],
    bestSeasons:    ["通年（カサゴ・メバル年中）", "アジは9〜11月"],
    notes: [
      "テトラに乗る際はライフジャケット着用",
      "漁業関係者の邪魔にならないよう配慮",
      "夜釣りは常夜灯の明暗部を狙う",
    ],
    nearbyShops: ["国府津釣具店（車10分）"],
  },
];

export function getSpotDetail(id: string): SpotDetail | undefined {
  return SPOT_DETAILS.find((s) => s.id === id);
}

export const CROWD_COLOR: Record<CrowdLevel, string> = {
  "空いている":   "#10b981",
  "普通":         "#06b6d4",
  "混む":         "#f59e0b",
  "非常に混む":   "#ef4444",
};
