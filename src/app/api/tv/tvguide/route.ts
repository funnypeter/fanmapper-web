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

async function fetchFeed(url: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return items.map((match) => {
      const content = match[1];
      const title = decodeHtml(content.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const image = content.match(/url="([^"]+)"/)?.[1]
        ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
        ?? content.match(/<img[^>]*src="([^"]+)"/)?.[1]
        ?? null;
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      return { title, link, image, pubDate };
    }).filter((n) => n.title);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const showTitle = request.nextUrl.searchParams.get("show");
  if (!showTitle) return NextResponse.json([]);

  const geminiKey = process.env.GEMINI_API_KEY;

  // Fetch from TV news RSS feeds
  const feeds = await Promise.all([
    fetchFeed("https://www.tvguide.com/feed/"),
    fetchFeed("https://tvline.com/feed/"),
    fetchFeed("https://deadline.com/feed/"),
  ]);

  const seen = new Set<string>();
  const articles: NewsItem[] = [];
  for (const feed of feeds) {
    for (const item of feed) {
      if (!seen.has(item.link)) {
        seen.add(item.link);
        articles.push(item);
      }
    }
  }

  if (articles.length === 0) return NextResponse.json([]);
  if (!geminiKey) return NextResponse.json([]);

  try {
    const titleList = articles.slice(0, 60).map((a, i) => `${i}: ${a.title}`).join("\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Here are recent TV news articles:\n\n${titleList}\n\nI am interested in the TV show "${showTitle}". Pick up to 5 articles I would want to read. Be generous — include articles about:\n- This exact show\n- The same franchise or universe\n- The same network or streaming platform\n- Shows in the same genre\n- Cast members from this show\n- Similar or competing shows\n\nIf none are related, return an empty array.\n\nReturn ONLY a JSON array of index numbers, no other text. Example: [0, 3, 7]`,
            }],
          }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
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

    const indices: number[] = JSON.parse(jsonMatch[0]);

    const selected = indices
      .filter((i) => i >= 0 && i < articles.length)
      .slice(0, 5)
      .map((i) => ({
        title: articles[i].title,
        link: articles[i].link,
        image: articles[i].image,
        source: "TVGuide",
        pubDate: articles[i].pubDate,
      }));

    return NextResponse.json(selected);
  } catch {
    return NextResponse.json([]);
  }
}
