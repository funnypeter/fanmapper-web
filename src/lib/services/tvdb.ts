export interface TVDBShow {
  id: string;
  tvdbId: number;
  title: string;
  posterUrl: string | null;
  genres: string[];
  network: string | null;
  releaseDate: string | null;
  summary: string | null;
  year: string | null;
}

export interface TVDBShowDetail extends TVDBShow {
  rating: number | null;
  status: string | null;
  cast: { name: string; characterName: string; image: string | null }[];
  seasons: { seasonNumber: number; episodes: TVDBEpisode[] }[];
}

export interface TVDBEpisode {
  id: number;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
  aired: string | null;
  image: string | null;
  overview: string | null;
  runtime: number | null;
}

export async function searchShows(query: string): Promise<TVDBShow[]> {
  try {
    const res = await fetch(`/api/tv/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getShowDetails(id: string): Promise<TVDBShowDetail | null> {
  try {
    const res = await fetch(`/api/tv/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
