"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { getCategory, searchWiki } from "@/lib/services/fandom";

type Section = "characters" | "items" | "weapons" | "locations" | "bosses" | "quests";

export default function WikiPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  const [activeSection, setActiveSection] = useState<Section | "search">("characters");
  const [pages, setPages] = useState<{ title: string; pageId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const sections = Object.entries(config?.categories ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k as Section);

  useEffect(() => {
    if (!config || activeSection === "search") return;
    setLoading(true);
    const cat = config.categories[activeSection as keyof typeof config.categories];
    if (!cat) return;
    getCategory(config.wiki, cat, 200).then(setPages).finally(() => setLoading(false));
  }, [activeSection, config]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim() || !config) return;
    setActiveSection("search");
    setLoading(true);
    const results = await searchWiki(config.wiki, searchQuery, 30);
    setPages(results.map((r: { title: string; pageId: number }) => ({ title: r.title, pageId: r.pageId })));
    setLoading(false);
  }

  if (!config) return <p className="text-text-secondary">Game not found in registry.</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold">{config.gameTitle} Wiki</h2>
      <p className="text-sm text-text-muted mb-6">{config.wiki}.fandom.com — CC BY-SA 3.0</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${config.gameTitle} wiki...`}
          className="flex-1 rounded-lg bg-surface border border-border px-4 py-2 text-foreground text-sm"
        />
        <button type="submit" className="btn-primary text-sm">Search</button>
      </form>

      <div className="flex gap-2 flex-wrap mb-6">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveSection(s); setSearchQuery(""); }}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              activeSection === s
                ? "bg-primary border-primary text-white"
                : "bg-surface border-border text-text-secondary hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <div className="grid gap-1">
          {pages.map((p) => (
            <Link
              key={p.pageId}
              href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`}
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-surface transition"
            >
              <span>{p.title}</span>
              <span className="text-text-muted text-sm">→</span>
            </Link>
          ))}
          {pages.length === 0 && <p className="text-text-secondary text-center mt-8">No pages found</p>}
        </div>
      )}
    </div>
  );
}
