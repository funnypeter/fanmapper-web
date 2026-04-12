"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatResult {
  answer: string;
  wiki: string;
  wikiName: string;
  sources: { title: string; url: string }[];
}

const HINTS = [
  "Where do I find the Master Sword in Zelda?",
  "Who is Homelander in The Boys?",
  "Best Elden Ring builds for beginners",
  "Stardew Valley fishing guide",
  "How do I beat Malenia?",
  "What happened in Severance Season 2?",
  "Skyrim Daedric artifact locations",
  "Who are the main characters in Arcane?",
];

function cleanWikiHtml(html: string): string {
  let cleaned = html;
  cleaned = cleaned.replace(/\s+src="data:image[^"]*"/g, "");
  cleaned = cleaned.replace(/data-src="/g, 'src="');
  cleaned = cleaned.replace(/\s+srcset="[^"]*"/g, "");
  cleaned = cleaned.replace(
    /src="(https:\/\/static\.wikia\.nocookie\.net[^"]*)"/g,
    (_: string, url: string) => `src="/api/img?url=${encodeURIComponent(url)}"`
  );
  return cleaned;
}

function WikiModal({ wiki, pageTitle, onClose }: { wiki: string; pageTitle: string; onClose: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/wiki-page?wiki=${encodeURIComponent(wiki)}&title=${encodeURIComponent(pageTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.html) setContent(cleanWikiHtml(data.html));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wiki, pageTitle]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-2xl h-[85vh] sm:h-[80vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden border border-border/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-surface-elevated flex-shrink-0">
          <h3 className="font-bold text-sm truncate flex-1">{pageTitle}</h3>
          <button onClick={onClose} className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated border border-border hover:bg-error/20 hover:border-error/50 hover:text-error transition text-lg leading-none">
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : content ? (
            <div>
              <div className="wiki-content" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="border-t border-border mt-6 pt-4">
                <p className="text-[10px] text-text-muted">
                  Content from {wiki}.fandom.com — Licensed under CC BY-SA 3.0
                </p>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No wiki content available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeWikiChat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [hintIndex, setHintIndex] = useState(0);
  const [wikiModal, setWikiModal] = useState<{ wiki: string; title: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((i) => (i + 1) % HINTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setExpanded(true);

    try {
      const res = await fetch("/api/wiki-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-transparent to-yellow-400/[0.05] p-6 sm:p-8">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <img src="/icon-192.png" alt="" className="h-6 w-6" />
          <h2 className="text-lg sm:text-xl font-bold">Ask FanCompanion</h2>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask about any game or show..."
            className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            className="btn-primary px-4 py-3 rounded-xl text-sm shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Ask"
            )}
          </button>
        </div>

        {!result && !error && !loading && (
          <p className="text-[11px] text-text-muted mt-2 h-4 transition-all">
            Try: &quot;{HINTS[hintIndex]}&quot;
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 mt-4 text-sm text-text-secondary">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Searching wikis...
          </div>
        )}

        {error && (
          <div className="mt-4 card-glass p-4 border-error/20">
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 card-glass animate-fade-in">
            {/* Collapsible header */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-elevated/30 transition rounded-t-xl"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-primary font-semibold">Answer from {result.wikiName}</span>
              </div>
              <span className={`text-text-muted text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
            </button>

            {expanded && (
              <div className="px-5 pb-5">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{result.answer}</p>

                {result.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((s) => (
                        <button
                          key={s.url}
                          onClick={() => setWikiModal({ wiki: result.wiki, title: s.title })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                        >
                          <span>📖</span>
                          <span>{s.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-text-muted mt-3">
                  Powered by {result.wikiName} on Fandom
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {wikiModal && (
        <WikiModal
          wiki={wikiModal.wiki}
          pageTitle={wikiModal.title}
          onClose={() => setWikiModal(null)}
        />
      )}
    </section>
  );
}
