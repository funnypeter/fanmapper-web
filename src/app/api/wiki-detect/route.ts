import { NextRequest, NextResponse } from "next/server";

// Generate candidate wiki subdomains from a game title
function generateCandidates(title: string): string[] {
  const lower = title.toLowerCase();
  const noPunct = lower.replace(/[^a-z0-9\s]/g, "");
  const noSpace = noPunct.replace(/\s+/g, "");
  const dashed = noPunct.replace(/\s+/g, "-");
  const firstWord = noPunct.split(/\s+/)[0] ?? "";

  // Try variations + common patterns (drop "the", remove year/edition suffixes)
  const cleaned = lower
    .replace(/\bthe\b/g, "")
    .replace(/\(\d+\)/g, "")
    .replace(/edition$/i, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "");

  const candidates = [
    noSpace,
    dashed,
    cleaned,
    firstWord,
  ].filter((c, i, arr) => c.length >= 3 && arr.indexOf(c) === i);

  return candidates;
}

async function checkWikiExists(subdomain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://${subdomain}.fandom.com/api.php?action=query&meta=siteinfo&format=json&formatversion=2`,
      { next: { revalidate: 86400 } } // Cache 1 day
    );
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.query?.general?.sitename;
  } catch {
    return false;
  }
}

async function getDetectedCategories(wiki: string): Promise<string[]> {
  // Common category names that often exist on game wikis
  const guesses = ["Characters", "Items", "Weapons", "Locations", "Bosses", "Quests", "Enemies", "Achievements"];
  const found: string[] = [];

  for (const cat of guesses) {
    try {
      const res = await fetch(
        `https://${wiki}.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(cat)}&cmlimit=1&format=json&formatversion=2&origin=*`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if ((data.query?.categorymembers?.length ?? 0) > 0) {
        found.push(cat);
      }
    } catch {}
  }

  return found;
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const explicitWiki = request.nextUrl.searchParams.get("wiki");

  // Explicit wiki: return its categories without re-detecting
  if (explicitWiki) {
    const exists = await checkWikiExists(explicitWiki);
    if (exists) {
      const categories = await getDetectedCategories(explicitWiki);
      return NextResponse.json({
        found: true,
        wiki: explicitWiki,
        url: `https://${explicitWiki}.fandom.com`,
        categories,
      });
    }
    return NextResponse.json({ found: false });
  }

  if (!title) return NextResponse.json({ found: false });

  const candidates = generateCandidates(title);

  for (const subdomain of candidates) {
    const exists = await checkWikiExists(subdomain);
    if (exists) {
      const categories = await getDetectedCategories(subdomain);
      return NextResponse.json({
        found: true,
        wiki: subdomain,
        url: `https://${subdomain}.fandom.com`,
        categories,
      });
    }
  }

  return NextResponse.json({ found: false });
}
