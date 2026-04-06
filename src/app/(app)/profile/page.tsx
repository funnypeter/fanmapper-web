import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-6">Profile</h2>

      <div className="card-glass p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
          {(profile?.display_name ?? user.email)?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-lg font-semibold">{profile?.display_name ?? user.email}</p>
          <p className="text-sm text-text-secondary">{user.email}</p>
        </div>
      </div>

      <div className="card-glass p-6 mt-4">
        <h3 className="font-semibold mb-4">Stats</h3>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{gameCount ?? 0}</p>
            <p className="text-xs text-text-muted">Games</p>
          </div>
        </div>
      </div>

      <div className="card-glass p-6 mt-4">
        <h3 className="font-semibold mb-4">Linked Platforms</h3>
        {profile?.steam_id ? (
          <p className="text-sm text-success">Steam linked</p>
        ) : (
          <p className="text-sm text-text-muted">No platforms linked yet</p>
        )}
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
