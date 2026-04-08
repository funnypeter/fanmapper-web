"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface NewAchievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  earnedAt: string;
  gameId: string;
  gameTitle: string;
  gameCover: string | null;
}

export default function AchievementCelebration() {
  const [achievements, setAchievements] = useState<NewAchievement[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("last_celebrated_at")
        .eq("id", user.id)
        .single();

      const since = profile?.last_celebrated_at ?? new Date(0).toISOString();

      // Find achievements earned after last celebration
      const { data: newAchs } = await supabase
        .from("user_achievements")
        .select("id, earned_at, achievement:achievements(id, name, description, icon_url, game_id, game:games(id, title, cover_url))")
        .eq("user_id", user.id)
        .eq("is_earned", true)
        .gt("earned_at", since)
        .order("earned_at", { ascending: false })
        .limit(8);

      if (newAchs && newAchs.length > 0) {
        const mapped: NewAchievement[] = newAchs.map((row: any) => ({
          id: row.id,
          name: row.achievement?.name ?? "Unknown",
          description: row.achievement?.description ?? null,
          iconUrl: row.achievement?.icon_url ?? null,
          earnedAt: row.earned_at,
          gameId: row.achievement?.game_id ?? "",
          gameTitle: row.achievement?.game?.title ?? "Unknown",
          gameCover: row.achievement?.game?.cover_url ?? null,
        }));
        setAchievements(mapped);
      }
      setLoading(false);
    })();
  }, [supabase]);

  async function dismiss() {
    setDismissed(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ last_celebrated_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  if (loading || dismissed || achievements.length === 0) return null;

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden border border-xp/30 bg-gradient-to-br from-xp/10 via-primary/5 to-accent/10">
      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="absolute text-xl animate-float"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
              animationDelay: `${(i * 0.2) % 3}s`,
              opacity: 0.4,
            }}
          >
            {["🎉", "✨", "⭐", "🏆", "🎊"][i % 5]}
          </span>
        ))}
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏆</span>
              <h3 className="text-xl font-bold">
                {achievements.length === 1
                  ? "New Achievement!"
                  : `${achievements.length} New Achievements!`}
              </h3>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              You earned these since your last visit. Nice work!
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-text-muted hover:text-foreground transition text-xl leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {achievements.slice(0, 4).map((ach) => (
            <Link
              key={ach.id}
              href={`/game/${ach.gameId}/achievements`}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/40 backdrop-blur hover:bg-background/60 transition group"
            >
              {ach.iconUrl ? (
                <img src={ach.iconUrl} alt="" className="w-10 h-10 rounded-lg shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-xp/20 flex items-center justify-center text-xl shrink-0">🏆</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate group-hover:text-primary transition">{ach.name}</p>
                <p className="text-xs text-text-muted truncate">{ach.gameTitle}</p>
              </div>
              <span className="text-text-muted text-sm shrink-0">→</span>
            </Link>
          ))}
          {achievements.length > 4 && (
            <p className="text-xs text-text-muted text-center pt-2">
              + {achievements.length - 4} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
