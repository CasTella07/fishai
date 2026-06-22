import Link from "next/link";
import { generateDailyForecast } from "@/lib/shonanForecast";
import type { FishScore, HourlySlot, SafetyFactor } from "@/lib/shonanForecast";
import { getMethodByFish } from "@/data/fishingMethods";
import { BottomNav } from "@/components/BottomNav";
import type { PlanData } from "@/components/TodayPlanButton";
import { fetchTideDataMultiDay } from "@/lib/tideApi";
import { TIDE_LOCATIONS } from "@/data/tideLocations";
import { fetchFishingWeatherMultiDay } from "@/lib/weather";
import { SpotPickerSheet } from "@/components/SpotPickerSheet";
import { DayForecastCarousel } from "@/components/DayForecastCarousel";
import type { DayCarouselData } from "@/components/DayForecastCarousel";

/* ── Design tokens ─────────────────────────────── */
const C = {
  page:    "#07111F",
  card:    "#0D1B2E",
  border:  "rgba(255,255,255,0.09)",
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
  return `${m}月${d}日（${w}）`;
}
function scoreColor(s: number): string {
  return s >= 80 ? C.green : s >= 65 ? C.ocean : s >= 48 ? C.amber : C.text3;
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
    fetchFishingWeatherMultiDay(tideLoc.id, 5),
    fetchTideDataMultiDay({ lat: tideLoc.lat, lng: tideLoc.lng, date: dateStr, location: tideLoc }, 5),
  ]);

  const fcDays = await Promise.all(
    weatherDays.map((wd, i) =>
      generateDailyForecast(wd.date, tideLoc.id, { weather: wd, tide: tideDays[i] }),
    ),
  );

  const fc = fcDays[0];
  const { bestWindows, spotScores, fishScores, decision, safety, hourly } = fc;

  const topFish   = fishScores[0];
  const topMethod = getMethodByFish(topFish.fish.name);
  const bw0       = bestWindows[0];
  const topSpot   = spotScores[0];

  const lureName = topMethod?.lures[0]
    ? `${topMethod.lures[0].name}${topMethod.lures[0].weight ? ` ${topMethod.lures[0].weight}` : ""}`
    : "ルアー";
  const lureNote = topMethod?.depth.split("（")[0] ?? "";

  const planData: PlanData = {
    decisionType:   decision.type,
    decisionIcon:   decision.icon,
    decisionColor:  decision.color,
    decisionBg:     decision.bg,
    decisionBorder: decision.border,
    decisionReason: decision.reason,
    decisionAction: decision.action,
    spotName:       topSpot.spot.name,
    spotIcon:       topSpot.spot.icon,
    startTime:      bw0.startTime,
    endTime:        bw0.endTime,
    timeLabel:      bw0.label,
    fishName:       topFish.fish.name,
    fishEmoji:      topFish.fish.emoji,
    fishScore:      topFish.score,
    methodName:     topMethod?.technique.split("。")[0] ?? "ボトム中心",
    lureName,
    safetyLevel:    safety.overall,
    safetyColor:    safety.color,
    safetyBg:       safety.bg,
    safetyMessage:  safety.message,
    safetyIcon:     safety.icon,
    goScore:        fc.goScore,
    captainComment: fc.captainComment,
  };

  const carouselDays: DayCarouselData[] = fcDays.map((dayFc, i) => ({
    date:        dayFc.date,
    fc:          dayFc,
    tideData:    tideDays[i],
    weatherData: weatherDays[i],
    planData:    i === 0 ? planData : undefined,
  }));

  return (
    <div style={{ background: C.page, minHeight: "100dvh", paddingBottom: 88 }}>

      {/* ── HEADER ────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 px-4 pt-10 pb-3"
        style={{
          background: `${C.page}f0`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-black tracking-[-0.03em] text-white leading-none">
              Fish<span style={{ color: C.cyan }}>AI</span>
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold" style={{ color: C.text2 }}>{tideLoc.name}</span>
              <SpotPickerSheet currentId={tideLoc.id} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SafetyPill level={safety.overall} color={safety.color} />
            <span className="text-[11px]" style={{ color: C.text3 }}>{fmtDate(dateStr)}</span>
          </div>
        </div>
      </header>

      <main>

        {/* ══════════════════════════════════════════
            1. 今日行くべきか — AI 船長の判定
        ══════════════════════════════════════════ */}
        <section className="px-4 pt-4 pb-2">
          <div
            className="rounded-2xl px-5 py-5"
            style={{
              background: decision.bg,
              border: `1.5px solid ${decision.border}`,
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: decision.color }}
            >
              AI 船長の判定
            </p>

            {/* Decision + Score */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[56px] leading-none flex-shrink-0">{decision.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[34px] font-black leading-none text-white tracking-[-0.02em]">
                  {decision.type}
                </p>
                <p className="text-[12px] mt-2 leading-snug" style={{ color: C.text2 }}>
                  {decision.reason}
                </p>
              </div>
              <CircleGauge score={fc.goScore} />
            </div>

            {/* Action */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-2.5"
              style={{ background: "rgba(0,0,0,.25)" }}
            >
              <span className="text-[18px] leading-none flex-shrink-0">{bw0.icon}</span>
              <p className="text-[13px] font-semibold leading-snug" style={{ color: C.text1 }}>
                {decision.action}
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            2〜5. 今日の計画：どこへ / 何を / 何時 / 何を投げる
        ══════════════════════════════════════════ */}
        <Block label="今日の計画" px={16}>
          <div className="grid grid-cols-2 gap-2.5">
            <PlanFact
              icon="📍"
              label="行くポイント"
              main={topSpot.spot.name}
              sub={`期待度 ${topSpot.score}点`}
              color={scoreColor(topSpot.score)}
            />
            <PlanFact
              icon={topFish.fish.emoji}
              label="狙う魚"
              main={topFish.fish.name}
              sub={`期待度 ${topFish.score}点`}
              color={scoreColor(topFish.score)}
            />
            <PlanFact
              icon="⏰"
              label="狙い目時間"
              main={`${bw0.startTime}〜${bw0.endTime}`}
              sub={bw0.label}
              color={C.cyan}
            />
            <PlanFact
              icon="🎯"
              label="仕掛け"
              main={lureName}
              sub={lureNote}
              color={C.ocean}
            />
          </div>
        </Block>

        {/* ══════════════════════════════════════════
            4詳細. 時間帯別 期待度
        ══════════════════════════════════════════ */}
        <Block label="時間帯別 期待度" px={16}>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {hourly.map((slot) => <HourlyCard key={slot.id} slot={slot} />)}
          </div>
        </Block>

        {/* ══════════════════════════════════════════
            3詳細. 魚種別 期待度
        ══════════════════════════════════════════ */}
        <Block label="魚種別 期待度" px={16} href="/guide" linkText="図鑑を見る">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {fishScores.map((fs, i) => (
              <FishRankRow
                key={fs.fish.name}
                fs={fs}
                rank={i + 1}
                isLast={i === fishScores.length - 1}
                spotId={tideLoc.id}
              />
            ))}
          </div>
        </Block>

        {/* ══════════════════════════════════════════
            6. なぜその判断なのか — 判断の根拠
        ══════════════════════════════════════════ */}
        <Block label="判断の根拠" px={16}>

          {/* 4-condition grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <ConditionFact
              icon={fc.weather.icon}
              label="天気"
              value={fc.weather.label}
              score={fc.scoreBreakdown.weatherScore}
            />
            <ConditionFact
              icon="🌊"
              label="波"
              value={fc.weather.waveHeight}
              score={fc.scoreBreakdown.waveScore}
            />
            <ConditionFact
              icon="💨"
              label="風"
              value={`${fc.weather.windDir} ${fc.weather.windSpeed}`}
              score={fc.scoreBreakdown.windScore}
            />
            <ConditionFact
              icon="🌙"
              label="潮"
              value={fc.weather.tideType}
              score={fc.scoreBreakdown.tideScore}
            />
          </div>

          {/* Safety quick-check */}
          {safety.overall !== "安全" && (
            <div
              className="rounded-xl px-4 py-3.5 mb-3 flex items-start gap-2.5"
              style={{
                background: safety.overall === "危険"
                  ? "rgba(240,96,96,0.1)"
                  : "rgba(245,158,11,0.08)",
                border: `1px solid ${safety.overall === "危険" ? "rgba(240,96,96,.35)" : "rgba(245,158,11,.25)"}`,
              }}
            >
              <span className="text-[18px] leading-none flex-shrink-0">{safety.icon}</span>
              <p
                className="text-[12px] leading-relaxed font-semibold"
                style={{ color: safety.color }}
              >
                {safety.message}
              </p>
            </div>
          )}
          {safety.overall === "安全" && (
            <div
              className="rounded-xl px-4 py-3 mb-3 flex items-center gap-2"
              style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)" }}
            >
              <span className="text-[16px] leading-none">✅</span>
              <p className="text-[12px] font-semibold" style={{ color: C.green }}>
                良好なコンディションです
              </p>
            </div>
          )}

          {/* Captain comment */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: C.card, border: `1px solid ${C.borderM}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={C.cyan} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: C.cyan }}>
                今日の船長コメント
              </span>
            </div>
            <p className="text-[13px] leading-[1.85]" style={{ color: C.text2 }}>
              {fc.captainComment}
            </p>
            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <Link
                href={`/ai-chat?spot=${tideLoc.id}`}
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: C.ocean }}
              >
                AI船長に詳しく相談する
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </Block>

        {/* ══════════════════════════════════════════
            5日間の見通し（潮汐・気象詳細）
        ══════════════════════════════════════════ */}
        <section className="mb-5">
          <div className="flex items-end justify-between mb-2.5 px-4">
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>5日間の見通し</h2>
              <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>潮汐・気象の詳細データ</p>
            </div>
          </div>
          <DayForecastCarousel
            days={carouselDays}
            spotId={tideLoc.id}
            spotName={tideLoc.name}
          />
        </section>

        {/* ══════════════════════════════════════════
            みんなの釣果速報（準備中）
        ══════════════════════════════════════════ */}
        <Block label="みんなの釣果速報" px={16}>
          <div
            className="rounded-2xl px-5 py-5 flex flex-col items-center gap-3 text-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <span className="text-[32px]">🎣</span>
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.text1 }}>湘南釣果速報 — 準備中</p>
              <p className="text-[12px] mt-1 leading-snug" style={{ color: C.text2 }}>
                ユーザーの釣果をリアルタイムで共有する機能を開発中です。
              </p>
            </div>
            <Link
              href="/catch-log"
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold"
              style={{ background: `${C.ocean}18`, border: `1px solid ${C.ocean}40`, color: C.ocean }}
            >
              自分の釣果を記録する →
            </Link>
          </div>
        </Block>

        {/* ── β FOOTER ──────────────────────────────── */}
        <div className="px-4 pb-4">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-[10px] leading-relaxed mb-2" style={{ color: C.text3 }}>
              β版 — 釣行判断の参考情報としてご利用ください。天候・海況は必ず公式情報もご確認ください。
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

function Block({
  label, sub, href, linkText, px, children,
}: {
  label: string; sub?: string; href?: string; linkText?: string; px?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5" style={{ paddingInline: px }}>
      <div className="flex items-end justify-between mb-2.5">
        <div>
          <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>{label}</h2>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>{sub}</p>}
        </div>
        {href && linkText && (
          <Link href={href} className="text-[11px] font-medium" style={{ color: C.ocean }}>
            {linkText}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function SafetyPill({ level, color }: { level: string; color: string }) {
  const Icon =
    level === "安全" ? (
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ) : level === "注意" ? (
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.5" fill={color} stroke="none" />
      </svg>
    ) : (
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}1c`, border: `1px solid ${color}40` }}
    >
      {Icon} {level}
    </span>
  );
}

