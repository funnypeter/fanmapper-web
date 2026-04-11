export interface TVShowConfig {
  showTitle: string;
  wiki: string;
  tvdbId: string;
  genre: string;
  network: string;
  categories: Record<string, string>;
}

export const TV_SHOW_REGISTRY: Record<string, TVShowConfig> = {
  "house-of-the-dragon": {
    showTitle: "House of the Dragon",
    wiki: "houseofthedragon",
    tvdbId: "tvdb-371572",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations", houses: "Houses" },
  },
  "severance": {
    showTitle: "Severance",
    wiki: "severance-tv",
    tvdbId: "tvdb-371980",
    genre: "Thriller",
    network: "Apple TV+",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "the-last-of-us": {
    showTitle: "The Last of Us",
    wiki: "thelastofus",
    tvdbId: "tvdb-392256",
    genre: "Drama",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes (TV Series)", locations: "Locations" },
  },
  "squid-game": {
    showTitle: "Squid Game",
    wiki: "squidgame",
    tvdbId: "tvdb-389828",
    genre: "Thriller",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", games: "Games" },
  },
  "stranger-things": {
    showTitle: "Stranger Things",
    wiki: "strangerthings",
    tvdbId: "tvdb-305288",
    genre: "Sci-Fi",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", creatures: "Creatures", locations: "Locations" },
  },
  "the-mandalorian": {
    showTitle: "The Mandalorian",
    wiki: "starwars",
    tvdbId: "tvdb-361753",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "The Mandalorian characters", episodes: "The Mandalorian episodes" },
  },
  "breaking-bad": {
    showTitle: "Breaking Bad",
    wiki: "breakingbad",
    tvdbId: "tvdb-81189",
    genre: "Crime",
    network: "AMC",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "game-of-thrones": {
    showTitle: "Game of Thrones",
    wiki: "gameofthrones",
    tvdbId: "tvdb-121361",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", houses: "Great Houses", locations: "Locations" },
  },
  "the-bear": {
    showTitle: "The Bear",
    wiki: "the-bear-tv",
    tvdbId: "tvdb-409680",
    genre: "Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "shogun": {
    showTitle: "Shogun",
    wiki: "shogun",
    tvdbId: "tvdb-392434",
    genre: "Historical Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "fallout-tv": {
    showTitle: "Fallout",
    wiki: "fallout",
    tvdbId: "tvdb-413289",
    genre: "Sci-Fi",
    network: "Prime Video",
    categories: { characters: "Fallout TV characters", episodes: "Fallout TV episodes", locations: "Fallout TV locations" },
  },
  "wednesday": {
    showTitle: "Wednesday",
    wiki: "wednesday-netflix",
    tvdbId: "tvdb-394016",
    genre: "Comedy",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "arcane": {
    showTitle: "Arcane",
    wiki: "leagueoflegends",
    tvdbId: "tvdb-393100",
    genre: "Animation",
    network: "Netflix",
    categories: { characters: "Arcane characters", episodes: "Arcane episodes" },
  },
  "the-boys": {
    showTitle: "The Boys",
    wiki: "the-boys",
    tvdbId: "tvdb-355567",
    genre: "Action",
    network: "Prime Video",
    categories: { characters: "Characters", episodes: "Episodes", supes: "Supes" },
  },
  "andor": {
    showTitle: "Andor",
    wiki: "starwars",
    tvdbId: "tvdb-380661",
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

export function findTVWikiConfigByTvdbId(tvdbId: string): { key: string; config: TVShowConfig } | null {
  const entry = Object.entries(TV_SHOW_REGISTRY).find(
    ([, c]) => c.tvdbId === tvdbId
  );
  return entry ? { key: entry[0], config: entry[1] } : null;
}
