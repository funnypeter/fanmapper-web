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
  const isAuto = gameKey.startsWith("auto-");

  // Resolve wiki subdomain: for auto wikis, parse from key; for registry, look up
  const wikiSubdomain = isAuto
    ? gameKey.replace("auto-", "")
    : GAME_REGISTRY[gameKey]?.wiki;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wikiSubdomain) return;
    fetchPage(wikiSubdomain, pageTitle).then((data) => {
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
  }, [wikiSubdomain, pageTitle]);

  if (!wikiSubdomain) return <p className="text-text-secondary">Game not found.</p>;

  // Preserve title query string when going back to wiki list (auto wikis need it)
  const backHref = isAuto && typeof window !== "undefined"
    ? `/wiki/${gameKey}${window.location.search}`
    : `/wiki/${gameKey}`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref} className="text-text-secondary hover:text-foreground transition">
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
              Content from {wikiSubdomain}.fandom.com/wiki/{pageTitle} — Licensed under CC BY-SA 3.0
            </p>
          </div>
        </div>
      ) : (
        <p className="text-text-secondary">No content available.</p>
      )}
    </div>
  );
}
