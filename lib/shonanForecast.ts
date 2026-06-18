/**
 * lib/shonanForecast.ts — 湘南エリア 釣果予報生成
 *
 * spotId が渡された場合は Open-Meteo + tide736.net の実データでスコアを計算。
 * API 失敗時 / 未指定時はハッシュベースのフォールバック値を使用。
 * 場所ごとの地形補正（風向き・港の静穏効果・濁り補正等）を反映。
 */

import { SHONAN_SPOTS, SHONAN_FISH } from "@/data/shonanData";
import type { ShonanSpot, ShonanFish } from "@/data/shonanData";

/* ─── ハッシュ ──────────────────────────────────── */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

/* ─── 型定義 ─────────────────────────────────────── */

export type DecisionType = "行くべき" | "朝だけ行く" | "場所を変える" | "やめる";
export type SafetyLevel  = "安全" | "注意" | "危険";

export interface Decision {
  type:   DecisionType;
  icon:   string;
  color:  string;
  bg:     string;
  border: string;
  reason: string;
  action: string;
}

export interface SafetyFactor {
  label: string;
  value: string;
  level: SafetyLevel;
  icon:  string;
}

export interface SafetyRating {
  overall: SafetyLevel;
  color:   string;
  bg:      string;
  icon:    string;
  factors: SafetyFactor[];
  message: string;
}

export interface HourlySlot {
  id:           string;
  timeRange:    string;
  label:        string;
  icon:         string;
  score:        number;
  color:        string;
  isBest:       boolean;
  topFish:      string;
  topFishEmoji: string;
  note:         string;
}

export interface BozuTarget {
  name:     string;
  emoji:    string;
  score:    number;
  catColor: string;
  catBg:    string;
  spot:     string;
  reason:   string;
}

export interface BozuAvoidance {
  needed:       boolean;
  mainFish:     string;
  mainScore:    number;
  alternatives: BozuTarget[];
  tip:          string;
}

export interface SpotScore {
  spot: ShonanSpot;
  score: number;
  stars: number;
  topFish: string[];
  statusText: string;
}

export interface FishScore {
  fish: ShonanFish;
  score: number;
  stars: number;
  bestTime: string;
  bestSpot: string;
  tip: string;
}

export interface BestWindow {
  label: string;
  startTime: string;
  endTime: string;
  score: number;
  reasons: string[];
  icon: string;
}

export interface WeatherInfo {
  icon: string;
  label: string;
  waveHeight: string;
  windDir: string;
  windSpeed: string;
  tempC: number;
  tideType: string;
  sunriseTime: string;
  sunsetTime: string;
  highTides: string[];
  lowTides: string[];
}

export interface ScoreBreakdown {
  weatherScore: number;
  windScore: number;
  waveScore: number;
  tideScore: number;
  windDir: string;
  windSpeedMs: number;
  waveHeightM: number;
  tideType: string;
  precipPct: number;
  terrainNote: string;
  factors: string[];
  isRealData: boolean;
}

export interface DailyForecast {
  date: string;
  goScore: number;
  goLabel: string;
  goColor: string;
  goBg: string;
  goStars: number;
  captainComment: string;
  weather: WeatherInfo;
  bestWindows: BestWindow[];
  spotScores: SpotScore[];
  fishScores: FishScore[];
  decision:      Decision;
  safety:        SafetyRating;
  hourly:        HourlySlot[];
  bozuAvoidance: BozuAvoidance;
  scoreBreakdown: ScoreBreakdown;
}

/* ─── 条件 → スコア変換 ──────────────────────────── */

function conditionToWeatherScore(label: string): number {
  if (label.includes("雷"))              return 10;
  if (label.includes("雨") && !label.includes("晴")) return label.includes("霧") ? 35 : 18;
  if (label.includes("曇り時々雨"))       return 38;
  if (label.includes("曇り"))            return 65;
  if (label.includes("時々曇"))          return 85;
  if (label.includes("晴"))              return 100;
  if (label.includes("霧"))              return 40;
  return 65;
}

function conditionToIcon(label: string): string {
  if (label.includes("雷"))  return "⛈️";
  if (label.includes("雪"))  return "🌨️";
  if (label.includes("雨"))  return label.includes("晴") ? "🌦️" : "🌧️";
  if (label.includes("曇り時々雨")) return "🌦️";
  if (label.includes("曇り")) return "☁️";
  if (label.includes("時々曇")) return "⛅";
  if (label.includes("晴"))  return "☀️";
  if (label.includes("霧"))  return "🌫️";
  return "☁️";
}

