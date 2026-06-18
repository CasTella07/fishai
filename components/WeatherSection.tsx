"use client";

import type { FishingWeatherData, WeatherHour, FishingSafetyStatus } from "@/lib/weather";

/* ── Design tokens ── */
const C = {
  card:   "#0D1B2E",
  border: "rgba(255,255,255,0.09)",
  text1:  "#E2EAF4",
  text2:  "#8AA0B5",
  text3:  "#516070",
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#F06060",
} as const;

const SAFETY_COLOR: Record<FishingSafetyStatus, string> = {
  快適: C.green, 注意: C.amber, 危険: C.red,
};

/* ── SVG Icons ─────────────────────────────────── */
function IconSun({ size = 24, color = "#F59E0B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon({ size = 24, color = "#94a3b8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function IconPartlyCloudy({ size = 24, color = "#8AA0B5" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 18H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" stroke={color} />
      <circle cx="17" cy="9" r="2.5" stroke="#F59E0B" />
      <path d="M17 5v1M17 14v-1M21 9h-1M13 9h1M19.5 6.5l-.7.7M14.5 11.5l.7-.7M14.5 6.5l.7.7M19.5 11.5l-.7-.7"
            stroke="#F59E0B" strokeOpacity={0.8} />
    </svg>
  );
}

function IconCloud({ size = 24, color = "#64748b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function IconCloudRain({ size = 24, color = "#60a5fa" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 17H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <path d="M11 13v4M15 13v4" />
    </svg>
  );
}

function IconDroplet({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 11 5 14.5 5 17a7 7 0 0 0 14 0c0-2.5-1.5-6-7-15Z" />
    </svg>
  );
}

function IconWaves({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8c1-.8 2-1 3-1s2 .2 3 1 2 1 3 1 2-.2 3-1 2-1 3-1" />
      <path d="M2 14c1-.8 2-1 3-1s2 .2 3 1 2 1 3 1 2-.2 3-1 2-1 3-1" />
      <path d="M2 20c1-.8 2-1 3-1s2 .2 3 1 2 1 3 1 2-.2 3-1 2-1 3-1" />
    </svg>
  );
}

