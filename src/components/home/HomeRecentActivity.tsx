"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useGameModal } from "@/components/GameModalContext";
import { useTVShowModal } from "@/components/TVShowModalContext";

interface ActivityItem {
  key: string;
  kind: "game" | "show" | "episode";
  icon: string;
  title: string;
  subtitle: string;
  timestamp: string;
  targetKind?: "game" | "show";
  targetId?: string;
}

const STATUS_LABEL: Record<string, string> = {
  playing: "Playing",
  watching: "Watching",
  completed: "Completed",
  backlog: "Added to backlog",
  wishlist: "Added to wishlist",
  dropped: "Dropped",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export default function HomeRecentActivity({ userId }: { userId: string }) {
  const supabase = createClient();
  const { openGame } = useGameModal();
  const { openShow } = useTVShowModal();
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: games }, { data: shows }, { data: episodes }] = await Promise.all([
        supabase
          .from("user_games")
          .select("game_id, status, updated_at, games(title)")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("user_shows")
          .select("show_id, status, current_season, current_episode, updated_at, tv_shows(title)")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(6),
        supabase
          .from("tv_wiki_progress")
          .select("page_id, page_title, show_key, checked_at")
          .eq("user_id", userId)
          .order("checked_at", { ascending: false })
          .limit(5),
      ]);

      const merged: ActivityItem[] = [];

      for (const g of (games ?? []) as any[]) {
        merged.push({
          key: `game-${g.game_id}-${g.updated_at}`,
          kind: "game",
          icon: "🎮",
          title: g.games?.title ?? "A game",
          subtitle: STATUS_LABEL[g.status] ?? g.status,
          timestamp: g.updated_at,
          targetKind: "game",
          targetId: g.game_id,
        });
      }

      for (const s of (shows ?? []) as any[]) {
        const progress = s.current_season ? ` · S${s.current_season} E${s.current_episode || 0}` : "";
        merged.push({
          key: `show-${s.show_id}-${s.updated_at}`,
          kind: "show",
          icon: "📺",
          title: s.tv_shows?.title ?? "A show",
          subtitle: (STATUS_LABEL[s.status] ?? s.status) + progress,
          timestamp: s.updated_at,
          targetKind: "show",
          targetId: s.show_id,
        });
      }

      for (const e of (episodes ?? []) as any[]) {
        merged.push({
          key: `ep-${e.show_key}-${e.page_id}-${e.checked_at}`,
          kind: "episode",
          icon: "✓",
          title: e.page_title || e.page_id,
          subtitle: "Checked off episode",
          timestamp: e.checked_at,
        });
      }

      merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setItems(merged.slice(0, 10));
    }
    load();
  }, [userId, supabase]);

  if (items === null || items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Your Recent Activity</h2>
      <div className="card-glass divide-y divide-border/30">
        {items.map((item) => {
          const clickable = item.targetKind && item.targetId;
          const onClick = clickable
            ? () => (item.targetKind === "game" ? openGame(item.targetId!) : openShow(item.targetId!))
            : undefined;

          const inner = (
            <>
              <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-sm shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                <p className="text-[11px] text-text-muted truncate">{item.subtitle}</p>
              </div>
              <span className="text-[11px] text-text-muted shrink-0">{relativeTime(item.timestamp)}</span>
            </>
          );

          return clickable ? (
            <button
              key={item.key}
              onClick={onClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-elevated/40 transition"
            >
              {inner}
            </button>
          ) : (
            <div key={item.key} className="flex items-center gap-3 px-4 py-3">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
