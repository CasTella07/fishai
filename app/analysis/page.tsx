"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconFishHook, IconFish, IconBook2, IconRuler, IconChevronRight,
} from "@tabler/icons-react";
import { BottomNav } from "@/components/BottomNav";
import { AuthForm } from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";

/* ── types ─────────────────────────────────────────────────── */

interface Stats {
  catchTotal: number;
  speciesCount: number;
  maxFishName: string | null;
  maxFishCm: number | null;
}

interface RecentCatch {
  id: string;
  fish_name: string;
  date: string;
  length_cm: number | null;
  count: number;
  location: string | null;
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function AnalysisPage() {
  const { user, loading, supabase, signOut } = useAuth();

  /* local notification toggles */
  const [notifyFish,    setNotifyFish]    = useState(true);
  const [notifySunrise, setNotifySunrise] = useState(true);
  const [notifySafety,  setNotifySafety]  = useState(false);

  /* stats */
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [tackleCount,   setTackleCount]   = useState(0);
  const [recentCatches, setRecentCatches] = useState<RecentCatch[]>([]);
  const [statsLoading,  setStatsLoading]  = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    setStatsLoading(true);

    Promise.all([
      supabase
        .from("catch_records")
        .select("id, fish_name, date, length_cm, count, location")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("tackles")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]).then(([catchRes, tackleRes]) => {
      const rows = catchRes.data ?? [];
      const total = rows.reduce((s, r) => s + (r.count ?? 1), 0);
      const species = new Set(rows.map((r) => r.fish_name)).size;
      const withSize = rows.filter(
        (r): r is RecentCatch & { length_cm: number } => r.length_cm !== null,
      );
      const maxRec = withSize.length
        ? withSize.reduce((a, b) => (b.length_cm > a.length_cm ? b : a))
        : null;

      setStats({
        catchTotal:   total,
        speciesCount: species,
        maxFishName:  maxRec?.fish_name ?? null,
        maxFishCm:    maxRec?.length_cm ?? null,
      });
      setRecentCatches(rows.slice(0, 5));
      setTackleCount(tackleRes.count ?? 0);
    }).finally(() => setStatsLoading(false));
  }, [user, supabase]);

  /* ── layout shell ─────────────────────────── */
  return (
    <div className="min-h-dvh pb-28" style={{ background: "#030b16" }}>

      <header
        className="sticky top-0 z-40 px-5 pt-12 pb-3 flex items-center justify-between"
        style={{
          background: "rgba(3,11,22,.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <h1 className="text-[20px] font-black text-white tracking-[-0.03em]">マイページ</h1>
        {user && (
          <button
            onClick={() => signOut()}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-xl"
            style={{ color: "#8AA0B5", background: "rgba(255,255,255,.07)" }}
          >
            ログアウト
          </button>
        )}
      </header>

      <div className="px-5 pt-5 flex flex-col gap-5">

        {/* ── loading ──────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <span className="text-[14px]" style={{ color: "#516070" }}>読み込み中…</span>
          </div>
        )}

        {/* ── not logged in ─────────────────────── */}
        {!loading && !user && (<>
          <div className="pt-2">
            <p className="text-[22px] font-black text-white mb-1">釣果を記録しよう</p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#8AA0B5" }}>
              アカウント登録で釣果・タックルをクラウドに保存。どのデバイスからでも確認できます。
            </p>
          </div>
          <AuthForm />
        </>)}

        {/* ── logged in ─────────────────────────── */}
        {!loading && user && (<>

          {/* user card */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(14,165,233,.14)" }}
              >
                <IconFishHook size={22} stroke={1.5} color="#0ea5e9" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold" style={{ color: "#64748b" }}>ログイン中</p>
                <p className="text-[14px] font-bold truncate" style={{ color: "#e8f1fc" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* stats grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {statsLoading ? (
              <div className="col-span-2 py-8 text-center">
                <span className="text-[13px]" style={{ color: "#516070" }}>集計中…</span>
              </div>
            ) : (<>
              {(
                [
                  { label: "総釣果数", value: stats?.catchTotal   ?? 0, unit: "尾", Icon: IconFish,     color: "#10b981" },
                  { label: "魚種数",   value: stats?.speciesCount ?? 0, unit: "種", Icon: IconBook2,    color: "#a78bfa" },
                  { label: "タックル", value: tackleCount,               unit: "個", Icon: IconFishHook, color: "#0ea5e9" },
                  {
                    label: "自己最大",
                    value: stats?.maxFishCm ? `${stats.maxFishCm}cm` : "—",
                    unit:  stats?.maxFishName ?? "未記録",
                    Icon:  IconRuler,
                    color: "#f59e0b",
                  },
                ] as const
              ).map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl px-4 py-4"
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.Icon size={14} stroke={1.5} color="#64748b" />
                    <span className="text-[10px] font-semibold" style={{ color: "#64748b" }}>{s.label}</span>
                  </div>
                  <p className="text-[24px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: "#7c92ab" }}>{s.unit}</p>
                </div>
              ))}
            </>)}
          </div>

          {/* recent catches */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-white">最近の釣果</h2>
              <Link href="/catch-log" className="text-[12px] font-semibold" style={{ color: "#0ea5e9" }}>
                すべて見る →
              </Link>
            </div>
            {recentCatches.length === 0 ? (
              <div
                className="rounded-2xl px-5 py-6 text-center"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
              >
                <p className="text-[13px]" style={{ color: "#64748b" }}>まだ釣果がありません</p>
                <Link
                  href="/catch-log"
                  className="inline-block mt-2 text-[12px] font-semibold"
                  style={{ color: "#0ea5e9" }}
                >
                  釣果を記録する →
                </Link>
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}
              >
                {recentCatches.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < recentCatches.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}
                  >
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      <IconFish size={20} stroke={1.5} color="#516070" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold" style={{ color: "#e8f1fc" }}>{r.fish_name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>
                        {r.date}
                        {r.location ? ` · ${r.location}` : ""}
                        {r.length_cm ? ` · ${r.length_cm}cm` : ""}
                        {r.count > 1 ? ` · ${r.count}尾` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </>)}

        {/* ── notifications (always shown) ──────── */}
        {!loading && (
          <section>
            <h2 className="text-[16px] font-bold text-white mb-3">通知設定</h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)" }}
            >
              {[
                { label: "青物指数90点突破", sub: "釣果期待度が高くなったら通知", value: notifyFish,    set: setNotifyFish,    color: "#0ea5e9" },
                { label: "日の出まで30分",   sub: "朝まずめ出発の目安に",          value: notifySunrise, set: setNotifySunrise, color: "#f59e0b" },
                { label: "危険海況アラート", sub: "波・風が基準を超えたら通知",     value: notifySafety,  set: setNotifySafety,  color: "#ef4444" },
              ].map((n, i, arr) => (
                <div
                  key={n.label}
                  className="flex items-center gap-3 px-4 py-4"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}
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
        )}

        {/* ── links ─────────────────────────────── */}
        {!loading && (
          <div className="flex flex-col gap-1.5">
            {[
              { label: "釣果記録を見る",     href: "/catch-log" },
              { label: "タックルを登録する", href: "/tackle"    },
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
        )}

        {/* ── info links ────────────────────────── */}
        {!loading && (
          <div className="flex flex-col gap-1 pb-2">
            {[
              { label: "お問い合わせ",         href: "/contact" },
              { label: "プライバシーポリシー", href: "/privacy" },
              { label: "利用規約",             href: "/terms"   },
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
          </div>
        )}

        {/* ── β版注意書き ──────────────────────── */}
        {!loading && (
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
        )}

        <p className="text-center text-[10px] pb-2" style={{ color: "#64748b" }}>
          FishAI β版 · Shonan Fishing AI Assistant
        </p>

      </div>

      <BottomNav />
    </div>
  );
}
