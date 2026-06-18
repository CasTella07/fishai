import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropicConfig } from "@/lib/config";

export interface CatchAnalysisResult {
  fishName: string;
  confidence: "高" | "中" | "低";
  sizeNote: string | null;
}

const PROMPT = `この写真に写っている魚を判定してください。
必ず以下のJSON形式だけで回答してください（前後に余分なテキスト不要）:
{
  "fishName": "魚の和名（例: ヒラメ、シーバス、マアジ、メジナ）",
  "confidence": "高" または "中" または "低",
  "sizeNote": "推定サイズ（例: 40〜50cm程度、30cm前後）または null"
}
魚が写っていない・判別不能な場合は fishName を "不明" にしてください。`;

export async function POST(req: NextRequest) {
  if (!anthropicConfig.apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が .env.local に未設定です。lib/config.ts のコメントを参照してください。" },
      { status: 503 },
    );
  }

  let imageBase64: string;
  let mimeType: string;
  try {
    ({ imageBase64, mimeType } = await req.json());
    if (!imageBase64 || !mimeType) throw new Error();
  } catch {
    return NextResponse.json({ error: "imageBase64 と mimeType は必須です" }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: anthropicConfig.apiKey });

    const message = await client.messages.create({
      model: anthropicConfig.model,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: imageBase64,
              },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) {
      return NextResponse.json({ error: "AI の応答を解析できませんでした" }, { status: 500 });
    }

    const result = JSON.parse(match[0]) as CatchAnalysisResult;
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: `AI 判定エラー: ${msg}` }, { status: 500 });
  }
}
