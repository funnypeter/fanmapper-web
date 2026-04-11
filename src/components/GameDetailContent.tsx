"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { findWikiConfig, findWikiConfigByIgdbId, GAME_REGISTRY } from "@/lib/services/gameRegistry";
import ReviewSection from "@/components/ReviewSection";
import SteamReviews from "@/components/SteamReviews";
import GameNews from "@/components/GameNews";
import AutoWikiCard from "@/components/AutoWikiCard";
import GameChat from "@/components/GameChat";
import GameSpotArticles from "@/components/GameSpotArticles";

interface GameData {
  id: string;
  title: string;
  coverUrl: string | null;
  genres: string[];
  platforms: string[];
  releaseDate: string | null;
  summary: string | null;
  rating: number | null;
  ratingCount: number;
  screenshots: string[];
  videos: { id: string; name: string }[];
  steamAppId: string | null;
  timeToBeat: { hastily: number | null; normally: number | null; completely: number | null } | null;
}

interface UserGameData {
  status: string;
  playtime_minutes: number;
  rating: number | null;
  review: string | null;
}

const STATUSES = [
  { value: "playing", label: "Playing", icon: "🎮", color: "bg-primary" },
  { value: "completed", label: "Completed", icon: "✅", color: "bg-success" },
  { value: "backlog", label: "Backlog", icon: "📋", color: "bg-xp" },
  { value: "wishlist", label: "Wishlist", icon: "💜", color: "bg-accent" },
  { value: "dropped", label: "Dropped", icon: "❌", color: "bg-error" },
];

