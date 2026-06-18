"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TIDE_LOCATIONS, CUSTOM_LOCATION } from "@/data/tideLocations";
import type { TideLocation } from "@/data/tideLocations";
import { fetchTideData, hourToTimeStr } from "@/lib/tideApi";
import type { TideData } from "@/lib/tideApi";
import { TideGraph } from "@/components/TideGraph";
import { BottomNav } from "@/components/BottomNav";

/* ─── ユーティリティ ─────────────────────────── */

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function fmtDateLabel(dateStr: string): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(y, m - 1, day).getDay()];
  return `${m}月${day}日（${w}）`;
}

type DateMode = "today" | "tomorrow" | "custom";

/* ─── PAGE ─────────────────────────────────── */

export default function TidePage() {
  /* ── State ── */
  const [locationId, setLocationId] = useState("enoshima");
  const [useCustomLoc, setUseCustomLoc] = useState(false);
  const [customLat, setCustomLat] = useState("35.30");
  const [customLng, setCustomLng] = useState("139.48");

  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [customDate, setCustomDate] = useState(todayStr());

  const [tideData, setTideData] = useState<TideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(12);

  /* ── 現在時刻をクライアントで取得 ── */
  useEffect(() => {
    const now = new Date();
    setCurrentHour(now.getHours() + now.getMinutes() / 60);
    const timer = setInterval(() => {
      const n = new Date();
      setCurrentHour(n.getHours() + n.getMinutes() / 60);
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  /* ── データ取得 ── */
  const load = useCallback(async () => {
    setLoading(true);
    const date =
      dateMode === "today"    ? todayStr()
      : dateMode === "tomorrow" ? tomorrowStr()
      : customDate || todayStr();

    const location: TideLocation = useCustomLoc
      ? { ...CUSTOM_LOCATION, lat: parseFloat(customLat) || 35.3, lng: parseFloat(customLng) || 139.48 }
      : (TIDE_LOCATIONS.find((l) => l.id === locationId) ?? TIDE_LOCATIONS[0]);

    const data = await fetchTideData({ lat: location.lat, lng: location.lng, date, location });
    setTideData(data);
    setLoading(false);
  }, [locationId, useCustomLoc, customLat, customLng, dateMode, customDate]);

  useEffect(() => { load(); }, [load]);

  /* ── 現在から次の満潮/干潮までの時間 ── */
  function nextMarkDiff(): string {
    if (!tideData) return "—";
    const upcoming = tideData.marks.find(
      (m) => m.hour + m.minute / 60 > currentHour
    );
    if (!upcoming) return "—";
    const diff = (upcoming.hour + upcoming.minute / 60) - currentHour;
    const hh = Math.floor(diff);
    const mm = Math.round((diff - hh) * 60);
    const label = upcoming.type === "high" ? "満潮" : "干潮";
    return `${label}まで約${hh > 0 ? `${hh}時間` : ""}${mm}分`;
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#080f1c" }}>

      {/* ── HEADER ── */}
      <header
        className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-white/8"
        style={{ background: "rgba(8,15,28,.98)" }}
      >
        <Link href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white/60 active:bg-white/8 transition-colors"
          style={{ background: "rgba(255,255,255,.06)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-white font-bold text-[16px] leading-tight">タイドグラフ</p>
          <p className="text-slate-500 text-[11px]">
            {tideData ? `${tideData.location.name} · ${fmtDateLabel(tideData.date)}` : "読み込み中..."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-500/15 border border-sky-500/25 rounded-full px-2.5 py-1">
          <span className="text-sky-400 text-[11px]">🌊</span>
          <span className="text-sky-400 text-[10px] font-bold">
            {tideData?.tideType ?? "—"}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-5 pt-5 pb-28 px-4">

        {/* ── LOCATION SELECTOR ── */}
        <section>
          <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2.5">エリア</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {TIDE_LOCATIONS.map((loc) => (
              <button key={loc.id}
                onClick={() => { setLocationId(loc.id); setUseCustomLoc(false); }}
                className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-[12px] font-bold transition-colors active:scale-95 ${
                  !useCustomLoc && locationId === loc.id
                    ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                    : "border-white/10 text-slate-400"
                }`}
                style={{ background: !useCustomLoc && locationId === loc.id ? undefined : "rgba(255,255,255,.05)" }}>
                {loc.name}
              </button>
            ))}
            <button
              onClick={() => setUseCustomLoc(true)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-[12px] font-bold transition-colors active:scale-95 ${
                useCustomLoc
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                  : "border-white/10 text-slate-400"
              }`}
              style={{ background: useCustomLoc ? undefined : "rgba(255,255,255,.05)" }}>
              📍 カスタム
            </button>
          </div>

          {/* カスタム入力 */}
          {useCustomLoc && (
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-2xl border border-white/10 px-3 py-2.5"
                   style={{ background: "#111827" }}>
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase mb-1">緯度</p>
                <input
                  type="number" step="0.001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-transparent text-white text-[14px] font-bold outline-none"
                  placeholder="35.302"
                />
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 px-3 py-2.5"
                   style={{ background: "#111827" }}>
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase mb-1">経度</p>
                <input
                  type="number" step="0.001"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full bg-transparent text-white text-[14px] font-bold outline-none"
                  placeholder="139.480"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── DATE SELECTOR ── */}
        <section>
          <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-2.5">日付</p>
          <div className="flex gap-2">
            {(["today", "tomorrow", "custom"] as DateMode[]).map((mode) => {
              const labels: Record<DateMode, string> = {
                today: "今日", tomorrow: "明日", custom: "日付指定",
              };
              return (
                <button key={mode}
                  onClick={() => setDateMode(mode)}
                  className={`flex-1 py-2.5 rounded-2xl border text-[12px] font-bold transition-colors active:scale-95 ${
                    dateMode === mode
                      ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                      : "border-white/10 text-slate-400"
                  }`}
                  style={{ background: dateMode === mode ? undefined : "rgba(255,255,255,.05)" }}>
                  {labels[mode]}
                </button>
              );
            })}
          </div>
          {dateMode === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 px-4 py-3 text-white text-[14px] font-bold outline-none"
              style={{ background: "#111827", colorScheme: "dark" }}
            />
          )}
        </section>

        {/* ── MAIN CARD ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-sky-500/30 border-t-sky-400 animate-spin" />
              <p className="text-slate-500 text-[13px]">潮汐データを取得中...</p>
            </div>
          </div>
        ) : tideData ? (
          <>
            {/* ── Score + Header ── */}
            <div className="rounded-3xl overflow-hidden border border-white/8" style={{ background: "#111827" }}>
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <p className="text-white/35 text-[9px] font-black tracking-[0.2em] uppercase">Tide & Conditions</p>
                  <p className="text-white font-bold text-[18px] leading-tight mt-0.5">
                    {tideData.location.name}
                  </p>
                  <p className="text-slate-500 text-[12px] mt-0.5">{fmtDateLabel(tideData.date)}</p>
                  {/* おすすめ時間帯バッジ */}
                  <div className="flex items-center gap-1.5 mt-2.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 w-fit">
                    <span className="text-amber-400 text-[11px]">⏰</span>
                    <span className="text-amber-300 text-[10px] font-bold">
                      おすすめ {hourToTimeStr(tideData.bestTimeStart)}〜{hourToTimeStr(tideData.bestTimeEnd)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">FishAI釣れる指数</p>
                  <p className="text-white font-black leading-none tracking-tighter mt-0.5"
                     style={{ fontSize: "48px" }}>
                    {tideData.fishingScore}
                    <span className="text-sky-400 font-black" style={{ fontSize: "20px" }}>%</span>
                  </p>
                  <span className="inline-flex items-center gap-1 bg-sky-500/15 border border-sky-500/20 rounded-full px-2 py-0.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span className="text-sky-400 text-[10px] font-bold">
                      {tideData.fishingScore >= 80 ? "絶好調" : tideData.fishingScore >= 60 ? "好調" : "普通"}
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Tide Graph ── */}
              <div className="px-2 pb-2">
                <TideGraph
                  tideData={tideData}
                  bestWindowStart={hourToTimeStr(tideData.bestTimeStart)}
                  bestWindowEnd={hourToTimeStr(tideData.bestTimeEnd)}
                />
              </div>

              {/* ── 満潮/干潮 times ── */}
              {(() => {
                const highs = tideData.marks.filter((m) => m.type === "high");
                const lows  = tideData.marks.filter((m) => m.type === "low");
                return (
                  <div className="grid grid-cols-2 border-t border-white/6">
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-7 h-7 rounded-full bg-sky-500/15 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sky-400 text-[13px] font-black">↑</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">満潮</p>
                        <p className="text-white font-bold text-[13px] leading-tight mt-0.5">
                          {highs.map((m) => `${String(m.hour).padStart(2,"0")}:${String(m.minute).padStart(2,"0")}`).join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3.5 border-l border-white/6">
                      <div className="w-7 h-7 rounded-full bg-slate-600/15 border border-slate-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-400 text-[13px] font-black">↓</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">干潮</p>
                        <p className="text-white font-bold text-[13px] leading-tight mt-0.5">
                          {lows.map((m) => `${String(m.hour).padStart(2,"0")}:${String(m.minute).padStart(2,"0")}`).join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── 現在の潮位 + 次の変化 ── */}
              <div className="grid grid-cols-2 border-t border-white/6">
                <div className="px-5 py-3.5">
                  <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">現在の潮位</p>
                  <p className="text-white font-black text-[24px] leading-tight mt-0.5">
                    {tideData.currentLevel}
                    <span className="text-slate-500 text-[12px] font-bold ml-1">/ 100</span>
                  </p>
                </div>
                <div className="px-5 py-3.5 border-l border-white/6">
                  <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">次の変化</p>
                  <p className="text-white font-bold text-[13px] leading-tight mt-0.5">{nextMarkDiff()}</p>
                </div>
              </div>

              {/* ── AI Comment ── */}
              <div className="mx-4 mb-4 rounded-2xl border border-sky-500/20 px-4 py-3.5 border-t-0"
                   style={{ background: "rgba(14,165,233,.07)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-sky-500/20 flex items-center justify-center">
                    <span className="text-sky-400 text-[8px] font-black">AI</span>
                  </div>
                  <span className="text-sky-400 text-[10px] font-black tracking-wide uppercase">AI予報コメント</span>
                </div>
                <p className="text-white/80 text-[13px] leading-relaxed">{tideData.aiComment}</p>
              </div>
            </div>

            {/* ── Fish Scores ── */}
            <div className="rounded-3xl border border-white/8 px-5 py-4" style={{ background: "#111827" }}>
              <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-4">魚種別おすすめ度</p>
              <div className="flex flex-col gap-4">
                {tideData.fishScores.map((f) => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-[14px]">{f.name}</span>
                      <Stars count={f.stars} />
                    </div>
                    <p className="text-slate-500 text-[11px]">{f.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Location Description ── */}
            <div className="rounded-3xl border border-white/8 px-5 py-4" style={{ background: "#111827" }}>
              <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-2">エリア情報</p>
              <p className="text-white font-bold text-[15px]">{tideData.location.name}</p>
              <p className="text-slate-400 text-[13px] mt-1 leading-relaxed">{tideData.location.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tideData.location.mainFish.map((fish) => (
                  <span key={fish}
                    className="text-[11px] font-semibold text-slate-400 bg-white/6 border border-white/10 px-2.5 py-1 rounded-full">
                    {fish}
                  </span>
                ))}
              </div>
            </div>

            {/* ── AI Chat CTA ── */}
            <Link href="/ai-chat"
              className="flex items-center justify-center gap-2 rounded-3xl py-4 border border-sky-500/25 text-sky-400 font-bold text-[14px] active:bg-sky-500/15 transition-colors"
              style={{ background: "rgba(14,165,233,.07)" }}>
              🤖 この条件でAIに釣りを相談する
            </Link>
          </>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
}

/* ─── SUBCOMPONENTS ─────────────────────────── */

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`text-[14px] leading-none ${i < count ? "text-amber-400" : "text-slate-700"}`}>
          {i < count ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

