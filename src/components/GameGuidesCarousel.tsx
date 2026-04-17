"use client";

import { useEffect, useState } from "react";
import GameSpotGuide from "@/components/GameSpotGuide";

interface Guide {
  title: string;
  link: string;
  image_url: string;
  short_description?: string;
  date?: string;
}

function toGameDataKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function GameGuidesCarousel({ gameTitle }: { gameTitle: string }) {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const key = toGameDataKey(gameTitle);
    fetch(`https://game-data-two.vercel.app/game/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (data.guides && data.guides.length > 0) {
          setGuides(data.guides);
        } else {
          setFallback(true);
        }
      })
      .catch(() => setFallback(true));
  }, [gameTitle]);

  if (fallback) return <GameSpotGuide gameTitle={gameTitle} />;
  if (!guides) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Guides</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {guides.map((guide, i) => (
          <a
            key={i}
            href={guide.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-52 snap-start group"
          >
            <div className="aspect-video rounded-xl overflow-hidden border border-border/50 mb-2">
              <img
                src={guide.image_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).className = "w-full h-full bg-surface-elevated";
                }}
              />
            </div>
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition">
              {guide.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
