# FanMapper Web

A Next.js web app for tracking game libraries with Fandom wiki integration, Steam imports, achievements, interactive maps, stats dashboard, and game-specific news.

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
- **Game IDs are prefixed**: `igdb-{id}` for IGDB games, `steam-{appid}` for Steam imports — this distinguishes sources throughout the app
- **Wiki keys are prefixed too**: `auto-{wiki}` for auto-detected wikis (e.g. `auto-thesims4`); plain keys (`elden-ring`, `skyrim`) for the 16 hand-curated registry entries
- **Wiki progress dual-stored**: localStorage (instant) + Supabase wiki_progress table (cross-device sync)
- **Routes are public by default**: Only `/library`, `/profile`, `/profile/*`, `/stats` require auth via middleware

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
- `src/middleware.ts` — Auth-protected route logic
- `supabase/migrations/` — SQL migrations (run manually in Supabase SQL Editor; not auto-applied)

## IGDB Gotchas

- **`game_time_to_beat` is not a field on `/games`** — fetch from `/game_time_to_beats` endpoint with `where game_id = X`
- **`external_games.category = 1` means Steam** — use this to find Steam app IDs for cross-linking reviews
- **IGDB IDs change between guesses and reality** — always verify IDs by calling `/api/games/igdb-{id}` before adding to the registry

## Fandom Gotchas

- **`pageimages` API doesn't work on Fandom** — use the Nirvana ArticlesApi or scrape parsed HTML
- **Categories nest deeply** — `getCategory` must recursively expand subcategories to reach actual pages (e.g. "Fallout 4 characters" → subcats → real character names)
- **Images are hotlink-protected** — use the `/api/img` proxy
- **`getmap` action returns nothing** — Fandom interactive maps have no public API; use external map sites (Fextralife, UESP, fo4map.com) opened in new tab
- **`data-src` lazy loading** — Fandom uses data-src for images; swap to `src` before rendering wiki articles
- **Common categories don't always exist** — wikis like The Sims 4 have no "Characters" category. Auto detection falls back to fetching the wiki's actual top categories sorted by size, with junk filtering (broken links, hidden, cleanup)

## Auto Wiki Detection

For games not in the 16-game registry, the app auto-detects a Fandom wiki:

1. **AutoWikiCard** on game detail calls `/api/wiki-detect?title={gameTitle}`
2. The endpoint generates subdomain candidates from the title, checks each via Fandom's siteinfo API
3. If found, queries common category names; falls back to top categories from `allcategories` (sorted by size)
4. Card links to `/wiki/auto-{subdomain}?title={gameTitle}` (the title query is needed for the wiki page to refetch the config)
5. The wiki page detects the `auto-` prefix, fetches the config dynamically, and renders the same checklist UI as registry games

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
- **Game registry is the source of truth** — Home page trending games, wiki configs, and cover art all pull from `GAME_REGISTRY`
- **Status colors**: playing=primary purple, completed=success green, backlog=xp yellow, wishlist=accent teal, dropped=error red
- **All state changes save to Supabase immediately** — no "Save" buttons except for review text and playtime input
- **Bottom nav**: Home (house), Library (stack), Stats (chart), Profile (person)

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `IGDB_CLIENT_ID` (Twitch dev console)
- `IGDB_CLIENT_SECRET`
- `STEAM_API_KEY` (steamcommunity.com/dev/apikey)
- `GEMINI_API_KEY` (Google AI Studio — used for auto-generating community polls)

## Common Tasks

- **Add a new wiki game to the registry**: Verify IGDB ID via `/api/games/igdb-{id}`, find Fandom wiki subdomain, identify category names that actually contain pages, add entry to `GAME_REGISTRY`
- **Add an icon for a wiki section**: Add a `{ keyword, icon }` entry to `ICON_KEYWORDS` in `src/app/(app)/wiki/[game]/page.tsx`. Order matters — more specific keywords first.
- **Run a Supabase migration**: Copy SQL from `supabase/migrations/`, paste into Supabase SQL Editor, run
- **Debug a game detail issue**: Check `/api/games/igdb-{id}` directly to see if IGDB is returning data
- **Debug an auto wiki**: Check `/api/wiki-detect?wiki={subdomain}` to see what categories are detected
- **Build locally**: `npm run build` (delete `.next` first if you hit EPERM errors on Windows OneDrive)
