import { NextResponse } from "next/server";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function fetchRSS(url: string, source: string, limit = 8): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, limit);

    return items
      .map((match) => {
        const content = match[1];
        const title = decodeHtml(
          content.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1]
            ?? content.match(/<title>(.*?)<\/title>/)?.[1]
            ?? ""
        );
        const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
        const image = content.match(/<media:content[^>]*url="([^"]+)"/)?.[1]
          ?? content.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1]
          ?? content.match(/url="([^"]+)"/)?.[1]
          ?? content.match(/<img[^>]*src="([^"]+)"/)?.[1]
          ?? null;
        const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
        return { title, link, image, source, pubDate };
      })
      .filter((n) => n.title && n.link);
  } catch {
    return [];
  }
}

export async function GET() {
  const feeds = await Promise.all([
    fetchRSS("https://tvline.com/feed/", "TVLine"),
    fetchRSS("https://deadline.com/feed/", "Deadline"),
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

  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json(articles);
}
