import { createClient as createServerClient } from "@/lib/supabase/server";

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_BASE = "https://api.igdb.com/v4";

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getIGDBToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("IGDB credentials not configured");

  const res = await fetch(
    `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return accessToken!;
}

async function searchGameCover(gameTitle: string): Promise<string | null> {
  try {
    const token = await getIGDBToken();
    const res = await fetch(`${IGDB_BASE}/games`, {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: `search "${gameTitle.replace(/"/g, '\\"')}"; fields cover.url; limit 1;`,
    });

    if (!res.ok) return null;
    const results = await res.json();
    if (results[0]?.cover?.url) {
      return `https:${results[0].cover.url.replace("t_thumb", "t_720p")}`;
    }
    return null;
  } catch {
    return null;
  }
}

interface GeminiPoll {
  question: string;
  options: string[];
  gameHint: string;
}

// In-memory lock to prevent concurrent generation
let generating = false;

export async function generatePolls(): Promise<{ success: boolean; error?: string }> {
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
          contents: [
            {
              parts: [
                {
                  text: `Based on gaming trends this week (April 2026), generate exactly 4 topical poll questions for a gaming community app.

Types of questions to choose from:
- Which upcoming game are you most excited for?
- X vs Y matchups (characters, franchises, studios)
- Predictions about releases, events, or awards
- "What would you rather" gaming scenarios
- Community opinions on hot gaming topics or controversies
- Best game in a genre or category

Rules:
- Each poll must have 2-4 options
- Keep questions concise and engaging
- Reference real games, studios, and events
- Make them feel timely and relevant
- Each poll should have a gameHint field with a single game title that best represents the poll topic (for fetching cover artwork)

Return ONLY a JSON array with no other text, in this exact format:
[{"question": "...", "options": ["A", "B"], "gameHint": "Game Title"}]`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return { success: false, error: `Gemini API ${geminiRes.status}: ${errText.substring(0, 200)}` };
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return { success: false, error: `Failed to parse Gemini response: ${rawText.substring(0, 200)}` };

    const polls: GeminiPoll[] = JSON.parse(jsonMatch[0]);

    const supabase = await createServerClient();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const errors: string[] = [];
    for (const poll of polls) {
      const imageUrl = await searchGameCover(poll.gameHint);

      const { error } = await supabase.from("polls").insert({
        question: poll.question,
        options: poll.options,
        image_url: imageUrl,
        game_hint: poll.gameHint,
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
