"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  globalUnlockPercent: number | null;
  isEarned: boolean;
  earnedAt: string | null;
}

export default function AchievementsPage() {
  const params = useParams();
  const gameId = params.id as string;
  const supabase = createClient();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "unearned">("all");
  const [gameTitle, setGameTitle] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      // Get game title
      const { data: game } = await supabase.from("games").select("title").eq("id", gameId).single();
      if (game) setGameTitle(game.title);

      // Get achievements for this game
      const { data: achs } = await supabase.from("achievements").select("*").eq("game_id", gameId);
      if (!achs || achs.length === 0) { setLoading(false); return; }

      // Get user's earned status
      let userAchMap = new Map<string, any>();
      if (user) {
        const achIds = achs.map((a: any) => a.id);
        const { data: userAchs } = await supabase
          .from("user_achievements")
          .select("*")
          .eq("user_id", user.id)
          .in("achievement_id", achIds);
        userAchMap = new Map((userAchs ?? []).map((ua: any) => [ua.achievement_id, ua]));
      }

      const mapped: Achievement[] = achs.map((a: any) => {
        const ua = userAchMap.get(a.id);
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          iconUrl: a.icon_url,
          globalUnlockPercent: a.global_unlock_percent,
          isEarned: ua?.is_earned ?? false,
          earnedAt: ua?.earned_at ?? null,
        };
      });

      mapped.sort((a, b) => {
        if (a.isEarned !== b.isEarned) return a.isEarned ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setAchievements(mapped);
      setLoading(false);
    }
    load();
  }, [gameId]);

  const earned = achievements.filter((a) => a.isEarned).length;
  const total = achievements.length;
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;

  const filtered = achievements.filter((a) => {
    if (filter === "earned") return a.isEarned;
    if (filter === "unearned") return !a.isEarned;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/game/${gameId}`} className="text-text-secondary hover:text-foreground transition">← Back</Link>
        <h2 className="text-2xl font-bold">{gameTitle} — Achievements</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : total === 0 ? (
        <div className="card-glass p-12 text-center">
          <span className="text-5xl">🏆</span>
          <h3 className="text-lg font-bold mt-4">No achievements yet</h3>
          <p className="text-text-secondary mt-2">Link your Steam or PlayStation account to import achievements.</p>
          <Link href="/profile" className="btn-primary inline-block mt-4 text-sm">Go to Profile</Link>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="card-glass p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-primary">{earned}<span className="text-text-muted font-normal text-lg">/{total}</span></span>
              <span className="text-sm text-text-secondary">{percent}% complete</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-elevated overflow-hidden">
              <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(["all", "earned", "unearned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  filter === f ? "bg-primary border-primary text-white font-medium" : "bg-surface border-border text-text-secondary hover:border-text-muted"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Achievement list */}
          <div className="space-y-2">
            {filtered.map((ach) => (
              <div
                key={ach.id}
                className={`card-glass p-4 flex items-center gap-4 transition ${ach.isEarned ? "" : "opacity-50"}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.isEarned ? "bg-xp/20" : "bg-surface-elevated"
                }`}>
                  {ach.iconUrl ? (
                    <img src={ach.iconUrl} alt="" className="w-8 h-8 rounded" />
                  ) : (
                    <span className="text-xl">{ach.isEarned ? "🏆" : "🔒"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{ach.name}</p>
                  {ach.description && <p className="text-xs text-text-muted mt-0.5 truncate">{ach.description}</p>}
                  {ach.isEarned && ach.earnedAt && (
                    <p className="text-xs text-success mt-0.5">Earned {new Date(ach.earnedAt).toLocaleDateString()}</p>
                  )}
                </div>
                {ach.globalUnlockPercent != null && (
                  <span className="text-xs text-text-muted shrink-0">{ach.globalUnlockPercent.toFixed(1)}%</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
