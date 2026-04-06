export interface IGDBGame {
  id: string;
  igdbId: number;
  title: string;
  coverUrl: string | null;
  genres: string[];
  platforms: string[];
  releaseDate: string | null;
  summary: string | null;
}

// IGDB calls go through our API route to keep credentials server-side
export async function searchGames(query: string): Promise<IGDBGame[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function getGameDetails(igdbId: number): Promise<IGDBGame | null> {
  const res = await fetch(`/api/games/${igdbId}`);
  if (!res.ok) return null;
  return res.json();
}
