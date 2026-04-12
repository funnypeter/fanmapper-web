"use client";

import { useEffect, useMemo, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
  kind: "game" | "tv";
}

type Filter = "all" | "game" | "tv";

function relativeTime(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diff = Date.now() - then;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}

export default function HomeNewsFeed() {
  const [all, setAll] = useState<NewsItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/news").then((r) => r.json()).catch(() => []),
      fetch("/api/tv/news").then((r) => r.json()).catch(() => []),
    ]).then(([games, tv]) => {
      const gameItems: NewsItem[] = Array.isArray(games)
        ? games.map((g: any) => ({ ...g, kind: "game" as const }))
        : [];
      const tvItems: NewsItem[] = Array.isArray(tv)
        ? tv.map((t: any) => ({ ...t, kind: "tv" as const }))
        : [];

      // Interleave so game and TV alternate
      const merged: NewsItem[] = [];
      const maxLen = Math.max(gameItems.length, tvItems.length);
      for (let i = 0; i < maxLen; i++) {
        if (gameItems[i]) merged.push(gameItems[i]);
        if (tvItems[i]) merged.push(tvItems[i]);
      }
      setAll(merged);
    });
  }, []);

  const filtered = useMemo(() => {
    if (all === null) return [];
    if (filter === "all") return all.slice(0, 12);
    return all.filter((a) => a.kind === filter).slice(0, 12);
  }, [all, filter]);

  if (all === null || all.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold">Latest News</h2>
        <div className="flex gap-1.5 bg-surface-elevated rounded-full p-1">
          {(["all", "game", "tv"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition ${
                filter === f ? "bg-primary text-white" : "text-text-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "game" ? "Games" : "TV"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 card-glass hover:border-primary/30 transition group"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-20 h-20 rounded-lg object-cover shrink-0"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-surface-elevated flex items-center justify-center text-2xl shrink-0">
                {item.kind === "game" ? "🎮" : "📺"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition">{item.title}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-muted">
                <span
                  className={`px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    item.kind === "game" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                  }`}
                >
                  {item.kind === "game" ? "Games" : "TV"}
                </span>
                <span>{item.source}</span>
                {item.pubDate && <span>· {relativeTime(item.pubDate)}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