function windSpeedToScore(ms: number): number {
  if (ms <= 3) return 100;
  if (ms <= 5) return 85;
  if (ms <= 8) return 58;
  return 28;
}

function waveHeightToScore(h: number): number {
  if (h <= 0.5) return 100;
  if (h <= 0.8) return 96;
  if (h <= 1.0) return 88;
  if (h <= 1.2) return 72;
  if (h <= 1.5) return 50;
  if (h <= 2.0) return 22;
  return 8;
}

/* ─── 風向き 日本語 → コンパス ───────────────────── */
const JP_TO_COMPASS: Record<string, string> = {
  "北": "N",   "北北東": "NNE", "北東": "NE",  "東北東": "ENE",
  "東": "E",   "東南東": "ESE", "南東": "SE",  "南南東": "SSE",
  "南": "S",   "南南西": "SSW", "南西": "SW",  "西南西": "WSW",
  "西": "W",   "西北西": "WNW", "北西": "NW",  "北北西": "NNW",
};

function jpToCompass(jp: string): string {
  return JP_TO_COMPASS[jp] ?? "N";
}

/* ─── 地形補正データ ─────────────────────────────── */
interface TerrainRule {
  worstWindDirs: string[];
  bestWindDirs: string[];
  isPortHarbor: boolean;
  noteForBadWind: string;
  noteForGoodWind: string;
  tideSmallIsOk: boolean;
  turbidityFish?: string[];
}

const TERRAIN: Record<string, TerrainRule> = {
  chigasaki_surf: {
    worstWindDirs:  ["S", "SE", "E"],
    bestWindDirs:   ["NW", "W", "SW"],
    isPortHarbor:   false,
    noteForBadWind: "南東風でサーフ波荒れ",
    noteForGoodWind:"西〜北西風で追い風",
    tideSmallIsOk:  false,
  },
  hiratsuka: {
    worstWindDirs:  ["S", "SE"],
    bestWindDirs:   ["NW", "W"],
    isPortHarbor:   false,
    noteForBadWind: "南風でサーフ波荒れ",
    noteForGoodWind:"北西風で波落ち着く",
    tideSmallIsOk:  false,
    turbidityFish:  ["シーバス"],
  },
  enoshima: {
    worstWindDirs:  ["SE", "E"],
    bestWindDirs:   ["NW", "N", "W"],
    isPortHarbor:   true,
    noteForBadWind: "東風で港内に波入り",
    noteForGoodWind:"北西風で港内静穏",
    tideSmallIsOk:  false,
  },
  sagami_river: {
    worstWindDirs:  ["S", "SE"],
    bestWindDirs:   ["N", "NW"],
    isPortHarbor:   false,
    noteForBadWind: "南風で河口釣りにくい",
    noteForGoodWind:"北風で安定",
    tideSmallIsOk:  false,
    turbidityFish:  ["シーバス", "クロダイ"],
  },
  oiso: {
    worstWindDirs:  ["SE", "E", "S"],
    bestWindDirs:   ["NW", "N", "W"],
    isPortHarbor:   true,
    noteForBadWind: "南東風も防波堤が緩衝",
    noteForGoodWind:"北西風で港内静穏",
    tideSmallIsOk:  true,
  },
};

// TideLocation ID → shonanData spot ID
const TIDE_ID_TO_SPOT: Record<string, string> = {
  chigasaki:  "chigasaki_surf",
  enoshima:   "enoshima",
  katase:     "enoshima",
  hiratsuka:  "hiratsuka",
  oiso:       "oiso",
  odawara:    "oiso",
};

