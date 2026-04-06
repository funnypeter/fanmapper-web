"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SteamProfile {
  steamId: string;
  personaName: string;
  avatarUrl: string;
}

interface ImportProgress {
  current: number;
  total: number;
  currentGame: string;
}

export default function LinkSteamPage() {
  const supabase = createClient();
  const [steamId, setSteamId] = useState("");
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<{ games: number; achievements: number } | null>(null);
  const [error, setError] = useState("");
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Check if Steam is already linked
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("steam_id").eq("id", user.id).single();
        if (p?.steam_id) {
          setSteamId(p.steam_id);
          // Auto-lookup the existing profile
          try {
            const res = await fetch(`/api/steam/profile?steamid=${p.steam_id}`);
            const data = await res.json();
            if (res.ok) setProfile(data);
          } catch {}
        }
      }
      setLoadingExisting(false);
    })();
  }, []);

  async function handleLookup() {
    if (!steamId.trim()) return;
    setLookingUp(true);
    setError("");
    setProfile(null);
    try {
      const res = await fetch(`/api/steam/profile?steamid=${steamId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Profile not found");
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Could not find that Steam ID");
    } finally {
      setLookingUp(false);
    }
  }

  async function handleImport() {
    if (!profile) return;
    setImporting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Fetch owned games
      const gamesRes = await fetch(`/api/steam/games?steamid=${profile.steamId}`);
      const gamesData = await gamesRes.json();
      const games = gamesData.games ?? [];

      setProgress({ current: 0, total: games.length, currentGame: "" });

      let importedGames = 0;
      let importedAchievements = 0;

      for (let i = 0; i < games.length; i++) {
        const g = games[i];
        setProgress({ current: i + 1, total: games.length, currentGame: g.name });

        const gameId = `steam-${g.appid}`;

        // Upsert game — use header image as fallback for cover
        await supabase.from("games").upsert({
          id: gameId,
          title: g.name,
          cover_url: g.headerUrl ?? g.coverUrl,
          genres: [],
          platforms: ["PC"],
        }, { onConflict: "id" });

        // Upsert user_game
        const status = g.playtimeForever > 0
          ? (g.playtime2Weeks > 0 ? "playing" : "backlog")
          : "backlog";

        await supabase.from("user_games").upsert({
          user_id: user.id,
          game_id: gameId,
          status,
          playtime_minutes: g.playtimeForever,
          platform: "steam",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,game_id" });

        importedGames++;

        // Fetch achievements (skip for speed — do every 5th game or games with significant playtime)
        if (g.playtimeForever > 60) {
          try {
            const achRes = await fetch(`/api/steam/achievements?steamid=${profile.steamId}&appid=${g.appid}`);
            const achData = await achRes.json();
            for (const ach of achData.achievements ?? []) {
              const { data: achRow } = await supabase.from("achievements").upsert({
                game_id: gameId,
                platform: "steam",
                external_id: ach.apiname,
                name: ach.name ?? ach.apiname,
                description: ach.description ?? null,
              }, { onConflict: "game_id,platform,external_id" }).select("id").single();

              if (achRow) {
                await supabase.from("user_achievements").upsert({
                  user_id: user.id,
                  achievement_id: achRow.id,
                  is_earned: ach.achieved,
                  earned_at: ach.achieved && ach.unlocktime > 0
                    ? new Date(ach.unlocktime * 1000).toISOString()
                    : null,
                }, { onConflict: "user_id,achievement_id" });
                if (ach.achieved) importedAchievements++;
              }
            }
          } catch {}
        }
      }

      // Save Steam ID to profile
      await supabase.from("profiles").update({ steam_id: profile.steamId }).eq("id", user.id);

      setResult({ games: importedGames, achievements: importedAchievements });
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-text-secondary hover:text-foreground transition">← Back</Link>
        <h2 className="text-2xl font-bold">Link Steam</h2>
      </div>

      <div className="card-glass p-6">
        <p className="text-sm text-text-secondary mb-4">
          Enter your SteamID64 (17-digit number). Find it at{" "}
          <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">steamid.io</a>
        </p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="76561198011775992"
            maxLength={17}
            className="flex-1 rounded-xl bg-surface-elevated border border-border px-4 py-3 text-foreground text-center tracking-wider font-mono"
          />
          <button onClick={handleLookup} disabled={lookingUp || steamId.length < 17} className="btn-primary px-6">
            {lookingUp ? "..." : "Look Up"}
          </button>
        </div>

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        {profile && !result && (
          <div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-elevated mb-4">
              <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-xl" />
              <div>
                <p className="font-semibold">{profile.personaName}</p>
                <p className="text-xs text-text-muted">{profile.steamId}</p>
              </div>
            </div>

            <button onClick={handleImport} disabled={importing} className="btn-primary w-full py-3.5">
              {importing ? "Importing..." : "Import Games & Achievements"}
            </button>

            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-muted mb-2">
                  <span>{progress.currentGame}</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="text-center py-6">
            <span className="text-5xl">🎉</span>
            <h3 className="text-xl font-bold mt-4">Import Complete!</h3>
            <p className="text-text-secondary mt-2">
              {result.games} games · {result.achievements} achievements
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/library" className="btn-primary text-sm">View Library</Link>
              <button
                onClick={() => { setResult(null); setProgress(null); }}
                className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:text-foreground transition"
              >
                Re-sync
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
