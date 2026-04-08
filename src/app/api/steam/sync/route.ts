import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STEAM_API = "https://api.steampowered.com";
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // Don't sync more than once per hour

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const key = process.env.STEAM_API_KEY;
  if (!key) return NextResponse.json({ error: "Steam not configured" }, { status: 500 });

  // Get the user's profile to find Steam ID and last sync time
  const { data: profile } = await supabase
    .from("profiles")
    .select("steam_id, last_steam_sync_at")
    .eq("id", user.id)
    .single();

  if (!profile?.steam_id) return NextResponse.json({ skipped: "no_steam_link" });

  // Throttle: skip if synced recently
  if (profile.last_steam_sync_at) {
    const elapsed = Date.now() - new Date(profile.last_steam_sync_at).getTime();
    if (elapsed < SYNC_INTERVAL_MS) {
      return NextResponse.json({ skipped: "throttled", lastSync: profile.last_steam_sync_at });
    }
  }

  try {
    // Fetch owned games (focus on recently played for efficiency)
    const gamesRes = await fetch(
      `${STEAM_API}/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${profile.steam_id}&include_appinfo=true&include_played_free_games=true&format=json`
    );
    if (!gamesRes.ok) return NextResponse.json({ error: "Steam API error" }, { status: 502 });

    const gamesData = await gamesRes.json();
    const games = gamesData.response?.games ?? [];

    // Filter to games with recent activity (played in last 2 weeks) for achievement sync
    // Plus any games where playtime increased significantly since last sync
    const recentGames = games.filter((g: any) => g.playtime_2weeks > 0);

    let achievementsAdded = 0;
    let newAchievements = 0;

    // Update playtime for ALL games (cheap)
    for (const g of games) {
      const gameId = `steam-${g.appid}`;
      const headerUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`;

      await supabase.from("games").upsert({
        id: gameId,
        title: g.name,
        cover_url: headerUrl,
        genres: [],
        platforms: ["PC"],
      }, { onConflict: "id" });

      // Update playtime if changed
      const { data: existing } = await supabase
        .from("user_games")
        .select("playtime_minutes, status")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .single();

      if (!existing || existing.playtime_minutes !== g.playtime_forever) {
        const status = existing?.status ?? (g.playtime_forever > 0
          ? (g.playtime_2weeks > 0 ? "playing" : "backlog")
          : "backlog");

        await supabase.from("user_games").upsert({
          user_id: user.id,
          game_id: gameId,
          status,
          playtime_minutes: g.playtime_forever,
          platform: "steam",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,game_id" });
      }
    }

    // Sync achievements only for recently played games (expensive)
    for (const g of recentGames) {
      const gameId = `steam-${g.appid}`;
      try {
        const achRes = await fetch(
          `${STEAM_API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${key}&steamid=${profile.steam_id}&appid=${g.appid}&l=english`
        );
        if (!achRes.ok) continue;
        const achData = await achRes.json();
        if (!achData.playerstats?.success) continue;

        for (const ach of achData.playerstats.achievements ?? []) {
          const { data: achRow } = await supabase.from("achievements").upsert({
            game_id: gameId,
            platform: "steam",
            external_id: ach.apiname,
            name: ach.name ?? ach.apiname,
            description: ach.description ?? null,
          }, { onConflict: "game_id,platform,external_id" }).select("id").single();

          if (achRow) {
            // Check if this is newly earned
            const { data: existingUserAch } = await supabase
              .from("user_achievements")
              .select("is_earned")
              .eq("user_id", user.id)
              .eq("achievement_id", achRow.id)
              .single();

            const wasEarned = existingUserAch?.is_earned ?? false;
            const isNowEarned = ach.achieved === 1;

            await supabase.from("user_achievements").upsert({
              user_id: user.id,
              achievement_id: achRow.id,
              is_earned: isNowEarned,
              earned_at: isNowEarned && ach.unlocktime > 0
                ? new Date(ach.unlocktime * 1000).toISOString()
                : null,
            }, { onConflict: "user_id,achievement_id" });

            achievementsAdded++;
            if (!wasEarned && isNowEarned) newAchievements++;
          }
        }
      } catch {}
    }

    // Update last sync timestamp
    await supabase
      .from("profiles")
      .update({ last_steam_sync_at: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({
      synced: true,
      games: games.length,
      recentGames: recentGames.length,
      achievementsAdded,
      newAchievements,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
