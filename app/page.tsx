import Link from "next/link";
import { generateDailyForecast } from "@/lib/shonanForecast";
import type { SpotScore } from "@/lib/shonanForecast";
import { getMethodByFish } from "@/data/fishingMethods";
import { BottomNav } from "@/components/BottomNav";
import { fetchTideDataMultiDay } from "@/lib/tideApi";
import type { TideData } from "@/lib/tideApi";
import { TIDE_LOCATIONS } from "@/data/tideLocations";
import { fetchFishingWeatherMultiDay } from "@/lib/weather";
import { SpotPickerSheet } from "@/components/SpotPickerSheet";
import {
  AREA_RANKING_REASONS,
  AREA_CONDITION_DETAILS,
  LOCAL_REPORTS,
  PRO_FEATURES,
} from "@/data/shonanConditions";
import { AREA_REPORTS } from "@/data/bulletinData";
import type { LocalReport } from "@/data/shonanConditions";

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
function toStars(score: number): number {
  if (score >= 82) return 5;
  if (score >= 66) return 4;
  if (score >= 50) return 3;
  if (score >= 34) return 2;
  return 1;
}
function scoreColor(score: number): string {
  if (score >= 70) return C.green;
  if (score >= 50) return C.ocean;
  if (score >= 35) return C.amber;
  return C.red;
}

/* ── 潮位フェーズ（隣接時刻の差で判定） ── */
function tidePhaseLabel(points: { hour: number; level: number }[], hour: number): string {
  const cur  = points.find((p) => p.hour === hour)?.level ?? 50;
  const next = points.find((p) => p.hour === Math.min(hour + 1, 24))?.level ?? cur;
  const diff = next - cur;
  if (diff > 3)  return "上げ潮";
  if (diff < -3) return "下げ潮";
  return "潮止まり";
}

/* ── ミニタイドグラフ用スロット（3時間刻み） ── */
interface MiniTideSlot {
  hour:      number;
  label:     string;
  level:     number;
  phase:     string;
  isBest:    boolean;
  badgeText?: string;
}
function buildMiniTideSlots(tide: TideData, bwStartTime: string, bwEndTime: string,
  bw2StartTime: string, bw2EndTime: string,
  sunriseH: number, sunsetH: number): MiniTideSlot[] {
  const hours = [5, 8, 11, 14, 17, 20];
  const s0 = parseInt(bwStartTime || "0");
  const e0 = parseInt(bwEndTime   || "0");
  const s1 = parseInt(bw2StartTime|| "0");
  const e1 = parseInt(bw2EndTime  || "0");

  return hours.map((h) => {
    const level = tide.points.find((p) => p.hour === h)?.level ?? 50;
    const phase = tidePhaseLabel(tide.points, h);
    const isBest = (h >= s0 && h < e0) || (h >= s1 && h < e1);
    let badgeText: string | undefined;
    if (Math.abs(h - Math.round(sunriseH)) <= 1) badgeText = "朝まずめ";
    else if (Math.abs(h - Math.round(sunsetH)) <= 1) badgeText = "夕まずめ";
    else if (isBest) badgeText = "◎";
    return { hour: h, label: `${h}:00`, level, phase, isBest, badgeText };
  });
}

/* ── 根拠パネルデータ（実データから生成） ── */
interface CondPanel {
  icon:  string;
  label: string;
  value: string;
  note:  string;
  level: "good" | "ok" | "caution" | "danger";
}
function condLevelColor(level: CondPanel["level"]): string {
  if (level === "good")    return C.green;
  if (level === "ok")      return C.ocean;
  if (level === "caution") return C.amber;
  return C.red;
}

interface ForecastForCond {
  goScore: number;
  weather: { tideType: string; windDir: string };
  scoreBreakdown: {
    tideScore: number; windScore: number; waveScore: number;
    windSpeedMs: number; waveHeightM: number; precipPct: number;
  };
  bestWindows: { label: string; startTime: string; endTime: string }[];
  safety: { overall: string; message: string };
}

