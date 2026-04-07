import { NextRequest, NextResponse } from "next/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE = "https://api.igdb.com/v4";

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("IGDB credentials not configured");

  const res = await fetch(
    `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken!;
}

async function getSteamAppId(igdbGame: any): Promise<string | null> {
  // Try IGDB external_games first (category 1 = Steam)
  const fromIgdb = (igdbGame.external_games ?? []).find((e: any) => e.category === 1)?.uid;
  if (fromIgdb) return fromIgdb;

  // Fallback: search Steam store by game name
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(igdbGame.name)}&cc=us&l=en`,
    );
    if (res.ok) {
      const data = await res.json();
      const match = (data.items ?? []).find((item: any) =>
        item.name.toLowerCase() === igdbGame.name.toLowerCase()
      ) ?? data.items?.[0];
      if (match) return String(match.id);
    }
  } catch {}

  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const igdbId = id.replace("igdb-", "");
  const numericId = parseInt(igdbId, 10);
  if (isNaN(numericId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const token = await getToken();
    const res = await fetch(`${IGDB_BASE}/games`, {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: `where id = ${numericId};
fields id,name,cover.url,genres.name,platforms.name,first_release_date,summary,storyline,screenshots.url,artworks.url,videos.video_id,videos.name,rating,aggregated_rating,total_rating,total_rating_count,external_games.uid,external_games.category,game_time_to_beats.hastily,game_time_to_beats.normally,game_time_to_beats.completely;
limit 1;`,
    });

    if (!res.ok) return NextResponse.json({ error: "IGDB error" }, { status: 502 });
    const results = await res.json();
    if (results.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const r = results[0];
    return NextResponse.json({
      id: `igdb-${r.id}`,
      igdbId: r.id,
      title: r.name,
      coverUrl: r.cover?.url ? `https:${r.cover.url.replace("t_thumb", "t_cover_big")}` : null,
      genres: (r.genres ?? []).map((g: any) => g.name),
      platforms: (r.platforms ?? []).map((p: any) => p.name),
      releaseDate: r.first_release_date ? new Date(r.first_release_date * 1000).toISOString().split("T")[0] : null,
      summary: r.summary ?? r.storyline ?? null,
      rating: r.total_rating ? Math.round(r.total_rating) : null,
      ratingCount: r.total_rating_count ?? 0,
      screenshots: (r.screenshots ?? []).map((s: any) => s.url ? `https:${s.url.replace("t_thumb", "t_screenshot_big")}` : null).filter(Boolean),
      videos: (r.videos ?? []).map((v: any) => ({ id: v.video_id, name: v.name })),
      steamAppId: await getSteamAppId(r),
      timeToBeat: r.game_time_to_beats?.[0] ? {
        hastily: r.game_time_to_beats[0].hastily ? Math.round(r.game_time_to_beats[0].hastily / 3600) : null,
        normally: r.game_time_to_beats[0].normally ? Math.round(r.game_time_to_beats[0].normally / 3600) : null,
        completely: r.game_time_to_beats[0].completely ? Math.round(r.game_time_to_beats[0].completely / 3600) : null,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
