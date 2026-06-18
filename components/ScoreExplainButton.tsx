"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { ScoreBreakdown } from "@/lib/shonanForecast";

const C = {
  green: "#10B981",
  amber: "#F59E0B",
  red:   "#F06060",
  cyan:  "#22D3EE",
  card:  "#0D1B2E",
  page:  "#07111F",
  text1: "#E2EAF4",
  text2: "#8AA0B5",
  text3: "#516070",
  border: "rgba(255,255,255,0.09)",
} as const;

function gaugeColor(score: number): string {
  return score >= 75 ? C.green : score >= 55 ? C.amber : C.red;
}

/* ── ローディングドット ──── */
function Dots() {
  return (
    <div className="flex items-center gap-1.5 py-4 justify-center">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: C.cyan, animationDelay: `${d}ms` }}
        />
      ))}
      <span className="text-[13px] ml-1" style={{ color: C.text2 }}>AI が分析中...</span>
    </div>
  );
}

/* ── スコアゲージ SVG ──── */
function GaugeSvg({ score }: { score: number }) {
  const r    = 35;
  const circ = 2 * Math.PI * r;
  const color = gaugeColor(score);
  const dash  = (score / 100) * circ;
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" style={{ flexShrink: 0 }}>
      <circle cx="43" cy="43" r={r} fill="none"
              stroke="rgba(255,255,255,.07)" strokeWidth="5" />
      <circle cx="43" cy="43" r={r} fill="none"
              stroke={color} strokeWidth="5"
              strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
              strokeLinecap="round"
              transform="rotate(-90 43 43)" />
      <text x="43" y="40" textAnchor="middle" fontSize="21" fontWeight="900"
            fill={color} fontFamily="system-ui,-apple-system,sans-serif">
        {score}
      </text>
      <text x="43" y="54" textAnchor="middle" fontSize="8"
            fill="rgba(255,255,255,.3)" fontFamily="system-ui,-apple-system,sans-serif">
        /100
      </text>
    </svg>
  );
}

/* ── メインコンポーネント ──── */
export function ScoreExplainButton({
  score,
  goLabel,
  breakdown,
  spotId,
  spotName,
}: {
  score: number;
  goLabel: string;
  breakdown: ScoreBreakdown;
  spotId: string;
  spotName: string;
}) {
  const [mounted,     setMounted]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [showPulse,   setShowPulse]   = useState(true);

  useEffect(() => {
    setMounted(true);
    // 2 回パルスして消える（0.6s delay + 1s × 2 = 2.6s）
    const t = setTimeout(() => setShowPulse(false), 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleOpen() {
    setOpen(true);
    if (explanation !== null) return;
    setLoading(true);
    try {
      const res = await fetch("/api/score-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotName, goScore: score, goLabel, breakdown }),
      });
      const data = await res.json() as { explanation: string };
      setExplanation(data.explanation || "スコア根拠を取得できませんでした。");
    } catch {
      setExplanation("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  const color = gaugeColor(score);

  const modal = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-end"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full rounded-t-3xl pb-10 pt-5 px-5"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドル */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,.18)" }} />
        </div>

        {/* タイトル */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white font-black text-[17px]">スコア根拠</p>
            <p className="text-[12px] mt-0.5" style={{ color: C.text3 }}>
              {spotName} · {breakdown.isRealData ? "実データ" : "推定値"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,.07)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* スコア大表示 */}
        <div
          className="flex items-center gap-4 rounded-2xl px-4 py-4 mb-4"
          style={{ background: `${color}12`, border: `1px solid ${color}30` }}
        >
          <GaugeSvg score={score} />
          <div>
            <p className="text-[20px] font-black" style={{ color }}>{goLabel}</p>
            <p className="text-[12px] mt-1" style={{ color: C.text2 }}>総合スコア {score}/100</p>
          </div>
        </div>

        {/* 内訳 */}
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.text3 }}>
          内訳
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {[
            { label: "天気",   value: `${breakdown.weatherScore}/100`, sub: breakdown.factors[0]?.split(": ")[1]?.split(" →")[0] ?? "" },
            { label: "風",     value: `${breakdown.windScore}/100`,    sub: `${breakdown.windDir} ${breakdown.windSpeedMs}m/s` },
            { label: "波",     value: `${breakdown.waveScore}/100`,    sub: `${breakdown.waveHeightM}m` },
            { label: "潮汐",   value: `${breakdown.tideScore}/100`,    sub: breakdown.tideType },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl px-4 py-2.5"
              style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}
            >
              <div>
                <p className="text-[13px] font-semibold" style={{ color: C.text1 }}>{row.label}</p>
                {row.sub && <p className="text-[11px] mt-0.5" style={{ color: C.text3 }}>{row.sub}</p>}
              </div>
              <span className="font-black text-[15px]" style={{ color }}>{row.value}</span>
            </div>
          ))}
          {breakdown.terrainNote ? (
            <div
              className="rounded-xl px-4 py-2.5"
              style={{ background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.2)" }}
            >
              <p className="text-[11px] font-bold mb-0.5" style={{ color: C.cyan }}>地形補正</p>
              <p className="text-[12px]" style={{ color: C.text2 }}>{breakdown.terrainNote}</p>
            </div>
          ) : null}
        </div>

        {/* AI 説明 */}
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.text3 }}>
          AI 解説
        </p>
        <div
          className="rounded-2xl px-4 py-4 min-h-[72px] flex items-start"
          style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}
        >
          {loading ? (
            <Dots />
          ) : (
            <p className="text-[13px] leading-[1.85]" style={{ color: C.text2 }}>
              {explanation}
            </p>
          )}
        </div>

        {breakdown.precipPct > 0 && (
          <p className="text-[11px] mt-3 text-center" style={{ color: C.text3 }}>
            降水確率 {breakdown.precipPct}%
          </p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* パルスアニメーション定義 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes score-gauge-pulse {
          0%   { transform: scale(1);   opacity: 0.45; }
          100% { transform: scale(1.3); opacity: 0;    }
        }
        .score-pulse-ring {
          animation: score-gauge-pulse 1s ease-out 0.6s 2 forwards;
        }
      ` }} />

      <button
        onClick={handleOpen}
        className="flex flex-col items-center gap-2 rounded-2xl px-3 pt-3 pb-2.5
                   focus:outline-none active:scale-[.97] transition-transform"
        style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.09)",
          flexShrink: 0,
        }}
        aria-label={`スコア${score}点の根拠を見る`}
        title="タップしてスコア根拠を見る"
      >
        {/* ゲージ + パルスリング */}
        <div className="relative">
          <GaugeSvg score={score} />
          {mounted && showPulse && (
            <div
              className="score-pulse-ring absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `2px solid ${color}` }}
            />
          )}
        </div>

        {/* タップヒントラベル */}
        <span
          className="flex items-center gap-[3px] text-[10px] font-semibold"
          style={{ color: C.text3 }}
        >
          詳しく見る
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth={3}
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
