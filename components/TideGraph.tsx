"use client";

import { useState, useEffect } from "react";
import type { TideData } from "@/lib/tideApi";

interface TideGraphProps {
  tideData: TideData;
  /** "05:00" 形式 — forecast の bestWindow と連動 */
  bestWindowStart?: string;
  bestWindowEnd?: string;
  spotName?: string;
}

/* ── SVG 座標定数 ─────────────────────────── */
const W = 360, H = 165;
const PT = 22, PB = 28, PL = 4, PR = 4;
const PW = W - PL - PR; // 352
const PH = H - PT - PB; // 115

function toX(hour: number) { return PL + (hour / 24) * PW; }
function toY(level: number) { return PT + PH - (level / 100) * PH; }
function rv(n: number) { return n.toFixed(1); }
function timeToHour(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

/* Catmull-Rom → cubic bezier for smooth curve */
function smooth(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M${rv(pts[0][0])},${rv(pts[0][1])}`];
  const T = 1 / 6;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d.push(
      `C${rv(p1[0] + (p2[0] - p0[0]) * T)},${rv(p1[1] + (p2[1] - p0[1]) * T)},` +
      `${rv(p2[0] - (p3[0] - p1[0]) * T)},${rv(p2[1] - (p3[1] - p1[1]) * T)},` +
      `${rv(p2[0])},${rv(p2[1])}`
    );
  }
  return d.join("");
}

const TIDE_COLOR: Record<string, string> = {
  大潮: "#0ea5e9", 中潮: "#22d3ee", 小潮: "#94a3b8", 長潮: "#64748b", 若潮: "#818cf8",
};
const TIDE_BG: Record<string, string> = {
  大潮: "rgba(14,165,233,.15)", 中潮: "rgba(34,211,238,.12)",
  小潮: "rgba(148,163,184,.12)", 長潮: "rgba(100,116,139,.1)", 若潮: "rgba(129,140,248,.12)",
};

function fmtHM(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m === 60 ? 0 : m).padStart(2, "0")}`;
}
function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return fmtHM(hh, mm);
}

