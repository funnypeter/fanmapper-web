import { NextResponse } from "next/server";

interface MetacriticItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
}

export async function GET() {
  try {
    // Scrape Metacritic's new releases page
    const res = await fetch("https://www.metacritic.com/browse/game/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) return NextResponse.json([]);

    const html = await res.text();

    // Extract game cards from the browse page
    const items: MetacriticItem[] = [];

    // Match product cards — Metacritic uses structured data in their cards
    const cardMatches = [...html.matchAll(/<a[^>]*class="[^"]*c-finderProductCard[^"]*"[^>]*href="([^"]*)"[^>]*>[\s\S]*?<\/a>/g)];

    for (const match of cardMatches.slice(0, 12)) {
      const cardHtml = match[0];
      const href = match[1];

      const title = cardHtml.match(/c-finderProductCard_titleHeading[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/)?.[1]?.trim() ?? "";
      const scoreStr = cardHtml.match(/c-siteReviewScore[^>]*>[\s\S]*?<span>([\d]+)<\/span>/)?.[1];
      const score = scoreStr ? parseInt(scoreStr) : null;
      const image = cardHtml.match(/src="(https:\/\/www\.metacritic\.com\/a\/img[^"]+)"/)?.[1]
        ?? cardHtml.match(/src="(https:[^"]+(?:\.jpg|\.png|\.webp)[^"]*)"/)?.[1]
        ?? null;

      if (title) {
        items.push({
          title,
          score,
          image,
          link: href.startsWith("http") ? href : `https://www.metacritic.com${href}`,
        });
      }
    }

    // Fallback: try a simpler pattern if the above didn't work
    if (items.length === 0) {
      const titleMatches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)];
      const scoreMatches = [...html.matchAll(/metascore_w[^>]*>(\d+)</g)];

      for (let i = 0; i < Math.min(titleMatches.length, 12); i++) {
        const title = titleMatches[i][1].replace(/<[^>]+>/g, "").trim();
        const score = scoreMatches[i] ? parseInt(scoreMatches[i][1]) : null;
        if (title && title.length < 100) {
          items.push({ title, score, image: null, link: "https://www.metacritic.com" });
        }
      }
    }

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
