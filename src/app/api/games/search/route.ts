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

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json([]);

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
      body: `search "${query.replace(/"/g, '\\"')}";
fields id,name,cover.url,genres.name,platforms.name,first_release_date,summary;
limit 20;`,
    });

    if (!res.ok) return NextResponse.json([]);
    const results = await res.json();

    return NextResponse.json(
      results.map((r: any) => ({
        id: `igdb-${r.id}`,
        igdbId: r.id,
        title: r.name,
        coverUrl: r.cover?.url ? `https:${r.cover.url.replace("t_thumb", "t_cover_big")}` : null,
        genres: (r.genres ?? []).map((g: any) => g.name),
        platforms: (r.platforms ?? []).map((p: any) => p.name),
        releaseDate: r.first_release_date ? new Date(r.first_release_date * 1000).toISOString().split("T")[0] : null,
        summary: r.summary ?? null,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
