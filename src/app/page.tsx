import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">
          Fan<span className="text-primary">Mapper</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/auth/login" className="text-sm text-text-secondary hover:text-foreground transition">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-5xl font-bold max-w-2xl leading-tight">
          Track Games. Explore Wikis.{" "}
          <span className="text-primary">Map Worlds.</span>
        </h2>
        <p className="mt-4 text-lg text-text-secondary max-w-xl">
          One app for managing your game library, syncing achievements from Steam &amp; PlayStation,
          and browsing Fandom wiki content with interactive maps.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
            Start Free
          </Link>
          <Link href="/explore" className="text-lg px-8 py-3 border border-border rounded-xl text-text-secondary hover:text-foreground transition">
            Explore Wikis
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl">
          {Object.values(GAME_REGISTRY).map((config) => (
            <div key={config.wiki} className="card-glass p-4 text-center">
              <p className="text-sm font-medium">{config.gameTitle}</p>
              <p className="text-xs text-text-muted mt-1">{config.wiki}.fandom.com</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-border text-center text-xs text-text-muted">
        FanMapper is free and open-source. Wiki content licensed under CC BY-SA 3.0.
      </footer>
    </div>
  );
}
