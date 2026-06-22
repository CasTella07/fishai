"use client";

import { useState } from "react";
import { TideGraph } from "@/components/TideGraph";
import type { TideData } from "@/lib/tideApi";

/* ── design tokens ── */
const C = {
  card:   "#0D1B2E",
  border: "rgba(255,255,255,0.08)",
  text1:  "#E2EAF4",
  text2:  "#8AA0B5",
  text3:  "#516070",
  cyan:   "#22D3EE",
  ocean:  "#0EA5E9",
  green:  "#10B981",
  amber:  "#F59E0B",
} as const;

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width={10} height={10} viewBox="0 0 24 24"
             fill={i <= count ? "#F59E0B" : "none"}
             stroke={i <= count ? "#F59E0B" : "rgba(255,255,255,.2)"}
             strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── 魚種スコア（serializableなprops用） ── */
export interface FishScoreSimple {
  name:     string;
  emoji:    string;
  stars:    number;
  bestTime: string;
  bestSpot: string;
}

/* ── エリアスコア（serializable） ── */
export interface SpotScoreSimple {
  name:  string;
  score: number;
}

export interface DetailSectionProps {
  tideData:      TideData;
  bwStartTime:   string;   // "05:00"
  bwEndTime:     string;   // "07:30"
  spotName:      string;
  weatherIcon:   string;
  weatherLabel:  string;
  tempC:         number;
  precipPct:     number;
  windDir:       string;
  windSpeedMs:   number;
  waveHeightM:   number;
  fishScores:    FishScoreSimple[];
  spotScores:    SpotScoreSimple[];
}

export function DetailSection(props: DetailSectionProps) {
  const [open, setOpen] = useState(false);
  const {
    tideData, bwStartTime, bwEndTime, spotName,
    weatherIcon, weatherLabel, tempC, precipPct,
    windDir, windSpeedMs, waveHeightM,
    fishScores,
  } = props;

  const waveOk  = waveHeightM <= 1.0;
  const windOk  = windSpeedMs <= 5;

  return (
    <div className="px-4 mb-5">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl"
        style={{
          background: C.card,
          border: `1px solid ${open ? C.ocean + "50" : C.border}`,
        }}
      >
        <span className="text-[13px] font-bold" style={{ color: open ? C.ocean : C.text1 }}>
          詳細を見る
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={open ? C.ocean : C.text3} strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="mt-2.5 flex flex-col gap-2.5">

          {/* タイドグラフ */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="px-4 pt-3.5 pb-2 text-[11px] font-bold" style={{ color: C.text3 }}>
              タイドグラフ
            </p>
            <TideGraph
              tideData={tideData}
              bestWindowStart={bwStartTime}
              bestWindowEnd={bwEndTime}
              spotName={spotName}
            />
          </div>

          {/* 天気 */}
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-[11px] font-bold mb-3" style={{ color: C.text3 }}>天気</p>
            <div className="flex items-center gap-4">
              <span className="text-[40px] leading-none">{weatherIcon}</span>
              <div>
                <p className="text-[16px] font-black text-white">{weatherLabel}</p>
                <p className="text-[13px] mt-0.5" style={{ color: C.text2 }}>{tempC}°C</p>
              </div>
              <div
                className="ml-auto px-3 py-2 rounded-xl text-right"
                style={{ background: "rgba(0,0,0,.2)" }}
              >
                <p className="text-[10px]" style={{ color: C.text3 }}>降水確率</p>
                <p
                  className="text-[16px] font-black"
                  style={{ color: precipPct >= 50 ? C.amber : C.text1 }}
                >
                  {precipPct}%
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 flex gap-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <div>
                <p className="text-[10px]" style={{ color: C.text3 }}>波高</p>
                <p
                  className="text-[14px] font-bold"
                  style={{ color: waveOk ? C.green : C.amber }}
                >
                  {waveHeightM.toFixed(1)}m
                </p>
              </div>
              <div>
                <p className="text-[10px]" style={{ color: C.text3 }}>風</p>
                <p
                  className="text-[14px] font-bold"
                  style={{ color: windOk ? C.green : C.amber }}
                >
                  {windDir} {windSpeedMs.toFixed(1)}m
                </p>
              </div>
            </div>
          </div>

          {/* 風 */}
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-[11px] font-bold mb-3" style={{ color: C.text3 }}>風</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[32px] leading-none">💨</span>
              <div>
                <p className="text-[18px] font-black" style={{ color: windOk ? C.green : C.amber }}>
                  {windDir}　{windSpeedMs.toFixed(1)} m/s
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: C.text2 }}>
                  {windSpeedMs <= 3
                    ? "弱風。キャストしやすい好条件"
                    : windSpeedMs <= 5
                    ? "やや風あり。ルアー操作は問題ない"
                    : windSpeedMs <= 8
                    ? "風強め。ライン管理に注意"
                    : "強風。釣行判断は慎重に"}
                </p>
              </div>
            </div>
            <div
              className="rounded-xl p-3 text-[11px] leading-relaxed"
              style={{ background: "rgba(0,0,0,.2)", color: C.text3 }}
            >
              波高 {waveHeightM.toFixed(1)}m —{" "}
              {waveHeightM <= 0.5
                ? "べた凪。サーフ・磯ともに快適"
                : waveHeightM <= 1.0
                ? "穏やか。サーフも問題なし"
                : waveHeightM <= 1.5
                ? "やや荒れ気味。初心者は港・河口へ"
                : "波高め。磯・サーフは要注意"}
            </div>
          </div>

          {/* 魚種別攻略 */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="px-4 pt-3.5 pb-2 text-[11px] font-bold" style={{ color: C.text3 }}>
              魚種別攻略
            </p>
            {fishScores.slice(0, 6).map((f, i) => (
              <div
                key={f.name}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i === 0 ? `1px solid ${C.border}` : `1px solid ${C.border}` }}
              >
                <span className="text-[20px] leading-none w-8 text-center flex-shrink-0">{f.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold" style={{ color: C.text1 }}>{f.name}</span>
                    <StarRow count={f.stars} />
                  </div>
                  <p className="text-[10px]" style={{ color: C.text3 }}>
                    {f.bestTime} · {f.bestSpot}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
