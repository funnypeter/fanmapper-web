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
  // TVDB tokens last 1 month, refresh after 7 days
  tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return accessToken!;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json([]);

  try {
    const token = await getToken();
    const res = await fetch(`${TVDB_BASE}/search?query=${encodeURIComponent(query)}&type=series&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `TVDB ${res.status}: ${errText.substring(0, 200)}` });
    }
    const data = await res.json();
    const results = data.data ?? [];

    return NextResponse.json(
      results.map((r: any) => ({
        id: `tvdb-${r.tvdb_id}`,
        tvdbId: parseInt(r.tvdb_id),
        title: r.name,
        posterUrl: r.image_url || r.poster || r.thumbnail || null,
        genres: r.genres ?? [],
        network: r.network || null,
        releaseDate: r.first_air_time || null,
        summary: r.overview || null,
        year: r.year || null,
      }))
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
