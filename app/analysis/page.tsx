"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import {
  USER_PROFILE, USER_TITLES, USER_MISSIONS, USER_BADGES,
  CAUGHT_FISH_NAMES,
} from "@/data/mockCatchData";

/* ── Helpers ─────────────────────────────────── */
function xpPercent(xp: number, next: number) {
  return Math.min(100, Math.round((xp / next) * 100));
}
function nextTitle(level: number) {
  return USER_TITLES.slice().reverse().find((t) => t.minLevel > level) ?? USER_TITLES[USER_TITLES.length - 1];
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function AnalysisPage() {
  const [notifyFish, setNotifyFish]   = useState(true);
  const [notifySunrise, setNotifySunrise] = useState(true);
  const [notifySafety, setNotifySafety]  = useState(false);

  const u     = USER_PROFILE;
  const xpPct = xpPercent(u.xp, u.nextLevelXp);
  const next  = nextTitle(u.level);

  return (
    <div className="min-h-dvh pb-28" style={{ background: "#030b16" }}>

      {/* ── Header ─────────────────────────────── */}
      <header
        className="sticky top-0 z-40 px-5 pt-12 pb-3"
        style={{
          background: "rgba(3,11,22,.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <h1 className="text-[20px] font-black text-white tracking-[-0.03em]">マイページ</h1>
      </header>

      <div className="px-5 pt-5 flex flex-col gap-5">

        {/* ── Coming-soon banner ───────────────────── */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.25)" }}
        >
          <span className="text-[20px] flex-shrink-0">🔒</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: "#f59e0b" }}>ログイン機能は準備中です</p>
            <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "#8AA0B5" }}>
              現在はゲストとして釣行データを確認できます
            </p>
          </div>
        </div>

        {/* ── Profile card (mock stats) ─── */}
        {(<>
        <div
          className="rounded-2xl px-5 py-5"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          {/* Avatar + level */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] flex-shrink-0"
              style={{ background: `${u.currentTitleColor}18`, border: `1.5px solid ${u.currentTitleColor}35` }}
            >
              {u.currentTitleIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ color: u.currentTitleColor, background: `${u.currentTitleColor}18`, border: `1px solid ${u.currentTitleColor}30` }}
                >
                  {u.currentTitle}
                </span>
              </div>
              <p className="text-[13px] font-semibold" style={{ color: "#c5d5e8" }}>{u.name}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[24px] font-black num-tab text-white">Lv.{u.level}</span>
                <span className="text-[11px]" style={{ color: "#64748b" }}>{u.xp} / {u.nextLevelXp} XP</span>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-1.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>次のレベルまで</span>
              <span className="text-[10px] font-bold num-tab" style={{ color: u.currentTitleColor }}>
                {u.nextLevelXp - u.xp} XP
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xpPct}%`, background: `linear-gradient(90deg,${u.currentTitleColor}80,${u.currentTitleColor})` }}
              />
            </div>
          </div>

          {/* Next title */}
          <p className="text-[11px]" style={{ color: "#64748b" }}>
            次の称号：<span style={{ color: next.color }}>{next.icon} {next.name}</span>
            <span className="ml-1">（Lv.{next.minLevel}〜）</span>
          </p>
        </div>

        {/* ── Stats grid ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "釣行回数",  value: u.fishingTrips,      unit: "回", icon: "🗓️", color: "#0ea5e9" },
            { label: "総釣果数",  value: u.catchTotal,        unit: "尾", icon: "🐟", color: "#10b981" },
            { label: "魚種数",    value: u.fishSpeciesCount,  unit: "種", icon: "📖", color: "#a78bfa" },
            { label: "自己最大",  value: `${u.maxFishCm}cm`, unit: u.maxFishName, icon: "📏", color: "#f59e0b" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-4 py-4"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[16px] leading-none">{s.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{s.label}</span>
              </div>
              <p className="text-[24px] font-black num-tab leading-none" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[10px] mt-1" style={{ color: "#7c92ab" }}>{s.unit}</p>
            </div>
          ))}
        </div>

        {/* ── Favorite spot ──────────────────────── */}
        <div
          className="rounded-2xl px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
        >
          <span className="text-[20px] leading-none">📍</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#64748b" }}>よく行くポイント</p>
            <p className="text-[15px] font-bold text-white">{u.favoriteSpot}</p>
          </div>
          <Link
            href="/spots"
            className="text-[12px] font-semibold flex-shrink-0"
            style={{ color: "#0ea5e9" }}
          >
            詳細 →
          </Link>
        </div>

        {/* ── Missions ───────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-white">ミッション</h2>
            <span className="text-[11px] font-semibold" style={{ color: "#64748b" }}>
              {USER_MISSIONS.filter((m) => m.done).length}/{USER_MISSIONS.length} 完了
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {USER_MISSIONS.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl px-4 py-3.5"
                style={{
                  background: m.done ? "rgba(16,185,129,.06)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${m.done ? "rgba(16,185,129,.2)" : "rgba(255,255,255,.07)"}`,
                  opacity: m.done ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[20px] leading-none mt-0.5 flex-shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-[13px] font-semibold leading-tight"
                         style={{ color: m.done ? "#10b981" : "#e8f1fc", textDecoration: m.done ? "line-through" : "none" }}>
                        {m.text}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          color:      m.done ? "#10b981"              : "#f59e0b",
                          background: m.done ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.12)",
                        }}
                      >
                        +{m.xp} XP
                      </span>
                    </div>
                    {m.total > 1 && !m.done && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px]" style={{ color: "#64748b" }}>
                            {m.progress}/{m.total}
                          </span>
                          <span className="text-[10px]" style={{ color: "#64748b" }}>
                            {Math.round((m.progress / m.total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,.07)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(m.progress / m.total) * 100}%`, background: "#0ea5e9" }}
                          />
                        </div>
                      </div>
                    )}
                    {m.done && (
                      <p className="text-[10px]" style={{ color: "#10b981" }}>✓ 達成済み</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Badges ─────────────────────────────── */}
        <section>
          <h2 className="text-[16px] font-bold text-white mb-3">バッジ</h2>
          <div className="grid grid-cols-4 gap-3">
            {USER_BADGES.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-3.5 px-1"
                style={{
                  background: b.earned ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.025)",
                  border: `1px solid ${b.earned ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.05)"}`,
                  opacity: b.earned ? 1 : 0.4,
                }}
              >
                <span className="text-[26px] leading-none" style={{ filter: b.earned ? "none" : "grayscale(1)" }}>
                  {b.icon}
                </span>
                <p className="text-[10px] font-bold text-center leading-tight"
                   style={{ color: b.earned ? "#e8f1fc" : "#64748b" }}>
                  {b.name}
                </p>
                {b.earned && (
                  <span className="text-[8px] font-semibold" style={{ color: "#10b981" }}>獲得済み</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Title progression ──────────────────── */}
        <section>
          <h2 className="text-[16px] font-bold text-white mb-3">称号</h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}
          >
            {USER_TITLES.map((t, i) => {
              const unlocked = u.level >= t.minLevel;
              const current  = t.name === u.currentTitle;
              return (
                <div
                  key={t.name}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < USER_TITLES.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(255,255,255,.06)", opacity: unlocked ? 1 : 0.4 }}
                >
                  <span className="text-[22px] leading-none w-8 text-center flex-shrink-0"
                        style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
                    {t.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold" style={{ color: unlocked ? "#e8f1fc" : "#64748b" }}>
                        {t.name}
                      </p>
                      {current && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: t.color, background: `${t.color}20` }}
                        >
                          現在
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>Lv.{t.minLevel} 以上</p>
                  </div>
                  {unlocked ? (
                    <span className="text-[18px] leading-none">✓</span>
                  ) : (
                    <span className="text-[11px]" style={{ color: "#64748b" }}>🔒</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Fish guide shortcut ─────────────────── */}
        <div
          className="rounded-2xl px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(14,165,233,.06)", border: "1px solid rgba(14,165,233,.16)" }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[20px] flex-shrink-0"
            style={{ background: "rgba(14,165,233,.14)" }}
          >
            📖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white">魚図鑑</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#7c92ab" }}>
              {CAUGHT_FISH_NAMES.length}/10種 記録済み
            </p>
            <div className="mt-1.5 w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,.07)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(CAUGHT_FISH_NAMES.length / 10) * 100}%`, background: "#0ea5e9" }}
              />
            </div>
          </div>
          <Link href="/guide" className="text-[12px] font-semibold flex-shrink-0" style={{ color: "#0ea5e9" }}>
            開く →
          </Link>
        </div>

        {/* ── Notifications ──────────────────────── */}
        <section>
          <h2 className="text-[16px] font-bold text-white mb-3">通知設定</h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}
          >
            {[
              { label: "青物指数90点突破", sub: "釣果期待度が高くなったら通知", value: notifyFish, set: setNotifyFish, color: "#0ea5e9" },
              { label: "日の出まで30分",   sub: "朝まずめ出発の目安に",          value: notifySunrise, set: setNotifySunrise, color: "#f59e0b" },
              { label: "危険海況アラート", sub: "波・風が基準を超えたら通知",     value: notifySafety,  set: setNotifySafety,  color: "#ef4444" },
            ].map((n, i, arr) => (
              <div
                key={n.label}
                className={`flex items-center gap-3 px-4 py-4 ${i < arr.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: "rgba(255,255,255,.06)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: "#e8f1fc" }}>{n.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>{n.sub}</p>
                </div>
                <button
                  onClick={() => n.set((v) => !v)}
                  className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors"
                  style={{ background: n.value ? n.color : "rgba(255,255,255,.1)" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ transform: `translateX(${n.value ? 26 : 2}px)`, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
                  />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: "#64748b" }}>
            ※ 通知機能は近日公開予定です
          </p>
        </section>

        {/* ── Navigation links ───────────────────── */}
        <div className="flex flex-col gap-1.5">
          {[
            { label: "お気に入りポイントを設定する", href: "/spots" },
            { label: "釣果記録を見る",               href: "/catch-log" },
            { label: "レシピ帳を開く",               href: "/recipes" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)" }}
            >
              <span className="text-[13px] font-medium" style={{ color: "#c5d5e8" }}>{l.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>

        {/* ── β版注意書き ─────────────────────────── */}
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.15)" }}
        >
          <p className="text-[11px] font-bold mb-2" style={{ color: "#f59e0b" }}>β版についてのご注意</p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#7c92ab" }}>
            FishAIはβ版です。釣行判断の参考情報としてご利用ください。
            天候・海況・安全情報は必ず公式情報も確認してください。
            危険を感じる場合は釣行を中止してください。
          </p>
        </div>

        {/* ── Info links ─────────────────────────── */}
        <div className="flex flex-col gap-1 pb-2">
          {[
            { label: "お問い合わせ",           href: "/contact" },
            { label: "プライバシーポリシー",   href: "/privacy" },
            { label: "利用規約",               href: "/terms" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
            >
              <span className="text-[13px]" style={{ color: "#64748b" }}>{l.label}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="#64748b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
          <p className="text-center text-[10px] pt-3" style={{ color: "#64748b" }}>
            FishAI β版 · Shonan Fishing AI Assistant
          </p>
        </div>

        </>)}

      </div>{/* /px-5 */}

      <BottomNav />
    </div>
  );
}
