import { NextRequest, NextResponse } from "next/server";

const STEAM_API = "https://api.steampowered.com";

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamid");
  if (!steamId) return NextResponse.json({ error: "Missing steamid" }, { status: 400 });

  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json({ error: "Steam API key not configured" }, { status: 500 });

  const res = await fetch(`${STEAM_API}/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`);
  if (!res.ok) return NextResponse.json({ error: "Steam API error" }, { status: 502 });

  const data = await res.json();
  const player = data.response?.players?.[0];
  if (!player) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json({
    steamId: player.steamid,
    personaName: player.personaname,
    avatarUrl: player.avatarfull,
    profileUrl: player.profileurl,
  });
}
