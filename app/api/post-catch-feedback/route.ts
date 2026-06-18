import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fishName, sizeCm, count, location, timeSlot, method, bait, memo } =
      body as {
        fishName: string;
        sizeCm: number | null;
        count: number;
        location: string | null;
        timeSlot: string | null;
        method: string | null;
        bait: string | null;
        memo: string | null;
      };

    if (!fishName) {
      return Response.json({ error: "fishName is required" }, { status: 400 });
    }

    const lines = [
      `魚種: ${fishName}`,
      sizeCm != null ? `サイズ: ${sizeCm}cm` : null,
      `匹数: ${count}匹`,
      location ? `場所: ${location}` : null,
      timeSlot ? `時間帯: ${timeSlot}` : null,
      method ? `釣法: ${method}` : null,
      bait ? `エサ/ルアー: ${bait}` : null,
      memo ? `メモ: ${memo}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `以下の釣果記録に対して、レシピアイデアと次回の改善ポイントを提案してください。

${lines}

以下のJSON形式のみで回答してください（余計なテキスト・説明・Markdownは不要）:
{
  "recipeIdeas": ["レシピ名と一言説明1", "レシピ名と一言説明2", "レシピ名と一言説明3"],
  "nextTips": ["次回へのアドバイス1", "次回へのアドバイス2", "次回へのアドバイス3"]
}

recipeIdeasは${fishName}を使った料理を3つ（具体的な料理名と調理ポイントを1文で）、nextTipsは次回釣行に役立つ改善・アドバイスを3つ。`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ recipeIdeas: [], nextTips: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      recipeIdeas?: string[];
      nextTips?: string[];
    };

    return Response.json({
      recipeIdeas: parsed.recipeIdeas ?? [],
      nextTips: parsed.nextTips ?? [],
    });
  } catch (err) {
    console.error("[post-catch-feedback] error:", err);
    return Response.json({ recipeIdeas: [], nextTips: [] });
  }
}
