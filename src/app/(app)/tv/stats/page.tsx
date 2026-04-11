import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TVStatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: shows } = await supabase
    .from("user_shows")
    .select("*, show:tv_shows(*)")
    .eq("user_id", user.id);

  const all = shows ?? [];

  // Stats
  const totalShows = all.length;
  const completed = all.filter((s: any) => s.status === "completed").length;
  const watching = all.filter((s: any) => s.status === "watching").length;
  const backlog = all.filter((s: any) => s.status === "backlog").length;
  const wishlist = all.filter((s: any) => s.status === "wishlist").length;
  const dropped = all.filter((s: any) => s.status === "dropped").length;
  const completionRate = totalShows > 0 ? Math.round((completed / totalShows) * 100) : 0;

  // Episode count from wiki progress
  const { count: episodesWatched } = await supabase
    .from("tv_wiki_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Genre breakdown
  const genreMap: Record<string, number> = {};
  all.forEach((s: any) => {
    (s.show?.genres ?? []).forEach((genre: string) => {
      genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    });
  });
  const genres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxGenreCount = genres[0]?.[1] ?? 1;

  // Highest rated
  const topRated = [...all]
    .filter((s: any) => s.rating)
    .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  const statuses = [
    { label: "Watching", count: watching, color: "bg-primary", pct: totalShows > 0 ? (watching / totalShows) * 100 : 0 },
    { label: "Completed", count: completed, color: "bg-success", pct: totalShows > 0 ? (completed / totalShows) * 100 : 0 },
    { label: "Backlog", count: backlog, color: "bg-xp", pct: totalShows > 0 ? (backlog / totalShows) * 100 : 0 },
    { label: "Wishlist", count: wishlist, color: "bg-accent", pct: totalShows > 0 ? (wishlist / totalShows) * 100 : 0 },
    { label: "Dropped", count: dropped, color: "bg-error", pct: totalShows > 0 ? (dropped / totalShows) * 100 : 0 },
  ];

  if (totalShows === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">No stats yet</h2>
        <p className="text-text-secondary">Start tracking TV shows to see your stats</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">TV Stats</h2>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Shows", value: totalShows, icon: "📺" },
          { label: "Episodes", value: episodesWatched ?? 0, icon: "▶️" },
          { label: "Completed", value: completed, icon: "✅" },
          { label: "Completion", value: `${completionRate}%`, icon: "📊" },
        ].map((stat) => (
          <div key={stat.label} className="card-glass p-4 text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="card-glass p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Status Breakdown</h3>
        <div className="space-y-3">
          {statuses.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-24">{s.label}</span>
              <div className="flex-1 h-3 rounded-full bg-surface-elevated overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-sm font-medium w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Genre breakdown */}
      {genres.length > 0 && (
        <div className="card-glass p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Top Genres</h3>
          <div className="space-y-3">
            {genres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary w-28 truncate">{genre}</span>
                <div className="flex-1 h-3 rounded-full bg-surface-elevated overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(count / maxGenreCount) * 100}%` }} />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highest rated */}
      {topRated.length > 0 && (
        <div className="card-glass p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Highest Rated</h3>
          <div className="space-y-3">
            {topRated.map((s: any, i: number) => (
              <div key={s.show_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated/50 transition">
                <span className="text-lg font-bold text-text-muted w-6">{i + 1}</span>
                {s.show?.poster_url ? (
                  <img src={s.show.poster_url} alt="" className="w-10 h-14 rounded object-cover" />
                ) : (
                  <div className="w-10 h-14 rounded bg-surface-elevated flex items-center justify-center text-sm">📺</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.show?.title ?? "Unknown"}</p>
                  <p className="text-xs text-text-muted">S{s.current_season} E{s.current_episode}</p>
                </div>
                <div className="text-xp font-bold">{"★".repeat(s.rating)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
