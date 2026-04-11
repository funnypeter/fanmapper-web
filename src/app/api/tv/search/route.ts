import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json([]);

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not configured" });

  try {
    const res = await fetch(
      `${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TMDB ${res.status}: ${errText.substring(0, 200)}` });
    }

    const data = await res.json();
    const results = data.results ?? [];

    return NextResponse.json(
      results.slice(0, 20).map((r: any) => ({
        id: `tmdb-${r.id}`,
        tmdbId: r.id,
        title: r.name,
        posterUrl: r.poster_path ? `${IMG_BASE}${r.poster_path}` : null,
        genres: [],
        network: null,
        releaseDate: r.first_air_date || null,
        summary: r.overview || null,
        year: r.first_air_date?.substring(0, 4) || null,
        rating: r.vote_average ? Math.round(r.vote_average * 10) : null,
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
