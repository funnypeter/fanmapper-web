# FanMapper Web

A Next.js web app for tracking game libraries with Fandom wiki integration, Steam imports, achievements, and interactive maps.

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
- **Wiki progress dual-stored**: localStorage (instant) + Supabase wiki_progress table (cross-device sync)
- **Routes are public by default**: Only `/library`, `/profile`, `/profile/*` require auth via middleware

## Critical Files

- `src/lib/services/gameRegistry.ts` — Hand-curated registry of 16 games with verified IGDB IDs and Fandom wiki configs. **Always verify IGDB IDs against the live API before adding** — IGDB IDs are NOT what you'd guess.
- `src/lib/services/fandom.ts` — Fandom API client with `getCategory` that recursively expands subcategories (Fandom nests real pages 2-3 levels deep)
- `src/app/api/games/[id]/route.ts` — IGDB game fetcher. The `game_time_to_beat` field is NOT valid in `/games` endpoint — must query `/game_time_to_beats` separately
- `src/app/(app)/wiki/[game]/page.tsx` — Wiki checklist UI with Supabase + localStorage sync
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

## Conventions

- **Server components by default**, client components only where state/interactivity needed
- **Game registry is the source of truth** — Home page trending games, wiki configs, and cover art all pull from `GAME_REGISTRY`
- **Status colors**: playing=primary purple, completed=success green, backlog=xp yellow, wishlist=accent teal, dropped=error red
- **All state changes save to Supabase immediately** — no "Save" buttons except for review text and playtime input
- **Bottom nav** instead of top nav — Home (house icon), Library (stack icon), Profile (person icon)

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `IGDB_CLIENT_ID` (Twitch dev console)
- `IGDB_CLIENT_SECRET`
- `STEAM_API_KEY` (steamcommunity.com/dev/apikey)

## Common Tasks

- **Add a new wiki game**: Verify IGDB ID via `/api/games/igdb-{id}`, find Fandom wiki subdomain, identify category names that actually contain pages (test with `/api/query?action=query&list=categorymembers`), add entry to `GAME_REGISTRY`
- **Run a Supabase migration**: Copy SQL from `supabase/migrations/`, paste into Supabase SQL Editor, run
- **Debug a game detail issue**: Check `/api/games/igdb-{id}` directly to see if IGDB is returning data
- **Build locally**: `npm run build` (delete `.next` first if you hit EPERM errors on Windows OneDrive)
