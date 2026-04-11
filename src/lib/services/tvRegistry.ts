export interface TVShowConfig {
  showTitle: string;
  wiki: string;
  poster: string;
  tvdbId: string;
  genre: string;
  network: string;
  categories: Record<string, string>;
}

export const TV_SHOW_REGISTRY: Record<string, TVShowConfig> = {
  "house-of-the-dragon": {
    showTitle: "House of the Dragon",
    wiki: "houseofthedragon",
    poster: "https://image.tmdb.org/t/p/w500/t9XkeE7HzOsdQcDDDapDYh8Rrmt.jpg",
    tvdbId: "tvdb-371572",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations", houses: "Houses" },
  },
  "severance": {
    showTitle: "Severance",
    wiki: "severance-tv",
    poster: "https://image.tmdb.org/t/p/w500/pBal2dHMFnp0EGOvFbv8mJAIG4M.jpg",
    tvdbId: "tvdb-371980",
    genre: "Thriller",
    network: "Apple TV+",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "the-last-of-us": {
    showTitle: "The Last of Us",
    wiki: "thelastofus",
    poster: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    tvdbId: "tvdb-392256",
    genre: "Drama",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes (TV Series)", locations: "Locations" },
  },
  "squid-game": {
    showTitle: "Squid Game",
    wiki: "squidgame",
    poster: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    tvdbId: "tvdb-389828",
    genre: "Thriller",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", games: "Games" },
  },
  "stranger-things": {
    showTitle: "Stranger Things",
    wiki: "strangerthings",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    tvdbId: "tvdb-305288",
    genre: "Sci-Fi",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", creatures: "Creatures", locations: "Locations" },
  },
  "the-mandalorian": {
    showTitle: "The Mandalorian",
    wiki: "starwars",
    poster: "https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Bry4MOqv.jpg",
    tvdbId: "tvdb-361753",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "The Mandalorian characters", episodes: "The Mandalorian episodes" },
  },
  "breaking-bad": {
    showTitle: "Breaking Bad",
    wiki: "breakingbad",
    poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    tvdbId: "tvdb-81189",
    genre: "Crime",
    network: "AMC",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "game-of-thrones": {
    showTitle: "Game of Thrones",
    wiki: "gameofthrones",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    tvdbId: "tvdb-121361",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", houses: "Great Houses", locations: "Locations" },
  },
  "the-bear": {
    showTitle: "The Bear",
    wiki: "the-bear-tv",
    poster: "https://image.tmdb.org/t/p/w500/sHFlZTTe1GZMBmaR2jOXMD0cEtk.jpg",
    tvdbId: "tvdb-409680",
    genre: "Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "shogun": {
    showTitle: "Shogun",
    wiki: "shogun",
    poster: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgmT.jpg",
    tvdbId: "tvdb-392434",
    genre: "Historical Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "fallout-tv": {
    showTitle: "Fallout",
    wiki: "fallout",
    poster: "https://image.tmdb.org/t/p/w500/AnsSKR4MVtMFszRMITMCMtsTCEv.jpg",
    tvdbId: "tvdb-413289",
    genre: "Sci-Fi",
    network: "Prime Video",
    categories: { characters: "Fallout TV characters", episodes: "Fallout TV episodes", locations: "Fallout TV locations" },
  },
  "wednesday": {
    showTitle: "Wednesday",
    wiki: "wednesday-netflix",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    tvdbId: "tvdb-394016",
    genre: "Comedy",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "arcane": {
    showTitle: "Arcane",
    wiki: "leagueoflegends",
    poster: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    tvdbId: "tvdb-393100",
    genre: "Animation",
    network: "Netflix",
    categories: { characters: "Arcane characters", episodes: "Arcane episodes" },
  },
  "the-boys": {
    showTitle: "The Boys",
    wiki: "the-boys",
    poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg",
    tvdbId: "tvdb-355567",
    genre: "Action",
    network: "Prime Video",
    categories: { characters: "Characters", episodes: "Episodes", supes: "Supes" },
  },
  "andor": {
    showTitle: "Andor",
    wiki: "starwars",
    poster: "https://image.tmdb.org/t/p/w500/59PVyTjR4vovOcYR4EkLM9Vp44V.jpg",
    tvdbId: "tvdb-380661",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "Andor characters", episodes: "Andor episodes" },
  },
};

export const TRENDING_SHOWS = Object.values(TV_SHOW_REGISTRY).map((config) => ({
  id: config.tvdbId,
  title: config.showTitle,
  poster: config.poster,
  genre: config.genre,
  network: config.network,
}));

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
