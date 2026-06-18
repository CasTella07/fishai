/**
 * lib/weather.ts — 釣り天気データ型 + Open-Meteo 実装
 *
 * 気温・降水確率・風速風向: Open-Meteo (https://open-meteo.com)
 * 波高:                   Open-Meteo Marine (https://marine-api.open-meteo.com)
 *
 * キャッシュ: Next.js fetch revalidate 1800秒（30分）
 * フォールバック: API失敗時は data/weatherData.ts のダミーデータを返す
 */

/* ── 型定義 ──────────────────────────────────────── */

export interface WeatherCurrent {
  condition:           string;   // "晴れ" | "曇り" | "雨" など
  conditionCode:       string;   // "sunny" | "p_cloudy" | "cloudy" | "rainy" | "night"
  temperature:         number;   // °C
  feelsLike:           number;   // °C (体感温度)
  precipProbability:   number;   // % (降水確率)
  windDirection:       string;   // "北東" など
  windSpeed:           number;   // m/s
  waveHeight:          number;   // m
  pressure:            number;   // hPa
}

export interface WeatherHour {
  time:              string;   // "05:00"
  condition:         string;
  conditionCode:     string;
  temperature:       number;   // °C
  precipProbability: number;   // %
  windDirection:     string;
  windSpeed:         number;   // m/s
  waveHeight:        number;   // m
}

export type FishingSafetyStatus = "快適" | "注意" | "危険";

export interface FishingWeatherSafety {
  status:       FishingSafetyStatus;
  reason:       string;
  bestHours:    string;   // "5:00〜10:00"
  captainNote:  string;
}

export interface FishingWeatherData {
  pointId: string;
  date:    string;
  current: WeatherCurrent;
  hourly:  WeatherHour[];
  safety:  FishingWeatherSafety;
}

/* ── WMO 天気コード変換 ──────────────────────────── */

const WMO_MAP: { max: number; condition: string; code: string }[] = [
  { max:  0, condition: "晴れ",       code: "sunny"    },
  { max:  2, condition: "晴れ時々曇り", code: "p_cloudy" },
  { max:  3, condition: "曇り",       code: "cloudy"   },
  { max: 49, condition: "霧",         code: "cloudy"   },
  { max: 59, condition: "霧雨",       code: "rainy"    },
  { max: 69, condition: "雨",         code: "rainy"    },
  { max: 79, condition: "雪",         code: "cloudy"   },
  { max: 84, condition: "にわか雨",   code: "rainy"    },
  { max: 99, condition: "雷雨",       code: "rainy"    },
];

function wmoToCondition(wmo: number, hour: number): { condition: string; conditionCode: string } {
  const entry = WMO_MAP.find((e) => wmo <= e.max) ?? WMO_MAP[WMO_MAP.length - 1];
  const night = hour < 5 || hour >= 19;
  const conditionCode =
    night && (entry.code === "sunny" || entry.code === "p_cloudy") ? "night" : entry.code;
  return { condition: entry.condition, conditionCode };
}

/* ── 風向き変換 ──────────────────────────────────── */

const DIR_16 = [
  "北", "北北東", "北東", "東北東", "東", "東南東", "南東", "南南東",
  "南", "南南西", "南西", "西南西", "西", "西北西", "北西", "北北西",
] as const;

function degToDir(deg: number): string {
  return DIR_16[Math.round(deg / 22.5) % 16];
}

/* ── 安全判定 ──────────────────────────────────── */

const HOURLY_SLOTS = [5, 8, 11, 14, 17, 20];

