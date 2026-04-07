"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { searchGames } from "@/lib/services/igdb";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}
import type { IGDBGame } from "@/lib/services/igdb";

import { GAME_REGISTRY } from "@/lib/services/gameRegistry";

const TRENDING_GAMES = Object.values(GAME_REGISTRY).map((config) => ({
  id: config.igdbId,
  title: config.gameTitle,
  cover: config.cover,
  genre: config.genre,
}));

const GENRES = ["RPG", "Action", "Adventure", "Shooter", "Strategy", "Indie", "Horror", "Platformer", "Sports", "Racing"];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IGDBGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/news").then((r) => r.json()).then(setNews).catch(() => {});
  }, []);

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

  return (
    <div>
      {/* Hero search */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">
          Discover <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Games</span>
        </h2>
        <p className="text-text-secondary mb-6">Search any game to track, review, and explore</p>
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
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => { setQuery(g); handleInput(g); }}
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
              <GameCard key={game.id} id={game.id} title={game.title} cover={game.coverUrl} genre={game.genres[0]} year={game.releaseDate?.substring(0, 4)} />
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-text-secondary text-center mb-12">No games found for &ldquo;{query}&rdquo;</p>
      )}

      {/* Trending / Popular games */}
      {!searched && (
        <>
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-2">Trending Games</h3>
            <p className="text-text-secondary text-sm mb-5">Popular titles to track and explore</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {TRENDING_GAMES.map((game) => (
                <GameCard key={game.id} id={game.id} title={game.title} cover={game.cover} genre={game.genre} />
              ))}
            </div>
          </div>

          {/* Gaming News */}
          {news.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-2">Gaming News</h3>
              <p className="text-text-secondary text-sm mb-5">Latest from GameSpot, IGN, and Kotaku</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-glass overflow-hidden hover:border-primary/30 transition group"
                  >
                    {item.image && (
                      <img src={item.image} alt="" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <p className="font-semibold text-sm leading-tight group-hover:text-primary transition line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-primary font-medium">{item.source}</span>
                        <span className="text-xs text-text-muted">
                          {new Date(item.pubDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GameCard({ id, title, cover, genre, year }: { id: string; title: string; cover: string | null; genre?: string; year?: string }) {
  return (
    <Link
      href={`/game/${id}`}
      className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10"
    >
      {cover ? (
        <img src={cover} alt={title} className="w-full aspect-[3/4] object-cover" />
      ) : (
        <div className="w-full aspect-[3/4] bg-surface-elevated flex items-center justify-center text-text-muted text-3xl">
          🎮
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-semibold text-sm leading-tight text-white">{title}</p>
        <p className="text-xs text-white/60 mt-0.5">
          {year}{genre ? ` · ${genre}` : ""}
        </p>
      </div>
    </Link>
  );
}