function buildCondPanels(fc: ForecastForCond): CondPanel[] {
  const sb = fc.scoreBreakdown;
  const w  = fc.weather;

  const tidalLevel: CondPanel["level"] =
    sb.tideScore >= 70 ? "good" : sb.tideScore >= 50 ? "ok" : "caution";
  const windLevel: CondPanel["level"] =
    sb.windScore >= 80 ? "good" : sb.windScore >= 55 ? "ok" : sb.windScore >= 30 ? "caution" : "danger";
  const waveLevel: CondPanel["level"] =
    sb.waveScore >= 80 ? "good" : sb.waveScore >= 60 ? "ok" : sb.waveScore >= 35 ? "caution" : "danger";
  const safetyLevel: CondPanel["level"] =
    fc.safety.overall === "安全" ? "good" : fc.safety.overall === "注意" ? "caution" : "danger";

  return [
    {
      icon:  "🌊",
      label: "潮",
      value: `${w.tideType} / ${sb.tideScore >= 60 ? "動きあり" : "動き弱め"}`,
      note:  sb.tideScore >= 70
        ? "大潮・中潮で潮の動きが活発。シーバス・クロダイにチャンス"
        : sb.tideScore >= 50
        ? "そこそこの潮回り。朝夕マズメを活かそう"
        : "潮の動きが弱い。時間帯を選んで釣行を",
      level: tidalLevel,
    },
    {
      icon:  "💨",
      label: "風",
      value: `${w.windDir} ${sb.windSpeedMs.toFixed(1)}m`,
      note:  windLevel === "good"
        ? "弱風で釣りやすい。ルアーも操作しやすい"
        : windLevel === "ok"
        ? "やや風あり。風向きをチェックして釣り座を選ぼう"
        : windLevel === "caution"
        ? "風が強め。足元注意・ライン管理に気をつけて"
        : "強風。釣行判断は慎重に",
      level: windLevel,
    },
    {
      icon:  "🏄",
      label: "波",
      value: `${sb.waveHeightM.toFixed(1)}m / ${waveLevel === "good" || waveLevel === "ok" ? "サーフ可" : "荒れ気味"}`,
      note:  waveLevel === "good"
        ? "波低め。サーフ・磯どちらも快適"
        : waveLevel === "ok"
        ? "やや波あり。サーフでも問題ない範囲"
        : waveLevel === "caution"
        ? "波高め。初心者は港・河口への変更を検討"
        : "高波注意。磯・サーフは危険",
      level: waveLevel,
    },
    {
      icon:  "🎯",
      label: "時間帯",
      value: fc.bestWindows.length > 0
        ? `${fc.bestWindows[0].label} ${fc.bestWindows[0].startTime}〜${fc.bestWindows[0].endTime}`
        : "要確認",
      note:  "最も釣れる時間帯。この前後1時間が特に狙い目",
      level: "good",
    },
    {
      icon:  "🌫️",
      label: "水色",
      value: sb.precipPct >= 40 ? "やや濁り" : "普通",
      note:  sb.precipPct >= 40
        ? "濁りが入るとシーバス・クロダイに有利"
        : "クリアな水色。ルアーカラーはナチュラル系が○",
      level: sb.precipPct >= 40 ? "good" : "ok",
    },
    {
      icon:  "🐟",
      label: "ベイト",
      value: fc.goScore >= 65 ? "気配あり" : "確認なし",
      note:  fc.goScore >= 65
        ? "ベイトフィッシュの気配。表層から攻めよう"
        : "ベイトは少なめ。底付近や流れ目を狙おう",
      level: fc.goScore >= 65 ? "good" : "ok",
    },
    {
      icon:  "⚠️",
      label: "安全性",
      value: fc.safety.overall,
      note:  fc.safety.overall === "安全"
        ? "全エリア安全圏。ライフジャケット着用を推奨"
        : fc.safety.overall === "注意"
        ? "一部エリアで注意が必要。磯・サーフは慎重に"
        : "危険な海況あり。安全第一で行動してください",
      level: safetyLevel,
    },
  ];
}

/* ── エリアランキング ── */
interface RankedArea {
  spotId:     string;
  name:       string;
  typeIcon:   string;
  score:      number;
  stars:      number;
  reasons:    string[];
  caution?:   string;
  targetFish: string[];
  aiComment:  string;
  beginnerOk: boolean;
}
function buildRankedAreas(spotScores: SpotScore[]): RankedArea[] {
  return AREA_REPORTS.map((area) => {
    const ss    = spotScores.find((s) => s.spot.id === area.spotId);
    const base  = ss?.score ?? 55;
    const score = area.id === "tsujido" ? Math.max(10, base - 4) : base;
    const rr    = AREA_RANKING_REASONS.find((r) => r.spotId === area.spotId);
    const acd   = AREA_CONDITION_DETAILS.find((d) => d.spotId === area.spotId);
    return {
      spotId:     area.spotId,
      name:       area.name,
      typeIcon:   area.typeIcon,
      score,
      stars:      toStars(score),
      reasons:    rr?.reasons ?? [],
      caution:    rr?.caution,
      targetFish: acd?.targetFish ?? area.targetFish,
      aiComment:  acd?.aiComment ?? area.normalComment,
      beginnerOk: area.beginnerOk,
    };
  }).sort((a, b) => b.score - a.score);
}

