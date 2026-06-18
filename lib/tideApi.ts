/**
 * lib/tideApi.ts — 潮汐データ取得レイヤー
 *
 * location.tideApi が設定されている港 → tide736.net 実API
 * 未設定の港                         → ダミーデータ（フォールバック）
 *
 * tide736.net エンドポイント:
 *   https://api.tide736.net/get_tide.php?pc={pc}&hc={hc}&yr={年}&mn={月}&dy={日}&rg=day
 */

import type { TideLocation } from "@/data/tideLocations";

/* ══════════════════════════════════════════════════
   公開型定義
══════════════════════════════════════════════════ */

export interface TidePoint {
  /** 0〜24 (整数時刻) */
  hour: number;
  /** 正規化潮位 0〜100 */
  level: number;
}

export interface TideMark {
  hour: number;
  minute: number;
  /** 正規化潮位 0〜100 */
  level: number;
  type: "high" | "low";
}

export interface FishScore {
  name: string;
  stars: number; // 1〜5
  note: string;
}

export interface TideData {
  location: TideLocation;
  date: string;            // YYYY-MM-DD
  tideType: string;        // 大潮/中潮/小潮/長潮/若潮
  /** 0〜24時の1時間ごとデータ (25点) */
  points: TidePoint[];
  /** 満潮・干潮マーク */
  marks: TideMark[];
  sunriseHour: number;     // 例: 4.5 = 4:30
  sunsetHour: number;      // 例: 18.85 = 18:51
  /** 現在の正規化潮位 */
  currentLevel: number;
  /** FishAI総合釣れる指数 0〜100 */
  fishingScore: number;
  /** おすすめ時間帯 */
  bestTimeStart: number;
  bestTimeEnd: number;
  fishScores: FishScore[];
  aiComment: string;
}

export interface FetchTideParams {
  lat: number;
  lng: number;
  /** YYYY-MM-DD */
  date: string;
  location: TideLocation;
}

/* ══════════════════════════════════════════════════
   tide736.net 内部型
══════════════════════════════════════════════════ */

interface T736Point { time: string; unix: number; cm: number; }
interface T736Day {
  sun:   { rise: string; set: string; midline: string; };
  moon:  { age: string; title: string; brightness: string; };
  edd:   T736Point[];   // 干潮 (low tide)
  flood: T736Point[];   // 満潮 (high tide)
  tide:  T736Point[];   // 全データ 20分刻み (73点: 00:00〜24:00)
}
interface T736Response {
  status: number;
  message: string;
  tide: {
    port: Record<string, unknown>;
    chart: Record<string, T736Day>;
  };
}

/* ══════════════════════════════════════════════════
   Public API
══════════════════════════════════════════════════ */

export async function fetchTideDataMultiDay(
  baseParams: FetchTideParams,
  numDays = 5,
): Promise<TideData[]> {
  const today = new Date();
  const todayJST = new Date(today.getTime() + 9 * 60 * 60 * 1000);
  return Promise.all(
    Array.from({ length: numDays }, (_, i) => {
      const d = new Date(todayJST);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      return fetchTideData({ ...baseParams, date: dateStr });
    }),
  );
}

export async function fetchTideData(params: FetchTideParams): Promise<TideData> {
  const api = params.location.tideApi;
  if (api) {
    try {
      const day = await fetchTide736(api.pc, api.hc, params.date);
      if (day) return mapTide736ToTideData(day, params);
    } catch {
      // fallthrough to dummy
    }
  }
  // フォールバック: ダミーデータ
  await new Promise((r) => setTimeout(r, 80));
  return generateDummyTideData(params);
}

/* ══════════════════════════════════════════════════
   tide736.net 実装
══════════════════════════════════════════════════ */

