import { NextResponse } from "next/server";

const METACRITIC_RSS = "https://rss.app/feeds/W3qYELBGuGh8xILO.xml";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE = "https://api.igdb.com/v4";

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getIGDBToken(): Promise<string> {
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

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'");
}

interface MetacriticItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
}

export async function GET() {
  try {
    const res = await fetch(METACRITIC_RSS, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json([]);

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10);

    // Parse RSS items
    const parsed = itemMatches.map((match) => {
      const content = match[1];
      const rawTitle = content.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1]
        ?? content.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      // Strip " Reviews" suffix from titles like "Slime Rancher 2 Reviews"
      const title = decodeHtml(rawTitle.replace(/\s*Reviews\s*$/i, "").trim());
      const link = content.match(/<link>(.*?)<\/link>/)?.[1] ?? "https://www.metacritic.com";
      return { title, link };
    }).filter((item) => item.title);

    if (parsed.length === 0) return NextResponse.json([]);

    // Batch search IGDB for cover art
    const token = await getIGDBToken();
    const items: MetacriticItem[] = [];

    // Search all titles in parallel
    const coverPromises = parsed.map(async (item) => {
      try {
        const igdbRes = await fetch(`${IGDB_BASE}/games`, {
          method: "POST",
          headers: {
            "Client-ID": process.env.IGDB_CLIENT_ID!,
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "text/plain",
          },
          body: `search "${item.title.replace(/"/g, '\\"')}"; fields cover.url,total_rating; limit 1;`,
        });

        if (!igdbRes.ok) return { ...item, image: null, score: null };
        const results = await igdbRes.json();
        const game = results[0];
        const image = game?.cover?.url
          ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
          : null;
        const score = game?.total_rating ? Math.round(game.total_rating) : null;
        return { ...item, image, score };
      } catch {
        return { ...item, image: null, score: null };
      }
    });

    const results = await Promise.all(coverPromises);
    items.push(...results);

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
