import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const IMG_PROFILE = "https://image.tmdb.org/t/p/w185";
const IMG_STILL = "https://image.tmdb.org/t/p/w300";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tmdbId = id.replace("tmdb-", "");

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 500 });

  try {
    // Fetch show details with credits + recommendations appended
    const detailRes = await fetch(
      `${TMDB_BASE}/tv/${tmdbId}?api_key=${apiKey}&language=en-US&append_to_response=credits,recommendations`
    );

    if (!detailRes.ok) return NextResponse.json({ error: "Show not found" }, { status: 404 });
    const show = await detailRes.json();

    // Parse recommendations — TMDB returns shows watched/liked by similar audiences
    const recommendations = (show.recommendations?.results ?? [])
      .slice(0, 8)
      .map((r: any) => ({
        id: `tmdb-${r.id}`,
        title: r.name,
        posterUrl: r.poster_path ? `${IMG_BASE}${r.poster_path}` : null,
        year: r.first_air_date?.substring(0, 4) || null,
      }));

    // Parse cast from credits
    const cast = (show.credits?.cast ?? [])
      .slice(0, 20)
      .map((c: any) => ({
        name: c.name,
        characterName: c.character || "Unknown",
        image: c.profile_path ? `${IMG_PROFILE}${c.profile_path}` : null,
      }));

    // Fetch episodes for each season in parallel
    const seasonNumbers = (show.seasons ?? [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => s.season_number);

    const seasonResults = await Promise.all(
      seasonNumbers.map(async (sn: number) => {
        try {
          const sRes = await fetch(
            `${TMDB_BASE}/tv/${tmdbId}/season/${sn}?api_key=${apiKey}&language=en-US`
          );
          if (!sRes.ok) return null;
          const sData = await sRes.json();
          return {
            seasonNumber: sn,
            episodes: (sData.episodes ?? []).map((ep: any) => ({
              id: ep.id,
              title: ep.name || `Episode ${ep.episode_number}`,
              seasonNumber: sn,
              episodeNumber: ep.episode_number,
              aired: ep.air_date || null,
              image: ep.still_path ? `${IMG_STILL}${ep.still_path}` : null,
              overview: ep.overview || null,
              runtime: ep.runtime || null,
            })),
          };
        } catch {
          return null;
        }
      })
    );

    const seasons = seasonResults.filter(Boolean);

    // Extract genres
    const genres = (show.genres ?? []).map((g: any) => g.name);

    // Get network
    const network = show.networks?.[0]?.name || null;

    return NextResponse.json({
      id: `tmdb-${show.id}`,
      tmdbId: show.id,
      title: show.name,
      posterUrl: show.poster_path ? `${IMG_BASE}${show.poster_path}` : null,
      genres,
      network,
      releaseDate: show.first_air_date || null,
      summary: show.overview || null,
      year: show.first_air_date?.substring(0, 4) || null,
      rating: show.vote_average ? Math.round(show.vote_average * 10) : null,
      status: show.status || null,
      cast,
      seasons,
      recommendations,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
