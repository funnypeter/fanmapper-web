"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

export default function MapPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  if (!config || !config.mapUrl) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🗺️</span>
        <h3 className="text-xl font-bold mt-4">No map available</h3>
        <p className="text-text-secondary mt-2">Interactive map is not yet available for this game.</p>
        <Link href={`/wiki/${gameKey}`} className="btn-primary inline-block mt-4 text-sm">Browse Wiki Instead</Link>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/game/${config.igdbId}`} className="text-text-secondary hover:text-foreground transition">←</Link>
          <div>
            <p className="font-semibold text-sm">{config.gameTitle}</p>
            <p className="text-xs text-text-muted">Interactive Map</p>
          </div>
        </div>
        <a
          href={config.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg text-sm bg-surface border border-border text-text-secondary hover:text-foreground transition"
        >
          Open Full ↗
        </a>
      </div>

      {/* Embedded map */}
      <iframe
        src={config.mapUrl}
        className="w-full h-full border-0 pt-14"
        title={`${config.gameTitle} Interactive Map`}
        allow="fullscreen"
      />
    </div>
  );
}
