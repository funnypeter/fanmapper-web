import { NextRequest, NextResponse } from "next/server";

interface GeminiArticle {
  title: string;
  url: string;
}

export async function GET(request: NextRequest) {
  const gameTitle = request.nextUrl.searchParams.get("game");
  if (!gameTitle) return NextResponse.json([]);

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Give me 5 GameSpot articles that someone interested in the game "${gameTitle}" would want to read. These should be real, recent GameSpot articles about this game or closely related games.

Return ONLY a JSON array, no other text:
[{"title": "Article title", "url": "https://www.gamespot.com/..."}]`,
            }],
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json([]);

    const articles: GeminiArticle[] = JSON.parse(jsonMatch[0]);

    // Return with GameSpot source label and a placeholder image
    return NextResponse.json(
      articles.slice(0, 5).map((a) => ({
        title: a.title,
        link: a.url,
        image: null,
        source: "GameSpot",
        pubDate: new Date().toISOString(),
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
