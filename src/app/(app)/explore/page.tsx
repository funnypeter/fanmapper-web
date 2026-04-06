"use client";

import { useState } from "react";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { searchGames } from "@/lib/services/igdb";
import type { IGDBGame } from "@/lib/services/igdb";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const games = await searchGames(query);
    setResults(games);
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Explore</h2>
      <p className="text-text-secondary mb-6">Discover games and Fandom communities</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games..."
          className="flex-1 rounded-lg bg-surface border border-border px-4 py-3 text-foreground"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {searched && results.length > 0 && (
        <div className="grid gap-3 mb-10">
          {results.map((game) => (
            <Link key={game.id} href={`/game/${game.id}`} className="card-glass p-4 flex items-center gap-4 hover:border-primary/30 transition">
              {game.coverUrl && <img src={game.coverUrl} alt="" className="w-12 h-16 rounded object-cover" />}
              <div className="flex-1">
                <p className="font-semibold">{game.title}</p>
                <p className="text-xs text-text-muted">{game.releaseDate?.substring(0, 4)} — {game.genres.slice(0, 3).join(", ")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-text-secondary text-center mb-10">No games found</p>
      )}

      <h3 className="text-xl font-bold mb-4">Popular Fandom Wikis</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(GAME_REGISTRY).map(([key, config]) => (
          <Link key={key} href={`/wiki/${key}`} className="card-glass p-5 hover:border-primary/30 transition">
            <p className="font-semibold">{config.gameTitle}</p>
            <p className="text-sm text-text-muted mt-1">{config.wiki}.fandom.com</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {Object.keys(config.categories).slice(0, 4).map((cat) => (
                <span key={cat} className="text-xs bg-primary/10 text-primary-light px-2 py-1 rounded-full capitalize">{cat}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
