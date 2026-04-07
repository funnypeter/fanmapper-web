"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { fetchPage } from "@/lib/services/fandom";

export default function WikiArticlePage() {
  const params = useParams();
  const gameKey = params.game as string;
  const pageTitle = decodeURIComponent(params.page as string);
  const config = GAME_REGISTRY[gameKey];

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) return;
    fetchPage(config.wiki, pageTitle).then((data) => {
      if (data?.html) {
        let html = data.html;
        // Fix Fandom lazy-loaded images: swap data-src to src
        html = html.replace(/\s+src="data:image[^"]*"/g, "");
        html = html.replace(/data-src="/g, 'src="');
        // Remove srcset to prevent broken responsive images
        html = html.replace(/\s+srcset="[^"]*"/g, "");
        // Proxy all external images through our API to bypass blocking
        html = html.replace(/src="(https:\/\/static\.wikia\.nocookie\.net[^"]*)"/g,
          (_: string, url: string) => `src="/api/img?url=${encodeURIComponent(url)}"`
        );
        setContent(html);
      }
      setLoading(false);
    });
  }, [config, pageTitle]);

  if (!config) return <p className="text-text-secondary">Game not found.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/wiki/${gameKey}`} className="text-text-secondary hover:text-foreground transition">
          ← Back
        </Link>
        <h2 className="text-2xl font-bold">{pageTitle}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : content ? (
        <div className="card-glass p-6 overflow-hidden">
          <div className="wiki-content" dangerouslySetInnerHTML={{ __html: content }} />
          <div className="border-t border-border mt-6 pt-4">
            <p className="text-xs text-text-muted">
              Content from {config.wiki}.fandom.com/wiki/{pageTitle} — Licensed under CC BY-SA 3.0
            </p>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary">No content available.</p>
      )}
    </div>
  );
}
