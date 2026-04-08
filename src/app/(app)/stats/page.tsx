import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: games } = await supabase
    .from("user_games")
    .select("*, game:games(*)")
    .eq("user_id", user.id);

  const all = games ?? [];

  // Stats
  const totalGames = all.length;
  const totalMinutes = all.reduce((sum: number, g: any) => sum + (g.playtime_minutes ?? 0), 0);
  const totalHours = Math.round(totalMinutes / 60);
  const completed = all.filter((g: any) => g.status === "completed").length;
  const playing = all.filter((g: any) => g.status === "playing").length;
  const backlog = all.filter((g: any) => g.status === "backlog").length;
  const wishlist = all.filter((g: any) => g.status === "wishlist").length;
  const dropped = all.filter((g: any) => g.status === "dropped").length;
  const completionRate = totalGames > 0 ? Math.round((completed / totalGames) * 100) : 0;

  // Genre breakdown
  const genreMap: Record<string, number> = {};
  all.forEach((g: any) => {
    (g.game?.genres ?? []).forEach((genre: string) => {
      genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    });
  });
  const genres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxGenreCount = genres[0]?.[1] ?? 1;

  // Top played games
  const topPlayed = [...all]
    .filter((g: any) => g.playtime_minutes > 0)
    .sort((a: any, b: any) => b.playtime_minutes - a.playtime_minutes)
    .slice(0, 5);

  // Highest rated
  const topRated = [...all]
    .filter((g: any) => g.rating)
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  // Status pie data
  const statusData = [
    { label: "Playing", count: playing, color: "var(--primary)" },
    { label: "Completed", count: completed, color: "var(--success)" },
    { label: "Backlog", count: backlog, color: "var(--xp)" },
    { label: "Wishlist", count: wishlist, color: "var(--accent)" },
    { label: "Dropped", count: dropped, color: "var(--error)" },
  ].filter((s) => s.count > 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Stats</h2>
        <p className="text-text-secondary mt-1">Your gaming activity and trends</p>
      </div>

      {totalGames === 0 ? (
        <div className="card-glass p-16 text-center">
          <span className="text-5xl">📊</span>
          <h3 className="text-xl font-bold mt-4">No data yet</h3>
          <p className="text-text-secondary mt-2 mb-6">Add some games to see your stats.</p>
          <Link href="/explore" className="btn-primary inline-block">Explore Games</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-glass p-5 text-center">
              <p className="text-3xl font-bold text-primary">{totalGames}</p>
              <p className="text-xs text-text-muted mt-1">Games</p>
            </div>
            <div className="card-glass p-5 text-center">
              <p className="text-3xl font-bold text-accent">{totalHours}</p>
              <p className="text-xs text-text-muted mt-1">Hours</p>
            </div>
            <div className="card-glass p-5 text-center">
              <p className="text-3xl font-bold text-success">{completed}</p>
              <p className="text-xs text-text-muted mt-1">Completed</p>
            </div>
            <div className="card-glass p-5 text-center">
              <p className="text-3xl font-bold text-xp">{completionRate}%</p>
              <p className="text-xs text-text-muted mt-1">Completion</p>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-4">By Status</h3>
            <div className="space-y-3">
              {statusData.map((s) => {
                const pct = Math.round((s.count / totalGames) * 100);
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{s.label}</span>
                      <span className="text-text-muted">{s.count} · {pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Genre breakdown */}
          {genres.length > 0 && (
            <div className="card-glass p-6">
              <h3 className="font-semibold mb-4">Top Genres</h3>
              <div className="space-y-3">
                {genres.map(([genre, count]) => {
                  const pct = Math.round((count / maxGenreCount) * 100);
                  return (
                    <div key={genre}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>{genre}</span>
                        <span className="text-text-muted">{count}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top played */}
          {topPlayed.length > 0 && (
            <div className="card-glass p-6">
              <h3 className="font-semibold mb-4">Most Played</h3>
              <div className="space-y-3">
                {topPlayed.map((g: any, i: number) => (
                  <Link key={g.id} href={`/game/${g.game_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated transition">
                    <span className="text-lg font-bold text-text-muted w-6">#{i + 1}</span>
                    {g.game?.cover_url && (
                      <img src={g.game.cover_url} alt="" className="w-10 h-14 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{g.game?.title}</p>
                      <p className="text-xs text-text-muted">{Math.round(g.playtime_minutes / 60)}h · {g.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Top rated */}
          {topRated.length > 0 && (
            <div className="card-glass p-6">
              <h3 className="font-semibold mb-4">Highest Rated</h3>
              <div className="space-y-3">
                {topRated.map((g: any) => (
                  <Link key={g.id} href={`/game/${g.game_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated transition">
                    {g.game?.cover_url && (
                      <img src={g.game.cover_url} alt="" className="w-10 h-14 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{g.game?.title}</p>
                      <p className="text-xs text-xp">{"★".repeat(g.rating)}{"☆".repeat(5 - g.rating)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
