"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { searchGames } from "@/lib/services/igdb";
import AchievementCelebration from "@/components/AchievementCelebration";
import PollCarousel from "@/components/PollCarousel";

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

interface MetacriticItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
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
  const [gamespot, setGamespot] = useState<NewsItem[]>([]);
  const [metacritic, setMetacritic] = useState<MetacriticItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/news").then((r) => r.json()).then((items: NewsItem[]) => {
      setGamespot(items.filter((n) => n.source === "GameSpot").slice(0, 10));
    }).catch(() => {});
    fetch("/api/metacritic").then((r) => r.json()).then(setMetacritic).catch(() => {});
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
      {/* Achievement celebration */}
      <AchievementCelebration />

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

      {/* Polls + Trending / Popular games */}
      {!searched && (
        <>
          <PollCarousel />

          <div className="mb-12">
            <h3 className="text-xl font-bold mb-2">Trending Games</h3>
            <p className="text-text-secondary text-sm mb-5">Popular titles to track and explore</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
              {TRENDING_GAMES.map((game) => (
                <div key={game.id} className="flex-shrink-0 w-[160px]">
                  <GameCard id={game.id} title={game.title} cover={game.cover} genre={game.genre} />
                </div>
              ))}
            </div>
          </div>

          {/* Trending on Metacritic */}
          {metacritic.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-lg font-bold text-text-secondary">Trending on</span>
                <svg viewBox="0 0 120 24" className="h-5" fill="none">
                  <rect width="24" height="24" rx="4" fill="#FFCC34" />
                  <text x="12" y="17" textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold">M</text>
                  <text x="36" y="18" fill="#FFCC34" fontSize="16" fontWeight="bold">metacritic</text>
                </svg>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                {metacritic.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[200px] card-glass overflow-hidden hover:border-primary/30 transition group"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">
                        🎮
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-xs leading-tight group-hover:text-primary transition line-clamp-2">
                        {item.title}
                      </p>
                      {item.score !== null && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            item.score >= 75 ? "bg-success/20 text-success" :
                            item.score >= 50 ? "bg-warning/20 text-warning" :
                            "bg-error/20 text-error"
                          }`}>
                            {item.score}
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Trending on GameSpot */}
          {gamespot.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-lg font-bold text-text-secondary">Trending on</span>
                <svg viewBox="0 0 120 24" className="h-5" fill="none">
                  <rect width="24" height="24" rx="4" fill="#E50914" />
                  <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">G</text>
                  <text x="36" y="18" fill="#E50914" fontSize="16" fontWeight="bold">GameSpot</text>
                </svg>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                {gamespot.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-[220px] card-glass overflow-hidden hover:border-primary/30 transition group"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">
                        📰
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-xs leading-tight group-hover:text-primary transition line-clamp-2">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-text-muted mt-2 block">
                        {new Date(item.pubDate).toLocaleDateString()}
                      </span>
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
