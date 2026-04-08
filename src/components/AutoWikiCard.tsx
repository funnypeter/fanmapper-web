"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DetectedWiki {
  found: boolean;
  wiki?: string;
  url?: string;
  categories?: string[];
}

export default function AutoWikiCard({ gameTitle }: { gameTitle: string }) {
  const [data, setData] = useState<DetectedWiki | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wiki-detect?title=${encodeURIComponent(gameTitle)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [gameTitle]);

  if (loading || !data?.found) return null;

  const href = `/wiki/auto-${data.wiki}?title=${encodeURIComponent(gameTitle)}`;

  return (
    <Link
      href={href}
      className="card-glass p-5 mb-6 flex items-center gap-4 hover:border-primary/30 transition group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-2xl shrink-0">📖</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold group-hover:text-primary transition">Track Progress</p>
        <p className="text-sm text-text-secondary truncate">
          {data.categories && data.categories.length > 0
            ? data.categories.slice(0, 4).join(" · ")
            : `${data.wiki}.fandom.com`}
        </p>
      </div>
      <span className="text-primary text-lg">→</span>
    </Link>
  );
}
