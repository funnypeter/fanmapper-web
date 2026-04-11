"use client";

import { useState, useRef, useEffect } from "react";
import { searchShows } from "@/lib/services/tvdb";
import type { TVDBShow } from "@/lib/services/tvdb";
import TVTrendingChats from "@/components/TVTrendingChats";
import TVPollCarousel from "@/components/TVPollCarousel";
import { useTVShowModal } from "@/components/TVShowModalContext";

interface MetacriticItem {
  title: string;
  score: number | null;
  image: string | null;
  link: string;
}

interface NewsItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
  pubDate: string;
}

export default function TVDiscoverPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TVDBShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [metacritic, setMetacritic] = useState<MetacriticItem[]>([]);
  const [trendingShows, setTrendingShows] = useState<{ id: string; title: string; posterUrl: string | null; genre: string | null; year: string | null }[]>([]);
  const [tvguide, setTvguide] = useState<NewsItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/tv/metacritic").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setMetacritic(data);
    }).catch(() => {});
    fetch("/api/tv/trending").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setTrendingShows(data);
    }).catch(() => {});
    fetch("/api/tv/tvguide?show=trending TV").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setTvguide(data);
    }).catch(() => {});
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
      const shows = await searchShows(value);
      setResults(shows);
      setSearched(true);
      setLoading(false);
    }, 400);
  }

  return (
    <div>
      {/* Hero search */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">
          Discover <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Shows</span>
        </h2>
        <p className="text-text-secondary mb-6">Search any TV show to track, review, and explore</p>
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search for a TV show..."
            className="w-full rounded-2xl bg-surface border border-border px-6 py-4 text-lg text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Search results */}
      {searched && results.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((show) => (
              <ShowCard key={show.id} id={show.id} title={show.title} poster={show.posterUrl} genre={show.genres[0]} year={show.year} />
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-text-secondary text-center mb-12">No shows found for &ldquo;{query}&rdquo;</p>
      )}

      {/* Trending content */}
      {!searched && (
        <>
          {/* TV Polls */}
          <TVPollCarousel />

          {/* Trending Chats */}
          <TVTrendingChats />

          {/* Trending Shows */}
          {trendingShows.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-2">Trending Shows</h3>
              <p className="text-text-secondary text-sm mb-5">Popular titles to track and explore</p>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                {trendingShows.map((show) => (
                  <div key={show.id} className="flex-shrink-0 w-[160px]">
                    <ShowCard id={show.id} title={show.title} poster={show.posterUrl} genre={show.genre} />
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-[200px] card-glass overflow-hidden hover:border-primary/30 transition group">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">📺</div>
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-xs leading-tight group-hover:text-primary transition line-clamp-2">{item.title}</p>
                      {item.score !== null && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            item.score >= 75 ? "bg-success/20 text-success" :
                            item.score >= 50 ? "bg-warning/20 text-warning" :
                            "bg-error/20 text-error"
                          }`}>{item.score}</span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* Trending on TVGuide */}
          {tvguide.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-lg font-bold text-text-secondary">Trending on</span>
                <svg viewBox="0 0 100 24" className="h-5" fill="none">
                  <rect width="24" height="24" rx="4" fill="#00A8E1" />
                  <text x="12" y="17" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">TV</text>
                  <text x="36" y="18" fill="#00A8E1" fontSize="14" fontWeight="bold">Guide</text>
                </svg>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                {tvguide.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-[220px] card-glass overflow-hidden hover:border-primary/30 transition group">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-surface-elevated flex items-center justify-center text-text-muted text-2xl">📺</div>
                    )}
                    <div className="p-3">
                      <p className="font-semibold text-xs leading-tight group-hover:text-primary transition line-clamp-2">{item.title}</p>
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

function ShowCard({ id, title, poster, genre, year }: { id: string; title: string; poster: string | null; genre?: string | null; year?: string | null }) {
  const { openShow } = useTVShowModal();

  return (
    <button
      onClick={() => openShow(id)}
      className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 text-left w-full cursor-pointer"
    >
      {poster ? (
        <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover" />
      ) : (
        <div className="w-full aspect-[2/3] bg-surface-elevated flex items-center justify-center text-text-muted text-3xl">📺</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="font-semibold text-xs leading-tight text-white">{title}</p>
        {(year || genre) && (
          <p className="text-[10px] text-white/50 mt-0.5 truncate">
            {year}{genre ? ` · ${genre}` : ""}
          </p>
        )}
      </div>
    </button>
  );
}
