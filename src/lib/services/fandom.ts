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

export async function searchAndFetchPage(wiki: string, query: string) {
  // Try exact title first
  const exact = await fetchPage(wiki, query);
  if (exact) return exact;

  // Search for the page
  try {
    const searchData = await fandomApi(wiki, {
      action: "query",
      list: "search",
      srsearch: query,
      srnamespace: "0",
      srlimit: "1",
    });
    const results = searchData.query?.search ?? [];
    if (results.length > 0) {
      return fetchPage(wiki, results[0].title);
    }
  } catch {}

  return null;
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

// Fetch a single level of category members (pages + subcategories)
async function fetchCategoryMembers(wiki: string, category: string, limit: number) {
  const pages: { title: string; pageId: number }[] = [];
  const subcategories: string[] = [];
  let cmcontinue: string | undefined;
  const catTitle = category.startsWith("Category:") ? category : `Category:${category}`;

  do {
    const params: Record<string, string> = {
      action: "query",
      list: "categorymembers",
      cmtitle: catTitle,
      cmlimit: String(Math.min(limit - pages.length, 500)),
      cmtype: "page|subcat",
      cmprop: "ids|title|type",
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;
    const data = await fandomApi(wiki, params);
    for (const m of data.query?.categorymembers ?? []) {
      if (m.ns === 14 || m.type === "subcat") {
        subcategories.push(m.title);
      } else {
        pages.push({ title: m.title, pageId: m.pageid });
      }
    }
    cmcontinue = data.continue?.cmcontinue;
  } while (cmcontinue && pages.length < limit);

  return { pages, subcategories };
}

export async function getCategory(wiki: string, category: string, limit = 300) {
  const seen = new Set<number>();
  const results: { title: string; pageId: number }[] = [];

  // First level
  const first = await fetchCategoryMembers(wiki, category, limit);

  // Add direct pages (filter out overview/list pages that match category name)
  for (const p of first.pages) {
    if (!seen.has(p.pageId) && !p.title.startsWith("Category:")) {
      seen.add(p.pageId);
      results.push(p);
    }
  }

  // If we got mostly subcategories and few pages, expand subcategories
  if (results.length < 10 && first.subcategories.length > 0) {
    for (const subcat of first.subcategories) {
      if (results.length >= limit) break;
      try {
        const sub = await fetchCategoryMembers(wiki, subcat, limit - results.length);
        for (const p of sub.pages) {
          if (!seen.has(p.pageId)) {
            seen.add(p.pageId);
            results.push(p);
          }
        }
        // Go one more level deep if still mostly subcategories
        if (sub.pages.length < 5 && sub.subcategories.length > 0) {
          for (const subsub of sub.subcategories.slice(0, 10)) {
            if (results.length >= limit) break;
            try {
              const deep = await fetchCategoryMembers(wiki, subsub, Math.min(50, limit - results.length));
              for (const p of deep.pages) {
                if (!seen.has(p.pageId)) {
                  seen.add(p.pageId);
                  results.push(p);
                }
              }
            } catch {}
          }
        }
      } catch {}
    }
  }

  return results;
}
