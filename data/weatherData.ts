/**
 * data/weatherData.ts — 釣り天気モックデータ（茅ヶ崎サーフ）
 * Replace fetchFishingWeather() in lib/weather.ts to connect a real API.
 */
import type { FishingWeatherData } from "@/lib/weather";

export const FISHING_WEATHER_DATA: Record<string, FishingWeatherData> = {
  "chigasaki-surf": {
    pointId: "chigasaki-surf",
    date: "mock",
    current: {
      condition:         "晴れ",
      conditionCode:     "sunny",
      temperature:       24,
      feelsLike:         26,
      precipProbability: 10,
      windDirection:     "北東",
      windSpeed:         2.1,
      waveHeight:        0.5,
      pressure:          1014,
    },
    hourly: [
      { time: "05:00", condition: "晴れ",       conditionCode: "sunny",    temperature: 21, precipProbability:  5, windDirection: "北東", windSpeed: 2.0, waveHeight: 0.4 },
      { time: "08:00", condition: "晴れ",       conditionCode: "sunny",    temperature: 23, precipProbability:  5, windDirection: "北東", windSpeed: 2.5, waveHeight: 0.4 },
      { time: "11:00", condition: "晴れ時々曇り", conditionCode: "p_cloudy", temperature: 26, precipProbability: 15, windDirection: "東",   windSpeed: 3.8, waveHeight: 0.6 },
      { time: "14:00", condition: "曇り時々晴れ", conditionCode: "p_cloudy", temperature: 27, precipProbability: 25, windDirection: "南西", windSpeed: 6.2, waveHeight: 1.0 },
      { time: "17:00", condition: "曇り",       conditionCode: "cloudy",   temperature: 25, precipProbability: 35, windDirection: "南西", windSpeed: 7.8, waveHeight: 1.3 },
      { time: "20:00", condition: "曇り",       conditionCode: "cloudy",   temperature: 22, precipProbability: 30, windDirection: "南西", windSpeed: 5.5, waveHeight: 1.1 },
    ],
    safety: {
      status:      "注意",
      reason:      "午後から南西風が強まり波も高くなります。早朝〜昼前がベスト。",
      bestHours:   "5:00〜11:00",
      captainNote: "朝イチの北東微風のうちに入るのがポイント。14時以降は波が1m超えるので無理しないで。",
    },
  },
};