function computeSafety(
  current: WeatherCurrent,
  hourly: WeatherHour[],
): FishingWeatherSafety {
  const allWinds  = [current.windSpeed,  ...hourly.map((h) => h.windSpeed)];
  const allWaves  = [current.waveHeight, ...hourly.map((h) => h.waveHeight)];
  const allPrecip = [current.precipProbability, ...hourly.map((h) => h.precipProbability)];

  const maxWind   = Math.max(...allWinds);
  const maxWave   = Math.max(...allWaves);
  const maxPrecip = Math.max(...allPrecip);

  const status: FishingSafetyStatus =
    maxWind >= 10 || maxWave >= 2.0 || maxPrecip >= 80
      ? "危険"
      : maxWind >= 6 || maxWave >= 1.0 || maxPrecip >= 40
      ? "注意"
      : "快適";

  // スコアが最小 = 最も釣りやすい時間帯
  const scores = hourly.map((h) => h.windSpeed * 2 + h.waveHeight * 4 + h.precipProbability * 0.1);
  const minIdx = scores.indexOf(Math.min(...scores));
  const startH = hourly[minIdx];
  const endH   = hourly[Math.min(minIdx + 2, hourly.length - 1)];
  const bestHours = `${startH.time}〜${endH.time}`;

  let reason = "";
  if (status === "危険") {
    const parts: string[] = [];
    if (maxWind >= 10)   parts.push(`最大風速 ${maxWind.toFixed(1)}m/s の強風`);
    if (maxWave >= 2.0)  parts.push(`波高 ${maxWave.toFixed(1)}m の高波`);
    if (maxPrecip >= 80) parts.push(`降水確率 ${maxPrecip}%`);
    reason = parts.join("、") + "が予想されます。釣行を控えてください。";
  } else if (status === "注意") {
    const parts: string[] = [];
    if (maxWind >= 6)    parts.push(`最大風速 ${maxWind.toFixed(1)}m/s`);
    if (maxWave >= 1.0)  parts.push(`波高 ${maxWave.toFixed(1)}m`);
    if (maxPrecip >= 40) parts.push(`降水確率 ${maxPrecip}%`);
    reason = parts.join("・") + "に注意。天候の変化に備えてください。";
  } else {
    reason = `風速 ${current.windSpeed.toFixed(1)}m/s、波高 ${current.waveHeight.toFixed(1)}m。釣りに好適なコンディションです。`;
  }

  return { status, reason, bestHours, captainNote: "" };
}

/* ── 複数日まとめ取得 ────────────────────────────── */

export async function fetchFishingWeatherMultiDay(
  pointId: string,
  numDays = 5,
): Promise<FishingWeatherData[]> {
  try {
    const { TIDE_LOCATIONS } = await import("@/data/tideLocations");
    const loc = TIDE_LOCATIONS.find((l) => l.id === pointId);
    const lat = loc?.lat ?? 35.3317;
    const lng = loc?.lng ?? 139.4036;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code,apparent_temperature` +
      `&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=${numDays}`;

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${lat}&longitude=${lng}` +
      `&hourly=wave_height` +
      `&timezone=Asia%2FTokyo&forecast_days=${numDays}`;

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(marineUrl,  { next: { revalidate: 1800 } }),
    ]);

    if (!weatherRes.ok) throw new Error(`Open-Meteo ${weatherRes.status}`);

    const wx    = await weatherRes.json();
    const wave  = marineRes.ok ? await marineRes.json() : null;
    const waveH: number[] = wave?.hourly?.wave_height ?? [];

    const results: FishingWeatherData[] = [];
    const today = new Date();
    const todayJST = new Date(today.getTime() + 9 * 60 * 60 * 1000);

    for (let day = 0; day < numDays; day++) {
      const dateObj = new Date(todayJST);
      dateObj.setDate(dateObj.getDate() + day);
      const dateStr = dateObj.toISOString().split("T")[0];

      const base = day * 24;

      // Represent the day by hour 9 (9 AM)
      const repIdx = base + 9;
      const repCode = wx.hourly.weather_code[repIdx] ?? 0;
      const repHour = 9;
      const { condition, conditionCode } = wmoToCondition(repCode, repHour);

      const current: WeatherCurrent = {
        condition,
        conditionCode,
        temperature:       Math.round((wx.hourly.temperature_2m[repIdx] ?? 18) * 10) / 10,
        feelsLike:         Math.round((wx.hourly.apparent_temperature?.[repIdx] ?? wx.hourly.temperature_2m[repIdx] ?? 18) * 10) / 10,
        precipProbability: wx.hourly.precipitation_probability[repIdx] ?? 0,
        windDirection:     degToDir(wx.hourly.wind_direction_10m[repIdx] ?? 0),
        windSpeed:         Math.round((wx.hourly.wind_speed_10m[repIdx] ?? 0) * 10) / 10,
        waveHeight:        Math.round((waveH[repIdx] ?? 0) * 10) / 10,
        pressure:          1013,
      };

      const hourly: WeatherHour[] = HOURLY_SLOTS.map((h) => {
        const idx = base + h;
        const { condition: cond, conditionCode: ccode } = wmoToCondition(
          wx.hourly.weather_code[idx] ?? 0, h,
        );
        return {
          time:              `${String(h).padStart(2, "0")}:00`,
          condition:         cond,
          conditionCode:     ccode,
          temperature:       Math.round((wx.hourly.temperature_2m[idx] ?? 0) * 10) / 10,
          precipProbability: wx.hourly.precipitation_probability[idx] ?? 0,
          windDirection:     degToDir(wx.hourly.wind_direction_10m[idx] ?? 0),
          windSpeed:         Math.round((wx.hourly.wind_speed_10m[idx] ?? 0) * 10) / 10,
          waveHeight:        Math.round((waveH[idx] ?? current.waveHeight) * 10) / 10,
        };
      });

      const safety = computeSafety(current, hourly);
      results.push({ pointId, date: dateStr, current, hourly, safety });
    }

    return results;
  } catch (err) {
    console.error("[fetchFishingWeatherMultiDay] failed, generating per-day fallback:", err);
    // Fall back to individual calls for each day
    const today = new Date();
    const todayJST = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    return Promise.all(
      Array.from({ length: numDays }, (_, i) => {
        const d = new Date(todayJST);
        d.setDate(d.getDate() + i);
        return fetchFishingWeather(pointId, d.toISOString().split("T")[0]);
      }),
    );
  }
}

