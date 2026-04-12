"use client";

import { useEffect, useState } from "react";
import { useGameModal } from "@/components/GameModalContext";
import { useTVShowModal } from "@/components/TVShowModalContext";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

interface TrendingShow {
  id: string;
  title: string;
  posterUrl: string | null;
  year: string | null;
}

export default function HomeForYou({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { openGame } = useGameModal();
  const { openShow } = useTVShowModal();
  const [shows, setShows] = useState<TrendingShow[]>([]);

  useEffect(() => {
    fetch("/api/tv/trending")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setShows(data.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const games = Object.values(GAME_REGISTRY).slice(0, 8);

  if (games.length === 0 && shows.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold">For You</h2>
        <p className="text-xs text-text-muted mt-0.5">
          {isLoggedIn
            ? "Hand-picked games and shows from the community favorites"
            : "Sign in to get personalized picks — here's what's hot right now"}
        </p>
      </div>

      {games.length > 0 && (
        <>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">🎮 Games</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 mb-6">
            {games.map((g) => (
              <button
                key={g.igdbId}
                onClick={() => openGame(g.igdbId)}
                className="flex-shrink-0 w-[120px] text-left group"
              >
                {g.cover ? (
                  <img
                    src={g.cover}
                    alt={g.gameTitle}
                    className="w-[120px] h-[160px] rounded-xl object-cover border border-border/50 group-hover:border-primary transition"
                  />
                ) : (
                  <div className="w-[120px] h-[160px] rounded-xl bg-surface-elevated flex items-center justify-center text-3xl border border-border/50">🎮</div>
                )}
                <p className="text-xs font-semibold mt-2 line-clamp-1 group-hover:text-primary transition">{g.gameTitle}</p>
                <p className="text-[10px] text-text-muted">{g.genre}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {shows.length > 0 && (
        <>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">📺 TV Shows</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
            {shows.map((s) => (
              <button
                key={s.id}
                onClick={() => openShow(s.id)}
                className="flex-shrink-0 w-[120px] text-left group"
              >
                {s.posterUrl ? (
                  <img
                    src={s.posterUrl}
                    alt={s.title}
                    className="w-[120px] h-[180px] rounded-xl object-cover border border-border/50 group-hover:border-primary transition"
                  />
                ) : (
                  <div className="w-[120px] h-[180px] rounded-xl bg-surface-elevated flex items-center justify-center text-3xl border border-border/50">📺</div>
                )}
                <p className="text-xs font-semibold mt-2 line-clamp-1 group-hover:text-primary transition">{s.title}</p>
                {s.year && <p className="text-[10px] text-text-muted">{s.year}</p>}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
