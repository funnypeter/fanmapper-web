"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

export default function MapPage() {
  const params = useParams();
  const router = useRouter();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  useEffect(() => {
    if (config?.mapUrl) {
      window.open(config.mapUrl, "_blank");
      router.back();
    }
  }, [config, router]);

  if (!config || !config.mapUrl) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🗺️</span>
        <h3 className="text-xl font-bold mt-4">No map available</h3>
        <p className="text-text-secondary mt-2">Interactive map is not yet available for this game.</p>
        <button onClick={() => router.back()} className="btn-primary mt-4 text-sm">Go Back</button>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <span className="text-5xl">🗺️</span>
      <h3 className="text-xl font-bold mt-4">Opening Map...</h3>
      <p className="text-text-secondary mt-2">
        If the map didn&apos;t open,{" "}
        <a href={config.mapUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          click here
        </a>
      </p>
    </div>
  );
}
