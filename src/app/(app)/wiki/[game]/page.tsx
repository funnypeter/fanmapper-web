"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { getCategory } from "@/lib/services/fandom";
import { createClient } from "@/lib/supabase/client";

const SECTION_ICONS: Record<string, string> = {
  characters: "👤", items: "📦", weapons: "⚔️", armor: "🛡️",
  locations: "📍", bosses: "💀", quests: "📜", walkthroughs: "🗺️",
  boons: "✨", fish: "🐟", crops: "🌾", missions: "🎯",
};

interface DynamicConfig {
  gameTitle: string;
  wiki: string;
  cover?: string;
  categories: Record<string, string>;
}

export default function WikiPage() {
  const params = useParams();
  const gameKey = params.game as string;
  const isAuto = gameKey.startsWith("auto-");

  const [dynamicConfig, setDynamicConfig] = useState<DynamicConfig | null>(null);
  const config: DynamicConfig | undefined = isAuto
    ? (dynamicConfig ?? undefined)
    : GAME_REGISTRY[gameKey];

  const supabase = useMemo(() => createClient(), []);
  const [activeSection, setActiveSection] = useState<string>("characters");
  const [allPages, setAllPages] = useState<{ title: string; pageId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(`fanmapper-checked-${gameKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // For auto-detected wikis, fetch config dynamically
  useEffect(() => {
    if (!isAuto) return;
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") ?? "";
    const wikiSubdomain = gameKey.replace("auto-", "");
    fetch(`/api/wiki-detect?title=${encodeURIComponent(title)}&wiki=${wikiSubdomain}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          const cats: Record<string, string> = {};
          (data.categories ?? []).forEach((c: string) => {
            const key = c.toLowerCase().replace(/\s+/g, "_");
            cats[key] = c;
          });
          setDynamicConfig({
            gameTitle: title || wikiSubdomain,
            wiki: data.wiki,
            categories: cats,
          });
        }
      });
  }, [isAuto, gameKey]);

  // Load checked state from Supabase on mount (cross-device sync)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("wiki_progress")
        .select("page_id")
        .eq("user_id", user.id)
        .eq("game_key", gameKey);
      if (data && data.length > 0) {
        const ids = new Set<number>(data.map((r: { page_id: number }) => r.page_id));
        setChecked(ids);
        localStorage.setItem(`fanmapper-checked-${gameKey}`, JSON.stringify([...ids]));
      }
    })();
  }, [gameKey, supabase]);

  const toggleChecked = useCallback(async (pageId: number, pageTitle: string) => {
    const wasChecked = checked.has(pageId);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      localStorage.setItem(`fanmapper-checked-${gameKey}`, JSON.stringify([...next]));
      return next;
    });

    // Sync to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (wasChecked) {
      await supabase.from("wiki_progress").delete()
        .eq("user_id", user.id).eq("game_key", gameKey).eq("page_id", pageId);
    } else {
      await supabase.from("wiki_progress").upsert({
        user_id: user.id, game_key: gameKey, page_id: pageId, page_title: pageTitle,
      }, { onConflict: "user_id,game_key,page_id" });
    }
  }, [gameKey, checked, supabase]);

  const sections = Object.entries(config?.categories ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  // For auto wikis, set initial active section once config loads
  useEffect(() => {
    if (config && sections.length > 0 && !sections.includes(activeSection)) {
      setActiveSection(sections[0]);
    }
    // Stop spinner if config loaded but has no categories
    if (config && sections.length === 0) {
      setLoading(false);
    }
  }, [config, sections, activeSection]);

  useEffect(() => {
    if (!config) return;
    if (!sections.includes(activeSection)) return;
    loadSection(activeSection);
    setSearchQuery(""); // Clear search on section change
  }, [activeSection, config]);

  async function loadSection(section: string) {
    if (!config) return;
    const cat = (config.categories as Record<string, string | undefined>)[section];
    if (!cat) return;
    setLoading(true);
    try {
      const results = await getCategory(config.wiki, cat, 200);
      setAllPages(results);
    } catch {
      setAllPages([]);
    } finally {
      setLoading(false);
    }
  }

  // Live filter pages by search query within current section
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return allPages;
    const q = searchQuery.toLowerCase();
    return allPages.filter((p) => p.title.toLowerCase().includes(q));
  }, [allPages, searchQuery]);

  if (!config) {
    if (isAuto) {
      return (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return <p className="text-text-secondary">Game not found in registry.</p>;
  }

  const coverUrl = config?.cover;
  const sectionIcon = SECTION_ICONS[activeSection] ?? "📄";

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

      {/* Search — live filter within active section */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${activeSection}...`}
          className="w-full rounded-xl bg-surface border border-border px-5 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
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
      {!loading && filteredPages.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${filteredPages.length > 0 ? (filteredPages.filter((p) => checked.has(p.pageId)).length / filteredPages.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {filteredPages.filter((p) => checked.has(p.pageId)).length} / {filteredPages.length}
          </span>
        </div>
      )}

      {/* Page list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPages.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPages.map((p) => {
            const isChecked = checked.has(p.pageId);
            return (
              <div key={p.pageId} className={`card-glass flex items-center gap-3 pr-2 transition ${isChecked ? "opacity-60" : ""}`}>
                <button
                  onClick={() => toggleChecked(p.pageId, p.title)}
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

                <Link
                  href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`}
                  className="flex-1 flex items-center gap-2.5 py-3 group min-w-0"
                >
                  <span className="text-base shrink-0">{sectionIcon}</span>
                  <span className={`font-medium text-sm truncate transition ${isChecked ? "line-through text-text-muted" : "group-hover:text-primary"}`}>
                    {p.title}
                  </span>
                </Link>

                <Link href={`/wiki/${gameKey}/${encodeURIComponent(p.title)}`} className="text-text-muted text-xs shrink-0 p-1">
                  →
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary">
            {searchQuery ? `No ${activeSection} match "${searchQuery}"` : `No ${activeSection} found`}
          </p>
        </div>
      )}
    </div>
  );
}
