import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

async function callGeminiWithSearch(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
          tools: [{ googleSearch: {} }],
        }),
      });
      if (res.status === 503 || res.status === 429) {
        console.warn(`[gamespot/guide] Gemini ${model} returned ${res.status}, trying next model`);
        continue;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`[gamespot/guide] Gemini ${model} ${res.status}: ${errText.substring(0, 300)}`);
        return null;
      }
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      return parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    } catch (err) {
      console.error(`[gamespot/guide] Gemini ${model} call failed:`, err);
      continue;
    }
  }
  return null;
}

function normalizeGameTitle(title: string): string {
  return title
    .replace(
      /\s*[:\-–—]?\s*(Ultimate|Complete|Definitive|Deluxe|Game of the Year|GOTY|Director'?s Cut|Enhanced|Remastered|Anniversary|Legendary|Special|Gold|Platinum|Collector'?s|Premium|Standard|Legacy|Anthology|Trilogy)(\s+Edition)?.*$/i,
      "",
    )
    .replace(/\s*[:\-–—]\s*(Edition|Version).*$/i, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const rawTitle = request.nextUrl.searchParams.get("game");
  if (!rawTitle) return NextResponse.json({ found: false });
  const gameTitle = normalizeGameTitle(rawTitle) || rawTitle;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.warn(`[gamespot/guide] missing GEMINI_API_KEY`);
    return NextResponse.json({ found: false });
  }

  const prompt = `Does GameSpot have a game guide, walkthrough, or tips page for the game "${gameTitle}"?

Search for a GameSpot guide page for this game. I want the main guide/walkthrough hub page, not a news article or review.

Return ONLY a JSON object with these fields:
- "found": boolean — true if a GameSpot guide exists
- "url": string — the full GameSpot URL to the guide (must be a real gamespot.com URL)
- "title": string — the guide page title
- "thumbnail": string | null — a thumbnail image URL if you can find one

If no guide exists, return: {"found": false}

Return ONLY the JSON, no other text.`;

  const rawText = await callGeminiWithSearch(geminiKey, prompt);
  if (!rawText) {
    console.warn(`[gamespot/guide] "${gameTitle}": no response from any Gemini model`);
    return NextResponse.json({ found: false });
  }

  const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn(`[gamespot/guide] "${gameTitle}": no JSON in Gemini response. Raw: ${rawText.substring(0, 200)}`);
    return NextResponse.json({ found: false });
  }

  let result: { found?: boolean; url?: string; title?: string; thumbnail?: string | null };
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn(`[gamespot/guide] "${gameTitle}": JSON parse failed`, err);
    return NextResponse.json({ found: false });
  }

  if (!result.found) {
    console.warn(`[gamespot/guide] "${gameTitle}": Gemini reported found:false`);
    return NextResponse.json({ found: false });
  }
  if (!result.url || !result.url.includes("gamespot.com")) {
    console.warn(`[gamespot/guide] "${gameTitle}": non-gamespot URL: ${result.url}`);
    return NextResponse.json({ found: false });
  }

  const gameWords = gameTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w: string) => w.length >= 2 && !["the", "and", "for", "of", "in"].includes(w));
  const urlLower = result.url.toLowerCase();
  const urlMatchesGame = gameWords.some((w: string) => urlLower.includes(w));
  if (!urlMatchesGame) {
    console.warn(`[gamespot/guide] "${gameTitle}": URL keyword check failed for ${result.url} (words=${gameWords.join(",")})`);
    return NextResponse.json({ found: false });
  }

  // NOTE: we used to validate by fetching the page and checking its <title>,
  // but GameSpot returns 403 to server-side fetches. The URL + keyword check
  // above already filters hallucinations well enough. A rare broken link is
  // better than never showing any guide.

  return NextResponse.json({
    found: true,
    url: result.url,
    title: result.title || `${gameTitle} Guide`,
    thumbnail: result.thumbnail || null,
  });
}
