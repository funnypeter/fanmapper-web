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

// Fetch thumbnail images using Fandom's Nirvana ArticlesApi
export async function getPageThumbnails(wiki: string, pageIds: number[]): Promise<Record<number, string>> {
  const thumbnails: Record<number, string> = {};
  // Fandom API supports up to 50 IDs per request
  for (let i = 0; i < pageIds.length; i += 50) {
    const batch = pageIds.slice(i, i + 50);
    const url = `https://${wiki}.fandom.com/wikia.php?controller=ArticlesApi&method=getDetails&ids=${batch.join(",")}&width=300&height=400`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      for (const [id, item] of Object.entries(data.items ?? {}) as [string, any][]) {
        if (item.thumbnail) {
          thumbnails[Number(id)] = item.thumbnail;
        }
      }
    } catch {
      // Continue on failure
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