/* ─── 地形ボーナス計算 ───────────────────────────── */
function calcTerrainBonus(
  spotId: string,
  windCompass: string,
  windSpeedMs: number,
  tideType: string,
  precipPct: number,
): { bonus: number; note: string } {
  const tc = TERRAIN[spotId];
  if (!tc) return { bonus: 0, note: "" };

  let bonus = 0;
  const notes: string[] = [];

  const matchesWorst = tc.worstWindDirs.some((d) =>
    windCompass === d || windCompass.startsWith(d.charAt(0)) && d.length <= 2
      ? windCompass.startsWith(d)
      : windCompass === d
  );
  const matchesBest = tc.bestWindDirs.some((d) => windCompass === d || windCompass.startsWith(d));

  if (matchesWorst && windSpeedMs >= 5) {
    bonus -= 15;
    notes.push(`${tc.noteForBadWind} −15`);
  } else if (matchesWorst && windSpeedMs >= 3) {
    bonus -= 7;
    notes.push(`${tc.noteForBadWind} −7`);
  } else if (matchesBest) {
    const b = tc.isPortHarbor ? 10 : 6;
    bonus += b;
    notes.push(`${tc.noteForGoodWind} +${b}`);
  }

  if (tc.tideSmallIsOk && (tideType === "小潮" || tideType === "長潮" || tideType === "若潮")) {
    bonus += 8;
    notes.push("根魚は小潮でも有効 +8");
  }

  if (tc.turbidityFish && precipPct >= 40) {
    bonus += 5;
    notes.push(`降雨濁り(${tc.turbidityFish.join("・")}に有利) +5`);
  }

  return { bonus: Math.max(-20, Math.min(18, bonus)), note: notes.join(", ") };
}

/* ─── 魚種ごと地形補正 ─────────────────────────── */
function fishTerrainBonus(
  fishName: string,
  spotId: string,
  windCompass: string,
  windSpeedMs: number,
  precipPct: number,
): number {
  const isBadSurf =
    windSpeedMs >= 5 &&
    TERRAIN[spotId]?.worstWindDirs.some((d) => windCompass.startsWith(d));

  const surfFish = ["ヒラメ", "マゴチ", "シロギス"];
  if (surfFish.includes(fishName) && (spotId === "chigasaki_surf" || spotId === "hiratsuka") && isBadSurf) {
    return -10;
  }

  if (fishName === "シーバス" && precipPct >= 40 && (spotId === "sagami_river" || spotId === "hiratsuka")) {
    return 12;
  }

  return 0;
}

/* ─── ユーティリティ ────────────────────────────── */
function seasonScore(month: number, peakMonths: number[]): number {
  if (peakMonths.includes(month)) return 100;
  const near = peakMonths.some((m) => Math.abs(m - month) === 1 || Math.abs(m - month) === 11);
  return near ? 68 : 28;
}

