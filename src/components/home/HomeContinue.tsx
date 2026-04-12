"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGameModal } from "@/components/GameModalContext";
import { useTVShowModal } from "@/components/TVShowModalContext";

interface ContinueItem {
  kind: "game" | "show";
  id: string;
  title: string;
  coverUrl: string | null;
  subtitle: string;
  updatedAt: string;
}

export default function HomeContinue({ userId }: { userId: string }) {
  const supabase = createClient();
  const { openGame } = useGameModal();
  const { openShow } = useTVShowModal();
  const [items, setItems] = useState<ContinueItem[] | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: games }, { data: shows }] = await Promise.all([
        supabase
          .from("user_games")
          .select("game_id, playtime_minutes, updated_at, games(title, cover_url)")
          .eq("user_id", userId)
          .eq("status", "playing")
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("user_shows")
          .select("show_id, current_season, current_episode, updated_at, tv_shows(title, poster_url)")
          .eq("user_id", userId)
          .eq("status", "watching")
          .order("updated_at", { ascending: false })
          .limit(6),
      ]);

      const gameItems: ContinueItem[] = (games ?? []).map((g: any) => ({
        kind: "game",
        id: g.game_id,
        title: g.games?.title ?? "Unknown",
        coverUrl: g.games?.cover_url ?? null,
        subtitle: g.playtime_minutes ? `${Math.round(g.playtime_minutes / 60)}h played` : "Playing",
        updatedAt: g.updated_at,
      }));

      const showItems: ContinueItem[] = (shows ?? []).map((s: any) => ({
        kind: "show",
        id: s.show_id,
        title: s.tv_shows?.title ?? "Unknown",
        coverUrl: s.tv_shows?.poster_url ?? null,
        subtitle: s.current_season ? `S${s.current_season} · E${s.current_episode || 0}` : "Watching",
        updatedAt: s.updated_at,
      }));

      // Interleave by most-recent first so games and shows mix naturally
      const merged = [...gameItems, ...showItems].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setItems(merged);
    }
    load();
  }, [userId, supabase]);

  if (items === null || items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Continue</h2>
        <span className="text-xs text-text-muted">{items.length} in progress</span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {items.map((item) => (
          <button
            key={`${item.kind}-${item.id}`}
            onClick={() => (item.kind === "game" ? openGame(item.id) : openShow(item.id))}
            className="flex-shrink-0 w-[140px] text-left group"
          >
            <div className="relative">
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-[140px] h-[210px] rounded-xl object-cover border border-border/50 group-hover:border-primary transition"
                />
              ) : (
                <div className="w-[140px] h-[210px] rounded-xl bg-surface-elevated flex items-center justify-center text-3xl border border-border/50">
                  {item.kind === "game" ? "🎮" : "📺"}
                </div>
              )}
              <div
                className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  item.kind === "game" ? "bg-primary/90 text-white" : "bg-accent/90 text-black"
                }`}
              >
                {item.kind === "game" ? "Game" : "TV"}
              </div>
            </div>
            <p className="text-sm font-semibold mt-2 line-clamp-1 group-hover:text-primary transition">{item.title}</p>
            <p className="text-[11px] text-text-muted">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
