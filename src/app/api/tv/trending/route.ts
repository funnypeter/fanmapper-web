import { NextResponse } from "next/server";

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

// Curated list of popular show TVDB IDs to fetch dynamically
const TRENDING_IDS = [
  371572,  // House of the Dragon
  371980,  // Severance
  392256,  // The Last of Us
  389828,  // Squid Game
  305288,  // Stranger Things
  361753,  // The Mandalorian
  81189,   // Breaking Bad
  121361,  // Game of Thrones
  409680,  // The Bear
  392434,  // Shogun
  413289,  // Fallout
  394016,  // Wednesday
  393100,  // Arcane
  355567,  // The Boys
  380661,  // Andor
];

export async function GET() {
  try {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all shows in parallel
    const results = await Promise.all(
      TRENDING_IDS.map(async (id) => {
        try {
          const res = await fetch(`${TVDB_BASE}/series/${id}`, { headers });
          if (!res.ok) return null;
          const data = (await res.json()).data;
          return {
            id: `tvdb-${data.id}`,
            tvdbId: data.id,
            title: data.name,
            posterUrl: data.image || null,
            genre: (data.genres?.[0]?.name) || null,
            network: null,
            year: data.year || null,
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
