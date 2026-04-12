export function generateCandidates(title: string): string[] {
  const lower = title.toLowerCase();
  const noPunct = lower.replace(/[^a-z0-9\s]/g, "");
  const noSpace = noPunct.replace(/\s+/g, "");
  const dashed = noPunct.replace(/\s+/g, "-");
  const words = noPunct.split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  const firstTwo = words.slice(0, 2).join("");
  const firstThree = words.slice(0, 3).join("");

  const prefixMatch = lower.match(/^(.+?)[\s]*[:–—]|^(.+?)[\s]+-[\s]+/);
  const franchise = prefixMatch
    ? (prefixMatch[1] ?? prefixMatch[2] ?? "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "")
    : "";

  const cleaned = lower
    .replace(/\bthe\b/g, "")
    .replace(/\(\d+\)/g, "")
    .replace(/edition$/i, "")
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "");

  return [noSpace, dashed, cleaned, franchise, firstThree, firstTwo, firstWord]
    .filter((c, i, arr) => c.length >= 3 && arr.indexOf(c) === i);
}

export async function checkWikiExists(subdomain: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://${subdomain}.fandom.com/api.php?action=query&meta=siteinfo&format=json&formatversion=2`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.query?.general?.sitename;
  } catch {
    return false;
  }
}

export async function getWikiName(subdomain: string): Promise<string> {
  try {
    const res = await fetch(
      `https://${subdomain}.fandom.com/api.php?action=query&meta=siteinfo&format=json&formatversion=2`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return subdomain;
    const data = await res.json();
    return data.query?.general?.sitename ?? subdomain;
  } catch {
    return subdomain;
  }
}

export async function detectWiki(topic: string): Promise<{ wiki: string; wikiName: string } | null> {
  const candidates = generateCandidates(topic);
  for (const subdomain of candidates) {
    const exists = await checkWikiExists(subdomain);
    if (exists) {
      const wikiName = await getWikiName(subdomain);
      return { wiki: subdomain, wikiName };
    }
  }
  return null;
}
