import { createClient } from "@/lib/supabase/server";
import HomeHero from "@/components/home/HomeHero";
import HomeContinue from "@/components/home/HomeContinue";
import HomeFeaturedChats from "@/components/home/HomeFeaturedChats";
import HomeForYou from "@/components/home/HomeForYou";
import HomeTrending from "@/components/home/HomeTrending";
import PollCarousel from "@/components/PollCarousel";
import TVPollCarousel from "@/components/TVPollCarousel";
import HomeRecentActivity from "@/components/home/HomeRecentActivity";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let gameCount = 0;
  let showCount = 0;
  let playingCount = 0;
  let watchingCount = 0;

  if (user) {
    const [{ data: profile }, { count: gc }, { count: sc }, { count: pc }, { count: wc }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      supabase.from("user_games").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("user_shows").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("user_games").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "playing"),
      supabase.from("user_shows").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "watching"),
    ]);
    displayName = profile?.display_name ?? user.email?.split("@")[0] ?? null;
    gameCount = gc ?? 0;
    showCount = sc ?? 0;
    playingCount = pc ?? 0;
    watchingCount = wc ?? 0;
  }

  return (
    <div className="space-y-12">
      <HomeHero
        displayName={displayName}
        gameCount={gameCount}
        showCount={showCount}
        playingCount={playingCount}
        watchingCount={watchingCount}
      />

      {user && <HomeContinue userId={user.id} />}

      <HomeFeaturedChats />

      <HomeForYou isLoggedIn={!!user} />

      <HomeTrending />

      <PollCarousel />
      <TVPollCarousel />

      {user && <HomeRecentActivity userId={user.id} />}
    </div>
  );
}
