import Link from "next/link";
import { generateDailyForecast } from "@/lib/shonanForecast";
import type { FishScore } from "@/lib/shonanForecast";
import { getMethodByFish } from "@/data/fishingMethods";
import { BottomNav } from "@/components/BottomNav";
import { fetchTideDataMultiDay } from "@/lib/tideApi";
import { TIDE_LOCATIONS } from "@/data/tideLocations";
import { fetchFishingWeatherMultiDay } from "@/lib/weather";
import { SpotPickerSheet } from "@/components/SpotPickerSheet";
import {
  AREA_REPORTS, LOCAL_REPORTS, PRO_FEATURES,
} from "@/data/bulletinData";
import type { AreaReport, LocalReport } from "@/data/bulletinData";

/* ── Design tokens ─────────────────────────────── */
const C = {
  page:    "#07111F",
  card:    "#0D1B2E",
  cardB:   "#111E30",
  border:  "rgba(255,255,255,0.08)",
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

/* ── Utilities ──────────────────────────────────── */
function todayJST(): string {
  const now = new Date();
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
}
function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(y, m - 1, d).getDay()];
  return `${m}/${d}（${w}）`;
}
function toStars(score: number): number {
  if (score >= 82) return 5;
  if (score >= 66) return 4;
  if (score >= 50) return 3;
  if (score >= 34) return 2;
  return 1;
}
function tagStyle(tag: string): { color: string; bg: string } {
  const t = tag.toLowerCase();
  if (/(注意|高め|危険|強い|渋め)/.test(t))
    return { color: C.amber, bg: "rgba(245,158,11,.12)" };
  if (/(気配|回遊|好調|有利|◎|好条件|強|期待)/.test(t))
    return { color: C.green, bg: "rgba(16,185,129,.12)" };
  return { color: C.text3, bg: "rgba(255,255,255,.06)" };
}
function reportStyle(type: LocalReport["type"]) {
  if (type === "hot")     return { color: C.green, dot: C.green,  label: "情報" };
  if (type === "caution") return { color: C.amber, dot: C.amber,  label: "注意" };
  return                         { color: C.text2, dot: C.ocean,  label: "速報" };
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string }>;
}) {
  const { spot: spotId } = await searchParams;
  const dateStr = todayJST();
  const tideLoc = TIDE_LOCATIONS.find((l) => l.id === (spotId ?? "chigasaki")) ?? TIDE_LOCATIONS[0];

  /* ── 実データ取得（today のみ） ── */
  const [weatherDays, tideDays] = await Promise.all([
    fetchFishingWeatherMultiDay(tideLoc.id, 1),
    fetchTideDataMultiDay({ lat: tideLoc.lat, lng: tideLoc.lng, date: dateStr, location: tideLoc }, 1),
  ]);
  const fc = await generateDailyForecast(dateStr, tideLoc.id, {
    weather: weatherDays[0],
    tide: tideDays[0],
  });

  const { bestWindows, spotScores, fishScores, decision, safety } = fc;
  const bw0 = bestWindows[0];
  const bw1 = bestWindows[1] ?? bestWindows[0];
  const topFish = fishScores[0];
  const eveningFish = fishScores.find(
    (f) => f.fish.name !== topFish.fish.name && ["マゴチ", "シーバス", "ヒラメ", "タチウオ"].includes(f.fish.name),
  ) ?? fishScores[1];

  /* ── エリアデータ（実スコア + モック内容を合成） ── */
  const enrichedAreas = AREA_REPORTS.map((area) => {
    const ss = spotScores.find((s) => s.spot.id === area.spotId);
    const base = ss?.score ?? 55;
    // 辻堂は西浜から -4 pt（同エリアで差別化）
    const score = area.id === "tsujido" ? Math.max(10, base - 4) : base;
    const stars = toStars(score);
    const isGood = score >= 60;
    const isBad  = score < 50;
    const tags = [
      ...area.alwaysTags,
      ...(isGood ? area.goodTags : isBad ? area.badTags : []),
    ];
    const comment = isGood ? area.goodComment : isBad ? area.badComment : area.normalComment;
    return { ...area, score, stars, tags, comment };
  }).sort((a, b) => b.score - a.score);

  const topArea     = enrichedAreas[0];
  const eveningArea = enrichedAreas.find((a) => a.id !== topArea.id) ?? enrichedAreas[1];

  /* ── 今日の勝ち筋 ── */
  const winEntries: WinEntry[] = [
    {
      timeIcon:  bw0.icon,
      timeLabel: bw0.label,
      timeRange: `${bw0.startTime}〜${bw0.endTime}`,
      areaName:  topArea.shortName,
      fishName:  topFish.fish.name,
      fishEmoji: topFish.fish.emoji,
      isKey:     true,
      score:     bw0.score,
    },
    {
      timeIcon:  "☀️",
      timeLabel: "日中",
      timeRange: "10:00〜15:00",
      areaName:  null,
      fishName:  "様子見",
      fishEmoji: "👁️",
      isKey:     false,
      score:     38,
      note:      "潮が緩む時間帯。移動・準備や昼寝に充てよう",
    },
    {
      timeIcon:  bw1.icon,
      timeLabel: bw1.label,
      timeRange: `${bw1.startTime}〜${bw1.endTime}`,
      areaName:  eveningArea.shortName,
      fishName:  eveningFish.fish.name,
      fishEmoji: eveningFish.fish.emoji,
      isKey:     bw1.score >= 58,
      score:     bw1.score,
    },
  ];

  /* ── Pro ── */
  const topMethod = getMethodByFish(topFish.fish.name);
  const lureName  = topMethod?.lures[0]?.name ?? "ルアー";

  /* ─────────────────────────────────────────────── */
  return (
    <div style={{ background: C.page, minHeight: "100dvh", paddingBottom: 96 }}>

      {/* ══ ヘッダー ══════════════════════════════ */}
      <header
        className="sticky top-0 z-40 px-4 pt-10 pb-3"
        style={{
          background: `${C.page}f0`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[22px] font-black tracking-[-0.03em] text-white leading-none">
                Fish<span style={{ color: C.cyan }}>AI</span>
              </h1>
              <span className="text-[11px] font-semibold" style={{ color: C.cyan }}>
                湘南釣り速報
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[12px]" style={{ color: C.text3 }}>{tideLoc.name}</span>
              <SpotPickerSheet currentId={tideLoc.id} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <SafetyPill level={safety.overall} color={safety.color} />
            <span className="text-[11px]" style={{ color: C.text3 }}>{fmtDate(dateStr)}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-0">

        {/* ══ 1. AI船長の総評 ═══════════════════════ */}
        <section className="px-4 pt-4 pb-1">
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: C.card, border: `1.5px solid ${C.borderM}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke={C.cyan} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: C.cyan }}>
                AI 船長の総評
              </span>
            </div>
            <p className="text-[14px] font-semibold leading-[1.75]" style={{ color: C.text1 }}>
              {fc.captainComment}
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
              <Link
                href={`/ai-chat?spot=${tideLoc.id}`}
                className="text-[12px] font-semibold flex items-center gap-1"
                style={{ color: C.ocean }}
              >
                AI船長に詳しく相談する →
              </Link>
            </div>
          </div>
        </section>

        {/* ══ 2. 今日の湘南指数 ════════════════════ */}
        <section className="px-4 pt-3 pb-1">
          <div
            className="rounded-xl px-4 py-3.5 flex items-center gap-3"
            style={{
              background: decision.bg,
              border: `1px solid ${decision.border}`,
            }}
          >
            <span className="text-[32px] leading-none flex-shrink-0">{decision.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: C.text3 }}>今日の湘南指数</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className="text-[28px] font-black leading-none"
                  style={{ color: decision.color }}
                >
                  {fc.goScore}
                </span>
                <span className="text-[12px] font-bold" style={{ color: decision.color }}>
                  点 — {decision.type}
                </span>
              </div>
            </div>
            <div
              className="flex-shrink-0 rounded-xl px-3 py-2 text-right"
              style={{ background: "rgba(0,0,0,.2)" }}
            >
              <p className="text-[9px] font-semibold" style={{ color: C.text3 }}>狙い目</p>
              <p className="text-[12px] font-bold mt-0.5" style={{ color: C.cyan }}>
                {bw0.label}
              </p>
              <p className="text-[10px]" style={{ color: C.text2 }}>
                {bw0.startTime}〜{bw0.endTime}
              </p>
            </div>
          </div>
        </section>

        {/* ══ 3. 今日はどこが熱い？ランキング ══════ */}
        <Sec label="今日はどこが熱い？" sub={`${fmtDate(dateStr)} 湘南エリア別ランキング`}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {enrichedAreas.map((area, i) => (
              <div
                key={area.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < enrichedAreas.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                {/* Rank */}
                <span
                  className="text-[13px] font-black w-5 text-center flex-shrink-0"
                  style={{ color: i === 0 ? C.amber : i === 1 ? C.text2 : C.text3 }}
                >
                  {i + 1}
                </span>

                {/* Icon */}
                <span className="text-[18px] leading-none w-7 text-center flex-shrink-0">
                  {area.typeIcon}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[14px] font-bold" style={{ color: C.text1 }}>
                      {area.name}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: C.text3 }}>
                      {area.typeLabel}
                    </span>
                  </div>
                  <StarRow count={area.stars} />
                </div>

                {/* Fish tags */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-[11px] font-semibold" style={{ color: C.text2 }}>
                    {area.targetFish.slice(0, 2).join(" · ")}
                  </p>
                  {area.beginnerOk && (
                    <span className="text-[9px] font-bold" style={{ color: C.green }}>
                      初心者OK
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Sec>

        {/* ══ 4. 湘南エリア速報カード（横スクロール） ══ */}
        <section className="mb-5">
          <div className="flex items-end justify-between mb-2.5 px-4">
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>
                湘南エリア速報
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>
                各エリアの今日の状況
              </p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {enrichedAreas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </section>

        {/* ══ 5. AI船長の今日の勝ち筋 ══════════════ */}
        <Sec label="AI船長の今日の勝ち筋" sub="時間帯別・エリア別 行動ガイド">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {winEntries.map((entry, i) => (
              <WinRow
                key={entry.timeLabel}
                entry={entry}
                isLast={i === winEntries.length - 1}
              />
            ))}
            {safety.overall !== "安全" && (
              <div
                className="px-4 py-3.5 flex items-start gap-2.5"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <span className="text-[16px] flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-[11px] font-bold mb-0.5" style={{ color: C.amber }}>
                    安全注意
                  </p>
                  <p className="text-[12px] leading-snug" style={{ color: C.text2 }}>
                    {safety.message}
                    {" — ライフジャケット着用を強く推奨します。"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2.5 px-1">
            <p className="text-[10px] leading-relaxed" style={{ color: C.text3 }}>
              ※ 本日の本命ルアー：<span style={{ color: C.ocean }}>{lureName}</span>。
              仕掛けの詳細はAI船長に相談を。
            </p>
          </div>
        </Sec>

        {/* ══ 6. ローカル速報 ═══════════════════════ */}
        <Sec label="ローカル速報" sub="釣り人からの情報・AI観測レポート">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {LOCAL_REPORTS.map((r, i) => {
              const s = reportStyle(r.type);
              return (
                <div
                  key={r.id}
                  className="px-4 py-3.5 flex items-start gap-3"
                  style={{
                    borderBottom: i < LOCAL_REPORTS.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background: s.dot }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold" style={{ color: C.text3 }}>
                        {r.timeLabel}
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: C.ocean }}>
                        {r.spot}
                      </span>
                    </div>
                    <p className="text-[13px] leading-snug" style={{ color: s.color }}>
                      {r.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 px-1">
            <p className="text-[10px]" style={{ color: C.text3 }}>
              ※ ローカル速報の投稿機能は近日公開予定です
            </p>
          </div>
        </Sec>

        {/* ══ 7. FishAI Pro ════════════════════════ */}
        <section className="px-4 mb-5">
          <div
            className="rounded-2xl px-5 py-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #0a2040 100%)",
              border: `1.5px solid ${C.ocean}35`,
            }}
          >
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: `${C.ocean}12`, filter: "blur(30px)", transform: "translate(30%, -30%)" }}
            />

            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className="inline-block text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full mb-2"
                  style={{ color: C.ocean, background: `${C.ocean}18`, border: `1px solid ${C.ocean}40` }}
                >
                  FishAI Pro
                </span>
                <p className="text-[16px] font-black text-white leading-snug">
                  湘南の釣れるタイミングを
                  <br />もっと深く見る
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-2 mb-4">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke={C.cyan} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-[12px]" style={{ color: C.text2 }}>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/pro"
              className="inline-flex items-center gap-2 w-full justify-center py-3.5 rounded-xl text-[14px] font-black"
              style={{
                background: `linear-gradient(135deg, ${C.ocean}, ${C.cyan})`,
                color: "#fff",
              }}
            >
              Pro を見る
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ══ 8. AI相談・他機能への導線 ════════════ */}
        <section className="px-4 mb-5">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: "/catch-log", icon: "📝", label: "釣果を記録する" },
              { href: "/tackle",    icon: "🎣", label: "タックル登録"   },
              { href: "/ai-chat",   icon: "🤖", label: "AI船長に相談"   },
              { href: "/guide",     icon: "📖", label: "湘南魚図鑑"     },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <span className="text-[18px] leading-none">{item.icon}</span>
                <span className="text-[12px] font-semibold" style={{ color: C.text2 }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── β FOOTER ──────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="rounded-xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: C.text3 }}>
              β版 — 釣行判断の参考情報としてご利用ください。天候・海況は必ず公式情報もご確認ください。
              危険を感じる場合は釣行を中止してください。
            </p>
            <div className="flex gap-4">
              {[
                { href: "/terms",   label: "利用規約" },
                { href: "/privacy", label: "プライバシー" },
                { href: "/contact", label: "お問い合わせ" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-[10px]" style={{ color: C.text3 }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════ */

/* ── セクションラッパー ── */
function Sec({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="px-4 mb-5">
      <div className="mb-2.5">
        <h2 className="text-[13px] font-bold" style={{ color: "#E2EAF4" }}>{label}</h2>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: "#516070" }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/* ── 星ランキング ── */
function StarRow({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
             fill={i <= count ? "#F59E0B" : "none"}
             stroke={i <= count ? "#F59E0B" : "rgba(255,255,255,.15)"}
             strokeWidth={1.5}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── 安全ピル ── */
function SafetyPill({ level, color }: { level: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}1c`, border: `1px solid ${color}40` }}
    >
      {level === "安全" ? "✓" : level === "注意" ? "⚠" : "✕"} {level}
    </span>
  );
}

