"use client";

import { useState } from "react";
import Link from "next/link";
import { SHONAN_FISH } from "@/data/shonanData";
import { FISHING_METHODS } from "@/data/fishingMethods";
import { BottomNav } from "@/components/BottomNav";
import { CAUGHT_FISH_NAMES } from "@/data/mockCatchData";

type Category = "すべて" | "回遊魚" | "根魚" | "フラット" | "小物" | "大物";
const CATEGORIES: Category[] = ["すべて", "回遊魚", "根魚", "フラット", "小物", "大物"];

const DIFFICULTY_LABEL = ["", "★ 初心者", "★★ 中級者", "★★★ 上級者"] as const;
const DIFFICULTY_COLOR = ["", "#10b981", "#f59e0b", "#ef4444"] as const;

export default function GuidePage() {
  const [cat, setCat]           = useState<Category>("すべて");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = SHONAN_FISH.filter((f) =>
    cat === "すべて" ? true : f.category === cat
  );

  const completePct = Math.round((CAUGHT_FISH_NAMES.length / SHONAN_FISH.length) * 100);

  const selectedFish   = SHONAN_FISH.find((f) => f.name === selected);
  const selectedMethod = FISHING_METHODS.find((m) => m.fish === selected);

  return (
    <div className="min-h-dvh pb-28" style={{ background: "#030b16" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-40 px-5 pt-12 pb-3"
        style={{
          background: "rgba(3,11,22,.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div className="flex items-end justify-between mb-3">
          <h1 className="text-[20px] font-black text-white tracking-[-0.03em]">
            魚図鑑
            <span className="text-[11px] font-medium ml-2" style={{ color: "#7c92ab" }}>
              湘南で釣れる魚
            </span>
          </h1>
          <div className="text-right">
            <span className="text-[18px] font-black num-tab" style={{ color: "#0ea5e9" }}>
              {CAUGHT_FISH_NAMES.length}
            </span>
            <span className="text-[11px]" style={{ color: "#64748b" }}>/{SHONAN_FISH.length}種</span>
          </div>
        </div>
        {/* Completion bar */}
        <div className="mb-3">
          <div className="w-full rounded-full overflow-hidden mb-1" style={{ height: 3, background: "rgba(255,255,255,.07)" }}>
            <div className="h-full rounded-full" style={{ width: `${completePct}%`, background: "#0ea5e9" }} />
          </div>
          <p className="text-[9px] font-semibold" style={{ color: "#64748b" }}>
            コンプリート率 {completePct}%
          </p>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {CATEGORIES.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="flex-shrink-0 text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-colors"
                style={{
                  background: active ? "rgba(14,165,233,.18)" : "rgba(255,255,255,.06)",
                  color:      active ? "#0ea5e9"              : "#7c92ab",
                  border:     `1px solid ${active ? "rgba(14,165,233,.4)" : "rgba(255,255,255,.08)"}`,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-5 pt-4">

        {/* Fish grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filtered.map((fish) => {
            const method     = FISHING_METHODS.find((m) => m.fish === fish.name);
            const isSelected = fish.name === selected;
            const caught     = CAUGHT_FISH_NAMES.includes(fish.name);
            return (
              <button
                key={fish.name}
                onClick={() => setSelected(isSelected ? null : fish.name)}
                className="rounded-2xl text-left overflow-hidden transition-transform active:scale-95"
                style={{
                  background: isSelected ? `${fish.catColor}10` : "rgba(255,255,255,.04)",
                  border: `1px solid ${isSelected ? `${fish.catColor}40` : "rgba(255,255,255,.07)"}`,
                  opacity: caught ? 1 : 0.45,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[36px] leading-none"
                          style={{ filter: caught ? "none" : "grayscale(1)" }}>
                      {fish.emoji}
                    </span>
                    {method && caught && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: DIFFICULTY_COLOR[method.difficulty], background: `${DIFFICULTY_COLOR[method.difficulty]}18` }}
                      >
                        {DIFFICULTY_LABEL[method.difficulty]}
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] font-bold text-white">{fish.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] font-medium" style={{ color: fish.catColor }}>{fish.category}</p>
                    {caught ? (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ color: "#10b981", background: "rgba(16,185,129,.15)" }}>記録済</span>
                    ) : (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ color: "#64748b", background: "rgba(255,255,255,.07)" }}>🔒 未記録</span>
                    )}
                  </div>
                  {method && caught && (
                    <p className="text-[11px] mt-2 leading-tight" style={{ color: "#64748b" }}>
                      {method.timing}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div
                    className="w-full py-2 text-center text-[11px] font-semibold border-t"
                    style={{ borderColor: `${fish.catColor}25`, color: fish.catColor }}
                  >
                    詳細を見る ↓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedFish && selectedMethod && (
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            {/* Fish header */}
            <div
              className="px-5 py-5 flex items-center gap-4"
              style={{ background: `${selectedFish.catColor}08` }}
            >
              <span className="text-[52px] leading-none">{selectedFish.emoji}</span>
              <div>
                <p className="text-[22px] font-black text-white leading-tight">{selectedFish.name}</p>
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ color: selectedFish.catColor, background: selectedFish.catBg }}
                >
                  {selectedFish.category}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Spots */}
              <DetailRow label="釣れるスポット" icon="📍">
                <div className="flex flex-wrap gap-1.5">
                  {selectedMethod.targetSpots.map((s) => (
                    <span key={s}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,.08)", color: "#c5d5e8" }}
                    >{s}</span>
                  ))}
                </div>
              </DetailRow>

              {/* Depth */}
              <DetailRow label="タナ・水深" icon="🌊">
                <p className="text-[13px]" style={{ color: "#c5d5e8" }}>{selectedMethod.depth}</p>
              </DetailRow>

              {/* Lures */}
              <DetailRow label="おすすめルアー・仕掛け" icon="🎣">
                <div className="flex flex-col gap-2">
                  {selectedMethod.lures.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: "#e8f1fc" }}>{l.name}</span>
                      {l.weight && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(14,165,233,.12)", color: "#0ea5e9" }}>
                          {l.weight}
                        </span>
                      )}
                      {l.note && (
                        <span className="text-[11px]" style={{ color: "#64748b" }}>{l.note}</span>
                      )}
                    </div>
                  ))}
                </div>
              </DetailRow>

              {/* Technique */}
              <DetailRow label="釣り方・テクニック" icon="💡">
                <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                  {selectedMethod.technique}
                </p>
              </DetailRow>

              {/* Timing */}
              <DetailRow label="ベストタイミング" icon="🕐">
                <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                  {selectedMethod.timing}
                </p>
              </DetailRow>

              {/* Notes */}
              <DetailRow label="ポイント・注意点" icon="📝">
                <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                  {selectedMethod.notes}
                </p>
              </DetailRow>

              {/* Beginner tip */}
              <div
                className="rounded-2xl px-4 py-3.5"
                style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.18)" }}
              >
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#10b981" }}>
                  🎓 初心者へのアドバイス
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                  {selectedMethod.beginnerTip}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex gap-2.5 pt-1">
                <Link
                  href={`/ai-chat?q=${encodeURIComponent(`${selectedFish.name}の釣り方と仕掛けを詳しく教えて`)}&mode=tackle`}
                  className="flex-1 text-center text-[12px] font-bold py-3 rounded-2xl"
                  style={{ background: "rgba(14,165,233,.12)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,.22)" }}
                >
                  AI に仕掛けを相談
                </Link>
                <Link
                  href={`/recipes?fish=${encodeURIComponent(selectedFish.name)}`}
                  className="flex-1 text-center text-[12px] font-bold py-3 rounded-2xl"
                  style={{ background: "rgba(16,185,129,.1)", color: "#10b981", border: "1px solid rgba(16,185,129,.22)" }}
                >
                  レシピを見る
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}

function DetailRow({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
        <span>{icon}</span>{label}
      </p>
      {children}
    </div>
  );
}
