import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const gameTitle = request.nextUrl.searchParams.get("game");
  if (!gameTitle) return NextResponse.json({ found: false });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ found: false });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Does GameSpot have a game guide, walkthrough, or tips page for the game "${gameTitle}"?

Search for a GameSpot guide page for this game. I want the main guide/walkthrough hub page, not a news article or review.

Return ONLY a JSON object with these fields:
- "found": boolean — true if a GameSpot guide exists
- "url": string — the full GameSpot URL to the guide (must be a real gamespot.com URL)
- "title": string — the guide page title
- "thumbnail": string | null — a thumbnail image URL if you can find one

If no guide exists, return: {"found": false}

Return ONLY the JSON, no other text.`,
            }],
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
          tools: [{ googleSearch: {} }],
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ found: false });

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ found: false });

    const result = JSON.parse(jsonMatch[0]);

    if (!result.found || !result.url || !result.url.includes("gamespot.com")) {
      return NextResponse.json({ found: false });
    }

    // Validate the URL itself contains a game-relevant keyword — Gemini hallucates both URLs and titles
    const gameWords = gameTitle.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w: string) => w.length >= 2 && !["the", "and", "for", "of", "in"].includes(w));
    const urlLower = result.url.toLowerCase();
    const urlMatchesGame = gameWords.some((w: string) => urlLower.includes(w));
    if (!urlMatchesGame) {
      return NextResponse.json({ found: false });
    }

    // Fetch the actual page and verify the game name appears in the HTML title
    try {
      const pageRes = await fetch(result.url, { redirect: "follow" });
      if (!pageRes.ok) return NextResponse.json({ found: false });
      const html = await pageRes.text();
      const pageTitleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const pageTitle = (pageTitleMatch?.[1] ?? "").toLowerCase();
      const pageMatchesGame = gameWords.some((w: string) => pageTitle.includes(w));
      if (!pageMatchesGame) return NextResponse.json({ found: false });
    } catch {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      url: result.url,
      title: result.title || `${gameTitle} Guide`,
      thumbnail: result.thumbnail || null,
    });
  } catch {
    return NextResponse.json({ found: false });
  }
}
