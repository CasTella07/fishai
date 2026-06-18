import Anthropic from "@anthropic-ai/sdk";
import { findRelevantMethods, formatMethodForPrompt } from "@/data/fishingKnowledge";
import { fetchTideData } from "@/lib/tideApi";
import { fetchFishingWeather } from "@/lib/weather";
import { generateDailyForecast } from "@/lib/shonanForecast";

/* ─── 固定システムプロンプト（全リクエスト共通）── */

const BASE_SYSTEM_PROMPT = `
あなたは「FishAI」という、神奈川県湘南エリア専属の釣りAIアシスタントです。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【対応エリア：湘南5大ポイント】

1. 茅ヶ崎サーフ（サーフ/ヒラメ・マゴチ・シロギス・青物が主体）
2. 平塚海岸・新港（サーフ＋港/シロギス・ヒラメ・アジ・サバ）
3. 江ノ島（磯＋堤防/アジ・サバ・カサゴ・クロダイ・タチウオ）
4. 相模川河口（河川/シーバス・クロダイ・ハゼ・ウナギ）
5. 大磯港（磯＋港/カサゴ・メバル・アジ・イワシ）

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【主要ターゲット魚10種】

- ヒラメ：サーフのフラットフィッシュ。底付近を泳ぐ。茅ヶ崎・平塚が実績高い。
- シーバス（スズキ）：相模川河口・江ノ島が実績ポイント。夜釣りも有効。
- 青物（ワラサ・イナダ・ソウダガツオ）：回遊性。ナブラを追う。秋に最盛期。
- アジ：江ノ島堤防・平塚のサビキ釣りで安定。初心者向け。
- シロギス：茅ヶ崎・平塚のサーフ投げ釣り。夏〜秋に数が出る。
- タチウオ：夕〜夜が活性高い。秋の江ノ島・平塚で実績。ワインドが有効。
- カサゴ：江ノ島・大磯の磯・穴釣り。年中狙える根魚。
- クロダイ（チヌ）：相模川・江ノ島のフカセ・ヘチ釣り。警戒心強い。
- マゴチ：茅ヶ崎サーフ。ヒラメより浅場のサンド上を好む。夏が最盛期。
- サバ：サビキ・ジグで回遊時に大量。江ノ島・平塚で秋〜初冬。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【役割と対応モード】

FishAIは「釣り人の一日を支えるAIアシスタント」として、3フェーズで支援します。

■ 行く前：釣果予報・コンディション判断・釣行プラン作成
■ 釣っている時：仕掛け提案・ポイント選定・タックルアドバイス
■ 帰ってから：料理・レシピ提案・捌き方・保存方法

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【回答ルール】（必ず守ること）

1. Markdownを一切使わない。#による見出し、**による強調、-や*や数字によるリスト記号、テーブル記法、---の区切り線、すべて禁止。
2. 普通の話し言葉の文章だけで答える。改行は使ってもよい。
3. 通常の回答は3〜5文程度に簡潔にまとめる。チャットらしい自然な口調で。
4. 詳しい説明が必要な場合は、まず短く結論を1〜2文で伝えてから「もっと詳しく知りたいですか？」と聞く。ユーザーが「はい」と言ったときに詳細を話す。
5. 専門用語（PE、ハリス、サビキ、フカセ等）は初出時に括弧内で一言説明する。
6. 地域差・季節差がある情報は「目安ですが」「傾向として」など断定を避ける言葉を添える。
7. 安全に関わること（危険な魚・転倒リスク・ライフジャケット等）は自然な流れで触れる。
8. 不確かな情報は「たぶん」「可能性が高いです」など曖昧さを示す言葉で伝える。
9. 回答は日本語のみ。
10. 天気・波・潮のデータはシステムプロンプト内に記載済みなので、ユーザーに聞き返さないこと。

━━━━━━━━━━━━━━━━━━━━━━━━━━━
【知識の優先順位】

1. システムプロンプト内の【現在の釣り条件】セクション（最優先・実データ）
2. ユーザー質問に関連する釣法ナレッジ（プロンプト末尾に追記される場合あり）
3. 湘南エリアの一般知識で補足

━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trimStart();

/* ─── リアルタイムコンテキスト構築 ──────────────── */

// 30分間の in-memory キャッシュ（同一 spot+日付を重複フェッチしない）
const _ctxCache = new Map<string, { ts: number; data: string }>();
const CTX_TTL_MS = 30 * 60 * 1000;

function fmtHM(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fmtHour(frac: number): string {
  const h = Math.floor(frac);
  const m = Math.round((frac - h) * 60);
  return fmtHM(h === 24 ? 0 : h, m);
}

async function buildLiveContext(spotId: string): Promise<string> {
  // JST の日付文字列
  const jstDate = new Date(Date.now() + 9 * 3600 * 1000);
  const dateStr = jstDate.toISOString().split("T")[0];
  const cacheKey = `${spotId}:${dateStr}`;

  const cached = _ctxCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CTX_TTL_MS) return cached.data;

  const { TIDE_LOCATIONS } = await import("@/data/tideLocations");
  const loc = TIDE_LOCATIONS.find((l) => l.id === spotId) ?? TIDE_LOCATIONS[0];

  // 潮汐・天気を並列取得（どちらかが失敗しても続行）
  const [tideResult, wxResult] = await Promise.allSettled([
    fetchTideData({ lat: loc.lat, lng: loc.lng, date: dateStr, location: loc }),
    fetchFishingWeather(loc.id, dateStr),
  ]);

  // 釣果予報（実データ or ハッシュフォールバック）
  const forecast = await generateDailyForecast(dateStr, spotId);

  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "【現在の釣り条件（リアルタイム）】",
    `参照ポイント: ${loc.name}（${loc.prefecture}）/ ${dateStr}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ];

  /* ── 天気・海況 ── */
  if (wxResult.status === "fulfilled") {
    const wx = wxResult.value;
    lines.push("▼ 天気・海況（Open-Meteo 実データ）");
    lines.push(`天気: ${wx.current.condition}　気温: ${wx.current.temperature}°C（体感 ${wx.current.feelsLike}°C）`);
    lines.push(`降水確率: ${wx.current.precipProbability}%　気圧: ${wx.current.pressure}hPa`);
    lines.push(`風向・風速: ${wx.current.windDirection} ${wx.current.windSpeed}m/s　波高: ${wx.current.waveHeight}m`);
    lines.push(`海況判定: ${wx.safety.status} — ${wx.safety.reason}`);
    lines.push(`おすすめ時間帯: ${wx.safety.bestHours}`);
    lines.push("");
    lines.push("▼ 時間別予報");
    for (const h of wx.hourly) {
      lines.push(`${h.time}: ${h.condition} ${h.temperature}°C / 風:${h.windDirection} ${h.windSpeed}m/s / 波:${h.waveHeight}m / 降水:${h.precipProbability}%`);
    }
    lines.push("");
  }

  /* ── 潮汐 ── */
  if (tideResult.status === "fulfilled") {
    const td = tideResult.value;
    const highs = td.marks.filter((m) => m.type === "high").map((m) => fmtHM(m.hour, m.minute)).join(" / ");
    const lows  = td.marks.filter((m) => m.type === "low").map((m) => fmtHM(m.hour, m.minute)).join(" / ");
    lines.push("▼ 潮汐（tide736.net 実データ）");
    lines.push(`潮回り: ${td.tideType}　潮汐スコア: ${td.fishingScore}/100`);
    if (highs) lines.push(`満潮: ${highs}`);
    if (lows)  lines.push(`干潮: ${lows}`);
    lines.push(`釣りやすい時間帯: ${fmtHour(td.bestTimeStart)}〜${fmtHour(td.bestTimeEnd)}`);
    if (td.fishScores.length > 0) {
      lines.push(`潮から見た狙い目: ${td.fishScores.slice(0, 3).map((f) => `${f.name}(★${f.stars})`).join("・")}`);
    }
    lines.push("");
  }

  /* ── 釣果予報 ── */
  lines.push("▼ 釣果予報（シーズン+条件ベース）");
  lines.push(`総合スコア: ${forecast.goScore}/100　判定: ${forecast.decision.type}`);
  lines.push(`理由: ${forecast.decision.reason}`);
  lines.push("");

  /* ── 狙い目魚種 ── */
  const topFish = forecast.fishScores.slice(0, 5);
  if (topFish.length > 0) {
    lines.push("▼ 今日の狙い目魚種");
    for (const fs of topFish) {
      lines.push(`${fs.fish.emoji} ${fs.fish.name}（★${fs.stars}） — ${fs.bestTime} / ${fs.bestSpot} / ${fs.tip}`);
    }
    lines.push("");
  }

  /* ── スポット別評価 ── */
  const topSpots = forecast.spotScores.slice(0, 3);
  if (topSpots.length > 0) {
    lines.push("▼ スポット別評価（今日）");
    for (const ss of topSpots) {
      lines.push(`${ss.spot.icon} ${ss.spot.name}（★${ss.stars}） — ${ss.topFish.join("・")} / ${ss.statusText}`);
    }
    lines.push("");
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`上記は今この瞬間の${loc.name}の実データです。`);
  lines.push("「今日のこの場所では〜」という形で具体的に答えてください。");
  lines.push("ユーザーに天気・波・潮・場所を聞き返すことは禁止です（すでに上記に記載済み）。");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const data = lines.join("\n");
  _ctxCache.set(cacheKey, { ts: Date.now(), data });
  return data;
}

