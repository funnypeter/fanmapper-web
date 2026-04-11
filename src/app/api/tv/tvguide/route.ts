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
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return items.map((match) => {
      const content = match[1];
      const title = decodeHtml(content.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const image = content.match(/<media:content[^>]*url="([^"]+)"/)?.[1]
        ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
        ?? content.match(/url="([^"]+)"/)?.[1]
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

  // Fetch from working TV news RSS feeds in parallel
  const feeds = await Promise.all([
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

  // Simple keyword matching — no Gemini needed for speed
  const keywords = showTitle.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !["the", "and", "for", "trending"].includes(w));

  const scored = articles.map((article) => {
    const titleLower = article.title.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (titleLower.includes(kw)) score++;
    }
    // Boost for exact title match
    if (titleLower.includes(showTitle.toLowerCase())) score += 5;
    return { article, score };
  });

  // Get articles that match at least one keyword
  let matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article)
    .slice(0, 5);

  // If no matches, return the most recent articles as general TV news
  if (matched.length === 0) {
    matched = articles
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 5);
  }

  return NextResponse.json(
    matched.map((a) => ({
      title: a.title,
      link: a.link,
      image: a.image,
      source: "TV News",
      pubDate: a.pubDate,
    }))
  );
}
