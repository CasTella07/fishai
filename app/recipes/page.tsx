"use client";

import Link from "next/link";
import { useState } from "react";
import { SHONAN_FISH } from "@/data/shonanData";
import { RECIPES, getRecipesByFish, difficultyLabel, categoryIcon } from "@/data/recipes";
import type { Recipe } from "@/data/recipes";
import { BottomNav } from "@/components/BottomNav";

const DIFF_COLOR: Record<1 | 2 | 3, string> = {
  1: "#10b981",  // 緑
  2: "#f59e0b",  // 琥珀
  3: "#f472b6",  // ピンク
};

export default function RecipesPage() {
  const [selectedFish, setSelectedFish] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayed: Recipe[] = selectedFish
    ? getRecipesByFish(selectedFish)
    : RECIPES;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#080f1c" }}>

      {/* ── HEADER ─────────────────────────────── */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 sticky top-0 z-40"
              style={{ background: "rgba(8,15,28,.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <Link href="/catch-log"
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
              style={{ background: "rgba(255,255,255,.06)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-white font-bold text-[16px] leading-tight">
            レシピ<span style={{ color: "#22d3ee" }}>帳</span>
          </p>
          <p className="text-slate-500 text-[11px]">釣った魚を美味しく食べよう</p>
        </div>
        <Link href="/ai-chat?mode=recipe"
              className="text-[10px] font-black px-2.5 py-1.5 rounded-full"
              style={{ color: "#22d3ee", background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.2)" }}>
          AI に聞く
        </Link>
      </header>

      <div className="flex flex-col gap-5 pt-4 pb-32 px-4">

        {/* ── 魚種セレクター ─────────────────── */}
        <section>
          <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">魚種で絞り込む</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setSelectedFish(null)}
              className="flex-shrink-0 px-3.5 py-2 rounded-full text-[12px] font-bold border transition-colors active:scale-95"
              style={{
                background: selectedFish === null ? "rgba(34,211,238,.15)" : "rgba(255,255,255,.05)",
                borderColor: selectedFish === null ? "rgba(34,211,238,.35)" : "rgba(255,255,255,.1)",
                color: selectedFish === null ? "#22d3ee" : "#94a3b8",
              }}>
              すべて
            </button>
            {SHONAN_FISH.map((f) => (
              <button key={f.name}
                      onClick={() => setSelectedFish(f.name)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold border transition-colors active:scale-95"
                      style={{
                        background: selectedFish === f.name ? f.catBg : "rgba(255,255,255,.05)",
                        borderColor: selectedFish === f.name ? `${f.catColor}50` : "rgba(255,255,255,.1)",
                        color: selectedFish === f.name ? f.catColor : "#94a3b8",
                      }}>
                <span className="text-[14px] leading-none">{f.emoji}</span>
                {f.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── レシピカウント ─────────────────── */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-[15px]">
            {selectedFish ? `${selectedFish}のレシピ` : "すべてのレシピ"}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                style={{ color: "#22d3ee", background: "rgba(34,211,238,.12)" }}>
            {displayed.length}件
          </span>
        </div>

        {/* ── レシピ一覧 ─────────────────────── */}
        {displayed.length === 0 ? (
          <div className="rounded-2xl px-5 py-10 text-center border border-white/8"
               style={{ background: "#0d1829" }}>
            <p className="text-slate-500 text-[14px]">この魚のレシピはまだありません</p>
            <Link href="/ai-chat"
                  className="mt-3 inline-block text-[12px] font-bold"
                  style={{ color: "#22d3ee" }}>
              AIに料理方法を聞く →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                expanded={expandedId === recipe.id}
                onToggle={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              />
            ))}
          </div>
        )}

        {/* ── AI相談 CTA ─────────────────────── */}
        <Link href="/ai-chat"
              className="flex items-center gap-3 rounded-2xl px-4 py-4 border active:scale-[.98] transition-transform"
              style={{ background: "rgba(34,211,238,.06)", border: "1px solid rgba(34,211,238,.18)" }}>
          <span className="text-[28px] leading-none">🤖</span>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">AIに料理を相談する</p>
            <p className="text-white/40 text-[11px] mt-0.5">捌き方・保存方法も即答えます</p>
          </div>
          <span className="text-white/25 text-[18px] ml-auto">›</span>
        </Link>

      </div>

      <BottomNav />
    </div>
  );
}

/* ─── レシピカード ──────────────────────────────── */

function RecipeCard({
  recipe, expanded, onToggle,
}: {
  recipe: Recipe;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dColor = DIFF_COLOR[recipe.difficulty];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8"
         style={{ background: "#0d1829" }}>
      {/* ヘッダー（タップで展開） */}
      <button className="w-full text-left" onClick={onToggle}>
        <div className="flex items-start gap-3 px-4 py-4">
          {/* カテゴリアイコン */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
               style={{ background: "rgba(255,255,255,.07)" }}>
            {categoryIcon(recipe.category)}
          </div>
          <div className="flex-1 min-w-0">
            {/* 魚種バッジ */}
            <div className="flex flex-wrap gap-1 mb-1">
              {recipe.fish.map((f) => {
                const fishData = SHONAN_FISH.find((sf) => sf.name === f);
                return (
                  <span key={f} className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ color: fishData?.catColor ?? "#94a3b8", background: fishData?.catBg ?? "rgba(148,163,184,.15)" }}>
                    {fishData?.emoji} {f}
                  </span>
                );
              })}
            </div>
            <p className="text-white font-bold text-[15px] leading-tight">{recipe.name}</p>
            <div className="flex items-center gap-2.5 mt-1.5">
              {/* 難易度 */}
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ color: dColor, background: `${dColor}18` }}>
                {difficultyLabel(recipe.difficulty)}
              </span>
              {/* 時間 */}
              <span className="text-slate-500 text-[10px]">⏱ {recipe.cookTime}</span>
              {/* カテゴリ */}
              <span className="text-slate-500 text-[10px]">{recipe.category}</span>
              {/* 初心者OK */}
              {recipe.beginnerOk && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ color: "#10b981", background: "rgba(16,185,129,.12)" }}>
                  初心者OK
                </span>
              )}
            </div>
          </div>
          {/* 展開矢印 */}
          <span className="text-slate-600 text-[16px] mt-1 flex-shrink-0 transition-transform"
                style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
            ›
          </span>
        </div>
      </button>

      {/* 展開コンテンツ */}
      {expanded && (
        <div className="border-t border-white/8">
          {/* 説明 */}
          <div className="px-4 pt-3.5 pb-3">
            <p className="text-white/70 text-[13px] leading-relaxed">{recipe.description}</p>
          </div>

          {/* 手順 */}
          <div className="px-4 pb-3">
            <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase mb-3">作り方</p>
            <div className="flex flex-col gap-2.5">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                       style={{ background: "rgba(34,211,238,.15)", color: "#22d3ee" }}>
                    {i + 1}
                  </div>
                  <p className="text-white/80 text-[13px] leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ポイント */}
          <div className="mx-4 mb-4 rounded-xl px-3.5 py-3"
               style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)" }}>
            <p className="text-[10px] font-black mb-1" style={{ color: "#f59e0b" }}>💡 コツ</p>
            <p className="text-white/70 text-[12px] leading-relaxed">{recipe.tips}</p>
          </div>

          {/* AI相談ボタン */}
          <div className="px-4 pb-4">
            <Link href={`/ai-chat?q=${encodeURIComponent(`${recipe.fish[0]}の${recipe.name}の作り方を詳しく教えてください`)}`}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 border text-[12px] font-bold active:scale-95 transition-transform"
                  style={{ background: "rgba(34,211,238,.07)", borderColor: "rgba(34,211,238,.2)", color: "#22d3ee" }}>
              🤖 AIにもっと詳しく聞く
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
