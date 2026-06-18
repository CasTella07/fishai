"use client";

import Link from "next/link";
import { useState } from "react";
import { SPOT_DETAILS, CROWD_COLOR } from "@/data/spotDetails";
import type { SpotDetail } from "@/data/spotDetails";
import { BottomNav } from "@/components/BottomNav";

export default function SpotsPage() {
  const [selectedId, setSelectedId] = useState<string>(SPOT_DETAILS[0].id);
  const spot = SPOT_DETAILS.find((s) => s.id === selectedId) ?? SPOT_DETAILS[0];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#080f1c" }}>

      {/* HEADER */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 sticky top-0 z-40"
              style={{ background: "rgba(8,15,28,.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <Link href="/"
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
              style={{ background: "rgba(255,255,255,.06)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-white font-bold text-[16px] leading-tight">ポイント情報</p>
          <p className="text-slate-500 text-[11px]">湘南5大ポイントの実用情報</p>
        </div>
      </header>

      <div className="flex flex-col gap-5 pt-4 pb-32 px-4">

        {/* スポット選択 */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {SPOT_DETAILS.map((s) => {
              const sel = selectedId === s.id;
              return (
                <button key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold border transition-all active:scale-95"
                        style={{
                          background: sel ? "rgba(34,211,238,.12)" : "rgba(255,255,255,.05)",
                          borderColor: sel ? "rgba(34,211,238,.35)" : "rgba(255,255,255,.1)",
                          color: sel ? "#22d3ee" : "#64748b",
                        }}>
                  <span className="text-[15px] leading-none">{s.icon}</span>
                  {s.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* スポット詳細 */}
        <SpotDetailCard spot={spot} />

        {/* AI相談 */}
        <Link href={`/ai-chat?q=${encodeURIComponent(`${spot.name}での釣りについて詳しく教えてください`)}`}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 border active:scale-[.98] transition-transform"
              style={{ background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)" }}>
          <span className="text-[28px] leading-none">🤖</span>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">{spot.name}の釣りをAIに相談</p>
            <p className="text-white/40 text-[11px] mt-0.5">仕掛け・時間帯・コツを即答</p>
          </div>
          <span className="text-white/25 text-[18px] ml-auto">›</span>
        </Link>

      </div>

            <BottomNav />
    </div>
  );
}

/* ─── SPOT DETAIL CARD ─────────────────────── */
function SpotDetailCard({ spot }: { spot: SpotDetail }) {
  const crowdColor = CROWD_COLOR[spot.crowd.level];

  return (
    <div className="flex flex-col gap-3">

      {/* タイトル */}
      <div className="rounded-3xl px-5 py-4 border border-white/8"
           style={{ background: "linear-gradient(135deg,#0d1829,#080f1c)" }}>
        <div className="flex items-start gap-3">
          <span className="text-[44px] leading-none">{spot.icon}</span>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-white font-black text-[20px] leading-tight">{spot.name}</p>
            <p className="text-slate-500 text-[12px] mt-0.5">{spot.area}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {spot.bestSeasons.map((s) => (
                <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: "#22d3ee", background: "rgba(34,211,238,.12)" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 実用情報グリッド */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 駐車場 */}
        <InfoCard
          icon="🚗"
          label="駐車場"
          value={spot.parking.available ? "あり" : "なし"}
          sub={spot.parking.detail}
          sub2={spot.parking.available ? `${spot.parking.cost}` : undefined}
          valueColor={spot.parking.available ? "#10b981" : "#ef4444"}
        />

        {/* トイレ */}
        <InfoCard
          icon="🚻"
          label="トイレ"
          value={spot.toilet.available ? "あり" : "なし"}
          sub={spot.toilet.detail}
          valueColor={spot.toilet.available ? "#10b981" : "#ef4444"}
        />

        {/* 足場 */}
        <div className="col-span-2 rounded-2xl px-4 py-3.5 border border-white/8" style={{ background: "#0d1829" }}>
          <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-1.5">🏔️ 足場</p>
          <p className="text-white text-[13px] leading-relaxed">{spot.foothold}</p>
        </div>

        {/* 混雑 */}
        <InfoCard
          icon="👥"
          label="混雑度"
          value={spot.crowd.level}
          sub={spot.crowd.detail}
          valueColor={crowdColor}
        />

        {/* アクセス */}
        <InfoCard
          icon="🚃"
          label="アクセス"
          value="経路"
          sub={spot.access}
        />
      </div>

      {/* 必要な仕掛け */}
      <div className="rounded-2xl px-4 py-4 border border-white/8" style={{ background: "#0d1829" }}>
        <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-2.5">🎣 必要な仕掛け・タックル</p>
        <div className="flex flex-col gap-1.5">
          {spot.requiredTackle.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22d3ee" }} />
              <p className="text-white/80 text-[13px]">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 注意点 */}
      <div className="rounded-2xl px-4 py-4 border"
           style={{ background: "rgba(245,158,11,.05)", borderColor: "rgba(245,158,11,.2)" }}>
        <p className="text-[10px] font-black mb-2.5" style={{ color: "#f59e0b" }}>⚠️ 注意点</p>
        <div className="flex flex-col gap-2">
          {spot.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[11px] font-black mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }}>・</span>
              <p className="text-white/70 text-[12px] leading-relaxed">{n}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 近くの釣具店 */}
      {spot.nearbyShops.length > 0 && (
        <div className="rounded-2xl px-4 py-3.5 border border-white/8" style={{ background: "#0d1829" }}>
          <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-2">🏪 近くの釣具店</p>
          {spot.nearbyShops.map((shop, i) => (
            <p key={i} className="text-white/80 text-[13px]">{shop}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon, label, value, sub, sub2, valueColor,
}: {
  icon: string; label: string; value: string; sub?: string; sub2?: string; valueColor?: string;
}) {
  return (
    <div className="rounded-2xl px-3.5 py-3.5 border border-white/8 flex flex-col gap-1" style={{ background: "#0d1829" }}>
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] leading-none">{icon}</span>
        <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">{label}</p>
      </div>
      <p className="font-bold text-[14px] leading-tight" style={{ color: valueColor ?? "white" }}>{value}</p>
      {sub && <p className="text-slate-500 text-[10px] leading-relaxed">{sub}</p>}
      {sub2 && <p className="text-[11px] font-semibold" style={{ color: "#22d3ee" }}>{sub2}</p>}
    </div>
  );
}
