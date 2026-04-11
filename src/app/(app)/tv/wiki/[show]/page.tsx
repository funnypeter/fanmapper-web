"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TV_SHOW_REGISTRY } from "@/lib/services/tvRegistry";
import { getCategory } from "@/lib/services/fandom";
import { createClient } from "@/lib/supabase/client";

const ICON_KEYWORDS: { keyword: string; icon: string }[] = [
  { keyword: "character", icon: "👤" },
  { keyword: "cast", icon: "👤" },
  { keyword: "actor", icon: "🎭" },
  { keyword: "episode", icon: "📺" },
  { keyword: "season", icon: "📅" },
  { keyword: "location", icon: "📍" },
  { keyword: "place", icon: "📍" },
  { keyword: "house", icon: "🏰" },
  { keyword: "family", icon: "👪" },
  { keyword: "creature", icon: "🐾" },
  { keyword: "monster", icon: "👹" },
  { keyword: "weapon", icon: "⚔️" },
  { keyword: "item", icon: "📦" },
  { keyword: "game", icon: "🎮" },
  { keyword: "supe", icon: "🦸" },
  { keyword: "dragon", icon: "🐉" },
  { keyword: "quest", icon: "📜" },
  { keyword: "mission", icon: "🎯" },
  { keyword: "lore", icon: "📜" },
  { keyword: "event", icon: "🎉" },
  { keyword: "death", icon: "💀" },
  { keyword: "relationship", icon: "❤️" },
];

function iconForSection(section: string): string {
  const lower = section.toLowerCase();
  for (const { keyword, icon } of ICON_KEYWORDS) {
    if (lower.includes(keyword)) return icon;
  }
  return "📄";
}

function formatSectionLabel(section: string): string {
  return section.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TVWikiPage() {
  const params = useParams();
  const showKey = params.show as string;

  const config = TV_SHOW_REGISTRY[showKey];

  const supabase = useMemo(() => createClient(), []);
  const [activeSection, setActiveSection] = useState<string>("");
  const [allPages, setAllPages] = useState<{ title: string; pageId: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(`tv-wiki-checked-${showKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  // Load checked state from Supabase
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("tv_wiki_progress")
        .select("page_id")
        .eq("user_id", user.id)
        .eq("show_key", showKey);
      if (data && data.length > 0) {
        const ids = new Set<number>(data.map((r: { page_id: string }) => parseInt(r.page_id)));
        setChecked(ids);
        localStorage.setItem(`tv-wiki-checked-${showKey}`, JSON.stringify([...ids]));
      }
    })();
  }, [showKey, supabase]);

  const toggleChecked = useCallback(async (pageId: number, pageTitle: string) => {
    const wasChecked = checked.has(pageId);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      localStorage.setItem(`tv-wiki-checked-${showKey}`, JSON.stringify([...next]));
      return next;
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (wasChecked) {
      await supabase.from("tv_wiki_progress").delete()
        .eq("user_id", user.id).eq("show_key", showKey).eq("page_id", String(pageId));
    } else {
      await supabase.from("tv_wiki_progress").upsert({
        user_id: user.id, show_key: showKey, page_id: String(pageId), page_title: pageTitle,
      }, { onConflict: "user_id,show_key,page_id" });
    }
  }, [showKey, checked, supabase]);

  const sections = Object.entries(config?.categories ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  useEffect(() => {
    if (config && sections.length > 0 && (!activeSection || !sections.includes(activeSection))) {
      setActiveSection(sections[0]);
    }
    if (config && sections.length === 0) setLoading(false);
  }, [config, sections, activeSection]);

  useEffect(() => {
    if (!config || !activeSection || !sections.includes(activeSection)) return;
    loadSection(activeSection);
    setSearchQuery("");
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

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return allPages;
    const q = searchQuery.toLowerCase();
    return allPages.filter((p) => p.title.toLowerCase().includes(q));
  }, [allPages, searchQuery]);

  if (!config) {
    return <p className="text-text-secondary text-center py-20">Show not found in registry.</p>;
  }

  const sectionIcon = iconForSection(activeSection);

  return (
    <div>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="relative flex items-end gap-6 p-8">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Fandom Wiki</p>
            <h2 className="text-3xl font-bold">{config.showTitle}</h2>
            <p className="text-sm text-text-secondary mt-1">{config.wiki}.fandom.com · CC BY-SA 3.0</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${formatSectionLabel(activeSection)}...`}
          className="w-full rounded-xl bg-surface border border-border px-5 py-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition">✕</button>
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
            <span>{iconForSection(s)}</span>
            {formatSectionLabel(s)}
          </button>
        ))}
      </div>

      {/* Progress */}
      {!loading && filteredPages.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${(filteredPages.filter((p) => checked.has(p.pageId)).length / filteredPages.length) * 100}%` }}
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
                  href={`/tv/wiki/${showKey}/${encodeURIComponent(p.title)}`}
                  className="flex-1 flex items-center gap-2.5 py-3 group min-w-0"
                >
                  <span className="text-base shrink-0">{sectionIcon}</span>
                  <span className={`font-medium text-sm truncate transition ${isChecked ? "line-through text-text-muted" : "group-hover:text-primary"}`}>
                    {p.title}
                  </span>
                </Link>

                <Link href={`/tv/wiki/${showKey}/${encodeURIComponent(p.title)}`} className="text-text-muted text-xs shrink-0 p-1">→</Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-text-secondary">
            {searchQuery ? `No ${formatSectionLabel(activeSection)} match "${searchQuery}"` : `No ${formatSectionLabel(activeSection)} found`}
          </p>
        </div>
      )}
    </div>
  );
}