async function fetchTide736(pc: number, hc: number, dateStr: string): Promise<T736Day | null> {
  const [yr, mn, dy] = dateStr.split("-");
  const url = `https://api.tide736.net/get_tide.php?pc=${pc}&hc=${hc}&yr=${yr}&mn=${mn}&dy=${dy}&rg=day`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json: T736Response = await res.json();
  if (json.status !== 1) return null;
  return json.tide.chart[dateStr] ?? null;
}

/** "HH:MM" をパース。"18:60" のような60分表記も 59分に丸める */
function parseHHMM(s: string): { h: number; m: number } {
  const parts = s.split(":");
  return { h: Number(parts[0]), m: Math.min(59, Number(parts[1] ?? 0)) };
}

function mapTide736ToTideData(day: T736Day, params: FetchTideParams): TideData {
  /* ── 正規化 (cm → 0〜100) ── */
  const allCm = day.tide.map((p) => p.cm);
  const minCm = Math.min(...allCm);
  const maxCm = Math.max(...allCm);
  const range = maxCm - minCm || 1;
  const normalize = (cm: number): number =>
    Math.round(Math.max(5, Math.min(95, ((cm - minCm) / range) * 90 + 5)));

  /* ── 1時間ごと25点 (00:00〜24:00) ── */
  // tide配列は20分刻み73点 → インデックス h*3 が各時刻の値
  const points: TidePoint[] = Array.from({ length: 25 }, (_, h) => ({
    hour: h,
    level: normalize(day.tide[Math.min(h * 3, day.tide.length - 1)].cm),
  }));

  /* ── 満潮/干潮マーク ── */
  const toMark = (p: T736Point, type: "high" | "low"): TideMark | null => {
    const { h, m } = parseHHMM(p.time);
    if (h >= 24) return null; // 24:00 は翌日扱い
    return { hour: h, minute: m, level: normalize(p.cm), type };
  };
  const marks: TideMark[] = [
    ...day.flood.map((p) => toMark(p, "high")),
    ...day.edd.map((p) => toMark(p, "low")),
  ]
    .filter((m): m is TideMark => m !== null)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  /* ── 日の出・日の入り ── */
  const rise = parseHHMM(day.sun.rise);
  const set  = parseHHMM(day.sun.set);
  const sunriseHour = rise.h + rise.m / 60;
  const sunsetHour  = set.h  + set.m  / 60;

  /* ── 潮回り・月齢 ── */
  const tideType  = day.moon.title || "中潮";
  const lunarAge  = parseFloat(day.moon.age) || 0;

  /* ── 現在潮位: unix で最近傍点を探す ── */
  const nowMs  = Date.now();
  const nearest = day.tide.reduce((best, p) =>
    Math.abs(p.unix - nowMs) < Math.abs(best.unix - nowMs) ? p : best,
  );
  const currentLevel = normalize(nearest.cm);

  /* ── 釣れる指数・おすすめ時間 (既存ロジック流用) ── */
  const { score, bestStart, bestEnd } = calcFishingScore(
    marks, sunriseHour, sunsetHour, lunarAge,
  );
  const fishScores = calcFishScores(params.location, score, tideType);

  const highTides = marks.filter((m) => m.type === "high");
  const bh  = fmt(Math.floor(bestStart), Math.round((bestStart % 1) * 60));
  const bhe = fmt(Math.floor(bestEnd),   Math.round((bestEnd   % 1) * 60));

  const aiComment =
    highTides.length > 0
      ? `朝マズメと満潮前後が重なる${bh}〜${bhe}が最も狙い目。` +
        `${params.location.mainFish[0]}・${params.location.mainFish[1]}に期待。` +
        `潮回りは${tideType}。`
      : `${params.location.name}での釣りは、潮が動き始める時間帯を狙いましょう。`;

  return {
    location: params.location,
    date: params.date,
    tideType,
    points,
    marks,
    sunriseHour,
    sunsetHour,
    currentLevel,
    fishingScore: score,
    bestTimeStart: bestStart,
    bestTimeEnd: bestEnd,
    fishScores,
    aiComment,
  };
}