function CircleGauge({ score }: { score: number }) {
  const r     = 32;
  const circ  = 2 * Math.PI * r;
  const color = score >= 75 ? C.green : score >= 55 ? C.amber : C.red;
  const dash  = (score / 100) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5" />
      <circle cx="40" cy="40" r={r} fill="none"
              stroke={color} strokeWidth="5"
              strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)" />
      <text x="40" y="37" textAnchor="middle" fontSize="20" fontWeight="900"
            fill={color} fontFamily="system-ui, -apple-system, sans-serif">
        {score}
      </text>
      <text x="40" y="50" textAnchor="middle" fontSize="8"
            fill="rgba(255,255,255,.3)" fontFamily="system-ui, -apple-system, sans-serif">
        /100
      </text>
    </svg>
  );
}

/* ── 今日の計画 ─────────────────────────────────── */
function PlanFact({
  icon, label, main, sub, color,
}: {
  icon: string; label: string; main: string; sub: string; color: string;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[14px] leading-none">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.text3 }}>
          {label}
        </span>
      </div>
      <p className="text-[15px] font-bold leading-snug text-white">{main}</p>
      <p className="text-[10px] mt-1 truncate" style={{ color }}>{sub}</p>
    </div>
  );
}

/* ── 判断の根拠 ─────────────────────────────────── */
function ConditionFact({
  icon, label, value, score,
}: {
  icon: string; label: string; value: string; score: number;
}) {
  const c = scoreColor(score);
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] leading-none">{icon}</span>
          <span className="text-[10px] font-semibold" style={{ color: C.text3 }}>{label}</span>
        </div>
        <span className="text-[11px] font-black" style={{ color: c }}>{score}</span>
      </div>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: C.text1 }}>{value}</p>
      <div
        className="mt-1.5 rounded-full overflow-hidden"
        style={{ height: 2, background: "rgba(255,255,255,.07)" }}
      >
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: c }} />
      </div>
    </div>
  );
}

