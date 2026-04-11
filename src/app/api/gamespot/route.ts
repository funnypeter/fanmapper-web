import { NextRequest, NextResponse } from "next/server";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
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
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 40);

    return items.map((match) => {
      const content = match[1];
      const title = decodeHtml(content.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const image = content.match(/url="([^"]+)"/)?.[1]
        ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
        ?? null;
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      return { title, link, image, pubDate };
    }).filter((n) => n.title);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const gameTitle = request.nextUrl.searchParams.get("game");
  if (!gameTitle) return NextResponse.json([]);

  const geminiKey = process.env.GEMINI_API_KEY;
  const articles = await fetchGameSpotRSS();
  if (articles.length === 0) return NextResponse.json({ debug: "RSS fetch returned 0 articles" });

  if (!geminiKey) return NextResponse.json({ debug: "GEMINI_API_KEY not set" });

  try {
    // Give Gemini the real article titles and ask it to pick the relevant ones
    const titleList = articles.map((a, i) => `${i}: ${a.title}`).join("\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Here are today's GameSpot articles:\n\n${titleList}\n\nWhich of these articles would someone interested in the game "${gameTitle}" want to read? Pick up to 5 that are most relevant — they can be about this game, its franchise, genre, developer, or similar games.\n\nReturn ONLY a JSON array of the index numbers, no other text. Example: [0, 3, 7, 12, 15]`,
            }],
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ debug: `Gemini ${res.status}: ${errText.substring(0, 200)}` });
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json({ debug: `Parse failed: ${stripped.substring(0, 200)}` });

    const indices: number[] = JSON.parse(jsonMatch[0]);

    const selected = indices
      .filter((i) => i >= 0 && i < articles.length)
      .slice(0, 5)
      .map((i) => ({
        title: articles[i].title,
        link: articles[i].link,
        image: articles[i].image,
        source: "GameSpot",
        pubDate: articles[i].pubDate,
      }));

    return NextResponse.json(selected);
  } catch (err) {
    return NextResponse.json({ debug: String(err) });
  }
}
