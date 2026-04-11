"use client";

import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

export default function TVGuideArticles({ showTitle }: { showTitle: string }) {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tv/tvguide?show=${encodeURIComponent(showTitle)}`)
      .then((r) => r.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showTitle]);

  if (loading || articles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <svg viewBox="0 0 100 24" className="h-5" fill="none">
          <rect width="24" height="24" rx="4" fill="#00A8E1" />
          <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">TV</text>
          <text x="36" y="18" fill="#00A8E1" fontSize="14" fontWeight="bold">Guide</text>
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
              <div className="w-full h-28 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">📺</div>
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
