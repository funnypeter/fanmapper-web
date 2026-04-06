"use client";

import { useState } from "react";
import Link from "next/link";

interface LibraryGame {
  id: string;
  gameId: string;
  title: string;
  coverUrl: string | null;
  status: string;
  playtimeMinutes: number;
  rating: number | null;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  playing: { label: "Playing", bg: "bg-primary" },
  completed: { label: "Completed", bg: "bg-success" },
  backlog: { label: "Backlog", bg: "bg-xp" },
  wishlist: { label: "Wishlist", bg: "bg-accent" },
  dropped: { label: "Dropped", bg: "bg-error" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "playing", label: "Playing" },
  { value: "completed", label: "Completed" },
  { value: "backlog", label: "Backlog" },
  { value: "wishlist", label: "Wishlist" },
  { value: "dropped", label: "Dropped" },
];

const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "alpha", label: "A-Z" },
  { value: "playtime", label: "Playtime" },
  { value: "rating", label: "Rating" },
];

export default function LibraryGrid({ games }: { games: LibraryGame[] }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const filtered = filter === "all" ? games : games.filter((g) => g.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "alpha") return a.title.localeCompare(b.title);
    if (sort === "playtime") return b.playtimeMinutes - a.playtimeMinutes;
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Count per status
  const counts: Record<string, number> = {};
  games.forEach((g) => { counts[g.status] = (counts[g.status] || 0) + 1; });

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => {
          const count = f.value === "all" ? games.length : (counts[f.value] || 0);
          if (f.value !== "all" && count === 0) return null;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm border transition ${
                active
                  ? "bg-primary border-primary text-white font-medium"
                  : "bg-surface border-border text-text-secondary hover:border-text-muted"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-text-muted"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${
              sort === s.value
                ? "bg-surface-elevated text-foreground font-medium"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p className="text-text-secondary text-center py-12">No games match this filter</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {sorted.map((ug) => {
            const status = STATUS_CONFIG[ug.status];
            return (
              <Link
                key={ug.id}
                href={`/game/${ug.gameId}`}
                className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
              >
                {ug.coverUrl ? (
                  <img src={ug.coverUrl} alt={ug.title} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-text-muted text-3xl">🎮</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status?.bg ?? "bg-text-muted"} text-white`}>
                    {status?.label ?? ug.status}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold text-sm leading-tight text-white">{ug.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {ug.playtimeMinutes > 0 && (
                      <span className="text-xs text-white/60">{Math.round(ug.playtimeMinutes / 60)}h</span>
                    )}
                    {ug.rating && (
                      <span className="text-xs text-xp">{"★".repeat(ug.rating)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
