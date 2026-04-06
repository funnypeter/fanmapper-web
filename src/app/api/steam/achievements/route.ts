import { NextRequest, NextResponse } from "next/server";

const STEAM_API = "https://api.steampowered.com";

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamid");
  const appId = request.nextUrl.searchParams.get("appid");
  if (!steamId || !appId) return NextResponse.json({ error: "Missing steamid or appid" }, { status: 400 });

  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json({ error: "Steam API key not configured" }, { status: 500 });

  try {
    const res = await fetch(
      `${STEAM_API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${key}&steamid=${steamId}&appid=${appId}&l=english`
    );
    if (!res.ok) return NextResponse.json({ achievements: [] }); // Game may not have achievements

    const data = await res.json();
    if (!data.playerstats?.success) return NextResponse.json({ achievements: [] });

    const achievements = (data.playerstats.achievements ?? []).map((a: any) => ({
      apiname: a.apiname,
      achieved: a.achieved === 1,
      unlocktime: a.unlocktime,
      name: a.name,
      description: a.description,
    }));

    return NextResponse.json({ achievements });
  } catch {
    return NextResponse.json({ achievements: [] });
  }
}