/* ── Component ──────────────────────────────── */
export function TideGraph({ tideData, bestWindowStart, bestWindowEnd, spotName }: TideGraphProps) {
  const [nowHour, setNowHour] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNowHour(n.getHours() + n.getMinutes() / 60);
    };
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, []);

  const { points, marks, sunriseHour, sunsetHour, tideType } = tideData;
  const svgPts: [number, number][] = points.map((p) => [toX(p.hour), toY(p.level)]);
  const linePath = smooth(svgPts);
  const bottomY = rv(PT + PH);
  const fillPath = `${linePath} L${rv(svgPts[svgPts.length - 1][0])},${bottomY} L${rv(svgPts[0][0])},${bottomY} Z`;

  const bwS = bestWindowStart ? timeToHour(bestWindowStart) : null;
  const bwE = bestWindowEnd   ? timeToHour(bestWindowEnd)   : null;

  const nowX = nowHour !== null ? toX(Math.min(nowHour, 24)) : null;
  const nowLevel = nowHour !== null ? (() => {
    const idx = Math.min(Math.floor(nowHour), 23);
    const f   = Math.min(nowHour - idx, 1);
    const l0  = points[idx]?.level ?? 50;
    const l1  = points[Math.min(idx + 1, 24)]?.level ?? 50;
    return l0 + (l1 - l0) * f;
  })() : null;

  const tc = TIDE_COLOR[tideType] ?? "#0ea5e9";
  const tb = TIDE_BG[tideType]  ?? "rgba(14,165,233,.15)";
  const highMarks = marks.filter((m) => m.type === "high");
  const lowMarks  = marks.filter((m) => m.type === "low");

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-white">{spotName ?? tideData.location.name}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: tc, background: tb }}
          >
            {tideType}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px]" style={{ color: "#64748b" }}>現在 </span>
          <span className="text-[16px] font-black num-tab" style={{ color: tc }}>
            {nowLevel !== null ? Math.round(nowLevel) : "—"}
          </span>
          <span className="text-[10px]" style={{ color: "#64748b" }}>/100</span>
        </div>
      </div>

      {/* SVG Graph */}
      <div className="px-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ height: "auto", display: "block" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="tg-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={tc} stopOpacity="0.28" />
              <stop offset="88%" stopColor={tc} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="tg-best" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
            <clipPath id="tg-clip">
              <rect x={PL} y={PT} width={PW} height={PH} />
            </clipPath>
          </defs>

          {/* Subtle grid */}
          {[25, 50, 75].map((lv) => (
            <line key={lv}
              x1={PL} y1={toY(lv)} x2={PL + PW} y2={toY(lv)}
              stroke="rgba(255,255,255,.04)" strokeWidth="1"
            />
          ))}

          {/* Best time band */}
          {bwS !== null && bwE !== null && (
            <>
              <rect x={toX(bwS)} y={PT} width={toX(bwE) - toX(bwS)} height={PH}
                fill="url(#tg-best)" clipPath="url(#tg-clip)" />
              <line x1={toX(bwS)} y1={PT} x2={toX(bwS)} y2={PT + PH}
                stroke="#10b981" strokeWidth="1.5" opacity="0.55" />
              <line x1={toX(bwE)} y1={PT} x2={toX(bwE)} y2={PT + PH}
                stroke="#10b981" strokeWidth="1.5" opacity="0.55" />
              <text x={toX((bwS + bwE) / 2)} y={PT + PH - 8}
                textAnchor="middle" fontSize="8" fill="#10b981" opacity="0.85">
                おすすめ
              </text>
            </>
          )}

          {/* Sunrise / Sunset lines */}
          <line x1={toX(sunriseHour)} y1={PT} x2={toX(sunriseHour)} y2={PT + PH}
            stroke="#f59e0b" strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />
          <line x1={toX(sunsetHour)} y1={PT} x2={toX(sunsetHour)} y2={PT + PH}
            stroke="#f97316" strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />

          {/* Tide fill + stroke */}
          <path d={fillPath} fill="url(#tg-fill)" clipPath="url(#tg-clip)" />
          <path d={linePath} fill="none" stroke={tc} strokeWidth="1.5"
            strokeLinejoin="round" strokeLinecap="round" clipPath="url(#tg-clip)" />

          {/* High tide markers */}
          {highMarks.map((m, i) => {
            const x = toX(m.hour + m.minute / 60);
            const y = toY(m.level);
            const below = y < PT + 22;
            return (
              <g key={`hi-${i}`}>
                <circle cx={x} cy={y} r="3.5" fill={tc} />
                <text x={x} y={below ? y + 14 : y - 6} textAnchor="middle" fontSize="8" fill={tc} fontWeight="600">
                  {fmtHM(m.hour, m.minute)}
                </text>
                <text x={x} y={below ? y + 23 : y - 15} textAnchor="middle" fontSize="7" fill={tc} opacity="0.65">満潮</text>
              </g>
            );
          })}

          {/* Low tide markers */}
          {lowMarks.map((m, i) => {
            const x = toX(m.hour + m.minute / 60);
            const y = toY(m.level);
            const above = y > PT + PH - 22;
            return (
              <g key={`lo-${i}`}>
                <circle cx={x} cy={y} r="3" fill="#475569" />
                <text x={x} y={above ? y - 8 : y + 13} textAnchor="middle" fontSize="7.5" fill="#64748b">
                  {fmtHM(m.hour, m.minute)}
                </text>
                <text x={x} y={above ? y - 17 : y + 21} textAnchor="middle" fontSize="7" fill="#475569">干潮</text>
              </g>
            );
          })}

          {/* Current time indicator (client-only after hydration) */}
          {nowX !== null && nowLevel !== null && nowHour !== null && nowHour <= 23.9 && (
            <g>
              <line x1={nowX} y1={PT} x2={nowX} y2={PT + PH}
                stroke="rgba(255,255,255,.65)" strokeWidth="1.5" strokeDasharray="3 2.5" />
              <circle cx={nowX} cy={toY(nowLevel)} r="4.5" fill="white" opacity="0.9" />
              <text x={nowX} y={PT - 2} textAnchor="middle" fontSize="7" fill="white" opacity="0.75">
                NOW
              </text>
            </g>
          )}

          {/* Time axis */}
          {[0, 6, 12, 18, 24].map((h) => (
            <g key={h}>
              <line x1={toX(h)} y1={PT + PH} x2={toX(h)} y2={PT + PH + 4}
                stroke="rgba(255,255,255,.18)" strokeWidth="1" />
              <text x={toX(h)} y={H - 10} textAnchor="middle" fontSize="9" fill="#64748b">
                {h === 0 || h === 24 ? `${h}` : `${h}時`}
              </text>
            </g>
          ))}

          {/* Sunrise icon: half-circle + horizon */}
          <g transform={`translate(${toX(sunriseHour)}, ${H - 8})`} opacity="0.8">
            <line x1="-5.5" y1="2" x2="5.5" y2="2" stroke="#f59e0b" strokeWidth="0.9" />
            <path d="M-4 2 A4 4 0 0 1 4 2" stroke="#f59e0b" fill="none" strokeWidth="0.9" />
            <line x1="0" y1="-5" x2="0" y2="-3.5" stroke="#f59e0b" strokeWidth="0.9" />
            <line x1="3.2" y1="-3.2" x2="4.2" y2="-4.2" stroke="#f59e0b" strokeWidth="0.9" />
            <line x1="-3.2" y1="-3.2" x2="-4.2" y2="-4.2" stroke="#f59e0b" strokeWidth="0.9" />
          </g>
          {/* Sunset icon: half-circle + horizon, sun lower */}
          <g transform={`translate(${toX(sunsetHour)}, ${H - 8})`} opacity="0.75">
            <line x1="-5.5" y1="2" x2="5.5" y2="2" stroke="#f97316" strokeWidth="0.9" />
            <path d="M-4 2 A4 4 0 0 1 4 2" stroke="#f97316" fill="none" strokeWidth="0.9" />
          </g>
        </svg>
      </div>

      {/* Footer: sunrise/sunset + high/low times */}
      <div
        className="mx-4 mb-4 mt-1 flex items-center justify-between rounded-2xl px-3 py-2.5"
        style={{ background: "rgba(255,255,255,.04)" }}
      >
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1" style={{ color: "#f59e0b" }}>
            <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
              <line x1="0.5" y1="7" x2="10.5" y2="7" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
              <path d="M1.5 7 A4 4 0 0 1 9.5 7" stroke="#f59e0b" fill="none" strokeWidth="1" strokeLinecap="round" />
              <line x1="5.5" y1="0.5" x2="5.5" y2="2.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
              <line x1="8.5" y1="2.5" x2="7.3" y2="3.7" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
              <line x1="2.5" y1="2.5" x2="3.7" y2="3.7" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {fmtHour(sunriseHour)}
          </span>
          <span className="flex items-center gap-1" style={{ color: "#f97316" }}>
            <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
              <line x1="0.5" y1="7" x2="10.5" y2="7" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
              <path d="M1.5 7 A4 4 0 0 1 9.5 7" stroke="#f97316" fill="none" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {fmtHour(sunsetHour)}
          </span>
        </div>
        <div className="flex gap-2.5 text-[11px]">
          {highMarks.slice(0, 2).map((m, i) => (
            <span key={i} style={{ color: tc }}>
              満 {fmtHM(m.hour, m.minute)}
            </span>
          ))}
          {lowMarks.slice(0, 1).map((m, i) => (
            <span key={i} style={{ color: "#64748b" }}>
              干 {fmtHM(m.hour, m.minute)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
