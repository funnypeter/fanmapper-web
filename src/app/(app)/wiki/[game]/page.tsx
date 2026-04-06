"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { getCategory, searchWiki, getPageThumbnails } from "@/lib/services/fandom";

type Section = "characters" | "items" | "weapons" | "locations" | "bosses" | "quests";

const SECTION_ICONS: Record<string, string> = {
  characters: "👤", items: "📦", weapons: "⚔️", armor: "🛡️",
  locations: "📍", bosses: "💀", quests: "📜", walkthroughs: "🗺️",
};

const COVER_MAP: Record<string, string> = {
  "elden-ring": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
  "skyrim": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg",
  "fallout-4": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.jpg",
  "genshin-impact": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3s3x.jpg",
  "zelda-totk": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
};

export default function WikiPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const config = GAME_REGISTRY[gameKey];

  const [activeSection, setActiveSection] = useState<Section | "search">("characters");
  const [pages, setPages] = useState<{ title: string; pageId: number }[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const sections = Object.entries(config?.categories ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k as Section);

  useEffect(() => {
    if (!config || activeSection === "search") return;
    loadSection(activeSection);
  }, [activeSection, config]);

  async function loadSection(section: Section) {
    const cat = config.categories[section as keyof typeof config.categories];
    if (!cat) return;
    setLoading(true);
    try {
      const results = await getCategory(config.wiki, cat, 200);
      setPages(results);
      // Fetch thumbnails using page IDs
      const thumbs = await getPageThumbnails(config.wiki, results.map((r) => r.pageId));
      setThumbnails(thumbs);
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
      const thumbs = await getPageThumbnails(config.wiki, mapped.map((r: { pageId: number }) => r.pageId));
      setThumbnails(thumbs);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  if (!config) return <p className="text-text-secondary">Game not found in registry.</p>;

  const coverUrl = COVER_MAP[gameKey];

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

      {/* Page list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pages.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pages.map((p) => (
            <Link
              key={p.pageId}
              href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`}
              className="card-glass px-4 py-3 flex items-center justify-between hover:border-primary/30 transition group"
            >
              <span className="font-medium text-sm group-hover:text-primary transition">{p.title}</span>
              <span className="text-text-muted text-xs">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary">No pages found</p>
        </div>
      )}
    </div>
  );
}
