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

export default function HomeWikiChat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
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
          <div className="mt-4 card-glass p-5 animate-fade-in">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{result.answer}</p>

            {result.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-2">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                    >
                      <span>📖</span>
                      <span>{s.title}</span>
                    </a>
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
    </section>
  );
}
