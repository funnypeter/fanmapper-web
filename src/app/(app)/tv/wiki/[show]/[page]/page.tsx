"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TV_SHOW_REGISTRY } from "@/lib/services/tvRegistry";
import { fetchPage } from "@/lib/services/fandom";

export default function TVWikiArticlePage() {
  const params = useParams();
  const showKey = params.show as string;
  const pageTitle = decodeURIComponent(params.page as string);

  const wikiSubdomain = TV_SHOW_REGISTRY[showKey]?.wiki;

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wikiSubdomain) return;
    fetchPage(wikiSubdomain, pageTitle).then((data) => {
      if (data?.html) {
        let html = data.html;
        html = html.replace(/\s+src="data:image[^"]*"/g, "");
        html = html.replace(/data-src="/g, 'src="');
        html = html.replace(/\s+srcset="[^"]*"/g, "");
        html = html.replace(/src="(https:\/\/static\.wikia\.nocookie\.net[^"]*)"/g,
          (_: string, url: string) => `src="/api/img?url=${encodeURIComponent(url)}"`
        );
        setContent(html);
      }
      setLoading(false);
    });
  }, [wikiSubdomain, pageTitle]);

  if (!wikiSubdomain) return <p className="text-text-secondary">Show not found.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/tv/wiki/${showKey}`} className="text-text-secondary hover:text-foreground transition">
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
