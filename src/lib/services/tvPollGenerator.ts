import { createClient as createServerClient } from "@/lib/supabase/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

async function searchShowPoster(showTitle: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(showTitle)}&language=en-US&page=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const poster = data.results?.[0]?.poster_path;
    return poster ? `${IMG_BASE}${poster}` : null;
  } catch {
    return null;
  }
}

interface GeminiPoll {
  question: string;
  options: string[];
  showHint: string;
}

let generating = false;

export async function generateTVPolls(): Promise<{ success: boolean; error?: string }> {
  if (generating) return { success: false, error: "Generation already in progress" };
  generating = true;

  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return { success: false, error: "GEMINI_API_KEY not configured" };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate exactly 4 poll questions about REAL TV shows for a TV fan community app.

IMPORTANT: Only reference REAL TV shows that actually exist. Do NOT invent fictional show names. Use shows like: House of the Dragon, Severance, The Last of Us, Stranger Things, The Boys, Squid Game, The Bear, Wednesday, Arcane, Fallout, Shogun, The Mandalorian, Andor, Breaking Bad, Game of Thrones, Yellowjackets, The White Lotus, Succession, Ted Lasso, Euphoria, The Penguin, Dune Prophecy, or other real shows.

Types of questions:
- Which real show is better: X vs Y
- Best character performance in a real show
- Predictions about a real show's next season
- Streaming platform debates
- Best show in a genre this year

Rules:
- Each poll must have 2-4 options
- Keep questions concise and engaging
- The showHint MUST be a real TV show name that exists on TMDB (e.g. "House of the Dragon", not a made-up name)

Return ONLY a JSON array with no other text:
[{"question": "...", "options": ["A", "B"], "showHint": "Real Show Title"}]`,
            }],
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return { success: false, error: `Gemini API ${geminiRes.status}: ${errText.substring(0, 200)}` };
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { success: false, error: `Failed to parse Gemini response: ${stripped.substring(0, 300)}` };

    const polls: GeminiPoll[] = JSON.parse(jsonMatch[0]);

    // Fetch all posters in parallel
    const posters = await Promise.all(
      polls.map((poll) => searchShowPoster(poll.showHint))
    );

    const supabase = await createServerClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const errors: string[] = [];
    for (let i = 0; i < polls.length; i++) {
      const poll = polls[i];
      const imageUrl = posters[i];

      const { error } = await supabase.from("polls").insert({
        question: poll.question,
        options: poll.options,
        image_url: imageUrl,
        game_hint: poll.showHint,
        category: "tv",
        expires_at: expiresAt,
      });

      if (error) errors.push(`Insert failed: ${error.message}`);
    }

    if (errors.length === polls.length) {
      return { success: false, error: errors.join("; ") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  } finally {
    generating = false;
  }
}
