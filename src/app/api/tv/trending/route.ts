import { NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not configured" });

  try {
    // Fetch trending TV shows from TMDB (weekly)
    const res = await fetch(
      `${TMDB_BASE}/trending/tv/week?api_key=${apiKey}&language=en-US`
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TMDB ${res.status}: ${errText.substring(0, 200)}` });
    }

    const data = await res.json();
    const results = (data.results ?? []).slice(0, 15);

    return NextResponse.json(
      results.map((r: any) => ({
        id: `tmdb-${r.id}`,
        tmdbId: r.id,
        title: r.name,
        posterUrl: r.poster_path ? `${IMG_BASE}${r.poster_path}` : null,
        genre: null,
        network: null,
        year: r.first_air_date?.substring(0, 4) || null,
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
