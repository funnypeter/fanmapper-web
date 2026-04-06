"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { GAME_REGISTRY } from "@/lib/services/gameRegistry";
import { searchGames } from "@/lib/services/igdb";
import type { IGDBGame } from "@/lib/services/igdb";

const FEATURED_GAMES = [
  { title: "Elden Ring", slug: "elden-ring", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg", genre: "Action RPG", wiki: "eldenring" },
  { title: "Skyrim", slug: "skyrim", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.jpg", genre: "Open World RPG", wiki: "elderscrolls" },
  { title: "Fallout 4", slug: "fallout-4", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.jpg", genre: "Action RPG", wiki: "fallout" },
  { title: "Genshin Impact", slug: "genshin-impact", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3s3x.jpg", genre: "Action RPG", wiki: "genshin-impact" },
  { title: "Zelda: TotK", slug: "zelda-totk", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg", genre: "Adventure", wiki: "zelda" },
];

const GENRES = ["RPG", "Action", "Adventure", "Shooter", "Strategy", "Indie", "Horror", "Platformer"];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const games = await searchGames(value);
      setResults(games);
      setSearched(true);
      setLoading(false);
    }, 400);
  }

  function handleGenre(genre: string) {
    setQuery(genre);
    handleInput(genre);
  }

  return (
    <div>
      {/* Hero search */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">
          Discover <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Games</span>
        </h2>
        <p className="text-text-secondary mb-6">Search any game or browse Fandom wikis</p>
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search for a game..."
            className="w-full rounded-2xl bg-surface border border-border px-6 py-4 text-lg text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        {/* Genre chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleGenre(g)}
              className="px-4 py-1.5 rounded-full text-sm border border-border text-text-secondary hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Search results */}
      {searched && results.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
              >
                {game.coverUrl ? (
                  <img src={game.coverUrl} alt={game.title} className="w-full aspect-[3/4] object-cover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-text-muted text-3xl">
                    🎮
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold text-sm leading-tight text-white">{game.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {game.releaseDate?.substring(0, 4)}{game.genres.length > 0 ? ` · ${game.genres[0]}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-text-secondary text-center mb-12">No games found for &ldquo;{query}&rdquo;</p>
      )}

      {/* Featured wikis with cover art */}
      <div>
        <h3 className="text-xl font-bold mb-2">Featured Wikis</h3>
        <p className="text-text-secondary text-sm mb-6">Interactive maps, characters, items, and walkthroughs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {FEATURED_GAMES.map((game) => (
            <Link
              key={game.slug}
              href={`/wiki/${game.slug}`}
              className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
            >
              <img src={game.cover} alt={game.title} className="w-full aspect-[3/4] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-semibold text-sm text-white">{game.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{game.genre}</p>
                <div className="flex gap-1 mt-2">
                  {Object.keys(GAME_REGISTRY[game.slug]?.categories ?? {}).slice(0, 3).map((cat) => (
                    <span key={cat} className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded capitalize">{cat}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All wikis list */}
      <div className="mt-14">
        <h3 className="text-xl font-bold mb-4">All Supported Wikis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(GAME_REGISTRY).map(([key, config]) => (
            <Link
              key={key}
              href={`/wiki/${key}`}
              className="card-glass p-5 flex items-center gap-4 hover:border-primary/30 transition group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-primary transition">{config.gameTitle}</p>
                <p className="text-sm text-text-muted">{config.wiki}.fandom.com</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.keys(config.categories).slice(0, 3).map((cat) => (
                  <span key={cat} className="text-xs bg-primary/10 text-primary-light px-2 py-0.5 rounded-full capitalize">{cat}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
