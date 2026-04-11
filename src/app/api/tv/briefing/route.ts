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

Give me a spoiler-free episode briefing. DO NOT reveal any plot points, twists, deaths, or surprises from this episode. Only cover what I need to know BEFORE watching.

Respond in this exact JSON format:
{
  "recap": "A brief spoiler-free recap of what happened in previous episodes leading up to this one. What storylines are in play? What conflicts are unresolved? (2-3 sentences)",
  "characters": ["Character Name - brief reminder of who they are and their current situation (1 sentence each)"],
  "whatToExpect": "The tone and themes of this episode without spoiling anything. Is it action-heavy, dialogue-driven, emotional? Any content warnings? (1-2 sentences)"
}

Return ONLY the JSON, no other text.`,
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