/* ─── システムプロンプト構築 ──────────────────── */

async function buildSystemPrompt(
  userMessages: Anthropic.MessageParam[],
  spotId: string,
): Promise<string> {
  const recentUserText = userMessages
    .filter((m) => m.role === "user")
    .map((m) =>
      Array.isArray(m.content)
        ? m.content.map((c) => (c.type === "text" ? c.text : "")).join("")
        : m.content,
    )
    .join(" ");

  const [matched, liveContext] = await Promise.all([
    Promise.resolve(findRelevantMethods(recentUserText)),
    buildLiveContext(spotId),
  ]);

  let prompt = BASE_SYSTEM_PROMPT + liveContext + "\n\n";

  if (matched.length > 0) {
    prompt +=
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "【釣法別ナレッジ（優先参照）】\n" +
      "以下のナレッジを最優先で参照し、回答に反映すること。\n\n" +
      matched.map(formatMethodForPrompt).join("\n\n") +
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  }

  return prompt;
}

/* ─── エラーログ ─────────────────────────────── */

function logError(label: string, err: unknown) {
  if (err instanceof Error) {
    console.error(`[chat] ${label}`);
    console.error("  name   :", err.name);
    console.error("  message:", err.message);
    console.error("  stack  :", err.stack);
    if ("status" in err) console.error("  status :", (err as NodeJS.ErrnoException & { status?: number }).status);
    if ("type"   in err) console.error("  type   :", (err as Error & { type?: string }).type);
  } else {
    console.error(`[chat] ${label}`, err);
  }
}

