"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const steamIdParam = searchParams.get("steamid");
  const errorParam = searchParams.get("error");

  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<{ games: number; achievements: number } | null>(null);
  const [error, setError] = useState(errorParam ? "Steam sign in failed. Please try again." : "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // If we got a steamid from the OpenID callback, look up the profile
      if (steamIdParam) {
        try {
          const res = await fetch(`/api/steam/profile?steamid=${steamIdParam}`);
          const data = await res.json();
          if (res.ok) setProfile(data);
        } catch {}
        setLoading(false);
        return;
      }

      // Check if already linked
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("steam_id").eq("id", user.id).single();
        if (p?.steam_id) {
          try {
            const res = await fetch(`/api/steam/profile?steamid=${p.steam_id}`);
            const data = await res.json();
            if (res.ok) setProfile(data);
          } catch {}
        }
      }
      setLoading(false);
    })();
  }, [steamIdParam]);

  async function handleImport() {
    if (!profile) return;
    setImporting(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

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

        await supabase.from("games").upsert({
          id: gameId, title: g.name, cover_url: g.headerUrl ?? g.coverUrl,
          genres: [], platforms: ["PC"],
        }, { onConflict: "id" });

        const status = g.playtimeForever > 0
          ? (g.playtime2Weeks > 0 ? "playing" : "backlog")
          : "backlog";

        await supabase.from("user_games").upsert({
          user_id: user.id, game_id: gameId, status,
          playtime_minutes: g.playtimeForever, platform: "steam",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,game_id" });

        importedGames++;

        if (g.playtimeForever > 60) {
          try {
            const achRes = await fetch(`/api/steam/achievements?steamid=${profile.steamId}&appid=${g.appid}`);
            const achData = await achRes.json();
            for (const ach of achData.achievements ?? []) {
              const { data: achRow } = await supabase.from("achievements").upsert({
                game_id: gameId, platform: "steam",
                external_id: ach.apiname, name: ach.name ?? ach.apiname,
                description: ach.description ?? null,
              }, { onConflict: "game_id,platform,external_id" }).select("id").single();

              if (achRow) {
                await supabase.from("user_achievements").upsert({
                  user_id: user.id, achievement_id: achRow.id,
                  is_earned: ach.achieved,
                  earned_at: ach.achieved && ach.unlocktime > 0
                    ? new Date(ach.unlocktime * 1000).toISOString() : null,
                }, { onConflict: "user_id,achievement_id" });
                if (ach.achieved) importedAchievements++;
              }
            }
          } catch {}
        }
      }

      await supabase.from("profiles").update({ steam_id: profile.steamId }).eq("id", user.id);
      setResult({ games: importedGames, achievements: importedAchievements });
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-text-secondary hover:text-foreground transition">← Back</Link>
        <h2 className="text-2xl font-bold">Link Steam</h2>
      </div>

      <div className="card-glass p-6">
        {error && <p className="text-error text-sm mb-4">{error}</p>}

        {/* Not linked yet — show Sign In with Steam button */}
        {!profile && !result && (
          <div className="text-center py-4">
            <p className="text-text-secondary mb-6">Sign in with your Steam account to import your games and achievements.</p>
            <a
              href="/api/steam/auth"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #171a21 0%, #1b2838 100%)" }}
            >
              <svg className="w-7 h-7" viewBox="0 0 256 259" fill="currentColor">
                <path d="M127.779 0C60.42 0 5.24 52.412 0 119.014l68.724 28.674a35.604 35.604 0 0120.426-6.366l30.6-44.452c0-.21 0-.42 0-.63A53.469 53.469 0 01173.22 43.2a53.469 53.469 0 0153.47 53.47 53.469 53.469 0 01-53.47 53.47h-1.26l-43.68 31.2a35.846 35.846 0 01-35.784 37.38 35.916 35.916 0 01-35.42-30.24L3.36 165.48C19.32 219.36 69.18 258.96 127.78 258.96c70.56 0 127.78-57.22 127.78-127.78S198.34 0 127.78 0z" />
              </svg>
              Sign in with Steam
            </a>
          </div>
        )}

        {/* Profile loaded — show import button */}
        {profile && !result && (
          <div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-elevated mb-4">
              <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-xl" />
              <div>
                <p className="font-semibold">{profile.personaName}</p>
                <p className="text-xs text-text-muted">{profile.steamId}</p>
              </div>
              <span className="ml-auto text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">Verified</span>
            </div>

            <button onClick={handleImport} disabled={importing} className="btn-primary w-full py-3.5">
              {importing ? "Importing..." : "Import Games & Achievements"}
            </button>

            {progress && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-muted mb-2">
                  <span className="truncate mr-2">{progress.currentGame}</span>
                  <span className="shrink-0">{progress.current}/{progress.total}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import complete */}
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
