const USER_AGENT = "FanMapper/1.0 (https://github.com/funnypeter/fanmapper-web)";

async function fandomApi(wiki: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`https://${wiki}.fandom.com/api.php`);
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("origin", "*");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { "Api-User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`Fandom API error: ${res.status}`);
  return res.json();
}

export async function fetchPage(wiki: string, title: string) {
  const data = await fandomApi(wiki, {
    action: "parse",
    page: title,
    prop: "text|categories|sections",
  });
  if (data.error) return null;
  return {
    title: data.parse.title,
    html: data.parse.text,
    categories: (data.parse.categories ?? []).map((c: any) => c.category ?? c["*"]),
    sections: (data.parse.sections ?? []).map((s: any) => ({
      level: s.level, line: s.line, anchor: s.anchor,
    })),
  };
}

export async function fetchWikitext(wiki: string, title: string): Promise<string | null> {
  const data = await fandomApi(wiki, {
    action: "query",
    titles: title,
    prop: "revisions",
    rvprop: "content",
    rvslots: "*",
  });
  const pages = data.query?.pages;
  if (!pages || pages.length === 0 || pages[0].missing) return null;
  return pages[0].revisions?.[0]?.slots?.main?.content ?? null;
}

export async function searchWiki(wiki: string, query: string, limit = 20) {
  const data = await fandomApi(wiki, {
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    srprop: "snippet",
  });
  return (data.query?.search ?? []).map((r: any) => ({
    title: r.title,
    pageId: r.pageid,
    snippet: r.snippet?.replace(/<[^>]*>/g, "") ?? "",
  }));
}

// Fetch thumbnail images for a batch of page titles (up to 50 at a time)
export async function getPageThumbnails(wiki: string, titles: string[]): Promise<Record<string, string>> {
  const thumbnails: Record<string, string> = {};
  // MediaWiki API supports up to 50 titles per request
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const data = await fandomApi(wiki, {
      action: "query",
      titles: batch.join("|"),
      prop: "pageimages",
      pithumbsize: "300",
      pilimit: "50",
    });
    for (const page of data.query?.pages ?? []) {
      if (page.thumbnail?.source) {
        thumbnails[page.title] = page.thumbnail.source;
      }
    }
  }
  return thumbnails;
}

export async function getCategory(wiki: string, category: string, limit = 500) {
  const results: { title: string; pageId: number }[] = [];
  let cmcontinue: string | undefined;
  do {
    const params: Record<string, string> = {
      action: "query",
      list: "categorymembers",
      cmtitle: category.startsWith("Category:") ? category : `Category:${category}`,
      cmlimit: String(Math.min(limit - results.length, 500)),
      cmtype: "page",
      cmprop: "ids|title",
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;
    const data = await fandomApi(wiki, params);
    for (const m of data.query?.categorymembers ?? []) {
      results.push({ title: m.title, pageId: m.pageid });
    }
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue && results.length < limit);
  return results;
}
