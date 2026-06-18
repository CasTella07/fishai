import Anthropic from "@anthropic-ai/sdk";
import type { ScoreBreakdown } from "@/lib/shonanForecast";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      spotName: string;
      goScore: number;
      goLabel: string;
      breakdown: ScoreBreakdown;
    };

    const { spotName, goScore, goLabel, breakdown } = body;

    const factsList = breakdown.factors.join("\n");
    const terrainLine = breakdown.terrainNote
      ? `地形補正: ${breakdown.terrainNote}`
      : "地形補正: なし";
    const dataSource = breakdown.isRealData
      ? "（Open-Meteo + tide736.net 実データ）"
      : "（推定値）";

    const prompt = `${spotName}の今日の釣り総合スコアについて、釣り人向けに3〜4文で根拠を説明してください。

スコア: ${goScore}/100 — ${goLabel} ${dataSource}

内訳:
${factsList}
${terrainLine}

ルール:
- Markdownや記号（**、#、-など）は一切使わない
- 普通の話し言葉で3〜4文だけ
- 具体的な数値（風速・波高・潮汐種別）を使って説明する
- 「なぜこのスコアか」の主因を分かりやすく
- 最後に一言アドバイスを添える`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const explanation = msg.content[0].type === "text" ? msg.content[0].text : "";
    return Response.json({ explanation });
  } catch (err) {
    console.error("[score-explain] error:", err);
    return Response.json({ explanation: "" });
  }
}
