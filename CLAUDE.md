# FanCompanion

A Next.js web app for tracking **game and TV libraries** with Fandom wiki integration, Steam imports, achievements, interactive maps, episode tracking, AI episode briefings, stats dashboards, community polls, live chats, and trending feeds from Metacritic, GameSpot, and TVGuide. The **Home hub** at `/home` unifies personalized recommendations, Continue Watching/Playing, featured live chats, polls, recent activity, and news across both games and TV.

> Repo and project folder are still named `FanMapper-Web` / `fanmapper-web` for git-history stability. The user-facing brand is **FanCompanion**. Internal User-Agent strings in `fandom.ts` and `api/img/route.ts` intentionally keep the legacy name.

## Stack

- **Next.js 16** (App Router, Turbopack) — note: cookies() is async
- **TypeScript** with strict mode
- **Tailwind CSS v4** (uses `@theme inline` in globals.css)
- **Supabase** — auth, Postgres database, Row Level Security
- **Vercel** — hosting + serverless API routes
- **No next/image** — using raw `<img>` tags everywhere because game cover art comes from many external CDNs

## Key Architectural Decisions

- **Server-side API key proxying**: All Steam, IGDB, and image requests go through `/api/*` routes so credentials never reach the client
- **Image proxy at `/api/img?url=`**: Fandom blocks hotlinking, so wiki article images route through our server
- **Game IDs are prefixed**: `igdb-{id}` for IGDB games, `steam-{appid}` for Steam imports, `tmdb-{id}` for TV shows — this distinguishes sources throughout the app
- **Wiki keys are prefixed too**: plain keys (`elden-ring`, `skyrim`) for the 16 hand-curated game registry entries; `auto-{wiki}` for auto-detected game wikis (e.g. `auto-thesims4`); `auto-tv-{tmdbId}` for auto-detected TV wikis that aren't in `tvRegistry`
- **Wiki progress dual-stored**: localStorage (instant) + Supabase `wiki_progress` / `tv_wiki_progress` (cross-device sync)
- **Two-level navigation**: Bottom nav (Home, TV, Games, Collections, Profile) for main sections; top tabs (Discover, Library, Stats) within both Games and TV sections
- **Game detail opens in modal**: Clicking a game card opens `GameDetailContent` in a scrollable modal via `GameModalContext`. Direct URL `/game/[id]` still works as full page fallback. Use `useGameModal().openGame(id)` instead of `<Link>` to open in the modal.
- **TV show detail opens in modal**: Clicking a show opens `TVShowDetailContent` via `TVShowModalContext`. Use `useTVShowModal().openShow(id)` to swap the modal to another show — this is how "You Might Like" swaps shows without closing the modal. The context exposes three views: show detail, wiki article (`WikiArticleView`), and episode briefing (`BriefingView`).
- **Routes are public by default**: Only `/library`, `/profile`, `/profile/*`, `/stats`, `/tv/library`, `/tv/stats` require auth via middleware

## Critical Files

