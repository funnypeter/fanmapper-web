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
    poster: "https://artworks.thetvdb.com/banners/v4/series/371572/posters/66a6e362ed3e0.jpg",
    tvdbId: "tvdb-371572",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations", houses: "Houses" },
  },
  "severance": {
    showTitle: "Severance",
    wiki: "severance-tv",
    poster: "https://artworks.thetvdb.com/banners/v4/series/371980/posters/61b2e5e523254.jpg",
    tvdbId: "tvdb-371980",
    genre: "Thriller",
    network: "Apple TV+",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "the-last-of-us": {
    showTitle: "The Last of Us",
    wiki: "thelastofus",
    poster: "https://artworks.thetvdb.com/banners/v4/series/392256/posters/63ea8f831e984.jpg",
    tvdbId: "tvdb-392256",
    genre: "Drama",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes (TV Series)", locations: "Locations" },
  },
  "squid-game": {
    showTitle: "Squid Game",
    wiki: "squidgame",
    poster: "https://artworks.thetvdb.com/banners/v4/series/392256/posters/63ea8f831e984.jpg",
    tvdbId: "tvdb-389828",
    genre: "Thriller",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", games: "Games" },
  },
  "stranger-things": {
    showTitle: "Stranger Things",
    wiki: "strangerthings",
    poster: "https://artworks.thetvdb.com/banners/v4/series/305288/posters/5f8a56cca9ee0.jpg",
    tvdbId: "tvdb-305288",
    genre: "Sci-Fi",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes", creatures: "Creatures", locations: "Locations" },
  },
  "the-mandalorian": {
    showTitle: "The Mandalorian",
    wiki: "starwars",
    poster: "https://artworks.thetvdb.com/banners/v4/series/361753/posters/5f8a54ae1a498.jpg",
    tvdbId: "tvdb-361753",
    genre: "Sci-Fi",
    network: "Disney+",
    categories: { characters: "The Mandalorian characters", episodes: "The Mandalorian episodes" },
  },
  "breaking-bad": {
    showTitle: "Breaking Bad",
    wiki: "breakingbad",
    poster: "https://artworks.thetvdb.com/banners/v4/series/81189/posters/5f8a57397fe09.jpg",
    tvdbId: "tvdb-81189",
    genre: "Crime",
    network: "AMC",
    categories: { characters: "Characters", episodes: "Episodes", locations: "Locations" },
  },
  "game-of-thrones": {
    showTitle: "Game of Thrones",
    wiki: "gameofthrones",
    poster: "https://artworks.thetvdb.com/banners/v4/series/121361/posters/5f8a58d87a4f4.jpg",
    tvdbId: "tvdb-121361",
    genre: "Fantasy",
    network: "HBO",
    categories: { characters: "Characters", episodes: "Episodes", houses: "Great Houses", locations: "Locations" },
  },
  "the-bear": {
    showTitle: "The Bear",
    wiki: "the-bear-tv",
    poster: "https://artworks.thetvdb.com/banners/v4/series/409680/posters/649a5c91c698a.jpg",
    tvdbId: "tvdb-409680",
    genre: "Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "shogun": {
    showTitle: "Shogun",
    wiki: "shogun",
    poster: "https://artworks.thetvdb.com/banners/v4/series/392434/posters/65d3e3f3c9ecb.jpg",
    tvdbId: "tvdb-392434",
    genre: "Historical Drama",
    network: "FX",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "fallout-tv": {
    showTitle: "Fallout",
    wiki: "fallout",
    poster: "https://artworks.thetvdb.com/banners/v4/series/413289/posters/660bd08e91a6e.jpg",
    tvdbId: "tvdb-413289",
    genre: "Sci-Fi",
    network: "Prime Video",
    categories: { characters: "Fallout TV characters", episodes: "Fallout TV episodes", locations: "Fallout TV locations" },
  },
  "wednesday": {
    showTitle: "Wednesday",
    wiki: "wednesday-netflix",
    poster: "https://artworks.thetvdb.com/banners/v4/series/394016/posters/637a17e39428a.jpg",
    tvdbId: "tvdb-394016",
    genre: "Comedy",
    network: "Netflix",
    categories: { characters: "Characters", episodes: "Episodes" },
  },
  "arcane": {
    showTitle: "Arcane",
    wiki: "leagueoflegends",
    poster: "https://artworks.thetvdb.com/banners/v4/series/393100/posters/618bdd4e10369.jpg",
    tvdbId: "tvdb-393100",
    genre: "Animation",
    network: "Netflix",
    categories: { characters: "Arcane characters", episodes: "Arcane episodes" },
  },
  "the-boys": {
    showTitle: "The Boys",
    wiki: "the-boys",
    poster: "https://artworks.thetvdb.com/banners/v4/series/355567/posters/5f8a57e6b2e73.jpg",
    tvdbId: "tvdb-355567",
    genre: "Action",
    network: "Prime Video",
    categories: { characters: "Characters", episodes: "Episodes", supes: "Supes" },
  },
  "andor": {
    showTitle: "Andor",
    wiki: "starwars",
    poster: "https://artworks.thetvdb.com/banners/v4/series/380661/posters/631c86e13e18a.jpg",
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
