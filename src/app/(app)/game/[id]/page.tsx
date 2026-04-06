"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { findWikiConfig, GAME_REGISTRY } from "@/lib/services/gameRegistry";

interface GameData {
  id: string;
  title: string;
  coverUrl: string | null;
  genres: string[];
  platforms: string[];
  releaseDate: string | null;
  summary: string | null;
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

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const supabase = createClient();

  const [game, setGame] = useState<GameData | null>(null);
  const [userGame, setUserGame] = useState<UserGameData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [playtimeInput, setPlaytimeInput] = useState("");
  const [editingPlaytime, setEditingPlaytime] = useState(false);

  useEffect(() => {
    async function load() {
      // Get user (may be null if not logged in)
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      // Try to load game from Supabase first
      const { data: dbGame } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (dbGame) {
        setGame({
          id: dbGame.id,
          title: dbGame.title,
          coverUrl: dbGame.cover_url,
          genres: dbGame.genres ?? [],
          platforms: dbGame.platforms ?? [],
          releaseDate: dbGame.release_date,
          summary: dbGame.summary,
        });
      } else if (gameId.startsWith("igdb-")) {
        // Fetch from IGDB API by ID
        try {
          const res = await fetch(`/api/games/${gameId}`);
          if (res.ok) {
            const data = await res.json();
            setGame({
              id: data.id,
              title: data.title,
              coverUrl: data.coverUrl,
              genres: data.genres ?? [],
              platforms: data.platforms ?? [],
              releaseDate: data.releaseDate,
              summary: data.summary,
            });
          }
        } catch {}
      }

      // Get user's relationship with this game
      if (u) {
        const { data: ug } = await supabase
          .from("user_games")
          .select("*")
          .eq("user_id", u.id)
          .eq("game_id", gameId)
          .single();

        if (ug) {
          setUserGame(ug);
          setRating(ug.rating ?? 0);
        }
      }

      setLoading(false);
    }
    load();
  }, [gameId]);

  async function addToLibrary(status: string) {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setSaving(true);

    // Ensure game exists in DB
    if (game) {
      await supabase.from("games").upsert({
        id: game.id,
        title: game.title,
        cover_url: game.coverUrl,
        genres: game.genres,
        platforms: game.platforms,
        release_date: game.releaseDate,
        summary: game.summary,
      });
    }

    await supabase.from("user_games").upsert({
      user_id: user.id,
      game_id: gameId,
      status,
      updated_at: new Date().toISOString(),
    });

    setUserGame((prev) => ({ ...prev, status, playtime_minutes: prev?.playtime_minutes ?? 0, rating: prev?.rating ?? null, review: prev?.review ?? null }));
    setSaving(false);
  }

  async function updateRating(newRating: number) {
    if (!user || !userGame) return;
    setRating(newRating);
    await supabase.from("user_games").update({ rating: newRating, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("game_id", gameId);
    setUserGame((prev) => prev ? { ...prev, rating: newRating } : null);
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
    setUserGame(null);
    setRating(0);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!game) {
    return <p className="text-text-secondary text-center py-20">Game not found</p>;
  }

  const wikiConfig = findWikiConfig(game.title);
  const wikiKey = wikiConfig ? Object.entries(GAME_REGISTRY).find(([, v]) => v === wikiConfig)?.[0] : null;
  const inLibrary = !!userGame;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
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
            {game.releaseDate && (
              <p className="text-text-secondary mt-1">{game.releaseDate.substring(0, 4)}</p>
            )}
            {game.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {game.genres.map((g) => (
                  <span key={g} className="text-xs bg-primary/10 text-primary-light px-2.5 py-1 rounded-full">{g}</span>
                ))}
              </div>
            )}
            {game.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {game.platforms.map((p) => (
                  <span key={p} className="text-xs bg-surface-elevated text-text-muted px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Library / Status */}
      {!inLibrary ? (
        <div className="card-glass p-6 mb-6">
          <h3 className="font-semibold mb-4">Add to Library</h3>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => addToLibrary(s.value)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition text-sm"
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          {!user && (
            <p className="text-xs text-text-muted mt-3">
              <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to add games to your library
            </p>
          )}
        </div>
      ) : (
        <div className="card-glass p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">In Your Library</h3>
            <button onClick={removeFromLibrary} className="text-xs text-error hover:underline">Remove</button>
          </div>

          {/* Status picker */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => addToLibrary(s.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${
                  userGame?.status === s.value
                    ? `${s.color} border-transparent text-white font-medium`
                    : "border-border text-text-secondary hover:border-text-muted"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Rating */}
          <div className="mb-5">
            <p className="text-sm text-text-secondary mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => updateRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition-transform hover:scale-125"
                >
                  {n <= (hoverRating || rating) ? "★" : "☆"}
                </button>
              ))}
              {rating > 0 && <span className="text-sm text-text-muted self-center ml-2">{rating}/5</span>}
            </div>
          </div>

          {/* Playtime */}
          <div>
            <p className="text-sm text-text-secondary mb-2">Playtime</p>
            {editingPlaytime ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={playtimeInput}
                  onChange={(e) => setPlaytimeInput(e.target.value)}
                  placeholder="Hours"
                  className="w-32 rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-foreground"
                  autoFocus
                />
                <button onClick={savePlaytime} className="btn-primary text-sm px-4 py-2">Save</button>
                <button onClick={() => setEditingPlaytime(false)} className="text-sm text-text-muted px-3">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => { setPlaytimeInput(String(Math.round((userGame?.playtime_minutes ?? 0) / 60 * 10) / 10)); setEditingPlaytime(true); }}
                className="text-lg font-bold text-accent hover:underline"
              >
                {Math.round((userGame?.playtime_minutes ?? 0) / 60 * 10) / 10}h
                <span className="text-xs text-text-muted font-normal ml-2">tap to edit</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick links: Wiki, Map, Achievements */}
      {wikiConfig && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link
            href={`/wiki/${wikiKey ?? ""}`}
            className="card-glass p-4 text-center hover:border-primary/30 transition group"
          >
            <span className="text-2xl">📖</span>
            <p className="text-sm font-medium mt-2 group-hover:text-primary transition">Wiki</p>
          </Link>
          {wikiConfig.maps.length > 0 && (
            <div className="card-glass p-4 text-center opacity-50">
              <span className="text-2xl">🗺️</span>
              <p className="text-sm font-medium mt-2">Map</p>
              <p className="text-xs text-text-muted">Coming soon</p>
            </div>
          )}
          <div className="card-glass p-4 text-center opacity-50">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-medium mt-2">Achievements</p>
            <p className="text-xs text-text-muted">Coming soon</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {game.summary && (
        <div className="card-glass p-6 mb-6">
          <h3 className="font-semibold mb-3">About</h3>
          <p className="text-text-secondary leading-relaxed">{game.summary}</p>
        </div>
      )}
    </div>
  );
}

