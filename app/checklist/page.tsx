"use client";

import Link from "next/link";
import { useState } from "react";
import { CHECKLISTS, CATEGORY_COLOR, CATEGORY_BG } from "@/data/checklistData";
import type { FishingChecklist, ChecklistItem } from "@/data/checklistData";
import { BottomNav } from "@/components/BottomNav";

export default function ChecklistPage() {
  const [selectedId, setSelectedId] = useState<string>(CHECKLISTS[0].id);
  const [checked, setChecked]       = useState<Record<string, boolean>>({});

  const current = CHECKLISTS.find((c) => c.id === selectedId) ?? CHECKLISTS[0];
  const checkedCount = current.items.filter((_, i) => checked[`${selectedId}_${i}`]).length;
  const totalCount   = current.items.length;

  function toggle(idx: number) {
    const key = `${selectedId}_${idx}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetAll() {
    const newState = { ...checked };
    current.items.forEach((_, i) => { delete newState[`${selectedId}_${i}`]; });
    setChecked(newState);
  }

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
          <p className="text-white font-bold text-[16px] leading-tight">持ち物チェックリスト</p>
          <p className="text-slate-500 text-[11px]">釣り方別の必要道具を確認</p>
        </div>
        {checkedCount > 0 && (
          <button onClick={resetAll}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10"
                  style={{ color: "#64748b", background: "rgba(255,255,255,.05)" }}>
            リセット
          </button>
        )}
      </header>

      <div className="flex flex-col gap-5 pt-4 pb-32 px-4">

        {/* 釣り方セレクター */}
        <section>
          <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">釣り方を選ぶ</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CHECKLISTS.map((cl) => {
              const sel = selectedId === cl.id;
              return (
                <button key={cl.id}
                        onClick={() => setSelectedId(cl.id)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold border transition-all active:scale-95"
                        style={{
                          background: sel ? cl.bg : "rgba(255,255,255,.05)",
                          borderColor: sel ? `${cl.color}50` : "rgba(255,255,255,.1)",
                          color: sel ? cl.color : "#64748b",
                        }}>
                  <span className="text-[16px] leading-none">{cl.icon}</span>
                  {cl.type}
                </button>
              );
            })}
          </div>
        </section>

        {/* 進捗バー */}
        <section>
          <div className="rounded-2xl px-4 py-4 border border-white/8" style={{ background: "#0d1829" }}>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-white font-bold text-[14px]">
                  {current.icon} {current.type}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  ターゲット: {current.targetFish.join("・")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-[22px]" style={{ color: current.color }}>
                  {checkedCount}/{totalCount}
                </p>
                <p className="text-slate-500 text-[10px]">準備完了</p>
              </div>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${(checkedCount / totalCount) * 100}%`, background: current.color }} />
            </div>
            {checkedCount === totalCount && totalCount > 0 && (
              <p className="text-center text-[13px] font-black mt-3" style={{ color: current.color }}>
                ✅ 準備完了！行ってらっしゃい🎣
              </p>
            )}
          </div>
        </section>

        {/* カテゴリ別チェックリスト */}
        {(["必須", "安全", "あると便利"] as const).map((cat) => {
          const items = current.items.filter((it) => it.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ color: CATEGORY_COLOR[cat], background: CATEGORY_BG[cat] }}>
                  {cat}
                </span>
                <p className="text-slate-500 text-[11px]">{items.length}項目</p>
              </div>
              <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "#0d1829" }}>
                {items.map((item, localIdx) => {
                  const globalIdx = current.items.indexOf(item);
                  const key = `${selectedId}_${globalIdx}`;
                  const isDone = !!checked[key];
                  return (
                    <button key={localIdx}
                            onClick={() => toggle(globalIdx)}
                            className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-white/6 last:border-b-0 active:bg-white/4 transition-colors ${isDone ? "opacity-60" : ""}`}>
                      {/* チェックボックス */}
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all"
                           style={{
                             background: isDone ? CATEGORY_COLOR[cat] : "transparent",
                             borderColor: isDone ? CATEGORY_COLOR[cat] : "rgba(255,255,255,.2)",
                           }}>
                        {isDone && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}
                               className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold leading-snug ${isDone ? "line-through text-slate-500" : "text-white"}`}>
                          {item.item}
                        </p>
                        {item.note && (
                          <p className="text-slate-600 text-[11px] mt-0.5">{item.note}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* AI相談 */}
        <Link href={`/ai-chat?q=${encodeURIComponent(`${current.type}釣りに必要な道具を詳しく教えてください`)}&mode=tackle`}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 border active:scale-[.98] transition-transform"
              style={{ background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)" }}>
          <span className="text-[28px] leading-none">🤖</span>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">AIに道具を相談する</p>
            <p className="text-white/40 text-[11px] mt-0.5">予算に合わせたおすすめを提案</p>
          </div>
          <span className="text-white/25 text-[18px] ml-auto">›</span>
        </Link>

      </div>

      <BottomNav />
    </div>
  );
}