/* ─── API ROUTE ──────────────────────────────── */

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";

  if (!apiKey || !apiKey.startsWith("sk-ant-")) {
    const msg = `ANTHROPIC_API_KEY が不正です。現在の値の先頭: "${apiKey.slice(0, 10)}"`;
    console.error("[chat]", msg);
    return new Response(msg, { status: 500 });
  }

  let messages: Anthropic.MessageParam[];
  let spotId: string;
  try {
    const body = await request.json();
    messages = body.messages as Anthropic.MessageParam[];
    spotId   = typeof body.spotId === "string" ? body.spotId : "chigasaki";
  } catch (err) {
    logError("リクエストのJSON解析に失敗", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  let systemPrompt: string;
  try {
    systemPrompt = await buildSystemPrompt(messages, spotId);
  } catch (err) {
    logError("システムプロンプト構築に失敗", err);
    // コンテキスト取得失敗でもチャットは続行（ベースプロンプトのみ使用）
    systemPrompt = BASE_SYSTEM_PROMPT;
  }

  const client = new Anthropic({ apiKey });

  let anthropicStream: Awaited<ReturnType<typeof client.messages.stream>>;
  try {
    anthropicStream = client.messages.stream({
      model:      "claude-sonnet-4-6",
      max_tokens: 2048,
      system:     systemPrompt,
      messages,
    });
  } catch (err) {
    logError("messages.stream() の初期化に失敗", err);
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new Response(msg, { status: 500 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        logError("ストリーミング中にエラー", err);
        const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        controller.enqueue(encoder.encode(`\n\n[ERROR] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
