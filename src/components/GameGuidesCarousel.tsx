"use client";

import { useEffect, useState } from "react";
import GameSpotGuide from "@/components/GameSpotGuide";

interface Article {
  title: string;
  link: string;
  image_url: string;
  short_description?: string;
  date?: string;
}

interface GameData {
  guides?: Article[];
  patches?: Article[];
  "developer-updates"?: Article[];
}

function toGameDataKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function ArticleCarousel({ items, heading }: { items: Article[]; heading: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">{heading}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-52 snap-start group"
          >
            <div className="aspect-video rounded-xl overflow-hidden border border-border/50 mb-2">
              <img
                src={item.image_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).className = "w-full h-full bg-surface-elevated";
                }}
              />
            </div>
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition">
              {item.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

function LatestPatch({ patch }: { patch: Article }) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4">Latest Game Update</h3>
      <a
        href={patch.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block card-glass overflow-hidden hover:border-primary/30 transition group"
      >
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={patch.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "";
              (e.target as HTMLImageElement).className = "w-full h-full bg-surface-elevated";
            }}
          />
        </div>
        <div className="p-4">
          <p className="font-semibold group-hover:text-primary transition mb-1">{patch.title}</p>
          {patch.short_description && (
            <p className="text-sm text-text-muted line-clamp-2">{patch.short_description}</p>
          )}
          {patch.date && (
            <p className="text-xs text-text-muted mt-2">{patch.date}</p>
          )}
        </div>
      </a>
    </div>
  );
}

export default function GameGuidesCarousel({ gameTitle }: { gameTitle: string }) {
  const [data, setData] = useState<GameData | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const key = toGameDataKey(gameTitle);
    fetch(`https://game-data-two.vercel.app/game/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setFallback(true));
  }, [gameTitle]);

  if (fallback) return <GameSpotGuide gameTitle={gameTitle} />;
  if (!data) return null;

  const guides = data.guides ?? [];
  const patches = data.patches ?? [];
  const devUpdates = data["developer-updates"] ?? [];
  const latestPatch = patches[0];

  // If no guides at all, fall back to Gemini GameSpot guide
  if (guides.length === 0 && patches.length === 0 && devUpdates.length === 0) {
    return <GameSpotGuide gameTitle={gameTitle} />;
  }

  return (
    <>
      {latestPatch && <LatestPatch patch={latestPatch} />}
      {guides.length > 0 && <ArticleCarousel items={guides} heading="Guides" />}
      {devUpdates.length > 0 && <ArticleCarousel items={devUpdates} heading="Updates from the Developers" />}
    </>
  );
}
