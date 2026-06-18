"use client";

import { useState } from "react";
import type { DailyForecast } from "@/lib/shonanForecast";
import type { TideData } from "@/lib/tideApi";
import type { FishingWeatherData } from "@/lib/weather";
import type { PlanData } from "@/components/TodayPlanButton";
import { TideGraph } from "@/components/TideGraph";
import { WeatherSection } from "@/components/WeatherSection";
import { ScoreExplainButton } from "@/components/ScoreExplainButton";
import { TodayPlanButton } from "@/components/TodayPlanButton";

/* ── Design tokens ── */
const C = {
  page:    "#07111F",
  card:    "#0D1B2E",
  border:  "rgba(255,255,255,0.09)",
  borderM: "rgba(255,255,255,0.14)",
  text1:   "#E2EAF4",
  text2:   "#8AA0B5",
  text3:   "#516070",
  cyan:    "#22D3EE",
  ocean:   "#0EA5E9",
  green:   "#10B981",
  amber:   "#F59E0B",
  red:     "#F06060",
} as const;

function scoreColor(s: number): string {
  return s >= 80 ? C.green : s >= 65 ? C.ocean : s >= 48 ? C.amber : C.text3;
}

function dayLabel(date: string, idx: number): { short: string; dateStr: string } {
  const [y, m, d] = date.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(y, m - 1, d).getDay()];
  const dateStr = `${m}/${d}`;
  const short = idx === 0 ? "今日" : idx === 1 ? "明日" : idx === 2 ? "明後日" : `${dateStr}(${w})`;
  return { short, dateStr };
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
             fill={i <= count ? C.amber : "none"}
             stroke={i <= count ? C.amber : "rgba(255,255,255,.18)"}
             strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── Data type passed from server ── */
export interface DayCarouselData {
  date: string;
  fc: DailyForecast;
  tideData: TideData;
  weatherData: FishingWeatherData;
  planData?: PlanData;
}

/* ── Date chip tab ── */
function ChipTab({
  date,
  idx,
  selected,
  goScore,
  goLabel,
  onSelect,
}: {
  date: string;
  idx: number;
  selected: boolean;
  goScore: number;
  goLabel: string;
  onSelect: () => void;
}) {
  const { short, dateStr } = dayLabel(date, idx);
  const color = scoreColor(goScore);
  return (
    <button
      onClick={onSelect}
      className="flex-shrink-0 flex flex-col items-center gap-0.5 rounded-xl px-3 py-2
                 focus:outline-none active:scale-[.97] transition-transform"
      style={{
        background: selected ? `${color}18` : "rgba(255,255,255,.04)",
        border: selected ? `1px solid ${color}50` : "1px solid rgba(255,255,255,.08)",
        minWidth: 56,
      }}
    >
      <span className="text-[12px] font-bold leading-none" style={{ color: selected ? color : C.text2 }}>
        {short}
      </span>
      {idx >= 3 ? null : (
        <span className="text-[9px] leading-none mt-0.5" style={{ color: C.text3 }}>{dateStr}</span>
      )}
      <span className="text-[10px] font-black leading-none mt-1 num-tab" style={{ color }}>
        {goScore}
      </span>
    </button>
  );
}

/* ── Main export ── */
export function DayForecastCarousel({
  days,
  spotId,
  spotName,
}: {
  days: DayCarouselData[];
  spotId: string;
  spotName: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const day = days[selectedIdx] ?? days[0];
  const { fc, tideData, weatherData, planData } = day;
  const bw0 = fc.bestWindows[0];
  const { decision } = fc;
  const topFish = fc.fishScores[0];
  const topSpot = fc.spotScores[0];
  const isToday = selectedIdx === 0;

  return (
    <>
      {/* ── Day chip tabs ── */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide">
        {days.map((d, i) => (
          <ChipTab
            key={d.date}
            date={d.date}
            idx={i}
            selected={selectedIdx === i}
            goScore={d.fc.goScore}
            goLabel={d.fc.goLabel}
            onSelect={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      {/* ── Tide graph ── */}
      <section className="px-4 pt-2 pb-1">
        <TideGraph
          tideData={tideData}
          bestWindowStart={bw0.startTime}
          bestWindowEnd={bw0.endTime}
          spotName={spotName}
        />
      </section>

      {/* ── Weather section ── */}
      <WeatherSection data={weatherData} />

      {/* ── Conclusion card ── */}
      <section className="px-4 py-2">
        <div
          className="rounded-2xl px-5 pt-5 pb-4"
          style={{ background: C.card, border: `1px solid ${C.borderM}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: C.text3 }}>
              {isToday ? "今日の行くべき度" : "この日の行くべき度"}
            </span>
            <StarRow count={fc.goStars} />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <ScoreExplainButton
              score={fc.goScore}
              goLabel={fc.goLabel}
              breakdown={fc.scoreBreakdown}
              spotId={spotId}
              spotName={spotName}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-black leading-tight text-white">{decision.type}</p>
              <p className="text-[12px] mt-1 leading-snug" style={{ color: C.text2 }}>
                {decision.reason}
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-0 pt-3.5"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[9px] mb-0.5" style={{ color: C.text3 }}>時間</p>
              <p className="text-[13px] font-bold" style={{ color: C.cyan }}>
                {bw0.startTime}〜{bw0.endTime}
              </p>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: C.border, margin: "0 12px" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] mb-0.5" style={{ color: C.text3 }}>ポイント</p>
              <p className="text-[13px] font-semibold truncate" style={{ color: C.text1 }}>
                {topSpot.spot.name}
              </p>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: C.border, margin: "0 12px" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] mb-0.5" style={{ color: C.text3 }}>狙い</p>
              <p className="text-[13px] font-semibold" style={{ color: C.text1 }}>
                {topFish.fish.emoji} {topFish.fish.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan button (today only) ── */}
      {isToday && planData && (
        <div className="px-4 pt-1 pb-4">
          <TodayPlanButton plan={planData} />
        </div>
      )}
      {!isToday && (
        <div className="px-4 pt-1 pb-4">
          <div
            className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-[12px]" style={{ color: C.text2 }}>
              {fc.captainComment}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
