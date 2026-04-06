import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  playing: { label: "Playing", color: "text-primary", bg: "bg-primary" },
  completed: { label: "Completed", color: "text-success", bg: "bg-success" },
  backlog: { label: "Backlog", color: "text-xp", bg: "bg-xp" },
  wishlist: { label: "Wishlist", color: "text-accent", bg: "bg-accent" },
  dropped: { label: "Dropped", color: "text-error", bg: "bg-error" },
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: games } = await supabase
    .from("user_games")
    .select("*, game:games(*)")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  const statusCounts: Record<string, number> = {};
  (games ?? []).forEach((ug: any) => {
    statusCounts[ug.status] = (statusCounts[ug.status] || 0) + 1;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold">My Library</h2>
          <p className="text-text-secondary mt-1">{games?.length ?? 0} games tracked</p>
        </div>
        <Link href="/explore" className="btn-primary text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Game
        </Link>
      </div>

      {/* Status summary */}
      {games && games.length > 0 && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            return (
              <div key={status} className="card-glass px-4 py-2.5 flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
                <span className={`text-sm font-medium ${cfg.color}`}>{count}</span>
                <span className="text-xs text-text-muted">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {(!games || games.length === 0) ? (
        <div className="card-glass p-16 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold mb-2">Your library is empty</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Search for games and add them to start tracking your backlog, playtime, and achievements.
          </p>
          <Link href="/explore" className="btn-primary inline-block text-lg px-8 py-3">
            Explore Games
          </Link>
        </div>
      ) : (
        /* Game grid with cover art */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {games.map((ug: any) => {
            const status = STATUS_CONFIG[ug.status];
            return (
              <Link
                key={ug.id}
                href={`/game/${ug.game_id}`}
                className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
              >
                {ug.game?.cover_url ? (
                  <img src={ug.game.cover_url} alt={ug.game.title} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-text-muted text-3xl">
                    🎮
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status?.bg ?? "bg-text-muted"} text-white`}>
                    {status?.label ?? ug.status}
                  </span>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold text-sm leading-tight text-white">{ug.game?.title ?? "Unknown"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {ug.playtime_minutes > 0 && (
                      <span className="text-xs text-white/60">{Math.round(ug.playtime_minutes / 60)}h</span>
                    )}
                    {ug.rating && (
                      <span className="text-xs text-xp">{"★".repeat(ug.rating)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