function IconBarometer({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="6" />
      <path d="M12 8V4M7 4h10" />
      <path d="M12 14l2.5-3.5" />
      <circle cx="12" cy="14" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

/* ── Wind direction → rotation degrees ── */
function windDirDeg(dir: string): number {
  const map: Record<string, number> = {
    "北": 0,   "北北東": 23,  "北東": 45,  "東北東": 68,
    "東": 90,  "東南東": 113, "南東": 135, "南南東": 158,
    "南": 180, "南南西": 203, "南西": 225, "西南西": 248,
    "西": 270, "西北西": 293, "北西": 315, "北北西": 338, "凪": 0,
  };
  return map[dir] ?? 0;
}

function windColor(s: number): string {
  return s >= 7 ? C.red : s >= 3.5 ? C.amber : C.green;
}
function waveColor(h: number): string {
  return h >= 1.0 ? C.red : h >= 0.5 ? C.amber : C.green;
}
function precipColor(p: number): string {
  return p >= 50 ? C.red : p >= 20 ? C.amber : C.text2;
}

/* ── Condition icon dispatcher ── */
function ConditionIcon({ code, timeStr, size = 32 }: {
  code: string; timeStr?: string; size?: number;
}) {
  const h = timeStr ? parseInt(timeStr) : 12;
  const night = h < 5 || h >= 19;
  if (night && (code === "sunny" || code === "p_cloudy")) return <IconMoon size={size} />;
  if (code === "sunny")    return <IconSun size={size} />;
  if (code === "p_cloudy") return <IconPartlyCloudy size={size} />;
  if (code === "rainy")    return <IconCloudRain size={size} />;
  return <IconCloud size={size} />;
}

/* ── Metric cell (2×2 grid) ── */
function MetricCell({
  label, value, color, icon,
}: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl px-3 py-3 flex items-center gap-2.5"
         style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex-shrink-0" style={{ color: "rgba(255,255,255,.28)" }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-medium mb-0.5" style={{ color: C.text3 }}>{label}</p>
        <p className="text-[12px] font-bold leading-tight" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Wind cell with rotating arrow ── */
function WindCell({ direction, speed, color }: { direction: string; speed: number; color: string }) {
  const deg = windDirDeg(direction);
  return (
    <div className="rounded-xl px-3 py-3 flex items-center gap-2.5"
         style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex-shrink-0" style={{ transform: `rotate(${deg}deg)`, color }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="4" />
          <polyline points="8 8 12 4 16 8" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-medium mb-0.5" style={{ color: C.text3 }}>風速</p>
        <p className="text-[12px] font-bold leading-tight" style={{ color }}>
          {direction} {speed}m/s
        </p>
      </div>
    </div>
  );
}

/* ── Hourly card ── */
function HourlyWeatherCard({ h }: { h: WeatherHour }) {
  const wc  = windColor(h.windSpeed);
  const wvc = waveColor(h.waveHeight);
  const deg = windDirDeg(h.windDirection);
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-xl px-2.5 pt-2.5 pb-3"
         style={{ width: 68, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}>
      <p className="text-[10px] font-semibold leading-none num-tab" style={{ color: C.text3 }}>
        {h.time}
      </p>
      <ConditionIcon code={h.conditionCode} timeStr={h.time.split(":")[0]} size={20} />
      <p className="text-[14px] font-bold leading-none num-tab" style={{ color: C.text1 }}>
        {h.temperature}°
      </p>
      <div className="flex items-center gap-0.5">
        <div style={{ transform: `rotate(${deg}deg)`, display: "inline-flex" }}>
          <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
               stroke={wc} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="4" />
            <polyline points="8 8 12 4 16 8" />
          </svg>
        </div>
        <p className="text-[9px] font-semibold leading-none" style={{ color: wc }}>
          {h.windSpeed}m
        </p>
      </div>
      <p className="text-[9px] font-semibold leading-none" style={{ color: wvc }}>
        波{h.waveHeight}m
      </p>
    </div>
  );
}

/* ── Main export ── */
export function WeatherSection({ data }: { data: FishingWeatherData }) {
  const { current: wx, hourly, safety } = data;
  const safetyColor = SAFETY_COLOR[safety.status];
  const wc  = windColor(wx.windSpeed);
  const wvc = waveColor(wx.waveHeight);
  const pc  = precipColor(wx.precipProbability);

  // 日中の最高/最低気温をhourlyから算出
  const temps = hourly.map((h) => h.temperature);
  const maxTemp = temps.length ? Math.max(...temps) : wx.temperature;
  const minTemp = temps.length ? Math.min(...temps) : wx.temperature;
  const maxPrecip = hourly.length
    ? Math.max(wx.precipProbability, ...hourly.map((h) => h.precipProbability))
    : wx.precipProbability;

  return (
    <div className="px-4 mb-5">
      <div className="rounded-2xl overflow-hidden"
           style={{ background: C.card, border: `1px solid ${C.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3"
             style={{ borderBottom: `1px solid ${C.border}` }}>
          <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>釣り天気</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: safetyColor }} />
            <span className="text-[11px] font-bold" style={{ color: safetyColor }}>{safety.status}</span>
          </div>
        </div>

        {/* Current */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ConditionIcon code={wx.conditionCode} size={36} />
              <div>
                <p className="text-[15px] font-bold" style={{ color: C.text1 }}>{wx.condition}</p>
                <p className="text-[11px] mt-0.5" style={{ color: C.text3 }}>体感 {wx.feelsLike}°C</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-start">
                <span className="num-tab font-black text-[40px] leading-none" style={{ color: C.text1 }}>
                  {wx.temperature}
                </span>
                <span className="text-[15px] font-bold mt-1 ml-0.5" style={{ color: C.text3 }}>°C</span>
              </div>
              {/* 最高/最低気温 */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold num-tab" style={{ color: "#F06060" }}>
                  ↑{maxTemp}°
                </span>
                <span className="text-[11px] font-bold num-tab" style={{ color: "#60a5fa" }}>
                  ↓{minTemp}°
                </span>
                {maxPrecip > 0 && (
                  <span className="text-[11px] font-bold num-tab" style={{ color: precipColor(maxPrecip) }}>
                    💧{maxPrecip}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3-col key metrics */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <WindCell direction={wx.windDirection} speed={wx.windSpeed} color={wc} />
            <MetricCell label="波高" value={`${wx.waveHeight}m`} color={wvc}
                        icon={<IconWaves size={14} />} />
            <MetricCell label="降水確率" value={`${maxPrecip}%`} color={pc}
                        icon={<IconDroplet size={14} />} />
          </div>
        </div>

        {/* Hourly */}
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="px-4 pt-2.5 pb-2 text-[9px] font-bold uppercase tracking-[0.1em]"
             style={{ color: C.text3 }}>
            時間別予報
          </p>
          <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {hourly.map((h) => <HourlyWeatherCard key={h.time} h={h} />)}
          </div>
        </div>

        {/* Safety note */}
        <div className="mx-4 mb-4 rounded-xl px-3.5 py-3"
             style={{ background: `${safetyColor}10`, border: `1px solid ${safetyColor}30` }}>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
                  style={{ background: safetyColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] leading-relaxed" style={{ color: safetyColor }}>
                {safety.reason}
              </p>
              {safety.bestHours && (
                <p className="text-[11px] mt-1.5" style={{ color: C.text2 }}>
                  おすすめ時間帯:{" "}
                  <span className="font-bold" style={{ color: C.text1 }}>{safety.bestHours}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
