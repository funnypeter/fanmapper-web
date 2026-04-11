"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

export default function GameSpotArticles({ gameTitle }: { gameTitle: string }) {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch game-specific articles first, then supplement with general GameSpot if needed
    Promise.all([
      fetch(`/api/news?game=${encodeURIComponent(gameTitle)}`).then((r) => r.json()),
      fetch("/api/news").then((r) => r.json()),
    ])
      .then(([gameNews, allNews]: [NewsItem[], NewsItem[]]) => {
        // Get GameSpot articles matching this game
        const gameSpotGame = (gameNews ?? []).filter((n) => n.source === "GameSpot");
        // Get general GameSpot articles as backfill
        const gameSpotGeneral = (allNews ?? []).filter(
          (n) => n.source === "GameSpot" && !gameSpotGame.some((g) => g.link === n.link)
        );
        // Combine: game-specific first, then general, up to 10
        setArticles([...gameSpotGame, ...gameSpotGeneral].slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gameTitle]);

  if (loading || articles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <svg viewBox="0 0 120 24" className="h-5" fill="none">
          <rect width="24" height="24" rx="4" fill="#E50914" />
          <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">G</text>
          <text x="36" y="18" fill="#E50914" fontSize="16" fontWeight="bold">GameSpot</text>
        </svg>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {articles.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[200px] card-glass overflow-hidden hover:border-primary/30 transition group"
          >
            {item.image ? (
              <img src={item.image} alt="" className="w-full h-28 object-cover" />
            ) : (
              <div className="w-full h-28 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">
                📰
              </div>
            )}
            <div className="p-3">
              <p className="font-semibold text-xs leading-tight group-hover:text-primary transition line-clamp-2">
                {item.title}
              </p>
              <span className="text-[10px] text-text-muted mt-2 block">
                {new Date(item.pubDate).toLocaleDateString()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
