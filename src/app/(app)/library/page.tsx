import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  playing: "bg-primary",
  completed: "bg-success",
  backlog: "bg-xp",
  wishlist: "bg-accent",
  dropped: "bg-error",
};

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: games } = await supabase
    .from("user_games")
    .select("*, game:games(*)")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Library</h2>
          <p className="text-text-secondary">{games?.length ?? 0} games</p>
        </div>
        <Link href="/explore" className="btn-primary text-sm">+ Add Game</Link>
      </div>

      {(!games || games.length === 0) ? (
        <div className="card-glass p-12 text-center">
          <p className="text-4xl mb-4">🎮</p>
          <p className="text-text-secondary">No games yet. Search and add your first game!</p>
          <Link href="/explore" className="btn-primary inline-block mt-4">Explore Games</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {games.map((ug: any) => (
            <Link
              key={ug.id}
              href={`/game/${ug.game_id}`}
              className="card-glass p-4 flex items-center gap-4 hover:border-primary/30 transition"
            >
              {ug.game?.cover_url ? (
                <img src={ug.game.cover_url} alt="" className="w-16 h-22 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-22 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted text-xs">
                  No Art
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{ug.game?.title ?? "Unknown"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[ug.status] ?? "bg-text-muted"}`} />
                  <span className="text-sm text-text-secondary capitalize">{ug.status}</span>
                </div>
                {ug.playtime_minutes > 0 && (
                  <p className="text-xs text-text-muted mt-1">{Math.round(ug.playtime_minutes / 60)}h played</p>
                )}
                {ug.rating && (
                  <p className="text-xs text-xp mt-0.5">{"★".repeat(ug.rating)}{"☆".repeat(5 - ug.rating)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
