"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

export default function GameNews({ gameTitle }: { gameTitle: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news?game=${encodeURIComponent(gameTitle)}`)
      .then((r) => r.json())
      .then((data) => setNews(data ?? []))
      .finally(() => setLoading(false));
  }, [gameTitle]);

  if (loading || news.length === 0) return null;

  return (
    <div className="card-glass p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">News</h3>
      <div className="space-y-3">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated transition group"
          >
            {item.image && (
              <img src={item.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight group-hover:text-primary transition line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-primary font-medium">{item.source}</span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-muted">{new Date(item.pubDate).toLocaleDateString()}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