/* ── メイン関数 ──────────────────────────────────── */

export async function fetchFishingWeather(
  pointId: string,
  _date: string,
): Promise<FishingWeatherData> {
  try {
    // pointId → 緯度経度の解決
    const { TIDE_LOCATIONS } = await import("@/data/tideLocations");
    const loc = TIDE_LOCATIONS.find((l) => l.id === pointId);
    const lat = loc?.lat ?? 35.3317;
    const lng = loc?.lng ?? 139.4036;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code,surface_pressure` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code` +
      `&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=1`;

    const marineUrl =
      `https://marine-api.open-meteo.com/v1/marine` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=wave_height` +
      `&hourly=wave_height` +
      `&timezone=Asia%2FTokyo&forecast_days=1`;

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(marineUrl,  { next: { revalidate: 1800 } }),
    ]);

    if (!weatherRes.ok) throw new Error(`Open-Meteo ${weatherRes.status}`);

    const wx   = await weatherRes.json();
    const wave = marineRes.ok ? await marineRes.json() : null;

    /* current */
    const nowHour   = new Date().getHours();
    const c         = wx.current;
    const waveNow   = wave?.current?.wave_height ?? 0;
    const { condition, conditionCode } = wmoToCondition(c.weather_code, nowHour);

    const current: WeatherCurrent = {
      condition,
      conditionCode,
      temperature:       Math.round(c.temperature_2m * 10) / 10,
      feelsLike:         Math.round(c.apparent_temperature * 10) / 10,
      precipProbability: c.precipitation_probability ?? 0,
      windDirection:     degToDir(c.wind_direction_10m),
      windSpeed:         Math.round(c.wind_speed_10m * 10) / 10,
      waveHeight:        Math.round(waveNow * 10) / 10,
      pressure:          Math.round(c.surface_pressure ?? 1013),
    };

    /* hourly — 代表6スロット */
    const waveHourly: number[] = wave?.hourly?.wave_height ?? [];
    const hourly: WeatherHour[] = HOURLY_SLOTS.map((h) => {
      const { condition: cond, conditionCode: ccode } = wmoToCondition(wx.hourly.weather_code[h], h);
      return {
        time:              `${String(h).padStart(2, "0")}:00`,
        condition:         cond,
        conditionCode:     ccode,
        temperature:       Math.round((wx.hourly.temperature_2m[h] ?? 0) * 10) / 10,
        precipProbability: wx.hourly.precipitation_probability[h] ?? 0,
        windDirection:     degToDir(wx.hourly.wind_direction_10m[h] ?? 0),
        windSpeed:         Math.round((wx.hourly.wind_speed_10m[h] ?? 0) * 10) / 10,
        waveHeight:        Math.round((waveHourly[h] ?? waveNow) * 10) / 10,
      };
    });

    const safety = computeSafety(current, hourly);
    const today  = new Date().toISOString().split("T")[0];

    return { pointId, date: today, current, hourly, safety };

  } catch (err) {
    console.error("[fetchFishingWeather] API failed, falling back to mock:", err);
    const { FISHING_WEATHER_DATA } = await import("@/data/weatherData");
    return FISHING_WEATHER_DATA["chigasaki-surf"];
  }
}
