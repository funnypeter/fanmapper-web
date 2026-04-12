import Link from "next/link";

interface Props {
  displayName: string | null;
  gameCount: number;
  showCount: number;
  playingCount: number;
  watchingCount: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

export default function HomeHero({ displayName, gameCount, showCount, playingCount, watchingCount }: Props) {
  if (!displayName) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-8 sm:p-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Welcome to FanCompanion</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-xl">
            Your whole gaming and TV life,{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent">
              in one place.
            </span>
          </h1>
          <p className="text-text-secondary mt-3 max-w-xl">
            Track games and shows, tick off episodes, see what fans are saying — all wired together with wikis, polls, and live chats.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/auth/signup" className="btn-primary text-sm px-5 py-3">Get Started Free</Link>
            <Link href="/explore" className="text-sm px-5 py-3 border border-border rounded-xl text-text-secondary hover:text-foreground hover:border-text-muted transition">
              Browse Games
            </Link>
            <Link href="/tv" className="text-sm px-5 py-3 border border-border rounded-xl text-text-secondary hover:text-foreground hover:border-text-muted transition">
              Browse TV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalActive = playingCount + watchingCount;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-6 sm:p-8">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="relative">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{greeting()}</p>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-yellow-400 to-primary bg-clip-text text-transparent">
            {displayName}
          </span>
        </h1>
        {totalActive > 0 ? (
          <p className="text-text-secondary mt-2">
            You have <span className="text-foreground font-semibold">{totalActive}</span> in progress — pick up where you left off.
          </p>
        ) : (
          <p className="text-text-secondary mt-2">Nothing in progress yet — explore below to start tracking.</p>
        )}
        <div className="flex flex-wrap gap-2 mt-5">
          <StatChip label="Playing" value={playingCount} color="bg-primary/15 text-primary" />
          <StatChip label="Watching" value={watchingCount} color="bg-accent/15 text-accent" />
          <StatChip label="Games Tracked" value={gameCount} color="bg-surface-elevated text-text-secondary" />
          <StatChip label="Shows Tracked" value={showCount} color="bg-surface-elevated text-text-secondary" />
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
      <span className="text-base font-bold">{value}</span>
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
