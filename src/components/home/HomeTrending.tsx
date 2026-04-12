"use client";

import { useEffect, useState } from "react";

interface MetaItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
}

function scoreColor(score: number | null) {
  if (score === null) return "bg-surface-elevated text-text-muted";
  if (score >= 85) return "bg-success/90 text-black";
  if (score >= 70) return "bg-xp/90 text-black";
  if (score >= 50) return "bg-warning/90 text-black";
  return "bg-error/90 text-white";
}

function Rail({ label, items }: { label: string; items: MetaItem[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 mb-6 last:mb-0">
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[120px] text-left group"
          >
            <div className="relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-[120px] h-[160px] rounded-xl object-cover border border-border/50 group-hover:border-primary transition"
                />
              ) : (
                <div className="w-[120px] h-[160px] rounded-xl bg-surface-elevated flex items-center justify-center text-3xl border border-border/50">🎞️</div>
              )}
              {item.score !== null && (
                <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${scoreColor(item.score)}`}>
                  {item.score}
                </div>
              )}
            </div>
            <p className="text-xs font-semibold mt-2 line-clamp-2 group-hover:text-primary transition">{item.title}</p>
          </a>
        ))}
      </div>
    </>
  );
}

export default function HomeTrending() {
  const [games, setGames] = useState<MetaItem[]>([]);
  const [shows, setShows] = useState<MetaItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/metacritic").then((r) => r.json()).catch(() => []),
      fetch("/api/tv/metacritic").then((r) => r.json()).catch(() => []),
    ]).then(([g, s]) => {
      if (Array.isArray(g)) setGames(g);
      if (Array.isArray(s)) setShows(s);
    });
  }, []);

  if (games.length === 0 && shows.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Trending Now</h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFCC34]/15 border border-[#FFCC34]/30">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
              <circle cx="12" cy="12" r="11" fill="#FFCC34" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000" fontFamily="Arial">M</text>
            </svg>
            <span className="text-[10px] font-bold text-[#FFCC34] uppercase tracking-wider">Metacritic</span>
          </div>
        </div>
      </div>

      <Rail label="🎮 Games" items={games} />
      <Rail label="📺 TV Shows" items={shows} />
    </section>
  );
}
