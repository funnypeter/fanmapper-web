import Link from "next/link";

const FEATURED_GAMES = [
  {
    title: "Elden Ring",
    slug: "elden-ring",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
    genre: "Action RPG",
  },
  {
    title: "The Elder Scrolls V: Skyrim",
    slug: "skyrim",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg",
    genre: "Open World RPG",
  },
  {
    title: "Fallout 4",
    slug: "fallout-4",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.jpg",
    genre: "Action RPG",
  },
  {
    title: "Genshin Impact",
    slug: "genshin-impact",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3s3x.jpg",
    genre: "Action RPG",
  },
  {
    title: "Zelda: Tears of the Kingdom",
    slug: "zelda-totk",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
    genre: "Adventure",
  },
];

const FEATURES = [
  {
    icon: "🎮",
    title: "Track Your Library",
    desc: "Manage your backlog across Steam, PlayStation, and more. Log playtime, rate games, and track your progress.",
  },
  {
    icon: "🗺️",
    title: "Interactive Maps",
    desc: "Explore game worlds with filterable markers for bosses, items, dungeons, and fast travel points.",
  },
  {
    icon: "📖",
    title: "Fandom Wiki Integration",
    desc: "Browse characters, weapons, quests, and crafting recipes from Fandom wikis — right inside the app.",
  },
  {
    icon: "🏆",
    title: "Achievement Sync",
    desc: "Import your Steam achievements and PlayStation trophies. Track completion across platforms.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border/50 backdrop-blur sticky top-0 z-50 bg-background/80">
        <h1 className="text-2xl font-bold tracking-tight">
          Fan<span className="text-primary">Mapper</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-foreground transition">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Free &amp; Open Source
          </div>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl mx-auto">
            Track Games. Explore Wikis.{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Map Worlds.
            </span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            One place for your game library, interactive maps, achievement tracking,
            and Fandom wiki content. Built for completionists and explorers.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-10 py-4 rounded-xl shadow-lg shadow-primary/25">
              Start Tracking Free
            </Link>
            <Link href="/explore" className="text-lg px-10 py-4 border border-border rounded-xl text-text-secondary hover:text-foreground hover:border-text-muted transition">
              Browse Wikis
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <p className="text-center text-sm text-text-muted uppercase tracking-widest mb-8">
          Launch Titles
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {FEATURED_GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/wiki/${game.slug}`}
              className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
            >
              <img
                src={game.cover}
                alt={game.title}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-semibold text-sm leading-tight text-white">{game.title}</p>
                <p className="text-xs text-white/60 mt-0.5">{game.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-surface/30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-20">
          <h3 className="text-3xl font-bold text-center mb-4">Everything in one place</h3>
          <p className="text-center text-text-secondary mb-14 max-w-xl mx-auto">
            Stop juggling browser tabs, spreadsheets, and multiple apps. FanMapper brings it all together.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-glass p-7 hover:border-primary/30 transition">
                <span className="text-3xl">{f.icon}</span>
                <h4 className="text-lg font-semibold mt-4">{f.title}</h4>
                <p className="text-text-secondary mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-20 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to level up your gaming?</h3>
        <p className="text-text-secondary mb-8">Join for free. No ads. No premium tiers. Open source forever.</p>
        <Link href="/auth/signup" className="btn-primary text-lg px-10 py-4 rounded-xl shadow-lg shadow-primary/25 inline-block">
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold">Fan<span className="text-primary">Mapper</span></span>
            <Link href="/explore" className="text-sm text-text-muted hover:text-foreground transition">Explore</Link>
            <a href="https://github.com/funnypeter/fanmapper-web" className="text-sm text-text-muted hover:text-foreground transition">GitHub</a>
          </div>
          <p className="text-xs text-text-muted">
            Wiki content licensed under CC BY-SA 3.0. Game trademarks belong to their respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}
