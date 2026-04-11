import { NextRequest, NextResponse } from "next/server";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

function decodeHtml(html: string): string {
  return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#x27;/g, "'");
}

async function fetchGameSpotRSS(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://www.gamespot.com/feeds/mashup/", { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30);

    return items.map((match) => {
      const content = match[1];
      const title = decodeHtml(content.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const image = content.match(/url="([^"]+)"/)?.[1]
        ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
        ?? null;
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

      return { title, link, image, source: "GameSpot", pubDate };
    }).filter((n) => n.title);
  } catch {
    return [];
  }
}

async function getRelatedKeywords(gameTitle: string): Promise<string[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return [gameTitle];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `For the video game "${gameTitle}", list 8-10 related search keywords that someone interested in this game would also care about. Include:
- The game title itself and abbreviations
- The game's franchise/series name
- The developer and publisher
- Similar competing games in the same genre
- The game's genre keywords

Return ONLY a JSON array of lowercase strings, no other text.
Example: ["elden ring", "fromsoftware", "dark souls", "bloodborne", "soulslike", "action rpg", "bandai namco"]`,
            }],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) return [gameTitle];

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [gameTitle];

    const keywords: string[] = JSON.parse(jsonMatch[0]);
    return keywords.map((k) => k.toLowerCase());
  } catch {
    return [gameTitle];
  }
}

export async function GET(request: NextRequest) {
  const gameTitle = request.nextUrl.searchParams.get("game");
  if (!gameTitle) return NextResponse.json([]);

  // Fetch articles and related keywords in parallel
  const [allArticles, keywords] = await Promise.all([
    fetchGameSpotRSS(),
    getRelatedKeywords(gameTitle),
  ]);

  // Score each article by how many keywords match
  const scored = allArticles.map((article) => {
    const titleLower = article.title.toLowerCase();
    let score = 0;
    for (const keyword of keywords) {
      // Multi-word keywords: check if all words appear
      const words = keyword.split(/\s+/);
      if (words.length > 1) {
        if (words.every((w) => titleLower.includes(w))) score += 2;
      } else if (titleLower.includes(keyword)) {
        score += 1;
      }
    }
    return { article, score };
  });

  // Filter to articles that match at least one keyword, sorted by score
  const related = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article)
    .slice(0, 10);

  return NextResponse.json(related);
}
