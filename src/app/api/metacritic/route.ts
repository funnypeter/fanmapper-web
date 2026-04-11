import { NextResponse } from "next/server";

const METACRITIC_API = "https://backend.metacritic.com/finder/metacritic/web";
const IMAGE_CDN = "https://www.metacritic.com/a/img/catalog";

interface MetacriticItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
}

export async function GET() {
  try {
    const res = await fetch(
      `${METACRITIC_API}?sortBy=-metaScore&productType=games&page=1&releaseYearMin=2025`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const games = data?.data?.items ?? [];

    const items: MetacriticItem[] = games.slice(0, 12).map((game: {
      title: string;
      slug: string;
      image?: { bucketPath?: string };
      criticScoreSummary?: { score?: number };
    }) => ({
      title: game.title,
      score: game.criticScoreSummary?.score ?? null,
      image: game.image?.bucketPath
        ? `${IMAGE_CDN}${game.image.bucketPath}`
        : null,
      link: `https://www.metacritic.com/game/${game.slug}/`,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
