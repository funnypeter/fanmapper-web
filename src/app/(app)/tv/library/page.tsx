"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTVShowModal } from "@/components/TVShowModalContext";
import Link from "next/link";

interface TVShowItem {
  show_id: string;
  status: string;
  rating: number | null;
  current_season: number;
  current_episode: number;
  updated_at: string;
  tv_shows: {
    title: string;
    poster_url: string | null;
    genres: string[];
    network: string | null;
  };
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "watching", label: "Watching", color: "bg-primary" },
  { value: "completed", label: "Completed", color: "bg-success" },
  { value: "backlog", label: "Backlog", color: "bg-xp" },
  { value: "wishlist", label: "Wishlist", color: "bg-accent" },
  { value: "dropped", label: "Dropped", color: "bg-error" },
];

const STATUS_COLORS: Record<string, string> = {
  watching: "bg-primary",
  completed: "bg-success",
  backlog: "bg-xp",
  wishlist: "bg-accent",
  dropped: "bg-error",
};

export default function TVLibraryPage() {
  const [shows, setShows] = useState<TVShowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"recent" | "az" | "rating">("recent");
  const [episodeCounts, setEpisodeCounts] = useState<Record<string, number>>({});
  const { openShow } = useTVShowModal();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_shows")
        .select("show_id, status, rating, current_season, current_episode, updated_at, tv_shows(title, poster_url, genres, network)")
        .eq("user_id", user.id);

      if (data) {
        setShows(data as unknown as TVShowItem[]);
        // Fetch episode watch counts
        const counts: Record<string, number> = {};
        await Promise.all(
          (data as any[]).map(async (item: any) => {
            const { count } = await supabase
              .from("tv_wiki_progress")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("show_key", item.show_id);
            counts[item.show_id] = count ?? 0;
          })
        );
        setEpisodeCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (shows.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📺</div>
        <h2 className="text-2xl font-bold mb-2">No shows yet</h2>
        <p className="text-text-secondary mb-6">Start tracking your favorite TV shows</p>
        <Link href="/tv" className="btn-primary px-6 py-3">Discover Shows</Link>
      </div>
    );
  }

  const filtered = filter === "all" ? shows : shows.filter((s) => s.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "az") return a.tv_shows.title.localeCompare(b.tv_shows.title);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const counts = STATUS_FILTERS.map((f) => ({
    ...f,
    count: f.value === "all" ? shows.length : shows.filter((s) => s.status === f.value).length,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Shows</h2>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        {counts.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f.value
                ? "bg-primary text-white"
                : "border border-border text-text-secondary hover:text-foreground"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        {(["recent", "az", "rating"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`text-xs px-3 py-1 rounded-full transition ${
              sort === s ? "bg-surface-elevated text-foreground" : "text-text-muted hover:text-foreground"
            }`}
          >
            {s === "recent" ? "Recent" : s === "az" ? "A-Z" : "Rating"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map((item) => {
          const watched = episodeCounts[item.show_id] ?? 0;
          return (
            <div key={item.show_id}>
              <button
                onClick={() => openShow(item.show_id)}
                className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] text-left cursor-pointer w-full"
              >
                {item.tv_shows.poster_url ? (
                  <img src={item.tv_shows.poster_url} alt={item.tv_shows.title} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-surface-elevated flex items-center justify-center text-3xl">📺</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[item.status] ?? "bg-border"}`} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="font-semibold text-xs leading-tight text-white">{item.tv_shows.title}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">
                    S{item.current_season} E{item.current_episode}
                    {item.rating ? ` · ${"★".repeat(item.rating)}` : ""}
                  </p>
                </div>
              </button>
              {/* Progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-surface-elevated overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  item.status === "completed" ? "bg-success" : "bg-primary"
                }`} style={{ width: `${item.status === "completed" ? 100 : watched > 0 ? Math.min(watched * 10, 95) : 3}%` }} />
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">{item.status === "completed" ? "Completed" : `${watched} eps watched`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