function toStars(score: number): number {
  if (score >= 85) return 5;
  if (score >= 68) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

function fmt(h: number, m = 0): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fmtHM(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ─── メイン関数 ─────────────────────────────────
 * @param dateStr "YYYY-MM-DD"
 * @param spotId  TIDE_LOCATIONS の id (省略時はハッシュベース)
 */
export async function generateDailyForecast(
  dateStr: string,
  spotId?: string,
  prefetched?: { weather?: import("@/lib/weather").FishingWeatherData; tide?: import("@/lib/tideApi").TideData },
): Promise<DailyForecast> {
  const seed  = hash(dateStr);
  const date  = new Date(dateStr + "T12:00:00+09:00");
  const month = date.getMonth() + 1;

  /* ── 実データ取得 ─────────────────────────────── */
  let realWindDir    = "";
  let realWindMs     = -1;
  let realWaveM      = -1;
  let realPrecipPct  = -1;
  let realTempC      = -999;
  let realCondLabel  = "";
  let realTideType   = "";
  let realTideScore  = -1;
  let realHighTides: string[] = [];
  let realLowTides:  string[] = [];
  let isRealData     = false;

  if (spotId) {
    try {
      // Use prefetched data if provided, otherwise fetch from APIs
      let wxData: import("@/lib/weather").FishingWeatherData | undefined = prefetched?.weather;
      let tdData: import("@/lib/tideApi").TideData | undefined = prefetched?.tide;

      if (!wxData || !tdData) {
        const { TIDE_LOCATIONS } = await import("@/data/tideLocations");
        const loc = TIDE_LOCATIONS.find((l) => l.id === spotId) ?? TIDE_LOCATIONS[0];

        const [wxRes, tideRes] = await Promise.allSettled([
          wxData   ? Promise.resolve(wxData) : (await import("@/lib/weather")).fetchFishingWeather(loc.id, dateStr),
          tdData   ? Promise.resolve(tdData) : (await import("@/lib/tideApi")).fetchTideData({ lat: loc.lat, lng: loc.lng, date: dateStr, location: loc }),
        ]);

        if (wxRes.status === "fulfilled") wxData = wxRes.value;
        if (tideRes.status === "fulfilled") tdData = tideRes.value;
      }

      if (wxData) {
        const wx = wxData;
        realWindDir   = wx.current.windDirection;
        realWindMs    = wx.current.windSpeed;
        realWaveM     = wx.current.waveHeight;
        realPrecipPct = wx.current.precipProbability;
        realTempC     = wx.current.temperature;
        realCondLabel = wx.current.condition;
        isRealData    = true;
      }
      if (tdData) {
        const td = tdData;
        realTideType  = td.tideType;
        realTideScore = td.fishingScore;
        realHighTides = td.marks.filter((m) => m.type === "high").map((m) => fmtHM(m.hour, m.minute));
        realLowTides  = td.marks.filter((m) => m.type === "low").map((m) => fmtHM(m.hour, m.minute));
        isRealData    = true;
      }
    } catch { /* fall through to hash */ }
  }

  /* ── 使用する値を決定（実データ優先） ─────────── */

  // 天気
  const WEATHERS = [
    { icon: "☀️",  label: "晴れ",       score: 100 },
    { icon: "⛅",  label: "晴れ時々曇", score: 85  },
    { icon: "☁️",  label: "曇り",       score: 65  },
    { icon: "🌦️", label: "曇り時々雨", score: 38  },
    { icon: "🌧️", label: "雨",         score: 18  },
  ] as const;
  const wxFallback  = WEATHERS[seed % WEATHERS.length];
  const wxLabel     = realCondLabel || wxFallback.label;
  const wxIcon      = realCondLabel ? conditionToIcon(realCondLabel) : wxFallback.icon;
  const weatherScore = conditionToWeatherScore(wxLabel);

  // 波高
  const WAVES = [
    { label: "0.5m", m: 0.5, score: 100 }, { label: "0.8m", m: 0.8, score: 96 },
    { label: "1.0m", m: 1.0, score: 88  }, { label: "1.2m", m: 1.2, score: 72 },
    { label: "1.5m", m: 1.5, score: 50  }, { label: "2.0m", m: 2.0, score: 22 },
    { label: "2.5m", m: 2.5, score: 8   },
  ] as const;
  const waveIdx    = (seed >> 4) % WAVES.length;
  const waveM      = realWaveM >= 0 ? realWaveM : WAVES[waveIdx].m;
  const waveScore  = waveHeightToScore(waveM);
  const waveLabel  = `${waveM.toFixed(1)}m`;

  // 風
  const DIRS_JP = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  const windDir    = realWindDir || DIRS_JP[(seed >> 8) % DIRS_JP.length];
  const windMs     = realWindMs >= 0 ? realWindMs : (1 + ((seed >> 12) % 10));
  const windScore  = windSpeedToScore(windMs);
  const windSpeed  = `${windMs.toFixed(1)}m/s`;
  const windCompass = jpToCompass(windDir);

  // 気温
  const baseTemp = [8, 9, 12, 16, 20, 23, 27, 28, 24, 19, 14, 10][month - 1];
  const tempC    = realTempC !== -999 ? Math.round(realTempC) : baseTemp + ((seed >> 16) % 5) - 2;

  // 降水確率
  const precipPct = realPrecipPct >= 0 ? realPrecipPct : 0;

  // 潮汐
  let tideType: string;
  let tideScore: number;
  if (realTideType && realTideScore >= 0) {
    tideType  = realTideType;
    tideScore = realTideScore;
  } else {
    // 月齢ベースのフォールバック
    const REF_NEW_MOON = new Date("2026-06-01T00:00:00Z").getTime();
    const LUNAR_CYCLE  = 29.530589 * 24 * 3600 * 1000;
    const rawAge       = ((date.getTime() - REF_NEW_MOON) % LUNAR_CYCLE) / LUNAR_CYCLE * 29.530589;
    const lunarAge     = ((rawAge % 29.5) + 29.5) % 29.5;
    if (lunarAge <= 1.5 || lunarAge >= 28 || (lunarAge >= 13.5 && lunarAge <= 16.5)) {
      tideType = "大潮"; tideScore = 100;
    } else if ((lunarAge >= 2 && lunarAge <= 4) || (lunarAge >= 17 && lunarAge <= 19)) {
      tideType = "中潮"; tideScore = 78;
    } else if ((lunarAge >= 5 && lunarAge <= 6.5) || (lunarAge >= 20 && lunarAge <= 21.5)) {
      tideType = "小潮"; tideScore = 52;
    } else if (lunarAge >= 6.5 && lunarAge <= 7.5) {
      tideType = "長潮"; tideScore = 38;
    } else if (lunarAge >= 7.5 && lunarAge <= 8.5) {
      tideType = "若潮"; tideScore = 48;
    } else {
      tideType = "中潮"; tideScore = 72;
    }
  }

  // 干満時刻
  const htH1 = 3 + ((seed >> 20) % 5);
  const ltH1 = htH1 + 5 + ((seed >> 22) % 3);
  const htH2 = ltH1 + 6 + ((seed >> 24) % 2);
  const ltH2 = Math.min(23, htH2 + 5 + ((seed >> 26) % 2));
  const tidalMin = (seed >> 3) % 58;
  const highTides = realHighTides.length > 0 ? realHighTides : [fmt(htH1, tidalMin), fmt(htH2, tidalMin)];
  const lowTides  = realLowTides.length  > 0 ? realLowTides  : [fmt(ltH1, tidalMin), fmt(ltH2, tidalMin)];

  // 日の出/日の入り（引き続きハッシュベース）
  const srBase = [7.0, 6.7, 6.2, 5.5, 4.9, 4.5, 4.6, 5.0, 5.5, 6.0, 6.5, 6.8][month - 1];
  const ssBase = [17.2, 17.7, 18.1, 18.6, 19.0, 19.2, 19.1, 18.7, 18.0, 17.2, 16.7, 16.6][month - 1];
  const srH    = Math.floor(srBase);
  const srM    = Math.round((srBase % 1) * 60 + ((seed >> 28) % 15));
  const ssH    = Math.floor(ssBase);
  const ssM    = Math.round((ssBase % 1) * 60 + ((seed >> 2) % 20));
  const sunriseTime = fmt(srH, Math.min(59, srM));
  const sunsetTime  = fmt(ssH, Math.min(59, ssM));

  /* ── 地形補正（選択スポット） ─────────────────── */
  const selectedSpotKey = spotId ? (TIDE_ID_TO_SPOT[spotId] ?? "") : "";
  const { bonus: globalTerrainBonus, note: globalTerrainNote } = calcTerrainBonus(
    selectedSpotKey, windCompass, windMs, tideType, precipPct,
  );

  /* ── 魚種スコア ──────────────────────────────── */
  const fishScores: FishScore[] = SHONAN_FISH.map((fish) => {
    const ss    = seasonScore(month, fish.peakMonths);
    const noise = ((hash(fish.name + dateStr)) % 17) - 8;
    const ft    = fishTerrainBonus(fish.name, selectedSpotKey, windCompass, windMs, precipPct);
    const raw   = Math.round(ss * 0.52 + tideScore * 0.26 + weatherScore * 0.12 + windScore * 0.10);
    const score = Math.min(99, Math.max(5, raw + noise + ft));
    const stars = toStars(score);
    const bestSpot   = fish.bestSpots[0];
    const isMorning  = (hash(fish.name) % 2) === 0;
    const bestTime   = isMorning ? "朝マズメ" : "夕マズメ";
    const tips = [
      fish.beginnerTip,
      `${bestSpot}が今日の実績ポイント`,
      `満潮前後2時間が活性ピーク`,
      `ボトム付近を丁寧に探る`,
    ];
    const tip = tips[hash(fish.name + "tip") % tips.length];
    return { fish, score, stars, bestTime, bestSpot, tip };
  });

  /* ── スポットスコア（地形補正付き） ─────────── */
  const spotScores: SpotScore[] = SHONAN_SPOTS.map((spot) => {
    const top3 = spot.targetFish.slice(0, 3);
    const avg  = top3.reduce((s, name) => {
      const fs = fishScores.find((f) => f.fish.name === name);
      return s + (fs ? fs.score : 50);
    }, 0) / top3.length;

    const typeBonus =
      spot.type === "surf"  ? (waveM <= 1.0 ? 8 : waveM <= 1.5 ? -5 : -12) :
      spot.type === "river" ? 6 :
      spot.type === "port"  ? 5 : 4;

    const { bonus: tBonus } = calcTerrainBonus(spot.id, windCompass, windMs, tideType, precipPct);

    const score = Math.min(99, Math.max(10, Math.round(avg + typeBonus + tBonus)));
    const stars = toStars(score);
    const STATUSES = ["潮通し良好", "ベイト回遊中", "底荒れ注意", "絶好コンディション", "ナブラ情報あり"];
    const statusText = STATUSES[hash(spot.id + dateStr) % STATUSES.length];

    return { spot, score, stars, topFish: top3, statusText };
  });

  /* ── ベスト時間帯 ─────────────────────────────── */
  const bestWindows: BestWindow[] = [
    {
      label: "朝マズメ",
      icon: "🌅",
      startTime: fmt(srH),
      endTime:   fmt(Math.min(23, srH + 2)),
      score: Math.round(weatherScore * 0.25 + tideScore * 0.40 + windScore * 0.35),
      reasons: [
        "朝マズメ",
        ...(tideType === "大潮" || tideType === "中潮" ? [`${tideType}の上げ潮`] : []),
        ...(windMs <= 5 ? ["弱風"] : []),
      ].slice(0, 3),
    },
    {
      label: "夕マズメ",
      icon: "🌇",
      startTime: fmt(Math.max(0, ssH - 1)),
      endTime:   fmt(Math.min(23, ssH + 1)),
      score: Math.round(weatherScore * 0.25 + tideScore * 0.35 + windScore * 0.40),
      reasons: [
        "夕マズメ",
        ...(ltH2 >= ssH - 1 && ltH2 <= ssH + 2 ? ["干潮前後"] : []),
        ...(windMs <= 5 ? ["弱風"] : []),
      ].slice(0, 3),
    },
  ].sort((a, b) => b.score - a.score);

  /* ── 総合スコア ───────────────────────────────── */
  const topFishAvg = [...fishScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .reduce((s, f) => s + f.score, 0) / 3;

  const goScore = Math.min(99, Math.max(8, Math.round(
    weatherScore * 0.25 +
    waveScore    * 0.20 +
    windScore    * 0.15 +
    tideScore    * 0.25 +
    topFishAvg   * 0.15 +
    globalTerrainBonus
  )));

  let goLabel: string;
  let goColor: string;
  let goBg: string;
  if (goScore >= 85) {
    goLabel = "絶対行くべき"; goColor = "#10b981"; goBg = "rgba(16,185,129,.14)";
  } else if (goScore >= 70) {
    goLabel = "行くべき";     goColor = "#06b6d4"; goBg = "rgba(6,182,212,.14)";
  } else if (goScore >= 52) {
    goLabel = "まあまあ";     goColor = "#f59e0b"; goBg = "rgba(245,158,11,.14)";
  } else {
    goLabel = "厳しい日";     goColor = "#64748b"; goBg = "rgba(100,116,139,.14)";
  }
  const goStars = toStars(goScore);

  /* ── スコア内訳（根拠説明用） ─────────────────── */
  const scoreBreakdown: ScoreBreakdown = {
    weatherScore,
    windScore,
    waveScore,
    tideScore,
    windDir,
    windSpeedMs: Math.round(windMs * 10) / 10,
    waveHeightM: Math.round(waveM * 10) / 10,
    tideType,
    precipPct,
    terrainNote: globalTerrainNote,
    factors: [
      `天気: ${wxLabel} → ${weatherScore}/100`,
      `風: ${windDir} ${windMs.toFixed(1)}m/s → ${windScore}/100`,
      `波: ${waveLabel} → ${waveScore}/100`,
      `潮: ${tideType} → ${tideScore}/100`,
      ...(globalTerrainNote ? [`地形補正: ${globalTerrainNote}`] : []),
    ],
    isRealData,
  };

  /* ── 船長コメント ─────────────────────────────── */
  const sortedFish = [...fishScores].sort((a, b) => b.score - a.score);
  const sortedSpot = [...spotScores].sort((a, b) => b.score - a.score);
  const f1 = sortedFish[0].fish.name;
  const f2 = sortedFish[1].fish.name;
  const s1 = sortedSpot[0].spot.name;
  const bw = bestWindows[0];

  const COMMENTS = [
    `${bw.startTime}に合わせて出発がベスト。${s1}で${f1}・${f2}を狙いましょう。${tideType}なので潮の流れに乗れます。`,
    `今日は${bw.label}の${bw.startTime}〜${bw.endTime}が勝負。${s1}に入れれば${f1}の可能性が高いです。`,
    `${s1}の${f1}が今日の本命。${bw.label}前後が最も期待できます。早めに現地入りしておくといいでしょう。`,
    `${tideType}で潮回りがいい日です。朝から行くなら${bw.startTime}には現地に着いていたいところ。`,
    `${f1}・${f2}どちらも狙えます。${s1}で${bw.label}に合わせるのがセオリーです。`,
    `今日の本命時間は${bw.startTime}〜${bw.endTime}。${s1}で${f1}を狙って、潮が緩んだら${f2}に切り替えましょう。`,
  ];
  const captainComment = COMMENTS[seed % COMMENTS.length];

  /* ── 安全判定 ─────────────────────────────────── */
  function sfLevel(v: number, ok: number, warn: number): SafetyLevel {
    return v <= ok ? "安全" : v <= warn ? "注意" : "危険";
  }
  function sfColor(l: SafetyLevel): string {
    return l === "安全" ? "#10b981" : l === "注意" ? "#f59e0b" : "#ef4444";
  }
  function sfBg(l: SafetyLevel): string {
    return l === "安全" ? "rgba(16,185,129,.15)" : l === "注意" ? "rgba(245,158,11,.15)" : "rgba(239,68,68,.15)";
  }

  const waveLv = sfLevel(waveM, 0.8, 1.5);
  const windLv = sfLevel(windMs, 4, 7);
  const wxLv:  SafetyLevel = (wxLabel.includes("雨") || wxLabel.includes("雷")) ? "注意" : "安全";

  const allLvs: SafetyLevel[] = [waveLv, windLv, wxLv];
  const overallLv: SafetyLevel =
    allLvs.includes("危険") ? "危険" :
    allLvs.includes("注意") ? "注意" : "安全";

  const safety: SafetyRating = {
    overall: overallLv,
    color:   sfColor(overallLv),
    bg:      sfBg(overallLv),
    icon:    overallLv === "安全" ? "✅" : overallLv === "注意" ? "⚠️" : "🚫",
    factors: [
      { label: "波",  value: waveLabel, level: waveLv, icon: "🌊" },
      { label: "風",  value: windSpeed, level: windLv, icon: "💨" },
      { label: "天気", value: wxLabel,  level: wxLv,   icon: wxIcon },
    ],
    message:
      overallLv === "危険"  ? "危険なコンディション。釣りは控えましょう。" :
      overallLv === "注意"  ? "注意が必要です。ライフジャケット着用を強く推奨。" :
                              "良好なコンディションです。",
  };

  /* ── 判断 ─────────────────────────────────────── */
  const DSTYLE: Record<DecisionType, { icon: string; color: string; bg: string; border: string }> = {
    "行くべき":     { icon: "✅", color: "#10b981", bg: "rgba(16,185,129,.14)", border: "rgba(16,185,129,.4)" },
    "朝だけ行く":   { icon: "🌅", color: "#f59e0b", bg: "rgba(245,158,11,.14)", border: "rgba(245,158,11,.4)" },
    "場所を変える": { icon: "📍", color: "#06b6d4", bg: "rgba(6,182,212,.14)",  border: "rgba(6,182,212,.4)"  },
    "やめる":       { icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,.14)",  border: "rgba(239,68,68,.4)"  },
  };

  let decisionType: DecisionType;
  let decisionReason: string;
  let decisionAction: string;

  if (overallLv === "危険" || goScore < 22) {
    decisionType   = "やめる";
    decisionReason = overallLv === "危険"
      ? `波${waveLabel}・風${windSpeed} — 危険なコンディション`
      : "釣果が期待できない条件です";
    decisionAction = "安全第一。道具のメンテナンスに充てましょう。";
  } else if (goScore >= 78 && overallLv === "安全") {
    decisionType   = "行くべき";
    decisionReason = `${wxLabel}・${tideType}・風${windSpeed} — 条件が揃っています`;
    decisionAction = `${bestWindows[0].startTime}〜${bestWindows[0].endTime}の${bestWindows[0].label}が最高潮`;
  } else if (goScore >= 52 || bestWindows[0].score >= 62) {
    decisionType   = "朝だけ行く";
    decisionReason = `${bestWindows[0].label}が今日のベストタイム。それ以外はやや厳しめ`;
    decisionAction = `${bestWindows[0].startTime}〜${bestWindows[0].endTime}に絞って集中釣行`;
  } else if (goScore >= 36) {
    decisionType   = "場所を変える";
    decisionReason = "サーフ系は厳しめ。風裏・河川・港内が◎";
    decisionAction = "相模川河口・江ノ島内側・大磯港など風の影響を受けにくいポイントへ";
  } else {
    decisionType   = "やめる";
    decisionReason = "天気・波・潮が揃っていません";
    decisionAction = "次回の好機を待ちましょう。釣果ログを見直すのもおすすめ。";
  }

  const decision: Decision = { type: decisionType, reason: decisionReason, action: decisionAction, ...DSTYLE[decisionType] };

  /* ── 時間別スロット ───────────────────────────── */
  const sortedFishForHourly = [...fishScores].sort((a, b) => b.score - a.score);

  type SlotDef = { id: string; label: string; icon: string; timeRange: string; wF: number; tF: number; wxF: number; note: string };
  const slotDefs: SlotDef[] = [
    { id: "am_mazume", label: "朝マズメ", icon: "🌅",
      timeRange: `${fmt(srH)}〜${fmt(Math.min(23, srH + 2))}`,
      wF: 0.25, tF: 0.45, wxF: 0.30, note: "最も活性が高い時間帯" },
    { id: "morning",   label: "朝",       icon: "☀️",
      timeRange: `${fmt(Math.min(23, srH + 2))}〜10:00`,
      wF: 0.30, tF: 0.40, wxF: 0.30, note: "朝マズメの延長。底物狙い◎" },
    { id: "noon",      label: "昼",       icon: "🌤️",
      timeRange: "10:00〜15:00",
      wF: 0.25, tF: 0.40, wxF: 0.35, note: "サビキ・シロギス。潮次第" },
    { id: "pm_mazume", label: "夕マズメ", icon: "🌇",
      timeRange: `${fmt(Math.max(0, ssH - 1))}〜${fmt(Math.min(23, ssH + 1))}`,
      wF: 0.30, tF: 0.35, wxF: 0.35, note: "第2の黄金時間" },
    { id: "night",     label: "夜",       icon: "🌙",
      timeRange: `${fmt(Math.min(23, ssH + 1))}〜23:00`,
      wF: 0.25, tF: 0.40, wxF: 0.35, note: "シーバス・タチウオ◎" },
  ];

  function slotColor(s: number): string {
    return s >= 80 ? "#10b981" : s >= 65 ? "#06b6d4" : s >= 48 ? "#f59e0b" : "#64748b";
  }

  const hourly: HourlySlot[] = slotDefs.map((s) => {
    const raw   = Math.round(windScore * s.wF + tideScore * s.tF + weatherScore * s.wxF);
    const noise = ((hash(s.id + dateStr)) % 11) - 5;
    const score = Math.min(99, Math.max(8, raw + noise));
    return {
      id: s.id, timeRange: s.timeRange, label: s.label, icon: s.icon,
      score, color: slotColor(score), isBest: false,
      topFish:      sortedFishForHourly[0]?.fish.name  ?? "",
      topFishEmoji: sortedFishForHourly[0]?.fish.emoji ?? "",
      note: s.note,
    };
  });

  const bestHourlyScore = Math.max(...hourly.map((h) => h.score));
  const hourlyFinal = hourly.map((h) => ({ ...h, isBest: h.score === bestHourlyScore }));

  /* ── ボウズ回避 ───────────────────────────────── */
  const sortedFishDesc = [...fishScores].sort((a, b) => b.score - a.score);
  const topScore       = sortedFishDesc[0]?.score ?? 50;
  const bozuNeeded     = topScore < 60 || overallLv === "注意" || overallLv === "危険";

  const bozuAlts: BozuTarget[] = sortedFishDesc
    .filter((f) => f.score >= 42)
    .slice(0, 4)
    .map((f) => ({
      name:     f.fish.name,
      emoji:    f.fish.emoji,
      score:    f.score,
      catColor: f.fish.catColor,
      catBg:    f.fish.catBg,
      spot:     f.fish.bestSpots[0],
      reason:   f.score >= 68 ? "今日の本命候補" : f.score >= 52 ? "狙い目" : "数釣り向け",
    }));

  const bozuAvoidance: BozuAvoidance = {
    needed:       bozuNeeded,
    mainFish:     sortedFishDesc[0]?.fish.name ?? "",
    mainScore:    topScore,
    alternatives: bozuAlts.slice(0, 3),
    tip: bozuNeeded
      ? "今日は条件がやや厳しめ。アジ・カサゴ・シロギスなど数釣りを楽しもう。"
      : `${sortedFishDesc[0]?.fish.name}の期待度が高い日。集中して狙いましょう。`,
  };

  return {
    date: dateStr,
    goScore, goLabel, goColor, goBg, goStars,
    captainComment,
    weather: {
      icon: wxIcon, label: wxLabel,
      waveHeight: waveLabel, windDir, windSpeed, tempC, tideType,
      sunriseTime, sunsetTime, highTides, lowTides,
    },
    bestWindows,
    spotScores: [...spotScores].sort((a, b) => b.score - a.score),
    fishScores: [...fishScores].sort((a, b) => b.score - a.score),
    decision, safety,
    hourly: hourlyFinal,
    bozuAvoidance,
    scoreBreakdown,
  };
}
