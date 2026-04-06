"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { getCategory, searchWiki } from "@/lib/services/fandom";

const SECTION_ICONS: Record<string, string> = {
  characters: "👤", items: "📦", weapons: "⚔️", armor: "🛡️",
  locations: "📍", bosses: "💀", quests: "📜", walkthroughs: "🗺️",
  boons: "✨", fish: "🐟", crops: "🌾", missions: "🎯",
};

export default function WikiPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  const [activeSection, setActiveSection] = useState<string>("characters");
  const [pages, setPages] = useState<{ title: string; pageId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(`fanmapper-checked-${gameKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleChecked = useCallback((pageId: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      localStorage.setItem(`fanmapper-checked-${gameKey}`, JSON.stringify([...next]));
      return next;
    });
  }, [gameKey]);

  const sections = Object.entries(config?.categories ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  useEffect(() => {
    if (!config || activeSection === "search") return;
    loadSection(activeSection);
  }, [activeSection, config]);

  async function loadSection(section: string) {
    const cat = (config.categories as Record<string, string | undefined>)[section];
    if (!cat) return;
    setLoading(true);
    try {
      const results = await getCategory(config.wiki, cat, 200);
      setPages(results);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || !config) return;
    setActiveSection("search");
    setLoading(true);
    try {
      const results = await searchWiki(config.wiki, searchQuery, 30);
      const mapped = results.map((r: { title: string; pageId: number }) => ({ title: r.title, pageId: r.pageId }));
      setPages(mapped);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  if (!config) return <p className="text-text-secondary">Game not found in registry.</p>;

  const coverUrl = config?.cover;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        {coverUrl && (
          <div className="absolute inset-0">
            <img src={coverUrl} alt="" className="w-full h-full object-cover blur-xl scale-110 opacity-30" />
          </div>
        )}
        <div className="relative flex items-end gap-6 p-8">
          {coverUrl && <img src={coverUrl} alt={config.gameTitle} className="w-24 h-32 rounded-xl object-cover shadow-lg border border-border/50" />}
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Fandom Wiki</p>
            <h2 className="text-3xl font-bold">{config.gameTitle}</h2>
            <p className="text-sm text-text-secondary mt-1">{config.wiki}.fandom.com · CC BY-SA 3.0</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${config.gameTitle} wiki...`}
          className="flex-1 rounded-xl bg-surface border border-border px-5 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition"
        />
        <button type="submit" className="btn-primary px-6">Search</button>
      </form>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveSection(s); setSearchQuery(""); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border transition ${
              activeSection === s
                ? "bg-primary border-primary text-white font-medium"
                : "bg-surface border-border text-text-secondary hover:text-foreground hover:border-text-muted"
            }`}
          >
            <span>{SECTION_ICONS[s] ?? "📄"}</span>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Progress */}
      {!loading && pages.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${pages.length > 0 ? (pages.filter((p) => checked.has(p.pageId)).length / pages.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {pages.filter((p) => checked.has(p.pageId)).length} / {pages.length}
          </span>
        </div>
      )}

      {/* Page list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pages.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pages.map((p) => {
            const isChecked = checked.has(p.pageId);
            const icon = SECTION_ICONS[activeSection === "search" ? "items" : activeSection] ?? "📄";
            return (
              <div key={p.pageId} className={`card-glass flex items-center gap-3 pr-2 transition ${isChecked ? "opacity-60" : ""}`}>
                {/* Checkbox */}
                <button
                  onClick={() => toggleChecked(p.pageId)}
                  className={`shrink-0 w-10 h-full flex items-center justify-center rounded-l-xl transition ${
                    isChecked ? "bg-success/20" : "bg-surface-elevated/50 hover:bg-primary/10"
                  }`}
                >
                  {isChecked ? (
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 rounded border-2 border-text-muted" />
                  )}
                </button>

                {/* Icon + link */}
                <Link
                  href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`}
                  className="flex-1 flex items-center gap-2.5 py-3 group min-w-0"
                >
                  <span className="text-base shrink-0">{icon}</span>
                  <span className={`font-medium text-sm truncate transition ${isChecked ? "line-through text-text-muted" : "group-hover:text-primary"}`}>
                    {p.title}
                  </span>
                </Link>

                {/* Arrow */}
                <Link href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`} className="text-text-muted text-xs shrink-0 p-1">
                  →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary">No pages found</p>
        </div>
      )}
    </div>
  );
}