export default function GameDetailContent({ gameId }: { gameId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [game, setGame] = useState<GameData | null>(null);
  const [userGame, setUserGame] = useState<UserGameData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [playtimeInput, setPlaytimeInput] = useState("");
  const [editingPlaytime, setEditingPlaytime] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      const { data: dbGame } = await supabase.from("games").select("*").eq("id", gameId).single();

      if (dbGame) {
        setGame({
          id: dbGame.id, title: dbGame.title, coverUrl: dbGame.cover_url,
          genres: dbGame.genres ?? [], platforms: dbGame.platforms ?? [],
          releaseDate: dbGame.release_date, summary: dbGame.summary,
          rating: null, ratingCount: 0, screenshots: [], videos: [], steamAppId: null, timeToBeat: null,
        });
        if (gameId.startsWith("igdb-")) fetchIGDB(gameId);
      } else if (gameId.startsWith("igdb-")) {
        await fetchIGDB(gameId);
      }

      if (u) {
        const { data: ug } = await supabase.from("user_games").select("*").eq("user_id", u.id).eq("game_id", gameId).single();
        if (ug) { setUserGame(ug); setUserRating(ug.rating ?? 0); }
      }
      setLoading(false);
    }

    async function fetchIGDB(id: string) {
      try {
        const res = await fetch(`/api/games/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGame({
            id: data.id, title: data.title, coverUrl: data.coverUrl,
            genres: data.genres ?? [], platforms: data.platforms ?? [],
            releaseDate: data.releaseDate, summary: data.summary,
            rating: data.rating, ratingCount: data.ratingCount ?? 0,
            screenshots: data.screenshots ?? [], videos: data.videos ?? [],
            steamAppId: data.steamAppId ?? null,
            timeToBeat: data.timeToBeat ?? null,
          });
        }
      } catch {}
    }
    load();
  }, [gameId]);

  async function handleAddToLibrary() {
    if (!user) { router.push("/auth/login"); return; }
    setSaving(true);
    try {
      if (game) {
        await supabase.from("games").upsert({
          id: game.id, title: game.title, cover_url: game.coverUrl,
          genres: game.genres, platforms: game.platforms,
          release_date: game.releaseDate, summary: game.summary,
        }, { onConflict: "id" });
      }
      const { error: ugErr } = await supabase.from("user_games").upsert({
        user_id: user.id, game_id: gameId, status: "backlog", updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,game_id" });
      if (!ugErr) setUserGame({ status: "backlog", playtime_minutes: 0, rating: null, review: null });
    } catch {}
    setSaving(false);
  }

  async function changeStatus(status: string) {
    if (!user) return;
    await supabase.from("user_games").update({ status, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("game_id", gameId);
    setUserGame((prev) => prev ? { ...prev, status } : null);
  }

  async function updateRating(r: number) {
    if (!user || !userGame) return;
    setUserRating(r);
    await supabase.from("user_games").update({ rating: r, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("game_id", gameId);
    setUserGame((prev) => prev ? { ...prev, rating: r } : null);
  }

  async function savePlaytime() {
    if (!user || !userGame) return;
    const hours = parseFloat(playtimeInput);
    if (isNaN(hours) || hours < 0) return;
    const minutes = Math.round(hours * 60);
    await supabase.from("user_games").update({ playtime_minutes: minutes, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("game_id", gameId);
    setUserGame((prev) => prev ? { ...prev, playtime_minutes: minutes } : null);
    setEditingPlaytime(false);
  }

  async function removeFromLibrary() {
    if (!user) return;
    await supabase.from("user_games").delete().eq("user_id", user.id).eq("game_id", gameId);
    setUserGame(null); setUserRating(0);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!game) {
    return <p className="text-text-secondary text-center py-20">Game not found</p>;
  }

  const byId = findWikiConfigByIgdbId(gameId);
  const wikiConfig = byId?.config ?? findWikiConfig(game.title);
  const wikiKey = byId?.key ?? (wikiConfig ? Object.entries(GAME_REGISTRY).find(([, v]) => v === wikiConfig)?.[0] : null);
  const inLibrary = !!userGame;

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {game.coverUrl && (
          <div className="absolute inset-0">
            <img src={game.coverUrl} alt="" className="w-full h-full object-cover blur-2xl scale-125 opacity-25" />
          </div>
        )}
        <div className="relative flex flex-col sm:flex-row items-start gap-6 p-8">
          {game.coverUrl ? (
            <img src={game.coverUrl} alt={game.title} className="w-36 h-48 rounded-xl object-cover shadow-2xl border border-border/50 shrink-0" />
          ) : (
            <div className="w-36 h-48 rounded-xl bg-surface-elevated flex items-center justify-center text-4xl shrink-0">🎮</div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">{game.title}</h1>
            {game.releaseDate && <p className="text-text-secondary mt-1">{game.releaseDate.substring(0, 4)}</p>}
            {game.rating && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-primary/15 px-3 py-1.5 rounded-lg">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-primary">{game.rating}</span>
                  <span className="text-xs text-text-muted">/ 100</span>
                </div>
                {game.ratingCount > 0 && <span className="text-xs text-text-muted">{game.ratingCount} ratings</span>}
              </div>
            )}
            {game.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {game.genres.map((g) => <span key={g} className="text-xs bg-primary/10 text-primary-light px-2.5 py-1 rounded-full">{g}</span>)}
              </div>
            )}
            {game.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {game.platforms.map((p) => <span key={p} className="text-xs bg-surface-elevated text-text-muted px-2.5 py-1 rounded-full">{p}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Library */}
      {!inLibrary ? (
        <div className="card-glass p-6 mb-6 text-center">
          <button onClick={handleAddToLibrary} disabled={saving} className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
            {saving ? "Adding..." : "+ Add to Library"}
          </button>
          {!user && (
            <p className="text-xs text-text-muted mt-3">
              <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to add games to your library
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            In Library
          </span>
        </div>
      )}

      {/* Library management */}
      {inLibrary && (
        <div className="card-glass p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {STATUSES.map((s) => (
              <button key={s.value} onClick={() => changeStatus(s.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${
                  userGame?.status === s.value ? `${s.color} border-transparent text-white font-medium` : "border-border text-text-secondary hover:border-text-muted"
                }`}>
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-sm text-text-secondary mb-2">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => updateRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition-transform hover:scale-125" style={{ color: n <= (hoverRating || userRating) ? "#FDCB6E" : "#484F58" }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-2">Playtime</p>
              {editingPlaytime ? (
                <div className="flex gap-2">
                  <input type="number" step="0.5" value={playtimeInput} onChange={(e) => setPlaytimeInput(e.target.value)} placeholder="Hours"
                    className="w-28 rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-foreground" autoFocus />
                  <button onClick={savePlaytime} className="btn-primary text-xs px-3 py-2">Save</button>
                </div>
              ) : (
                <button onClick={() => { setPlaytimeInput(String(Math.round((userGame?.playtime_minutes ?? 0) / 60 * 10) / 10)); setEditingPlaytime(true); }}
                  className="text-lg font-bold text-accent hover:underline">
                  {Math.round((userGame?.playtime_minutes ?? 0) / 60 * 10) / 10}h
                  <span className="text-xs text-text-muted font-normal ml-2">edit</span>
                </button>
              )}
            </div>
          </div>
          <button onClick={removeFromLibrary} className="w-full mt-2 py-3 rounded-xl border border-error/30 text-error text-sm font-medium hover:bg-error/10 transition">
            Remove from Library
          </button>
        </div>
      )}

      {!wikiKey && <AutoWikiCard gameTitle={game.title} />}

      {(wikiKey || inLibrary) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {wikiKey && (
            <Link href={`/wiki/${wikiKey}`} className="card-glass p-5 flex items-center gap-4 hover:border-primary/30 transition group">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-xl shrink-0">📖</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm group-hover:text-primary transition">Track Progress</p>
                <p className="text-xs text-text-muted">Wiki checklists</p>
              </div>
              <span className="text-primary">→</span>
            </Link>
          )}
          {wikiKey && wikiConfig?.maps && wikiConfig.maps.length > 0 && (
            <Link href={`/map/${wikiKey}`} className="card-glass p-5 flex items-center gap-4 hover:border-accent/30 transition group">
              <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center text-xl shrink-0">🗺️</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm group-hover:text-accent transition">Interactive Map</p>
                <p className="text-xs text-text-muted">Explore the world</p>
              </div>
              <span className="text-accent">→</span>
            </Link>
          )}
          {inLibrary && (
            <Link href={`/game/${gameId}/achievements`} className="card-glass p-5 flex items-center gap-4 hover:border-xp/30 transition group">
              <div className="w-11 h-11 rounded-xl bg-xp/15 flex items-center justify-center text-xl shrink-0">🏆</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm group-hover:text-xp transition">Achievements</p>
                <p className="text-xs text-text-muted">Track trophies</p>
              </div>
              <span className="text-xp">→</span>
            </Link>
          )}
        </div>
      )}

      <div className="mb-6"><GameChat gameTitle={game.title} /></div>
      <GameSpotArticles gameTitle={game.title} />

      {game.videos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Videos</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {game.videos.slice(0, 8).map((video) => (
              <div key={video.id} className="shrink-0 w-80 snap-start rounded-xl overflow-hidden border border-border/50">
                <div className="aspect-video">
                  <iframe src={`https://www.youtube.com/embed/${video.id}`} title={video.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                </div>
                <div className="p-3 bg-surface"><p className="text-sm font-medium truncate">{video.name}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {game.screenshots.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Screenshots</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {game.screenshots.slice(0, 10).map((url, i) => (
              <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="shrink-0 h-48 rounded-xl border border-border/50 snap-start object-cover" />
            ))}
          </div>
        </div>
      )}

      {game.timeToBeat && (game.timeToBeat.hastily || game.timeToBeat.normally || game.timeToBeat.completely) && (
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">How Long To Beat</h3>
          <div className="grid grid-cols-3 gap-4">
            {game.timeToBeat.hastily && (
              <div className="text-center p-3 rounded-xl bg-surface-elevated/50">
                <p className="text-2xl font-bold text-accent">{game.timeToBeat.hastily}h</p>
                <p className="text-xs text-text-muted mt-1">Main Story</p>
              </div>
            )}
            {game.timeToBeat.normally && (
              <div className="text-center p-3 rounded-xl bg-surface-elevated/50">
                <p className="text-2xl font-bold text-primary">{game.timeToBeat.normally}h</p>
                <p className="text-xs text-text-muted mt-1">Main + Extras</p>
              </div>
            )}
            {game.timeToBeat.completely && (
              <div className="text-center p-3 rounded-xl bg-surface-elevated/50">
                <p className="text-2xl font-bold text-xp">{game.timeToBeat.completely}h</p>
                <p className="text-xs text-text-muted mt-1">Completionist</p>
              </div>
            )}
          </div>
        </div>
      )}

      {game.summary && (
        <div className="card-glass p-6 mb-8">
          <h3 className="text-xl font-bold mb-3">About</h3>
          <p className="text-text-secondary leading-relaxed">{game.summary}</p>
        </div>
      )}

      <GameNews gameTitle={game.title} />

      {(game.steamAppId || gameId.startsWith("steam-")) && (
        <div className="mb-8">
          <SteamReviews gameId={game.steamAppId ?? gameId.replace("steam-", "")} />
        </div>
      )}

      <div className="mb-8">
        <ReviewSection gameId={gameId} isLoggedIn={!!user} isInLibrary={inLibrary} />
      </div>
    </div>
  );
}
