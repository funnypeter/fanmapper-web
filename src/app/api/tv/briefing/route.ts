import { NextRequest, NextResponse } from "next/server";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

type GeminiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; reason: string; details: unknown; attempts: { model: string; status: number | string; body?: string }[] };

async function callGemini(apiKey: string, prompt: string): Promise<GeminiResult> {
  const attempts: { model: string; status: number | string; body?: string }[] = [];
  let lastDetails: unknown = null;

  for (const model of MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
        }),
      });

      if (res.status === 503 || res.status === 429) {
        attempts.push({ model, status: res.status, body: "retryable" });
        console.warn(`Briefing: Gemini ${model} returned ${res.status}, trying next model`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        attempts.push({ model, status: res.status, body: errText.substring(0, 500) });
        console.error(`Briefing: Gemini ${model} ${res.status}: ${errText.substring(0, 500)}`);
        return {
          ok: false,
          reason: `Gemini ${model} returned HTTP ${res.status}`,
          details: errText.substring(0, 500),
          attempts,
        };
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      const text = parts.map((p: { text?: string }) => p.text ?? "").join("\n").trim();

      if (!text) {
        const finishReason = candidate?.finishReason;
        const safetyRatings = candidate?.safetyRatings;
        const promptFeedback = data.promptFeedback;
        attempts.push({
          model,
          status: 200,
          body: `empty response · finishReason=${finishReason} · promptFeedback=${JSON.stringify(promptFeedback ?? null)}`,
        });
        lastDetails = { finishReason, safetyRatings, promptFeedback };
        console.error(`Briefing: Gemini ${model} returned empty candidates:`, JSON.stringify({ finishReason, safetyRatings, promptFeedback }).substring(0, 500));
        continue;
      }

      return { ok: true, text, model };
    } catch (err) {
      attempts.push({ model, status: "exception", body: String(err).substring(0, 300) });
      console.error(`Briefing: Gemini ${model} call failed:`, err);
      lastDetails = String(err);
      continue;
    }
  }

  return { ok: false, reason: "All Gemini models failed or returned empty", details: lastDetails, attempts };
}

export async function GET(request: NextRequest) {
  const show = request.nextUrl.searchParams.get("show");
  const season = request.nextUrl.searchParams.get("season");
  const episode = request.nextUrl.searchParams.get("episode");
  const episodeTitle = request.nextUrl.searchParams.get("episodeTitle");
  const debug = request.nextUrl.searchParams.get("debug") === "1";

  if (!show || !season || !episode) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  const prompt = `I'm about to watch "${show}" Season ${season}, Episode ${episode}${episodeTitle ? ` ("${episodeTitle}")` : ""}.

Give me a spoiler-free episode briefing. DO NOT reveal any plot points, twists, deaths, or surprises from THIS episode. Only cover what happened BEFORE this episode.

Respond in this exact JSON format:
{
  "recap": "A detailed recap of what happened in the episodes leading up to this one. Cover the key plot points, major events, and important revelations from previous episodes that are relevant to understanding this episode. Be specific about what happened — names, events, decisions — but ONLY from previous episodes, never from this one. (4-6 sentences)",
  "characters": ["Character Name - where we last left this character, what they were doing, and what their current motivations are heading into this episode (1-2 sentences each)"]
}

Include 4-6 key characters. Return ONLY the JSON, no other text.`;

  const result = await callGemini(geminiKey, prompt);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: `AI service error: ${result.reason}. Add ?debug=1 to see details.`,
        ...(debug ? { debug: { reason: result.reason, details: result.details, attempts: result.attempts } } : {}),
      },
      { status: 502 },
    );
  }

  const rawText = result.text;
  try {
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Briefing: no JSON object found in response:", rawText.substring(0, 500));
      return NextResponse.json(
        {
          error: "Couldn't parse the briefing response.",
          ...(debug ? { debug: { model: result.model, raw: rawText.substring(0, 1000) } } : {}),
        },
        { status: 502 },
      );
    }
    const briefing = JSON.parse(jsonMatch[0]);
    return NextResponse.json(briefing);
  } catch (err) {
    console.error("Briefing: JSON parse failed:", err, "raw:", rawText.substring(0, 500));
    return NextResponse.json(
      {
        error: "Couldn't parse the briefing response.",
        ...(debug ? { debug: { model: result.model, parseError: String(err), raw: rawText.substring(0, 1000) } } : {}),
      },
      { status: 502 },
    );
  }
}