- `src/lib/services/gameRegistry.ts` — Hand-curated registry of 16 games with verified IGDB IDs and Fandom wiki configs. **Always verify IGDB IDs against the live API before adding** — IGDB IDs are NOT what you'd guess.
- `src/lib/services/fandom.ts` — Fandom API client with `getCategory` that recursively expands subcategories (Fandom nests real pages 2-3 levels deep)
- `src/app/api/games/[id]/route.ts` — IGDB game fetcher. The `game_time_to_beat` field is NOT valid in `/games` endpoint — must query `/game_time_to_beats` separately
- `src/app/api/wiki-detect/route.ts` — Auto wiki detection: guesses Fandom subdomain from game title, falls back to wiki's top categories sorted by size
- `src/app/api/news/route.ts` — Aggregates RSS from GameSpot, IGN, Kotaku. Accepts `?game=` query param for filtered news on game detail pages.
- `src/app/(app)/wiki/[game]/page.tsx` — Wiki checklist UI. Handles BOTH registry games and `auto-{wiki}` keys. Has 90+ icon keyword mappings.
- `src/app/(app)/wiki/[game]/[page]/page.tsx` — Article viewer with proxied images. Also handles auto wikis.
- `src/app/(app)/stats/page.tsx` — Server-rendered stats dashboard with status/genre breakdowns
- `src/components/PollCarousel.tsx` — **Reusable widget**. Self-contained poll carousel (fetches own data, manages state). Drop `<PollCarousel />` anywhere to add community polls. Backed by `PollCard.tsx`, `PollModal.tsx`, and `src/lib/services/pollGenerator.ts`.
- `src/components/GameChat.tsx` — **Reusable widget**. Live chat card for game detail pages. Shows animated chat preview, expands to full modal. Has demo content for all 15 registry games + generic fallback. Usage: `<GameChat gameTitle={title} />`
- `src/components/TrendingChats.tsx` — **Reusable widget**. Horizontal scroll of animated live chat rooms for the Explore page. Usage: `<TrendingChats />`
- `src/components/GameDetailContent.tsx` — Shared game detail UI (hero, library actions, chat, videos, reviews). Used by both the modal and the `/game/[id]` page.
- `src/components/GameModalContext.tsx` — Context provider for game detail modal. Wrap with `<GameModalProvider>`, open with `useGameModal().openGame(id)`.
- `src/components/GameSpotArticles.tsx` — **Reusable widget**. GameSpot articles relevant to a game (Gemini picks from real RSS feed). Usage: `<GameSpotArticles gameTitle={title} />`
- `src/components/TopNav.tsx` — Top tab navigation (Discover, Library, Stats) within the Games section
- `src/components/BottomNav.tsx` — Bottom navigation (Home, TV, Games, Collections, Profile)
- `src/app/api/gamespot/route.ts` — Fetches GameSpot RSS, uses Gemini to pick articles relevant to a game
- `src/app/api/metacritic/route.ts` — Fetches trending games from Metacritic backend API with scores and cover art
- `src/app/api/polls/` — Poll endpoints: GET active polls, POST vote, POST generate (via Gemini API)
- `src/middleware.ts` — Auth-protected route logic
- `supabase/migrations/` — SQL migrations (run manually in Supabase SQL Editor; not auto-applied)

### Home Section

The personalized hub at `/home`. Server component orchestrator + 8 client sections. Logged-in vs logged-out branching is handled in the page; individual sections hide themselves when empty.

- `src/app/(app)/home/page.tsx` — Server component orchestrator. Fetches user + display_name + 4 counts in parallel via `Promise.all`, passes `userId` and counts to client sections. Skips `HomeContinue` and `HomeRecentActivity` for logged-out users entirely.
- `src/components/home/HomeHero.tsx` — Time-of-day greeting, display name, stat chips. Logged-out variant with pitch + CTAs.
- `src/components/home/HomeContinue.tsx` — Interleaved `user_games` (playing) + `user_shows` (watching) sorted by most-recent `updated_at`. Cards open existing game/TV modals.
- `src/components/home/HomeFeaturedChats.tsx` — Prominent gradient wrapper around `<TrendingChats hideHeader />` + `<TVTrendingChats hideHeader />`. This is Home's signature section — bigger visual treatment than elsewhere.
- `src/components/home/HomeForYou.tsx` — Curated recs: 8 games from `GAME_REGISTRY` + 8 TMDB trending shows. Framing adapts to signed-in vs signed-out.
- `src/components/home/HomeTrending.tsx` — Metacritic games + Metacritic TV shows, both as external links with color-coded score badges.
- `src/components/home/HomeRecentActivity.tsx` — Unified timeline merging `user_games`, `user_shows`, and `tv_wiki_progress` by timestamp. Relative times. Game/show rows open modals.
- `src/components/home/HomeNewsFeed.tsx` — Interleaved games/TV news with All/Games/TV filter pills. Fetches `/api/news` + `/api/tv/news`.
- `src/app/api/tv/news/route.ts` — Generic TV news (TVLine + Deadline RSS, unfiltered). Distinct from `/api/tv/tvguide` which requires a `?show=` param for per-show keyword scoring.

### TV Section

