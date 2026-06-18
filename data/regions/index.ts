/**
 * data/regions/index.ts — リージョン（エリア）マスターデータ
 *
 * 全国展開時はここにリージョンを追加する。
 * spotIds は data/spots/ 配下のスポットデータの id と一致させる。
 */

import type { Region } from "@/lib/types/domain";

export const REGIONS: Region[] = [
  {
    id: "shonan",
    name: "湘南",
    nameEn: "Shonan",
    prefecture: "神奈川県",
    description:
      "茅ヶ崎・藤沢・鎌倉・平塚を含む相模湾沿岸。サーフフィッシング・港湾・磯と多彩なポイントを持つ。",
    lat: 35.3175,
    lng: 139.3975,
    timezone: "Asia/Tokyo",
    active: true,
    premiumOnly: false,
    launchDate: "2024-06-01",
    spotIds: [
      "chigasaki-surf",
      "shonan-port",
      "oiso-port",
      "hiratsuka-surf",
      "koshigoe-port",
    ],
  },

  /* ── 将来展開リージョン（active: false でプレースホルダーとして管理）── */
  {
    id: "miura",
    name: "三浦半島",
    nameEn: "Miura Peninsula",
    prefecture: "神奈川県",
    description: "城ヶ島・剣崎・三浦海岸などを含む磯・港エリア。",
    lat: 35.1521,
    lng: 139.6207,
    timezone: "Asia/Tokyo",
    active: false,
    premiumOnly: false,
    spotIds: [],
  },
  {
    id: "chiba-kujukuri",
    name: "九十九里",
    nameEn: "Kujukuri",
    prefecture: "千葉県",
    description: "外房の広大なサーフ。ヒラメ・シーバスの一大聖地。",
    lat: 35.5438,
    lng: 140.4287,
    timezone: "Asia/Tokyo",
    active: false,
    premiumOnly: false,
    spotIds: [],
  },
  {
    id: "izu",
    name: "伊豆",
    nameEn: "Izu",
    prefecture: "静岡県",
    description: "磯釣りの聖地。グレ・メジナ・アオリイカ・カンパチなど多彩な魚種。",
    lat: 34.9766,
    lng: 138.9449,
    timezone: "Asia/Tokyo",
    active: false,
    premiumOnly: true,
    spotIds: [],
  },
];

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export const SHONAN_REGION = REGIONS[0];
