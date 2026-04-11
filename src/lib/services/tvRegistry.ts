export interface TVShowConfig {
  showTitle: string;
  wiki: string;
  tmdbId: string;
  genre: string;
  network: string;
  categories: Record<string, string>;
}

export const TV_SHOW_REGISTRY: Record<string, TVShowConfig> = {
  "house-of-the-dragon": {
    showTitle: "House of the Dragon",
    wiki: "houseofthedragon",
    tmdbId: "tmdb-94997",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations", houses: "Houses" },
  },
  "severance": {
    showTitle: "Severance",
    wiki: "severance-tv",
    tmdbId: "tmdb-95396",
    genre: "Thriller",
    network: "Apple TV+",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "the-last-of-us": {
    showTitle: "The Last of Us",
    wiki: "thelastofus",
    tmdbId: "tmdb-100088",
    genre: "Drama",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes (TV Series)", locations: "Locations" },
  },
  "squid-game": {
    showTitle: "Squid Game",
    wiki: "squidgame",
    tmdbId: "tmdb-93405",
    genre: "Thriller",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", games: "Games" },
  },
  "stranger-things": {
    showTitle: "Stranger Things",
    wiki: "strangerthings",
    tmdbId: "tmdb-66732",
    genre: "Sci-Fi",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", creatures: "Creatures", locations: "Locations" },
  },
  "the-mandalorian": {
    showTitle: "The Mandalorian",
    wiki: "starwars",
    tmdbId: "tmdb-82856",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "The Mandalorian characters", episodes: "The Mandalorian episodes" },
  },
  "breaking-bad": {
    showTitle: "Breaking Bad",
    wiki: "breakingbad",
    tmdbId: "tmdb-1396",
    genre: "Crime",
    network: "AMC",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "game-of-thrones": {
    showTitle: "Game of Thrones",
    wiki: "gameofthrones",
    tmdbId: "tmdb-1399",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", houses: "Great Houses", locations: "Locations" },
  },
  "the-bear": {
    showTitle: "The Bear",
    wiki: "the-bear-tv",
    tmdbId: "tmdb-136315",
    genre: "Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "shogun": {
    showTitle: "Shogun",
    wiki: "shogun",
    tmdbId: "tmdb-126308",
    genre: "Historical Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "fallout-tv": {
    showTitle: "Fallout",
    wiki: "fallout",
    tmdbId: "tmdb-106379",
    genre: "Sci-Fi",
    network: "Prime Video",
    categories: { characters: "Fallout TV characters", episodes: "Fallout TV episodes", locations: "Fallout TV locations" },
  },
  "wednesday": {
    showTitle: "Wednesday",
    wiki: "wednesday-netflix",
    tmdbId: "tmdb-119051",
    genre: "Comedy",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "arcane": {
    showTitle: "Arcane",
    wiki: "leagueoflegends",
    tmdbId: "tmdb-94605",
    genre: "Animation",
    network: "Netflix",
    categories: { characters: "Arcane characters", episodes: "Arcane episodes" },
  },
  "the-boys": {
    showTitle: "The Boys",
    wiki: "the-boys",
    tmdbId: "tmdb-76479",
    genre: "Action",
    network: "Prime Video",
    categories: { characters: "Characters", episodes: "Episodes", supes: "Supes" },
  },
  "andor": {
    showTitle: "Andor",
    wiki: "starwars",
    tmdbId: "tmdb-83867",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "Andor characters", episodes: "Andor episodes" },
  },
};

export function findTVWikiConfig(showTitle: string): TVShowConfig | null {
  const lower = showTitle.toLowerCase();
  return Object.values(TV_SHOW_REGISTRY).find(
    (c) => c.showTitle.toLowerCase() === lower
  ) ?? null;
}

export function findTVWikiConfigByTmdbId(tmdbId: string): { key: string; config: TVShowConfig } | null {
  const entry = Object.entries(TV_SHOW_REGISTRY).find(
    ([, c]) => c.tmdbId === tmdbId
  );
  return entry ? { key: entry[0], config: entry[1] } : null;
}