- `src/lib/services/tvRegistry.ts` — Hand-curated registry of TV shows with TMDB IDs and Fandom wiki configs. Lookup via `findTVWikiConfigByTmdbId()`.
- `src/lib/services/tvdb.ts` — TV show type definitions and client-side fetch helpers. **Named "tvdb" for legacy reasons — actually uses TMDB.**
- `src/lib/services/tvPollGenerator.ts` — Gemini prompts tuned for TV-themed polls.
- `src/app/api/tv/[id]/route.ts` — TMDB show detail fetcher. Appends `credits` and `recommendations` in a single call. Maps TMDB shapes to the internal `TVDBShowDetail` type.
- `src/app/api/tv/search/route.ts` — TMDB search passthrough.
- `src/app/api/tv/trending/route.ts` — TMDB trending/tv/week.
- `src/app/api/tv/briefing/route.ts` — Gemini-generated spoiler-free episode recap + characters. Returns `{ recap, characters }`.
- `src/app/api/tv/tvguide/route.ts` / `src/app/api/tv/metacritic/route.ts` — TV news aggregation (RSS + Metacritic backend).
- `src/app/api/tv/polls/route.ts` — TV-specific polls (shares the `polls` table with `category='tv'`).
- `src/components/TVShowDetailContent.tsx` — Shared TV show detail UI (hero, library, cast, **You Might Like**, episode guide with auto-expand, TVGuide articles). Auto-opens and scrolls to the latest season with watched episodes.
- `src/components/TVShowModalContext.tsx` — Modal provider for TV. Three views: show detail, wiki article (`WikiArticleView`), episode briefing (`BriefingView`). Use `useTVShowModal()` to get `openShow`, `openWikiArticle`, `openBriefing`.
- `src/components/TVPollCarousel.tsx`, `src/components/TVTrendingChats.tsx`, `src/components/TVGuideArticles.tsx` — TV equivalents of the reusable game widgets.
- `src/app/(app)/tv/page.tsx` — TV Discover.
- `src/app/(app)/tv/library/page.tsx` — TV Library (auth-gated).
- `src/app/(app)/tv/stats/page.tsx` — TV Stats dashboard (auth-gated).
- `src/app/(app)/tv/wiki/[show]/page.tsx` + `[page]/page.tsx` — Full-page TV wiki browse / article fallback.
- `supabase/migrations/007_tv_shows.sql` — `tv_shows`, `user_shows`, `tv_wiki_progress` tables with RLS.

## IGDB Gotchas

- **`game_time_to_beat` is not a field on `/games`** — fetch from `/game_time_to_beats` endpoint with `where game_id = X`
- **`external_games.category = 1` means Steam** — use this to find Steam app IDs for cross-linking reviews
- **IGDB IDs change between guesses and reality** — always verify IDs by calling `/api/games/igdb-{id}` before adding to the registry

## TMDB Gotchas

- **One call, multiple resources**: `/tv/{id}?append_to_response=credits,recommendations` returns detail + cast + similar-audience recommendations in a single request. Don't fan out.
- **`recommendations` ≠ `similar`**: `recommendations` is TMDB's audience-based "viewers also watched" — use this for "You Might Like". `similar` is tag-based and less interesting.
- **Season data is a second call**: Each season's episode list must be fetched via `/tv/{id}/season/{n}`. `api/tv/[id]/route.ts` parallelizes these with `Promise.all`.
- **ID prefix**: TV show IDs are prefixed `tmdb-{id}` throughout the app. Strip the prefix before calling TMDB.
- **Type names are legacy**: `TVDBShow` / `TVDBShowDetail` in `tvdb.ts` are kept for stability but the data comes from themoviedb.org, not thetvdb.com.

## Fandom Gotchas

- **`pageimages` API doesn't work on Fandom** — use the Nirvana ArticlesApi or scrape parsed HTML
- **Categories nest deeply** — `getCategory` must recursively expand subcategories to reach actual pages (e.g. "Fallout 4 characters" → subcats → real character names)
- **Images are hotlink-protected** — use the `/api/img` proxy
- **`getmap` action returns nothing** — Fandom interactive maps have no public API; use external map sites (Fextralife, UESP, fo4map.com) opened in new tab
- **`data-src` lazy loading** — Fandom uses data-src for images; swap to `src` before rendering wiki articles
- **Common categories don't always exist** — wikis like The Sims 4 have no "Characters" category. Auto detection falls back to fetching the wiki's actual top categories sorted by size, with junk filtering (broken links, hidden, cleanup)

## Auto Wiki Detection

For **games** not in the 16-game registry, the app auto-detects a Fandom wiki:

1. **AutoWikiCard** on game detail calls `/api/wiki-detect?title={gameTitle}`
2. The endpoint generates subdomain candidates from the title, checks each via Fandom's siteinfo API
3. If found, queries common category names; falls back to top categories from `allcategories` (sorted by size)
4. Card links to `/wiki/auto-{subdomain}?title={gameTitle}` (the title query is needed for the wiki page to refetch the config)
5. The wiki page detects the `auto-` prefix, fetches the config dynamically, and renders the same checklist UI as registry games

For **TV shows** not in `tvRegistry`, the same `/api/wiki-detect` endpoint is reused with the show title:

1. `TVShowDetailContent` calls `/api/wiki-detect?title={show.title}` as a fallback after checking the registry
2. If a wiki is found, progress is stored under `auto-tv-{tmdbId}` in `tv_wiki_progress`
3. Episode checkbox titles and character names link into the detected wiki via `WikiArticleView` inside the TV modal

## Episode Briefing

