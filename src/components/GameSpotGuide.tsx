"use client";

import { useEffect, useState } from "react";

interface GuideData {
  found: boolean;
  url: string;
  title: string;
  thumbnail: string | null;
}

export default function GameSpotGuide({ gameTitle }: { gameTitle: string }) {
  const [guide, setGuide] = useState<GuideData | null>(null);

  useEffect(() => {
    fetch(`/api/gamespot/guide?game=${encodeURIComponent(gameTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) setGuide(data);
      })
      .catch(() => {});
  }, [gameTitle]);

  if (!guide) return null;

  return (
    <a
      href={guide.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block card-glass overflow-hidden hover:border-primary/30 transition group mb-6"
    >
      <div className="flex items-center gap-4 p-4">
        {guide.thumbnail ? (
          <img
            src={guide.thumbnail}
            alt=""
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border/50"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-xp/15 flex items-center justify-center text-2xl shrink-0">
            📗
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-xp bg-xp/15 px-2 py-0.5 rounded-full">GameSpot Guide</span>
          </div>
          <p className="font-semibold text-sm group-hover:text-primary transition line-clamp-1">{guide.title}</p>
          <p className="text-[11px] text-text-muted">Walkthrough, tips & strategies on GameSpot</p>
        </div>
        <span className="text-primary text-lg shrink-0">→</span>
      </div>
    </a>
  );
}