/* ══════════════════════════════════════════════════
   釣れる指数・おすすめ時間（共通ロジック）
══════════════════════════════════════════════════ */

function calcFishingScore(
  marks: TideMark[],
  sunriseHour: number,
  sunsetHour: number,
  lunarAge: number,
): { score: number; bestStart: number; bestEnd: number } {
  const highTides = marks.filter((m) => m.type === "high");

  const tideBonus = highTides.reduce((best, ht) => {
    const htTime = ht.hour + ht.minute / 60;
    return htTime - 2.5 >= 0 ? Math.max(best, 25) : best;
  }, 0);

  const springBonus =
    lunarAge <= 2 || (lunarAge >= 13 && lunarAge <= 16) ? 15 : 0;

  const score = Math.min(100, 42 + tideBonus + springBonus);

  let bestStart = sunriseHour - 0.5;
  let bestEnd   = sunriseHour + 1.5;

  const firstHigh = highTides[0];
  if (firstHigh) {
    const ht = firstHigh.hour + firstHigh.minute / 60;
    if (ht > 3 && ht < 10) {
      bestStart = Math.max(0, ht - 2);
      bestEnd   = ht + 0.5;
    }
  }

  return {
    score: Math.round(score),
    bestStart: Math.round(bestStart * 2) / 2,
    bestEnd:   Math.round(bestEnd   * 2) / 2,
  };
}

function calcFishScores(
  location: TideLocation,
  fishingScore: number,
  tideType: string,
): FishScore[] {
  const isSpring = tideType === "大潮";
  return location.mainFish.map((name, i) => {
    const base  = [4, 3, 4, 2][i % 4];
    const bonus = isSpring && i === 0 ? 1 : 0;
    const stars = Math.min(
      5,
      Math.max(1, base + bonus + (fishingScore > 80 ? 1 : 0) - (i > 2 ? 1 : 0)),
    );
    const notes = [
      "朝マズメの満潮前後に活性が高い",
      "潮が動き出す時間帯が狙い目",
      "底付近をゆっくり誘う",
      "ベイトの接岸に合わせる",
    ];
    return { name, stars, note: notes[i % notes.length] };
  });
}

/* ══════════════════════════════════════════════════
   ダミーデータ生成（フォールバック用）
══════════════════════════════════════════════════ */

