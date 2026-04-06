import { NextRequest, NextResponse } from "next/server";

const STEAM_API = "https://api.steampowered.com";

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamid");
  if (!steamId) return NextResponse.json({ error: "Missing steamid" }, { status: 400 });

  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json({ error: "Steam API key not configured" }, { status: 500 });

  const res = await fetch(
    `${STEAM_API}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
  );
  if (!res.ok) return NextResponse.json({ error: "Steam API error" }, { status: 502 });

  const data = await res.json();
  const games = (data.response?.games ?? []).map((g: any) => ({
    appid: g.appid,
    name: g.name,
    playtimeForever: g.playtime_forever ?? 0,
    playtime2Weeks: g.playtime_2weeks ?? 0,
    coverUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/library_600x900_2x.jpg`,
  }));

  return NextResponse.json({ gameCount: data.response?.game_count ?? 0, games });
}
