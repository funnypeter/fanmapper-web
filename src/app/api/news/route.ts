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

async function fetchRSS(url: string, source: string, limit = 12): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } }); // Cache 30 min
    if (!res.ok) return [];
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit);

    return items.map((match) => {
      const content = match[1];
      const title = decodeHtml(content.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const image = content.match(/url="([^"]+)"/)?.[1]
        ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
        ?? content.match(/<img[^>]*src="([^"]+)"/)?.[1]
        ?? null;
      const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

      return { title, link, image, source, pubDate };
    }).filter((n) => n.title);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game");

  const feeds = await Promise.all([
    fetchRSS("https://www.gamespot.com/feeds/mashup/", "GameSpot", game ? 30 : 6),
    fetchRSS("https://kotaku.com/rss", "Kotaku", game ? 20 : 4),
    fetchRSS("https://www.ign.com/articles.rss", "IGN", game ? 20 : 4),
  ]);

  let all = feeds.flat();

  // Filter by game name if provided
  if (game) {
    const lower = game.toLowerCase();
    // Match if game title appears in news title, with token-level matching for multi-word titles
    const tokens = lower.split(/\s+/).filter((t) => t.length > 2);
    all = all.filter((item) => {
      const titleLower = item.title.toLowerCase();
      if (titleLower.includes(lower)) return true;
      // Match if at least 2 significant tokens appear
      const matches = tokens.filter((t) => titleLower.includes(t)).length;
      return tokens.length >= 2 ? matches >= 2 : matches === tokens.length;
    });
  }

  // Sort by date descending
  all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json(all.slice(0, game ? 8 : 12));
}
