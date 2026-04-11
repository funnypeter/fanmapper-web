import { NextRequest, NextResponse } from "next/server";

const TVDB_BASE = "https://api4.thetvdb.com/v4";

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  const apiKey = process.env.TVDB_API_KEY;
  if (!apiKey) throw new Error("TVDB_API_KEY not configured");

  const res = await fetch(`${TVDB_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey: apiKey }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TVDB login ${res.status}: ${errText}`);
  }
  const data = await res.json();
  accessToken = data.data.token;
  tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return accessToken!;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tvdbId = id.replace("tvdb-", "");

  try {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch series extended (includes characters) and episodes in parallel
    const [seriesRes, episodesRes] = await Promise.all([
      fetch(`${TVDB_BASE}/series/${tvdbId}/extended`, { headers }),
      fetch(`${TVDB_BASE}/series/${tvdbId}/episodes/default?page=0`, { headers }),
    ]);

    if (!seriesRes.ok) return NextResponse.json({ error: "Show not found" }, { status: 404 });

    const seriesData = (await seriesRes.json()).data;

    // Parse cast from characters
    const cast = (seriesData.characters ?? [])
      .filter((c: any) => c.peopleType === "Actor" || c.type === 3)
      .sort((a: any, b: any) => (a.sort ?? 999) - (b.sort ?? 999))
      .slice(0, 20)
      .map((c: any) => ({
        name: c.personName || c.name,
        characterName: c.name || "Unknown",
        image: c.personImgURL || c.image || null,
      }));

    // Parse episodes and group by season
    let allEpisodes: any[] = [];
    if (episodesRes.ok) {
      const epData = await episodesRes.json();
      allEpisodes = epData.data?.episodes ?? [];

      // Fetch additional pages if needed
      let page = 1;
      while (allEpisodes.length > 0 && allEpisodes.length % 500 === 0 && page < 10) {
        const moreRes = await fetch(`${TVDB_BASE}/series/${tvdbId}/episodes/default?page=${page}`, { headers });
        if (!moreRes.ok) break;
        const moreData = await moreRes.json();
        const moreEps = moreData.data?.episodes ?? [];
        if (moreEps.length === 0) break;
        allEpisodes.push(...moreEps);
        page++;
      }
    }

    // Group episodes by season
    const seasonMap = new Map<number, any[]>();
    for (const ep of allEpisodes) {
      const sn = ep.seasonNumber ?? 0;
      if (sn === 0) continue; // Skip specials
      if (!seasonMap.has(sn)) seasonMap.set(sn, []);
      seasonMap.get(sn)!.push({
        id: ep.id,
        title: ep.name || `Episode ${ep.number}`,
        seasonNumber: sn,
        episodeNumber: ep.number,
        aired: ep.aired || null,
        image: ep.image || null,
        overview: ep.overview || null,
        runtime: ep.runtime || null,
      });
    }

    // Sort episodes within each season
    const seasons = [...seasonMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([seasonNumber, episodes]) => ({
        seasonNumber,
        episodes: episodes.sort((a: any, b: any) => a.episodeNumber - b.episodeNumber),
      }));

    // Extract genres
    const genres = (seriesData.genres ?? []).map((g: any) => g.name ?? g);

    return NextResponse.json({
      id: `tvdb-${seriesData.id}`,
      tvdbId: seriesData.id,
      title: seriesData.name,
      posterUrl: seriesData.image || null,
      genres,
      network: seriesData.companies?.[0]?.name || null,
      releaseDate: seriesData.firstAired || null,
      summary: seriesData.overview || null,
      year: seriesData.year || null,
      rating: seriesData.score ? Math.round(seriesData.score * 10) : null,
      status: seriesData.status?.name || null,
      cast,
      seasons,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
