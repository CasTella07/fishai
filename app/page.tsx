import Link from "next/link";
import { generateDailyForecast } from "@/lib/shonanForecast";
import { getMethodByFish } from "@/data/fishingMethods";
import { BottomNav } from "@/components/BottomNav";
import { fetchTideDataMultiDay } from "@/lib/tideApi";
import { TIDE_LOCATIONS } from "@/data/tideLocations";
import { fetchFishingWeatherMultiDay } from "@/lib/weather";
import { SpotPickerSheet } from "@/components/SpotPickerSheet";
import { LOCAL_REPORTS, PRO_FEATURES } from "@/data/shonanConditions";
import { DetailSection } from "@/components/DetailSection";
import type { FishScoreSimple } from "@/components/DetailSection";

/* ── Design tokens ─────────────────────────────── */
const C = {
  page:    "#07111F",
  card:    "#0D1B2E",
  border:  "rgba(255,255,255,0.07)",
  borderM: "rgba(255,255,255,0.13)",
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
  const w = ["日","月","火","水","木","金","土"][new Date(y, m - 1, d).getDay()];
  return `${m}/${d}（${w}）`;
}

/* ── ○ / △ / ✕ シンボル ── */
type CondSym = "good" | "ok" | "bad";
function symChar(s: CondSym) {
  return s === "good" ? "○" : s === "ok" ? "△" : "✕";
}
function symColor(s: CondSym) {
  return s === "good" ? C.green : s === "ok" ? C.amber : C.red;
}

/* ── 総評テキスト（1行）── */
function buildVerdict(score: number, decisionType: string, bwLabel: string): string {
  if (decisionType === "やめる" || score < 35)  return "今日はやめとけ";
  if (decisionType === "行くべき" && score >= 80) return `行くべき — ${bwLabel}が◎`;
  if (decisionType === "朝だけ行く")              return "行くなら朝まずめだけ";
  if (decisionType === "場所を変える")            return "場所を選べば行ける";
  return `行くなら${bwLabel}`;
}

/* ── キャプテン1行 ── */
function buildCaptainLine(topAreaName: string, topFishName: string, bwLabel: string): string {
  return `${bwLabel}は${topAreaName}で${topFishName}`;
}

