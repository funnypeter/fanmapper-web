import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LibraryGrid from "@/components/LibraryGrid";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: games } = await supabase
    .from("user_games")
    .select("*, game:games(*)")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  const serialized = (games ?? []).map((ug: any) => ({
    id: ug.id,
    gameId: ug.game_id,
    title: ug.game?.title ?? "Unknown",
    coverUrl: ug.game?.cover_url ?? null,
    status: ug.status,
    playtimeMinutes: ug.playtime_minutes,
    rating: ug.rating,
    updatedAt: ug.updated_at,
  }));

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold">My Library</h2>
          <p className="text-text-secondary mt-1">{serialized.length} games tracked</p>
        </div>
        <Link href="/explore" className="btn-primary text-sm flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Add Game
        </Link>
      </div>

      {serialized.length === 0 ? (
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
        <LibraryGrid games={serialized} />
      )}
    </div>
  );
}