Each episode row in the TV modal episode guide has a "Briefing" button that opens a spoiler-free prep view:

1. `TVShowDetailContent` calls `openBriefing({ showTitle, season, episode, episodeTitle })`
2. `BriefingView` in `TVShowModalContext` fetches `/api/tv/briefing?show=...&season=...&episode=...&episodeTitle=...`
3. The API calls Gemini with a prompt that enforces "recap everything before this episode, NO spoilers of this episode" and returns `{ recap, characters[] }`
4. Rendered as two cards inside the modal: "Previously on..." and "Characters to Watch"

Uses `GEMINI_API_KEY` (same key as polls).

## Game-Specific News

Game detail pages show a News card filtered to articles mentioning the game:

- `/api/news?game={title}` filters RSS feeds (GameSpot, IGN, Kotaku)
- Strips stop words ("the", "of") from query and headlines
- Multi-word titles require all significant tokens to whole-word match
- Single-word titles need exact whole-word match
- Numbers and short words (Sims 4, GTA V) are kept as significant tokens

## Conventions

- **Always commit and push** after completing a feature or task — don't wait to be asked
- **Server components by default**, client components only where state/interactivity needed
- **Game registry is the source of truth** for curated game wikis — `GAME_REGISTRY` drives Home "For You" games, Games Discover trending, wiki configs, and cover art
- **TV registry is the source of truth** for curated TV wikis — `TV_SHOW_REGISTRY` drives TV Discover trending and wiki mappings; auto detection is the fallback for the long tail
- **Chat components accept `hideHeader`** — `<TrendingChats />` and `<TVTrendingChats />` both accept an optional `hideHeader?: boolean` prop so a parent section can own the heading. Used by `HomeFeaturedChats` to avoid duplicated h3s under the big "Live Now" wrapper.
- **No Gemini on the Home page** — the Home hub optimizes for low latency on first paint, so recommendations, polls surfaces, and news use free/cached sources (TMDB, Metacritic, IGDB registry, RSS). Gemini calls are reserved for per-game/per-show surfaces (episode briefings, poll generation, etc.)
- **Status colors**: playing/watching=primary purple, completed=success green, backlog=xp yellow, wishlist=accent teal, dropped=error red
- **All state changes save to Supabase immediately** — no "Save" buttons except for review text and playtime input
- **Bottom nav**: Home, TV, Games, Collections, Profile — Games highlights on `/explore`, `/library`, `/stats`, `/game`, `/wiki`; TV highlights on any `/tv/*` route
- **Top tabs** (within Games and within TV): Discover, Library, Stats
- **Brand wordmark**: always "Fan" in `text-yellow-400` + "Companion" in `text-primary`, wrapped inside a single `<span>` so flex `gap-*` on the parent doesn't split the two halves into separate flex items

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `IGDB_CLIENT_ID` (Twitch dev console)
- `IGDB_CLIENT_SECRET`
- `STEAM_API_KEY` (steamcommunity.com/dev/apikey)
- `GEMINI_API_KEY` (Google AI Studio — used for auto-generating community polls **and** episode briefings)
- `TMDB_API_KEY` (themoviedb.org — v3 API key for TV show data, cast, and recommendations)

## Common Tasks

- **Add a new wiki game to the registry**: Verify IGDB ID via `/api/games/igdb-{id}`, find Fandom wiki subdomain, identify category names that actually contain pages, add entry to `GAME_REGISTRY`
- **Add a new show to the TV registry**: Find the TMDB ID via `/api/tv/search?q={title}`, find the Fandom wiki subdomain, add entry to `TV_SHOW_REGISTRY` in `src/lib/services/tvRegistry.ts`
- **Add an icon for a wiki section**: Add a `{ keyword, icon }` entry to `ICON_KEYWORDS` in `src/app/(app)/wiki/[game]/page.tsx`. Order matters — more specific keywords first.
- **Run a Supabase migration**: Copy SQL from `supabase/migrations/`, paste into Supabase SQL Editor, run
- **Debug a game detail issue**: Check `/api/games/igdb-{id}` directly to see if IGDB is returning data
- **Debug a TV show detail**: Check `/api/tv/tmdb-{id}` directly to see the TMDB response shape
- **Debug the episode briefing**: Hit `/api/tv/briefing?show=...&season=1&episode=1&episodeTitle=Pilot` — errors typically come from Gemini JSON parsing or a missing `GEMINI_API_KEY`
- **Debug an auto wiki**: Check `/api/wiki-detect?wiki={subdomain}` to see what categories are detected
- **Build locally**: `npm run build` (delete `.next` first if you hit EPERM errors on Windows OneDrive)