/* ── 今朝のまとめ文 ── */
function buildSummary(ranked: RankedArea[], bwLabel: string, bwTime: string): string {
  const t1 = ranked[0]?.name ?? "相模川河口";
  const t2 = ranked[1]?.name ?? "茅ヶ崎西浜";
  return `今朝の湘南は${t1}・${t2}が有力。${bwLabel}（${bwTime}）が狙い目。`;
}

/* ── 今日の結論テキスト ── */
function buildConclusion(
  ranked:      RankedArea[],
  bw0Label: string, bw0Range: string,
  bw1Label: string, bw1Range: string,
  topFishName: string, eveningFishName: string,
  eveningAreaName: string,
): string {
  const top     = ranked[0]?.name ?? "相模川河口";
  const caution = ranked.find((a) => a.score < 40);
  const cText   = caution?.caution ? `${caution.name}は${caution.caution}のため注意。` : "";
  return `${bw0Label}（${bw0Range}）は${top}で${topFishName}狙い。${bw1Label}（${bw1Range}）は${eveningAreaName}で${eveningFishName}。${cText}`;
}

/* ── Helpers ── */
function reportDot(type: LocalReport["type"]): string {
  return type === "hot" ? C.green : type === "caution" ? C.amber : C.ocean;
}
function reportColor(type: LocalReport["type"]): string {
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
  const ranked     = buildRankedAreas(fc.spotScores);
  const condPanels = buildCondPanels(fc);
  const bw0 = fc.bestWindows[0];
  const bw1 = fc.bestWindows[1] ?? fc.bestWindows[0];
  const miniTide   = buildMiniTideSlots(
    tide,
    bw0?.startTime ?? "5", bw0?.endTime ?? "7",
    bw1?.startTime ?? "17", bw1?.endTime ?? "19",
    tide.sunriseHour, tide.sunsetHour,
  );

  const topFish     = fc.fishScores[0];
  const topArea     = ranked[0];
  const eveningArea = ranked.find((a) => a.spotId !== topArea?.spotId) ?? ranked[1];
  const eveningFish = fc.fishScores.find(
    (f) => f.fish.name !== topFish?.fish.name &&
           ["マゴチ","シーバス","ヒラメ","タチウオ"].includes(f.fish.name),
  ) ?? fc.fishScores[1];

  const topFishName     = topFish?.fish.name    ?? "シーバス";
  const eveningFishName = eveningFish?.fish.name ?? "マゴチ";
  const bw0Label = bw0?.label ?? "朝まずめ";
  const bw0Range = bw0 ? `${bw0.startTime}〜${bw0.endTime}` : "5:00〜7:00";
  const bw1Label = bw1?.label ?? "夕まずめ";
  const bw1Range = bw1 ? `${bw1.startTime}〜${bw1.endTime}` : "17:00〜19:00";

  const summary    = buildSummary(ranked, bw0Label, bw0Range);
  const conclusion = buildConclusion(
    ranked, bw0Label, bw0Range, bw1Label, bw1Range,
    topFishName, eveningFishName, eveningArea?.name ?? "茅ヶ崎西浜",
  );

  const topMethod = getMethodByFish(topFishName);
  const lureName  = topMethod?.lures[0]?.name ?? "ルアー";

  interface WinEntry {
    timeIcon:  string;
    timeLabel: string;
    timeRange: string;
    areaName:  string | null;
    fishName:  string;
    fishEmoji: string;
    isKey:     boolean;
    score:     number;
    note?:     string;
  }
  const winEntries: WinEntry[] = [
    {
      timeIcon:  bw0?.icon ?? "🌅",
      timeLabel: bw0Label,
      timeRange: bw0Range,
      areaName:  topArea?.name ?? null,
      fishName:  topFishName,
      fishEmoji: topFish?.fish.emoji ?? "🐟",
      isKey:     true,
      score:     bw0?.score ?? 70,
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
      note:      "潮が緩む時間帯。移動・準備に充てよう",
    },
    {
      timeIcon:  bw1?.icon ?? "🌆",
      timeLabel: bw1Label,
      timeRange: bw1Range,
      areaName:  eveningArea?.name ?? null,
      fishName:  eveningFishName,
      fishEmoji: eveningFish?.fish.emoji ?? "🐟",
      isKey:     (bw1?.score ?? 0) >= 58,
      score:     bw1?.score ?? 55,
    },
  ];

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

        {/* ══ 1. 今朝の湘南まとめ ═══════════════════ */}
        <section className="px-4 pt-4 pb-1">
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{ background: `${C.cyan}10`, border: `1px solid ${C.cyan}30` }}
          >
            <span className="text-[18px] leading-none flex-shrink-0 mt-0.5">🗞️</span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: C.cyan }}>
                今朝の湘南まとめ
              </p>
              <p className="text-[13px] font-semibold leading-snug" style={{ color: C.text1 }}>
                {summary}
              </p>
            </div>
          </div>
        </section>

        {/* ══ 2. AI船長の結論 ════════════════════════ */}
        <section className="px-4 pt-3 pb-1">
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: C.card, border: `1.5px solid ${C.borderM}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[14px]">⚓</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: C.cyan }}>
                AI 船長の結論
              </span>
            </div>
            <p className="text-[14px] font-semibold leading-[1.8]" style={{ color: C.text1 }}>
              {conclusion}
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                {fc.captainComment}
              </p>
            </div>
          </div>
        </section>

        {/* ══ 3. 今日の湘南指数 ════════════════════ */}
        <section className="px-4 pt-3 pb-1">
          <div
            className="rounded-xl px-4 py-3.5 flex items-center gap-3"
            style={{ background: fc.decision.bg, border: `1px solid ${fc.decision.border}` }}
          >
            <span className="text-[32px] leading-none flex-shrink-0">{fc.decision.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold mb-0.5" style={{ color: C.text3 }}>今日の湘南指数</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[30px] font-black leading-none" style={{ color: fc.decision.color }}>
                  {fc.goScore}
                </span>
                <span className="text-[12px] font-bold" style={{ color: fc.decision.color }}>
                  点 — {fc.decision.type}
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: C.text2 }}>{fc.decision.reason}</p>
            </div>
            <div
              className="flex-shrink-0 rounded-xl px-3 py-2 text-right"
              style={{ background: "rgba(0,0,0,.2)" }}
            >
              <p className="text-[9px] font-semibold mb-0.5" style={{ color: C.text3 }}>狙い目</p>
              <p className="text-[12px] font-bold" style={{ color: C.cyan }}>{bw0Label}</p>
              <p className="text-[10px]" style={{ color: C.text2 }}>{bw0Range}</p>
            </div>
          </div>
        </section>

        {/* ══ 4. 根拠パネル ════════════════════════ */}
        <Sec label="判断の根拠" sub="潮・風・波・水色・ベイト・安全性">
          <div className="grid grid-cols-2 gap-2.5">
            {condPanels.map((p) => (
              <CondCard key={p.label} panel={p} />
            ))}
          </div>
        </Sec>

        {/* ══ 5. ミニタイドグラフ ══════════════════ */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2.5 px-4">
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>
                ミニタイドグラフ
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>
                3時間ごとの潮位・潮の動き
              </p>
            </div>
            <span className="text-[10px]" style={{ color: C.text3 }}>
              {fc.weather.tideType}
            </span>
          </div>
          <div className="overflow-x-auto px-4 pb-3 scrollbar-hide">
            <div className="flex gap-2.5" style={{ width: "max-content" }}>
              {miniTide.map((slot) => (
                <TideSlotCard key={slot.hour} slot={slot} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ 6. 今日はどこが熱い？ランキング ══════ */}
        <Sec label="今日はどこが熱い？" sub={`${fmtDate(dateStr)} 湘南エリア別ランキング`}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {ranked.map((area, i) => (
              <div
                key={area.spotId + area.name}
                className="px-4 py-3.5"
                style={{ borderBottom: i < ranked.length - 1 ? `1px solid ${C.border}` : "none" }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="text-[14px] font-black w-5 text-center flex-shrink-0 mt-0.5"
                    style={{ color: i === 0 ? C.amber : i === 1 ? C.text2 : C.text3 }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[18px] leading-none flex-shrink-0 mt-0.5">{area.typeIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[14px] font-bold" style={{ color: C.text1 }}>{area.name}</span>
                      <StarRow count={area.stars} />
                    </div>
                    {/* 根拠タグ */}
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {area.reasons.map((r) => (
                        <span
                          key={r}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: C.ocean, background: `${C.ocean}18` }}
                        >
                          {r}
                        </span>
                      ))}
                      {area.caution && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: C.amber, background: `${C.amber}18` }}
                        >
                          ⚠ {area.caution}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px]" style={{ color: C.text2 }}>
                      狙い：{area.targetFish.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <span
                    className="text-[18px] font-black flex-shrink-0"
                    style={{ color: scoreColor(area.score) }}
                  >
                    {area.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Sec>

        {/* ══ 7. 湘南エリア速報カード（横スクロール） ══ */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-2.5 px-4">
            <div>
              <h2 className="text-[13px] font-bold" style={{ color: C.text1 }}>湘南エリア速報</h2>
              <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>条件根拠 + AI船長コメント</p>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {ranked.map((area) => (
              <AreaDetailCard key={area.spotId + area.name} area={area} />
            ))}
          </div>
        </section>

        {/* ══ 8. AI船長の今日の勝ち筋 ══════════════ */}
        <Sec label="AI船長の今日の勝ち筋" sub="時間帯別・エリア別 行動ガイド">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {winEntries.map((entry, i) => {
              const isLast = i === winEntries.length - 1 && fc.safety.overall === "安全";
              return (
                <WinRow key={entry.timeLabel} entry={entry} isLast={isLast} />
              );
            })}
            {fc.safety.overall !== "安全" && (
              <div
                className="px-4 py-3.5 flex items-start gap-2.5"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <span className="text-[16px] flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-[11px] font-bold mb-0.5" style={{ color: C.amber }}>安全注意</p>
                  <p className="text-[12px] leading-snug" style={{ color: C.text2 }}>
                    {fc.safety.message} — ライフジャケット着用を強く推奨します。
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] mt-2.5 px-1 leading-relaxed" style={{ color: C.text3 }}>
            ※ 本日の本命ルアー：<span style={{ color: C.ocean }}>{lureName}</span>。
            仕掛けの詳細はAI船長に相談を。
          </p>
        </Sec>

        {/* ══ 9. ローカル速報 ════════════════════════ */}
        <Sec label="ローカル速報" sub="釣り人からの情報・AI観測レポート">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            {LOCAL_REPORTS.map((r, i) => (
              <div
                key={r.id}
                className="px-4 py-3.5 flex items-start gap-3"
                style={{ borderBottom: i < LOCAL_REPORTS.length - 1 ? `1px solid ${C.border}` : "none" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: reportDot(r.type) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold" style={{ color: C.text3 }}>{r.timeLabel}</span>
                    <span className="text-[11px] font-semibold" style={{ color: C.ocean }}>{r.spot}</span>
                  </div>
                  <p className="text-[13px] leading-snug" style={{ color: reportColor(r.type) }}>
                    {r.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-2 px-1" style={{ color: C.text3 }}>
            ※ ローカル速報の投稿機能は近日公開予定です
          </p>
        </Sec>

        {/* ══ 10. FishAI Pro ════════════════════════ */}
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
   SUB-COMPONENTS
══════════════════════════════════════════════════ */

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

function StarRow({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
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

/* ── 根拠カード ── */
interface CondPanel {
  icon:  string;
  label: string;
  value: string;
  note:  string;
  level: "good" | "ok" | "caution" | "danger";
}
function CondCard({ panel }: { panel: CondPanel }) {
  const c = condLevelColor(panel.level);
  return (
    <div
      className="rounded-xl px-3.5 py-3"
      style={{ background: "#0D1B2E", border: "1px solid rgba(255,255,255,.07)" }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[15px] leading-none">{panel.icon}</span>
        <span className="text-[10px] font-bold" style={{ color: "#516070" }}>{panel.label}</span>
      </div>
      <p className="text-[13px] font-bold mb-1.5 leading-tight" style={{ color: c }}>
        {panel.value}
      </p>
      <p className="text-[10px] leading-snug" style={{ color: "#516070" }}>
        {panel.note}
      </p>
    </div>
  );
}

/* ── ミニタイドスロット ── */
interface MiniTideSlot {
  hour:      number;
  label:     string;
  level:     number;
  phase:     string;
  isBest:    boolean;
  badgeText?: string;
}
function TideSlotCard({ slot }: { slot: MiniTideSlot }) {
  const barH = Math.round((slot.level / 100) * 52);
  const phaseColor = slot.phase === "上げ潮" ? "#0EA5E9" : slot.phase === "下げ潮" ? "#22D3EE" : "#516070";
  const barColor   = slot.isBest ? "#10B981" : "#0EA5E9";
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center rounded-2xl py-3 px-2.5"
      style={{
        width: 78,
        background: slot.isBest ? "rgba(16,185,129,.08)" : "#0D1B2E",
        border: `1px solid ${slot.isBest ? "rgba(16,185,129,.25)" : "rgba(255,255,255,.07)"}`,
      }}
    >
      <p className="text-[10px] font-bold mb-2" style={{ color: slot.isBest ? "#10B981" : "#516070" }}>
        {slot.label}
      </p>
      <div
        className="w-full rounded-full flex items-end justify-center mb-2"
        style={{ height: 52, background: "rgba(255,255,255,.04)" }}
      >
        <div
          className="w-full rounded-full"
          style={{ height: Math.max(barH, 2), background: barColor, opacity: 0.75 }}
        />
      </div>
      <p className="text-[11px] font-black mb-1" style={{ color: "#E2EAF4" }}>{slot.level}</p>
      <p className="text-[9px] font-semibold" style={{ color: phaseColor }}>{slot.phase}</p>
      {slot.badgeText && (
        <span
          className="mt-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full"
          style={{ color: "#10B981", background: "rgba(16,185,129,.18)" }}
        >
          {slot.badgeText}
        </span>
      )}
    </div>
  );
}

/* ── エリア速報カード ── */
interface RankedArea {
  spotId:     string;
  name:       string;
  typeIcon:   string;
  score:      number;
  stars:      number;
  reasons:    string[];
  caution?:   string;
  targetFish: string[];
  aiComment:  string;
  beginnerOk: boolean;
}
function AreaDetailCard({ area }: { area: RankedArea }) {
  const sc = scoreColor(area.score);
  return (
    <div
      className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
      style={{ width: 210, background: "#0D1B2E", border: "1px solid rgba(255,255,255,.08)" }}
    >
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div className="flex items-start justify-between mb-1.5">
          <div>
            <span className="text-[10px]" style={{ color: "#516070" }}>{area.typeIcon}</span>
            <p className="text-[16px] font-black text-white leading-tight mt-0.5">{area.name}</p>
          </div>
          <span className="text-[20px] font-black leading-none flex-shrink-0" style={{ color: sc }}>
            {area.score}
          </span>
        </div>
        <StarRow count={area.stars} size={11} />
      </div>
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
        {area.reasons.map((r) => (
          <span
            key={r}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: "#0EA5E9", background: "rgba(14,165,233,.12)" }}
          >
            {r}
          </span>
        ))}
        {area.caution && (
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: "#F59E0B", background: "rgba(245,158,11,.12)" }}
          >
            ⚠ {area.caution}
          </span>
        )}
      </div>
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {area.targetFish.slice(0, 3).map((f) => (
          <span key={f} className="text-[10px] font-semibold" style={{ color: "#8AA0B5" }}>{f}</span>
        ))}
      </div>
      <div className="px-4 pt-3 pb-4 flex-1" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: "#22D3EE" }}>AI船長</p>
        <p className="text-[11px] leading-[1.75]" style={{ color: "#8AA0B5" }}>{area.aiComment}</p>
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
  timeIcon:  string;
  timeLabel: string;
  timeRange: string;
  areaName:  string | null;
  fishName:  string;
  fishEmoji: string;
  isKey:     boolean;
  score:     number;
  note?:     string;
}
function WinRow({ entry, isLast }: { entry: WinEntry; isLast: boolean }) {
  const c = entry.score >= 75 ? "#10B981" : entry.score >= 55 ? "#F59E0B" : "#516070";
  return (
    <div
      className="px-4 py-4 flex items-start gap-3.5"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,.07)" }}
    >
      <span className="text-[22px] leading-none flex-shrink-0 mt-0.5">{entry.timeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[13px] font-bold" style={{ color: "#E2EAF4" }}>{entry.timeLabel}</span>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold" style={{ color: "#0EA5E9" }}>
              📍{entry.areaName}
            </span>
            <span className="text-[12px]" style={{ color: "#8AA0B5" }}>→</span>
            <span className="text-[13px] font-bold" style={{ color: c }}>
              {entry.fishEmoji} {entry.fishName}
            </span>
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: "#516070" }}>{entry.note ?? "様子見"}</p>
        )}
      </div>
    </div>
  );
}
