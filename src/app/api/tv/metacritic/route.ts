import { NextResponse } from "next/server";

const METACRITIC_API = "https://backend.metacritic.com/finder/metacritic/web";
const IMAGE_CDN = "https://www.metacritic.com/a/img/catalog";

export async function GET() {
  try {
    const res = await fetch(
      `${METACRITIC_API}?sortBy=-metaScore&productType=tv&page=1&releaseYearMin=2024`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const shows = data?.data?.items ?? [];

    const items = shows.slice(0, 12).map((show: {
      title: string;
      slug: string;
      image?: { bucketPath?: string };
      criticScoreSummary?: { score?: number };
    }) => ({
      title: show.title,
      score: show.criticScoreSummary?.score ?? null,
      image: show.image?.bucketPath ? `${IMAGE_CDN}${show.image.bucketPath}` : null,
      link: `https://www.metacritic.com/tv/${show.slug}/`,
    }));

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
