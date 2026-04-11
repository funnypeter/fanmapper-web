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

    // Fetch OG images from each article page in parallel
    const withImages = await Promise.all(
      articles.slice(0, 5).map(async (a) => {
        let image: string | null = null;
        try {
          const pageRes = await fetch(a.url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; FanMapper/1.0)" },
          });
          if (pageRes.ok) {
            const html = await pageRes.text();
            const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1]
              ?? html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/)?.[1];
            if (ogImage) image = ogImage;
          }
        } catch { /* skip */ }
        return {
          title: a.title,
          link: a.url,
          image,
          source: "GameSpot",
          pubDate: new Date().toISOString(),
        };
      })
    );

    return NextResponse.json(withImages);
  } catch {
    return NextResponse.json([]);
  }
}