/* ── エリアカード（横スクロール用） ── */
type EnrichedArea = AreaReport & {
  score: number;
  stars: number;
  tags: string[];
  comment: string;
};

function AreaCard({ area }: { area: EnrichedArea }) {
  const scoreC =
    area.score >= 66 ? "#10B981" : area.score >= 50 ? "#0EA5E9" : area.score >= 34 ? "#F59E0B" : "#516070";

  return (
    <div
      className="flex-shrink-0 rounded-2xl flex flex-col gap-0 overflow-hidden"
      style={{
        width: 195,
        background: "#0D1B2E",
        border: `1px solid rgba(255,255,255,.08)`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="text-[10px] font-semibold" style={{ color: "#516070" }}>
              {area.typeIcon} {area.typeLabel}
            </span>
            <p className="text-[16px] font-black text-white leading-tight mt-0.5">
              {area.name}
            </p>
          </div>
          <span
            className="text-[20px] font-black leading-none flex-shrink-0"
            style={{ color: scoreC }}
          >
            {area.score}
          </span>
        </div>
        <StarRow count={area.stars} size={11} />
      </div>

      {/* Tags */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
        {area.tags.slice(0, 3).map((tag) => {
          const s = tagStyle(tag);
          return (
            <span
              key={tag}
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: s.color, background: s.bg }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Fish */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {area.targetFish.map((f) => (
          <span key={f} className="text-[10px] font-semibold" style={{ color: "#8AA0B5" }}>
            {f}
          </span>
        ))}
      </div>

      {/* Comment */}
      <div
        className="px-4 pt-3 pb-4 flex-1"
        style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}
      >
        <p className="text-[11px] leading-[1.7]" style={{ color: "#8AA0B5" }}>
          {area.comment}
        </p>
        {area.beginnerOk && (
          <span
            className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: "#10B981", background: "rgba(16,185,129,.12)" }}
          >
            ✓ 初心者OK
          </span>
        )}
      </div>
    </div>
  );
}

/* ── 勝ち筋行 ── */
interface WinEntry {
  timeIcon: string;
  timeLabel: string;
  timeRange: string;
  areaName: string | null;
  fishName: string;
  fishEmoji: string;
  isKey: boolean;
  score: number;
  note?: string;
}

function WinRow({ entry, isLast }: { entry: WinEntry; isLast: boolean }) {
  const c = entry.score >= 75 ? "#10B981" : entry.score >= 55 ? "#F59E0B" : "#516070";
  return (
    <div
      className="px-4 py-4 flex items-start gap-3.5"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,.07)" }}
    >
      {/* Time icon */}
      <span className="text-[22px] leading-none flex-shrink-0 mt-0.5">{entry.timeIcon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-bold" style={{ color: "#E2EAF4" }}>
            {entry.timeLabel}
          </span>
          <span className="text-[11px]" style={{ color: "#516070" }}>{entry.timeRange}</span>
          {entry.isKey && (
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
              style={{ color: "#10B981", background: "rgba(16,185,129,.15)" }}
            >
              KEY TIME
            </span>
          )}
        </div>

        {entry.areaName ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold" style={{ color: "#0EA5E9" }}>
              📍{entry.areaName}
            </span>
            <span className="text-[12px]" style={{ color: "#8AA0B5" }}>→</span>
            <span className="text-[13px] font-bold" style={{ color: c }}>
              {entry.fishEmoji} {entry.fishName}
            </span>
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "#516070" }}>
            {entry.note ?? "様子見"}
          </p>
        )}
      </div>
    </div>
  );
}
