import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { count: gameCount } = await supabase
    .from("user_games")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: recentGames } = await supabase
    .from("user_games")
    .select("*, game:games(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(4);

  const playing = recentGames?.filter((g: any) => g.status === "playing") ?? [];
  const completed = recentGames?.filter((g: any) => g.status === "completed") ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="card-glass p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
          {(profile?.display_name ?? user.email)?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile?.display_name ?? user.email?.split("@")[0]}</h2>
          <p className="text-sm text-text-secondary">{user.email}</p>
          <p className="text-xs text-text-muted mt-1">
            Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-primary">{gameCount ?? 0}</p>
          <p className="text-xs text-text-muted mt-1">Games</p>
        </div>
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-accent">{playing.length}</p>
          <p className="text-xs text-text-muted mt-1">Playing</p>
        </div>
        <div className="card-glass p-5 text-center">
          <p className="text-3xl font-bold text-success">{completed.length}</p>
          <p className="text-xs text-text-muted mt-1">Completed</p>
        </div>
      </div>

      {/* Currently playing */}
      {playing.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Currently Playing</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {playing.map((ug: any) => (
              <Link key={ug.id} href={`/game/${ug.game_id}`} className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03]">
                {ug.game?.cover_url ? (
                  <img src={ug.game.cover_url} alt="" className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-2xl">🎮</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <p className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white">{ug.game?.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Linked platforms */}
      <div className="card-glass p-6 mt-8">
        <h3 className="font-semibold mb-4">Linked Platforms</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎮</span>
              <span>Steam</span>
            </div>
            {profile?.steam_id ? (
              <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">Linked</span>
            ) : (
              <Link href="/profile/link-steam" className="text-xs text-primary font-medium hover:underline">Connect</Link>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <span>PlayStation</span>
            </div>
            {profile?.psn_id ? (
              <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">Linked</span>
            ) : (
              <span className="text-xs text-text-muted">Coming soon</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50">
            <div className="flex items-center gap-3">
              <span className="text-xl">🟢</span>
              <span>Xbox</span>
            </div>
            <span className="text-xs text-text-muted">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card-glass p-6 mt-6">
        <h3 className="font-semibold mb-4">Account</h3>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Sign out of your account</span>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
