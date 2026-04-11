import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const show = request.nextUrl.searchParams.get("show");
  const season = request.nextUrl.searchParams.get("season");
  const episode = request.nextUrl.searchParams.get("episode");
  const episodeTitle = request.nextUrl.searchParams.get("episodeTitle");

  if (!show || !season || !episode) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `I'm about to watch "${show}" Season ${season}, Episode ${episode}${episodeTitle ? ` ("${episodeTitle}")` : ""}.

Give me a spoiler-free episode briefing. DO NOT reveal any plot points, twists, deaths, or surprises from THIS episode. Only cover what happened BEFORE this episode.

Respond in this exact JSON format:
{
  "recap": "A detailed recap of what happened in the episodes leading up to this one. Cover the key plot points, major events, and important revelations from previous episodes that are relevant to understanding this episode. Be specific about what happened — names, events, decisions — but ONLY from previous episodes, never from this one. (4-6 sentences)",
  "characters": ["Character Name - where we last left this character, what they were doing, and what their current motivations are heading into this episode (1-2 sentences each)"]
}

Include 4-6 key characters. Return ONLY the JSON, no other text.`,
            }],
          }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Gemini API error" }, { status: 502 });
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((p: { text?: string }) => p.text ?? "").join("\n");
    const stripped = rawText.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Failed to parse response" }, { status: 502 });

    const briefing = JSON.parse(jsonMatch[0]);
    return NextResponse.json(briefing);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
