/**
 * タイドグラフ対応エリア一覧
 *
 * tideApi フィールドが設定されている港は tide736.net の実APIを使用する。
 * pc = 都道府県コード（tide736.net 独自 ≒ JIS X 0401 相当）
 * hc = 港コード
 *
 * 神奈川 (pc=14) 港コード対応:
 *   江ノ島(hc=19) — 相模湾中央部の参照局。茅ヶ崎・片瀬・平塚・大磯はこれを使用。
 *   真鶴 (hc=20) — 相模湾西部の参照局。小田原はこれを使用。
 *   横須賀(hc= 7) — 東京湾口の参照局。
 * 静岡  (pc=22):
 *   熱海 (hc=19) — 伊豆半島付け根。
 */

export interface TideLocation {
  id: string;
  name: string;
  prefecture: string;
  lat: number;
  lng: number;
  description: string;
  mainFish: string[];
  /** tide736.net API 接続情報。未設定の場合はダミーデータ */
  tideApi?: { pc: number; hc: number };
}

export const TIDE_LOCATIONS: TideLocation[] = [
  /* ── 相模湾 ── */
  {
    id: "chigasaki",
    name: "茅ヶ崎",
    prefecture: "神奈川",
    lat: 35.3317,
    lng: 139.4036,
    description: "サーフフィッシングの聖地。ヒラメ・青物が狙える",
    mainFish: ["ヒラメ", "マゴチ", "シーバス", "青物"],
    tideApi: { pc: 14, hc: 19 }, // 江ノ島局（相模湾中央部）
  },
  {
    id: "enoshima",
    name: "江の島",
    prefecture: "神奈川",
    lat: 35.3020,
    lng: 139.4803,
    description: "湘南の定番ポイント。サビキ・ライト五目が人気",
    mainFish: ["アジ", "シーバス", "アオリイカ", "ヒラメ"],
    tideApi: { pc: 14, hc: 19 }, // 江ノ島局（直接対応）
  },
  {
    id: "katase",
    name: "片瀬海岸",
    prefecture: "神奈川",
    lat: 35.3101,
    lng: 139.4856,
    description: "片瀬川河口周辺。シーバス・ヒラメ・投げ釣りが盛ん",
    mainFish: ["シーバス", "ヒラメ", "キス", "アジ"],
    tideApi: { pc: 14, hc: 19 }, // 江ノ島局（片瀬は江ノ島の隣）
  },
  {
    id: "hiratsuka",
    name: "平塚",
    prefecture: "神奈川",
    lat: 35.3259,
    lng: 139.3427,
    description: "相模川河口・湘南港周辺。シーバス・ヒラメ・青物",
    mainFish: ["シーバス", "ヒラメ", "青物", "マゴチ"],
    tideApi: { pc: 14, hc: 19 }, // 江ノ島局（相模湾中央部）
  },
  {
    id: "oiso",
    name: "大磯",
    prefecture: "神奈川",
    lat: 35.3087,
    lng: 139.3127,
    description: "大磯港・城山公園周辺。根魚・青物・投げ釣り",
    mainFish: ["カサゴ", "メジナ", "青物", "キス"],
    tideApi: { pc: 14, hc: 19 }, // 江ノ島局（相模湾中央部）
  },
  {
    id: "odawara",
    name: "小田原",
    prefecture: "神奈川",
    lat: 35.2661,
    lng: 139.1526,
    description: "相模湾西部。ソウダガツオ・ショアジギングが盛ん",
    mainFish: ["ソウダガツオ", "ワカシ", "シーバス", "キス"],
    tideApi: { pc: 14, hc: 20 }, // 真鶴局（相模湾西部・最近傍）
  },

  /* ── 東京湾 ── */
  {
    id: "yokosuka",
    name: "横須賀",
    prefecture: "神奈川",
    lat: 35.2810,
    lng: 139.6729,
    description: "東京湾内。アジ・サバ・シーバスの好ポイント",
    mainFish: ["アジ", "サバ", "シーバス", "クロダイ"],
    tideApi: { pc: 14, hc: 7 }, // 横須賀局（東京湾口）
  },

  /* ── 伊豆・静岡 ── */
  {
    id: "atami",
    name: "熱海",
    prefecture: "静岡",
    lat: 35.0965,
    lng: 139.0737,
    description: "伊豆半島付け根。マダイ・イカ・根魚が豊富",
    mainFish: ["マダイ", "アオリイカ", "カサゴ", "メジナ"],
    tideApi: { pc: 22, hc: 19 }, // 熱海局（pc=22 静岡）
  },

  /* ── 千葉 (tideApi未設定 → ダミー) ── */
  {
    id: "tateyama",
    name: "館山",
    prefecture: "千葉",
    lat: 34.9969,
    lng: 139.8687,
    description: "東京湾口。クロダイ・シーバス・アジが人気",
    mainFish: ["クロダイ", "シーバス", "アジ", "ヒラメ"],
  },
];

export const CUSTOM_LOCATION: TideLocation = {
  id: "custom",
  name: "カスタム",
  prefecture: "",
  lat: 35.3020,
  lng: 139.4803,
  description: "任意の緯度経度を指定",
  mainFish: ["アジ", "シーバス", "ヒラメ"],
};
