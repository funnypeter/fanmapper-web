import { NextRequest, NextResponse } from "next/server";
import { detectWiki } from "@/lib/services/wikiDetect";
import { searchWiki, fetchPage } from "@/lib/services/fandom";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      });
      if (res.status === 503 || res.status === 429) {
        console.warn(`Gemini ${model} returned ${res.status}, trying next model`);
        continue;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`Gemini ${model} ${res.status}: ${errText.substring(0, 300)}`);
        return null;
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? null;
    } catch (err) {
      console.error(`Gemini ${model} call failed:`, err);
      continue;
    }
  }
  return null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = body?.question?.trim();
  if (!question || question.length < 3) {
    return NextResponse.json({ error: "Please ask a question." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured." });

  // Step 1: Extract topic + search query from the question
  const extractPrompt = `From this user question, extract the game or TV show name they're asking about, and a concise search query to look up on its Fandom wiki.

Question: "${question}"

Return ONLY a JSON object: { "topic": "the game or show name", "query": "search terms for the wiki" }
If you can't identify a specific game or show, set topic to the most likely subject.`;

  const extractRaw = await callGemini(apiKey, extractPrompt);
  if (!extractRaw) return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again in a moment." });

  let topic: string;
  let query: string;
  try {
    const cleaned = extractRaw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    topic = parsed.topic ?? question;
    query = parsed.query ?? question;
  } catch {
    topic = question;
    query = question;
  }

  // Step 2: Detect the Fandom wiki
  const wikiResult = await detectWiki(topic);
  if (!wikiResult) {
    return NextResponse.json({
      error: `Couldn't find a wiki for "${topic}". Try being more specific — e.g., "Elden Ring Moonveil Katana" instead of just "Moonveil".`,
    });
  }

  const { wiki, wikiName } = wikiResult;

  // Step 3: Search the wiki for relevant pages
  const results = await searchWiki(wiki, query, 5);
  if (results.length === 0) {
    return NextResponse.json({
      error: `Found the ${wikiName} wiki but couldn't find pages matching your question. Try rephrasing.`,
    });
  }

  // Step 4: Fetch top 3 pages and extract text
  const pageTitles = results.slice(0, 3).map((r: { title: string }) => r.title);
  const pages = await Promise.all(pageTitles.map((t: string) => fetchPage(wiki, t)));
  const pageTexts = pages
    .filter(Boolean)
    .map((p) => {
      const text = htmlToText(p!.html);
      return `--- ${p!.title} ---\n${text.slice(0, 3000)}`;
    });

  if (pageTexts.length === 0) {
    return NextResponse.json({
      error: `Found pages on ${wikiName} but couldn't load their content. Try again.`,
    });
  }

  // Step 5: Synthesize answer via Gemini
  const answerPrompt = `You are FanCompanion, a helpful assistant for gamers and TV fans. Answer the user's question using ONLY the wiki content provided below. Be concise (2-3 short paragraphs max). If the wiki content doesn't contain the answer, say so honestly.

User's question: "${question}"

Wiki content from ${wikiName}:
${pageTexts.join("\n\n")}

Rules:
- Answer directly and concisely
- Do not make up information not in the wiki content
- Do not use markdown headers or bullet points — just flowing text
- Mention which wiki page a fact comes from naturally (e.g., "According to the Master Sword page...")`;

  const answer = await callGemini(apiKey, answerPrompt);
  if (!answer) {
    return NextResponse.json({ error: "Couldn't generate an answer. Try again." });
  }

  const sources = pageTitles.map((title: string) => ({
    title,
    url: `https://${wiki}.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  }));

  return NextResponse.json({ answer, wiki, wikiName, sources });
}
