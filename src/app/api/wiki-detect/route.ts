import { NextRequest, NextResponse } from "next/server";

// Generate candidate wiki subdomains from a game/show title
function generateCandidates(title: string): string[] {
  const lower = title.toLowerCase();
  const noPunct = lower.replace(/[^a-z0-9\s]/g, "");
  const noSpace = noPunct.replace(/\s+/g, "");
  const dashed = noPunct.replace(/\s+/g, "-");
  const words = noPunct.split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  const firstTwo = words.slice(0, 2).join("");
  const firstThree = words.slice(0, 3).join("");

  // Extract franchise prefix before ":" or " - " (e.g. "Star Wars" from "Star Wars: Maul - Shadow Lord")
  const prefixMatch = lower.match(/^(.+?)[\s]*[:–—]|^(.+?)[\s]+-[\s]+/);
  const franchise = prefixMatch
    ? (prefixMatch[1] ?? prefixMatch[2] ?? "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "")
    : "";

  // Try variations — more specific (longer) first, less specific last
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
    franchise,
    firstThree,
    firstTwo,
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
  // First try common guesses
  const guesses = ["Characters", "Items", "Weapons", "Locations", "Bosses", "Quests", "Enemies", "Achievements", "Spells", "Skills"];
  const found: string[] = [];

  for (const cat of guesses) {
    try {
      const res = await fetch(
        `https://${wiki}.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(cat)}&cmlimit=1&cmtype=page&format=json&formatversion=2&origin=*`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if ((data.query?.categorymembers?.length ?? 0) > 0) {
        found.push(cat);
      }
    } catch {}
  }

  if (found.length >= 2) return found;

  // Fall back to wiki's actual top categories sorted by size
  try {
    const res = await fetch(
      `https://${wiki}.fandom.com/api.php?action=query&list=allcategories&aclimit=100&acmin=10&acprop=size&format=json&formatversion=2`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return found;
    const data = await res.json();
    const cats = (data.query?.allcategories ?? []) as { category: string; size: number }[];

    const skipPatterns = /^(template|user|file|image|media|admin|stub|community|browse|wiki|category|help|special|article|content|disambig|protect|all\s|pages?[\s_]with|broken|missing|needs|unused|orphaned|cleanup|deletion|maintenance|hidden)/i;
    const top = cats
      .filter((c) => !skipPatterns.test(c.category))
      .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
      .slice(0, 6)
      .map((c) => c.category);

    for (const c of top) {
      if (!found.includes(c)) found.push(c);
    }
  } catch {}

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