/* ── 時間帯カード ────────────────────────────────── */
function HourlyCard({ slot }: { slot: HourlySlot }) {
  const barH = Math.round((slot.score / 100) * 40);
  return (
    <div
      className="flex-shrink-0 w-[76px] rounded-xl flex flex-col items-center px-2 pt-3 pb-3 gap-1.5"
      style={{
        background: slot.isBest ? `${slot.color}14` : C.card,
        border: `1px solid ${slot.isBest ? `${slot.color}45` : C.border}`,
      }}
    >
      <p
        className="text-[11px] font-semibold leading-none"
        style={{ color: slot.isBest ? slot.color : C.text3 }}
      >
        {slot.label}
      </p>
      {slot.isBest && (
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none"
          style={{ color: slot.color, background: `${slot.color}20` }}
        >
          BEST
        </span>
      )}
      <div
        className="w-6 rounded-sm overflow-hidden"
        style={{
          height: 40, background: "rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}
      >
        <div className="w-full" style={{ height: barH, background: slot.color }} />
      </div>
      <p className="font-black text-[15px] leading-none" style={{ color: slot.color }}>
        {slot.score}
      </p>
      <p className="text-[9px] leading-none text-center whitespace-nowrap" style={{ color: C.text3 }}>
        {slot.timeRange}
      </p>
    </div>
  );
}

/* ── 魚種ランキング行 ───────────────────────────── */
function FishRankRow({ fs, rank, isLast, spotId = "chigasaki" }: { fs: FishScore; rank: number; isLast: boolean; spotId?: string }) {
  const method = getMethodByFish(fs.fish.name);
  const c = scoreColor(fs.score);
  return (
    <div
      className={`px-4 py-3.5 ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-black text-[11px] w-5 text-center flex-shrink-0"
          style={{ color: rank <= 3 ? c : C.text3 }}
        >
          {rank}
        </span>
        <span className="text-[19px] leading-none w-6 text-center flex-shrink-0">{fs.fish.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[13px] font-semibold" style={{ color: C.text1 }}>
              {fs.fish.name}
            </span>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ color: fs.fish.catColor, background: `${fs.fish.catColor}18` }}
            >
              {fs.fish.category}
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 2, background: "rgba(255,255,255,.07)" }}
          >
            <div className="h-full rounded-full" style={{ width: `${fs.score}%`, background: c }} />
          </div>
        </div>
        <span className="font-black text-[18px] flex-shrink-0" style={{ color: c }}>
          {fs.score}
        </span>
      </div>
      {rank <= 3 && method && (
        <div className="mt-2 ml-[52px] flex items-center justify-between gap-2">
          <span className="text-[10px] truncate" style={{ color: C.text3 }}>
            {method.lures[0]?.name}
            {method.lures[0]?.weight ? ` ${method.lures[0].weight}` : ""} · {method.depth.split("（")[0]}
          </span>
          <Link
            href={`/ai-chat?q=${encodeURIComponent(`${fs.fish.name}の仕掛けを詳しく教えて`)}&mode=tackle&spot=${spotId}`}
            className="text-[10px] font-semibold flex-shrink-0"
            style={{ color: C.ocean }}
          >
            詳細 →
          </Link>
        </div>
      )}
    </div>
  );
}