/* ── ニュースドット色 ── */
function newsDot(type: "hot" | "info" | "caution") {
  return type === "hot" ? C.green : type === "caution" ? C.amber : C.ocean;
}
function newsTextColor(type: "hot" | "info" | "caution") {
  return type === "hot" ? C.text1 : type === "caution" ? C.amber : C.text2;
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

  const [weatherDays, tideDays] = await Promise.all([
    fetchFishingWeatherMultiDay(tideLoc.id, 1),
    fetchTideDataMultiDay({ lat: tideLoc.lat, lng: tideLoc.lng, date: dateStr, location: tideLoc }, 1),
  ]);
  const fc   = await generateDailyForecast(dateStr, tideLoc.id, { weather: weatherDays[0], tide: tideDays[0] });
  const tide = tideDays[0];

  /* ── 派生データ ── */
  const sb       = fc.scoreBreakdown;
  const bw0      = fc.bestWindows[0];
  const bw0Label = bw0?.label ?? "朝まずめ";
  const bw0Range = bw0 ? `${bw0.startTime}〜${bw0.endTime}` : "";
  const topFish  = fc.fishScores[0];
  const topSpot  = fc.spotScores.sort((a, b) => b.score - a.score)[0];

  /* 3条件シンボル */
  const windSym:  CondSym = sb.windScore >= 70 ? "good" : sb.windScore >= 40 ? "ok" : "bad";
  const waveSym:  CondSym = sb.waveScore >= 70 ? "good" : sb.waveScore >= 40 ? "ok" : "bad";
  const tideSym:  CondSym = sb.tideScore >= 70 ? "good" : sb.tideScore >= 40 ? "ok" : "bad";

  const windDetail  = `${sb.windSpeedMs.toFixed(1)}m ${fc.weather.windDir}`;
  const waveDetail  = `${sb.waveHeightM.toFixed(1)}m`;
  const tideDetail  = fc.weather.tideType;

  const verdict      = buildVerdict(fc.goScore, fc.decision.type, bw0Label);
  const captainLine  = buildCaptainLine(
    topSpot?.spot.name ?? "相模川河口",
    topFish?.fish.name ?? "シーバス",
    bw0Label,
  );

  const topMethod = getMethodByFish(topFish?.fish.name ?? "");
  const lureName  = topMethod?.lures[0]?.name ?? "ルアー";

  /* DetailSection に渡すシリアライズ可能データ */
  const fishScoresSimple: FishScoreSimple[] = fc.fishScores.slice(0, 6).map((f) => ({
    name:     f.fish.name,
    emoji:    f.fish.emoji,
    stars:    f.stars,
    bestTime: f.bestTime,
    bestSpot: f.bestSpot,
  }));

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
              <span className="text-[11px] font-semibold" style={{ color: C.text3 }}>
                湘南釣り判断AI
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[12px]" style={{ color: C.text3 }}>{tideLoc.name}</span>
              <SpotPickerSheet currentId={tideLoc.id} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <SafetyPill level={fc.safety.overall} color={fc.safety.color} />
            <span className="text-[11px]" style={{ color: C.text3 }}>{fmtDate(dateStr)}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col">

        {/* ══ HERO: 今日、行く？ ════════════════════ */}
        <section className="px-4 pt-6 pb-2">
          {/* メイン問い */}
          <p
            className="text-[13px] font-bold mb-1"
            style={{ color: C.text3, letterSpacing: "0.04em" }}
          >
            {fmtDate(dateStr)} · {tideLoc.name}
          </p>
          <h2
            className="text-[38px] font-black leading-none tracking-[-0.03em] mb-5"
            style={{ color: C.text1 }}
          >
            今日、行く？
          </h2>

          {/* スコアカード */}
          <div
            className="rounded-3xl px-6 py-6 relative overflow-hidden"
            style={{
              background: fc.decision.bg,
              border: `1.5px solid ${fc.decision.border}`,
            }}
          >
            {/* 背景グロー */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${fc.decision.color}18, transparent 60%)`,
              }}
            />

            <div className="relative flex items-end gap-4">
              {/* スコア数字 */}
              <div>
                <div className="flex items-end gap-1 leading-none">
                  <span
                    className="font-black"
                    style={{ fontSize: 76, lineHeight: 1, color: fc.decision.color }}
                  >
                    {fc.goScore}
                  </span>
                  <span
                    className="text-[22px] font-black mb-2"
                    style={{ color: fc.decision.color }}
                  >
                    点
                  </span>
                </div>
                {/* 総評 */}
                <p
                  className="text-[18px] font-black mt-1 leading-tight"
                  style={{ color: C.text1 }}
                >
                  {verdict}
                </p>
                {bw0Range && (
                  <p className="text-[13px] mt-1 font-semibold" style={{ color: C.text2 }}>
                    {bw0Range}
                  </p>
                )}
              </div>

              {/* アイコン */}
              <span
                className="text-[56px] leading-none ml-auto self-start mt-1"
              >
                {fc.decision.icon}
              </span>
            </div>
          </div>
        </section>

        {/* ══ 根拠: 風・波・潮 ══════════════════════ */}
        <section className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.text3 }}>
            根拠
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: C.border }}>
              {[
                { label: "風",  sym: windSym,  detail: windDetail  },
                { label: "波",  sym: waveSym,  detail: waveDetail  },
                { label: "潮",  sym: tideSym,  detail: tideDetail  },
              ].map((item) => (
                <div key={item.label} className="px-4 py-4 flex flex-col items-center gap-2">
                  <p className="text-[11px] font-semibold" style={{ color: C.text3 }}>
                    {item.label}
                  </p>
                  <span
                    className="text-[28px] font-black leading-none"
                    style={{ color: symColor(item.sym) }}
                  >
                    {symChar(item.sym)}
                  </span>
                  <p className="text-[10px] font-medium text-center leading-tight" style={{ color: C.text2 }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AI船長の判断 ══════════════════════════ */}
        <section className="px-4 pt-2 pb-2">
          <div
            className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: C.card, border: `1.5px solid ${C.borderM}` }}
          >
            <span className="text-[22px] leading-none flex-shrink-0 mt-0.5">⚓</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: C.cyan }}>
                AI 船長の判断
              </p>
              <p className="text-[16px] font-black leading-snug" style={{ color: C.text1 }}>
                {captainLine}
              </p>
              <p className="text-[12px] mt-1.5 leading-snug" style={{ color: C.text2 }}>
                {fc.captainComment}
              </p>
              {topFish && (
                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
                  <span className="text-[18px] leading-none">{topFish.fish.emoji}</span>
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: C.text2 }}>
                      本命ルアー：<span style={{ color: C.ocean }}>{lureName}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ 湘南速報 ═══════════════════════════════ */}
        <section className="px-4 pt-2 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: C.text3 }}>
            湘南速報
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {LOCAL_REPORTS.slice(0, 4).map((r, i) => (
              <div
                key={r.id}
                className="px-4 py-3.5 flex items-start gap-3"
                style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: newsDot(r.type) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold" style={{ color: C.text3 }}>{r.timeLabel}</span>
                    <span className="text-[11px] font-semibold" style={{ color: C.ocean }}>{r.spot}</span>
                  </div>
                  <p className="text-[13px] leading-snug" style={{ color: newsTextColor(r.type) }}>
                    {r.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 詳細を見る（アコーディオン） ══════════ */}
        <div className="pt-2">
          <DetailSection
            tideData={tide}
            bwStartTime={bw0?.startTime ?? "5:00"}
            bwEndTime={bw0?.endTime ?? "7:30"}
            spotName={tideLoc.name}
            weatherIcon={fc.weather.icon}
            weatherLabel={fc.weather.label}
            tempC={fc.weather.tempC}
            precipPct={sb.precipPct}
            windDir={fc.weather.windDir}
            windSpeedMs={sb.windSpeedMs}
            waveHeightM={sb.waveHeightM}
            fishScores={fishScoresSimple}
            spotScores={fc.spotScores.map((s) => ({
              name:  s.spot.name,
              score: s.score,
            }))}
          />
        </div>

        {/* ══ FishAI Pro ════════════════════════════ */}
        <section className="px-4 mb-5">
          <div
            className="rounded-2xl px-5 py-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0D1B2E 0%, #0a2040 100%)",
              border: `1.5px solid ${C.ocean}35`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: `${C.ocean}12`,
                filter: "blur(30px)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div className="mb-3">
              <span
                className="inline-block text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full mb-2"
                style={{ color: C.ocean, background: `${C.ocean}18`, border: `1px solid ${C.ocean}40` }}
              >
                FishAI Pro
              </span>
              <p className="text-[16px] font-black text-white leading-snug">
                湘南の釣れる理由を
                <br />もっと深く見る
              </p>
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
              style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.cyan})`, color: "#fff" }}
            >
              Pro を見る
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── クイックリンク ── */}
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
                <span className="text-[12px] font-semibold" style={{ color: C.text2 }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── β FOOTER ── */}
        <div className="px-4 pb-4">
          <div className="rounded-xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: C.text3 }}>
              β版 — 釣行判断の参考情報としてご利用ください。天候・海況は必ず公式情報もご確認ください。
            </p>
            <div className="flex gap-4">
              {[
                { href: "/terms",   label: "利用規約" },
                { href: "/privacy", label: "プライバシー" },
                { href: "/contact", label: "お問い合わせ" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-[10px]" style={{ color: C.text3 }}>{label}</Link>
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
   SUB-COMPONENTS (server-side only)
══════════════════════════════════════════════════ */

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