function hashCode(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function getTideLevel(t: number, amplitude: number, diurnalRatio: number, phase: number): number {
  const T_M2 = 12.42;
  return (
    50 +
    amplitude * Math.sin((2 * Math.PI * t) / T_M2 + phase) +
    amplitude * diurnalRatio * Math.sin((2 * Math.PI * t) / 24 + phase * 0.4)
  );
}

function approximateLunarAge(dateStr: string): number {
  const REF_NEW_MOON = new Date("2026-06-01T00:00:00Z").getTime();
  const LUNAR_CYCLE  = 29.530589 * 24 * 3600 * 1000;
  const target       = new Date(dateStr + "T12:00:00Z").getTime();
  return (((target - REF_NEW_MOON) % LUNAR_CYCLE) / LUNAR_CYCLE) * 29.530589;
}

function getTideType(lunarAge: number): string {
  const age = lunarAge % 29.5;
  if (age <= 1.5 || age >= 28 || (age >= 13.5 && age <= 16.5)) return "大潮";
  if ((age >= 2 && age <= 4)   || (age >= 17 && age <= 19))   return "中潮";
  if ((age >= 5 && age <= 6.5) || (age >= 20 && age <= 21.5)) return "小潮";
  if (age >= 6.5 && age <= 7.5) return "長潮";
  if (age >= 7.5 && age <= 8.5) return "若潮";
  return "中潮";
}

function findTideMarks(amplitude: number, diurnalRatio: number, phase: number): TideMark[] {
  const marks: TideMark[] = [];
  const step = 1 / 6;
  for (let t = step; t < 24 - step / 2; t += step) {
    const prev = getTideLevel(t - step, amplitude, diurnalRatio, phase);
    const curr = getTideLevel(t,        amplitude, diurnalRatio, phase);
    const next = getTideLevel(t + step, amplitude, diurnalRatio, phase);
    const isHigh = curr > prev && curr > next;
    const isLow  = curr < prev && curr < next;
    if (!isHigh && !isLow) continue;
    const type: "high" | "low" = isHigh ? "high" : "low";
    const tooClose = marks.some(
      (m) => m.type === type && Math.abs(m.hour + m.minute / 60 - t) < 2,
    );
    if (tooClose) continue;
    const h = Math.floor(t);
    const m = Math.round((t - h) * 60);
    marks.push({
      hour: h,
      minute: m === 60 ? 0 : m,
      level: Math.round(Math.max(5, Math.min(95, curr))),
      type,
    });
  }
  return marks.sort((a, b) => a.hour + a.minute / 60 - (b.hour + b.minute / 60));
}

function generateDummyTideData(params: FetchTideParams): TideData {
  const seed          = hashCode(`${params.lat.toFixed(3)}_${params.lng.toFixed(3)}_${params.date}`);
  const amplitude     = 30 + (seed % 20);
  const diurnalRatio  = 0.15 + (seed % 10) / 100;
  const phase         = ((seed % 10000) / 10000) * Math.PI * 2;

  const points: TidePoint[] = Array.from({ length: 25 }, (_, h) => ({
    hour: h,
    level: Math.round(
      Math.max(5, Math.min(95, getTideLevel(h, amplitude, diurnalRatio, phase))),
    ),
  }));

  const marks       = findTideMarks(amplitude, diurnalRatio, phase);
  const lunarAge    = approximateLunarAge(params.date);
  const tideType    = getTideType(lunarAge);
  const sunriseHour = 4.5 + (params.lat - 35) * 0.1 + (seed % 3) * 0.1;
  const sunsetHour  = 18.85 + (params.lat - 35) * 0.05 + (seed % 4) * 0.1;
  const { score, bestStart, bestEnd } = calcFishingScore(marks, sunriseHour, sunsetHour, lunarAge);
  const currentLevel = Math.round(
    Math.max(5, Math.min(95, getTideLevel(bestStart + 1, amplitude, diurnalRatio, phase))),
  );
  const fishScores = calcFishScores(params.location, score, tideType);
  const highTides  = marks.filter((m) => m.type === "high");
  const bh  = fmt(Math.floor(bestStart), Math.round((bestStart % 1) * 60));
  const bhe = fmt(Math.floor(bestEnd),   Math.round((bestEnd   % 1) * 60));
  const aiComment =
    highTides.length > 0
      ? `朝マズメと満潮前後が重なる${bh}〜${bhe}が最も狙い目です。` +
        `${params.location.mainFish[0]}・${params.location.mainFish[1]}が期待できます。` +
        `潮回りは${tideType}で、${tideType === "大潮" ? "潮の動きが大きく活性が上がりやすい日です。" : "安定した釣りができる日です。"}`
      : `${params.location.name}での釣りは、潮が動き始める時間帯を狙いましょう。`;

  return {
    location: params.location,
    date: params.date,
    tideType,
    points,
    marks,
    sunriseHour,
    sunsetHour,
    currentLevel,
    fishingScore: score,
    bestTimeStart: bestStart,
    bestTimeEnd: bestEnd,
    fishScores,
    aiComment,
  };
}

/* ══════════════════════════════════════════════════
   ヘルパー (外部利用可)
══════════════════════════════════════════════════ */

function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTideTime(mark: TideMark): string {
  return fmt(mark.hour, mark.minute);
}

export function hourToTimeStr(h: number): string {
  const hour = Math.floor(h);
  const min  = Math.round((h - hour) * 60);
  return fmt(hour === 24 ? 0 : hour, min);
}
