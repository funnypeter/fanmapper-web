# FanCompanion — Project Tickets

**Status: ✅ Done | 🔲 Todo**

---

## ✅ Built (V1)

### Core App
- ✅ Next.js 16 + TypeScript + Tailwind CSS + Supabase + Vercel
- ✅ Dark theme with custom design tokens (gaming-inspired palette)
- ✅ Bottom navigation (Home, Library, Profile) with SVG icons
- ✅ PWA manifest, app icon, "Add to Home Screen" support
- ✅ Auth: signup, login, logout (Supabase)
- ✅ Auth-protected routes via middleware
- ✅ Public routes: /, /explore, /wiki, /game, /map

### Home (Explore)
- ✅ Hero search with debounced live filtering
- ✅ Genre quick-filter chips
- ✅ Trending Games grid (10 supported titles with cover art)
- ✅ Gaming News section (GameSpot, IGN, Kotaku RSS feeds)
- ✅ Live game search via IGDB API

### Game Detail
- ✅ HowLongToBeat times (Main Story, Main + Extras, Completionist)
- ✅ Hero with cover art, blurred background, rating, genres, platforms
- ✅ Add to Library button (single tap)
- ✅ In Library badge with Your Progress section
- ✅ Status picker (Playing, Completed, Backlog, Wishlist, Dropped)
- ✅ Star rating (1-5) with hover preview
- ✅ Playtime editor (hours)
- ✅ Remove from Library button
- ✅ Quick action cards: Track Progress (wiki), Interactive Map, Achievements
- ✅ YouTube videos (horizontal scroll, from IGDB)
- ✅ Screenshots (horizontal scroll)
- ✅ Steam reviews (real reviews from Steam API)
- ✅ User reviews (write/read with star rating)
- ✅ About/summary section

### Library
- ✅ Cover art grid with status badges
- ✅ Filter chips by status (with counts)
- ✅ Sort: Recent, A-Z, Playtime, Rating
- ✅ Empty state with Explore CTA
- ✅ Image fallback for broken covers

### Wiki Progress Tracking (16 supported games)
- ✅ Elden Ring, Skyrim, Fallout 4, Genshin Impact, Zelda TotK
- ✅ The Witcher 3, GTA V, God of War, Hades, Stardew Valley
- ✅ Baldur's Gate 3, Cyberpunk 2077, Minecraft, Starfield, Outer Wilds
- ✅ Cloud-synced checkmarks (Supabase wiki_progress table)
- ✅ Section tabs with category-specific icons
- ✅ Live filter search within active section
- ✅ Recursive subcategory expansion (finds real character/item pages)
- ✅ Checkboxes with localStorage persistence per game
- ✅ Progress bar showing checked/total
- ✅ Wiki article viewer with styled tables, infoboxes, images
- ✅ Image proxy to bypass Fandom hotlink protection

### Interactive Maps (5 games)
- ✅ Elden Ring (Fextralife), Skyrim (UESP), Fallout 4 (fo4map.com)
- ✅ Genshin Impact (HoYoLAB), Zelda TotK (Zelda Dungeon)
- ✅ Opens in new tab to avoid iframe blocking

### Steam Integration
- ✅ Sign in with Steam (OpenID, no manual SteamID64 entry)
- ✅ Profile preview with avatar
- ✅ Import games + playtime + achievements
- ✅ Live progress bar during import
- ✅ Re-sync button
- ✅ Unlink Steam account
- ✅ Server-side API key proxy
- ✅ Status auto-set: playing if recent activity, otherwise backlog

### Achievements
- ✅ Per-game achievement page with progress bar
- ✅ Filter: All, Earned, Unearned
- ✅ Achievement cards with icons, descriptions, earned dates
- ✅ Global unlock percentage display
- ✅ Empty state when no achievements imported

### Profile
- ✅ Avatar (gradient initial)
- ✅ Stats: Games, Hours Played, Achievements, Completion %
- ✅ Currently Playing thumbnails
- ✅ Linked Platforms (Steam connect/re-sync/unlink)
- ✅ PSN linking page (placeholder, import coming)
- ✅ Sign Out

### Stats Dashboard
- ✅ Top stats grid: Games, Hours, Completed, Completion %
- ✅ Status breakdown bars
- ✅ Top genres bar chart
- ✅ Most played leaderboard
- ✅ Highest rated games

### Discovery
- ✅ Game-specific news (filtered RSS on game detail page)
- ✅ Auto wiki detection (Fandom wiki lookup for any game)
- ✅ Auto wikis use the in-app tracking experience (checklists, search, cloud sync)
- ✅ Smart category detection: tries common names, falls back to wiki's top categories
- ✅ Junk category filtering (broken links, hidden, cleanup, etc.)
- ✅ Smart icon mapping (90+ keywords) for auto-detected sections
- ✅ Article viewer works for both registry and auto wikis

---

## ✅ Home Section — Personalized Hub [SHIPPED]

The `/home` route is now the app's engagement anchor — 8 stacked sections that amalgamate games, TV, polls, chats, news, and recommendations, tailored to the user when signed in.

**Design principles (codified during build):**
- Personalized first (Continue + For You above the fold for returning users)
- Density over minimalism (8 sections, trim later based on usage)
- Chats prominently featured (hero-style gradient wrapper, not a small rail)
- Cross-media — games and TV always mixed
- Free recommendation sources only (TMDB `recommendations`, IGDB similar, registry fallback — no Gemini on Home)
- Mobile-first horizontal rails
- Empty-state graceful — logged-out skips Continue + Recent Activity entirely

**Shipped section order (`src/app/(app)/home/page.tsx`):**
1. Personalized Hero
2. Continue (logged-in only)
3. Live Chats — Featured
4. For You
5. Trending Now
6. Community Polls (both carousels)
7. Recent Activity (logged-in only)
8. Latest News

### ✅ FMW-300: Home Hero — Personalized Greeting [DONE]
Time-of-day greeting, display name from `profiles.display_name`, stat chips (Playing / Watching / Games Tracked / Shows Tracked). Logged-out state shows a pitch + Sign Up / Browse Games / Browse TV CTAs. Gradient card with blurred glow.
- `src/components/home/HomeHero.tsx`
- `src/app/(app)/home/page.tsx` fetches counts in parallel server-side

### ✅ FMW-301: Home Continue Row [DONE]
Interleaved horizontal scroll of in-progress games and shows, sorted by most-recent `updated_at`. Cards carry a Game/TV badge and subtitle (hours played or `S{n} · E{n}`). Click opens the respective modal. Hidden when empty or signed out.
- `src/components/home/HomeContinue.tsx`

### ✅ FMW-302: Home Featured Chats [DONE]
Prominent gradient-wrapped section with "🔴 Live Now — Join the conversation" heading. Stacks `<TrendingChats />` and `<TVTrendingChats />` with 🎮 Games / 📺 TV Shows sub-labels. Added `hideHeader?: boolean` prop to both chat components so the Home wrapper owns the big section title without duplicating the internal h3.
- `src/components/home/HomeFeaturedChats.tsx`
- Updated: `src/components/TrendingChats.tsx`, `src/components/TVTrendingChats.tsx`

### ✅ FMW-303: Home For You [DONE]
Two horizontal rails: 8 curated games from `GAME_REGISTRY` + 8 TMDB trending shows. Cards click into modals. Framing flips between "Hand-picked..." (logged in) and "Sign in to get personalized picks..." (logged out). Follow-up: layer on top-show / top-genre signals for true personalization.
- `src/components/home/HomeForYou.tsx`

### ✅ FMW-304: Home Trending Now [DONE]
Metacritic top-scored games + TV shows in two rails with color-coded score badges (green 85+, yellow 70+, orange 50+, red below). External Metacritic links since Metacritic items don't carry internal IDs.
- `src/components/home/HomeTrending.tsx`

### ✅ FMW-305: Home Community Polls [DONE]
Dropped `<PollCarousel />` and `<TVPollCarousel />` into the Home page. No wrapping needed — both widgets self-fetch and return null when empty.

### ✅ FMW-306: Home Recent Activity [DONE]
Unified timeline of last 6 `user_games` updates, 6 `user_shows` updates, and 5 `tv_wiki_progress` episode checks, sorted by timestamp. Relative times (just now / 2h ago / 3d ago). Game/show rows open the modal; episode-check rows are read-only for now.
- `src/components/home/HomeRecentActivity.tsx`

### ✅ FMW-307: Home News Feed [DONE]
Interleaved games + TV news with All / Games / TV filter pills. Games from `/api/news` (GameSpot, IGN, Kotaku); TV from a new `/api/tv/news` (TVLine, Deadline, unfiltered). Cards show thumbnail, headline, kind badge, source, and relative time. Capped at 12 per view.
- `src/components/home/HomeNewsFeed.tsx`
- `src/app/api/tv/news/route.ts` (new lightweight endpoint — the existing `/api/tv/tvguide` requires a `show` param and runs per-show keyword scoring, so it was not usable here)

### ✅ FMW-308: Home Page Orchestrator [DONE]
`src/app/(app)/home/page.tsx` — server component. Fetches user + profile + 4 counts in parallel via `Promise.all`, passes `userId` down to client sections. Logged-out branches skip `HomeContinue` and `HomeRecentActivity` entirely. All sections share `space-y-12` spacing.

---

## ✅ Sprint 14: Home Polish + Cross-Cutting Fixes [SHIPPED]

### ✅ FMW-400: Ask FanCompanion — Wiki Chatbot Search Bar [DONE]
RAG-powered Q&A on the Home page. Gemini extracts topic + query, `detectWiki()` finds the Fandom wiki, `searchWiki` + `fetchPage` retrieve content, Gemini synthesizes a concise answer. Collapsible answer card with source links that open an in-app wiki modal.
- `src/app/api/wiki-chat/route.ts` — POST endpoint (2 Gemini calls + Fandom fetch)
- `src/app/api/wiki-page/route.ts` — GET proxy for server-side wiki page fetch (avoids CORS)
- `src/lib/services/wikiDetect.ts` — shared `generateCandidates`, `checkWikiExists`, `detectWiki` (extracted from wiki-detect)
- `src/components/home/HomeWikiChat.tsx` — search bar, rotating hints, collapsible answer, WikiModal

### ✅ FMW-401: GameSpot Guide Card [DONE]
Gemini with Google Search grounding finds GameSpot guides for games. Shows a thumbnail card above Track Progress in the game detail modal linking to the guide. 24h cache. Falls back to gemini-2.0-flash on 503.
- `src/app/api/gamespot/guide/route.ts`
- `src/components/GameSpotGuide.tsx`
- Inserted into `src/components/GameDetailContent.tsx`

### ✅ FMW-402: Episode Briefing Polish [DONE]
Improved Characters to Watch section: name on its own line with border dividers, description bumped to text-secondary, characters clickable to open wiki articles when a wiki is available. Added `wikiSubdomain` to BriefingParams.

### ✅ FMW-403: Fix Wiki Detection for Franchise Titles [DONE]
`generateCandidates` now extracts franchise prefix before `:` or ` - `, and tries first-two/first-three word combos. Fixes "Star Wars: Maul" hitting `star.fandom.com` instead of `starwars.fandom.com`.

### ✅ FMW-404: Fix Back Navigation Stack [DONE]
Wiki → Briefing → Show Detail now peels one layer at a time. `openWikiArticle` no longer clears `briefingView`. Browser back button respects the 3-level stack.

### ✅ FMW-405: Fix Game Modal Route Navigation [DONE]
Game modal now auto-closes on route change (Track Progress, Interactive Map, Achievements links were navigating behind the modal). Added `usePathname` listener to `GameModalContext`.

### ✅ FMW-406: Collections Board [DONE]
Pinterest-style collection boards with 2x2 thumbnail collage covers. 8 themed boards (Elden Ring, Gaming Setup, TV Merch, Collector's Editions, Fan Art, Zelda, Cozy Gaming, Bookshelf). Tap to open, masonry grid of items with heart/save, tags, prices, store attribution.
- `src/app/(app)/collections/page.tsx`

### ✅ FMW-407: Home Section Polish [DONE]
- Metacritic inline badge on Trending Now header
- Unified Community Polls under one heading with 🎮 Games / 📺 TV sub-labels
- Added `hideHeader` prop to `PollCarousel` and `TVPollCarousel`

### 🔲 FMW-500: Detailed Guides Carousel from Game Data Service [TODO]
For games with `hasDetailedGameData` flag, fetch guides from `game-data-two.vercel.app/game/<key>` and display a horizontal carousel (image + title + link) above Videos on the game detail page. Falls back to the Gemini-powered GameSpot Guide card on 404.
- `src/lib/services/gameRegistry.ts` — added `hasDetailedGameData` flag to `GameWikiConfig`, enabled for Cyberpunk 2077
- `src/components/GameGuidesCarousel.tsx` — new carousel component with 404 fallback to `GameSpotGuide`
- `src/components/GameDetailContent.tsx` — conditionally render carousel (above Videos) vs old guide card

### 🔲 FMW-501: Cyberpunk 2077 Build Planner [TODO]
Mobile-friendly build planner for Cyberpunk 2077. Card on game detail page opens a full-screen overlay with level/attribute/perk management. Attributes shown as expandable rows with +/- controls; perks listed inside expanded sections. Includes 4 recommended builds (Netrunner, Samurai, Solo, Ninja).
- `src/components/Cyberpunk2077BuildPlanner.tsx` — full planner UI with attribute/perk state management
- `src/components/BuildPlannerCard.tsx` — entry-point card, renders on game detail when `hasDetailedGameData` is set

### 🔲 FMW-502: Latest Patch + Developer Updates from Game Data Service [TODO]
Added "Latest Game Update" (featured card for most recent patch) and "Updates from the Developers" (carousel) sections to the game detail page for games with `hasDetailedGameData`. Refactored `GameGuidesCarousel` to fetch the game-data API once and render all three sections (patch, guides, dev updates). Falls back to Gemini GameSpot guide if 404.
- `src/components/GameGuidesCarousel.tsx` — single fetch, renders LatestPatch + Guides carousel + Dev Updates carousel

---

## 🔲 Backlog

### ✅ FMW-100: Game Wiki Auto-Detection [DONE]

### FMW-101: PSN Trophy Import [P1]
**Description:** Implement actual PSN NPSSO token import (currently placeholder).
**Acceptance Criteria:**
- Server-side proxy to PSN API
- Handle NPSSO token securely
- Import trophy titles + per-game trophies
- Rate limit appropriately
**Estimate:** L

### FMW-102: Xbox Integration [P2]
**Description:** Microsoft OAuth flow for Xbox achievement sync.
**Estimate:** L

### FMW-103: Friends & Activity Feed [P2]
**Description:** Follow other users, see their library activity in a feed.
**Acceptance Criteria:**
- Search/follow users
- Activity items: status changes, completions, achievements
- Public profile pages
**Estimate:** L

### ✅ FMW-104: HowLongToBeat Integration [DONE]
### ✅ FMW-107: Add More Wiki Games [DONE — 6 added, 16 total]
### ✅ FMW-109: Cloud Save Sync [DONE]

### ✅ FMW-105: Game-Specific News [DONE]
### ✅ FMW-106: Stats Dashboard [DONE]

### FMW-108: Library Bulk Actions [P2]
**Description:** Select multiple games to bulk-change status, export, or delete.
**Estimate:** M

### FMW-110: Notifications [P2]
**Description:** Browser push notifications for friend activity, news on tracked games.
**Estimate:** L

### FMW-111: Offline PWA Mode [P2]
**Description:** Service worker to cache library and wiki pages for offline viewing.
**Estimate:** M

### FMW-112: Game Bundles & Series [P2]
**Description:** Group related games (e.g., trilogies, DLC).
**Estimate:** M

### FMW-113: Custom Lists / Tags [P2]
**Description:** User-created lists beyond the 5 default statuses.
**Estimate:** M

---

## ✅ TV Section (Feature Parity with Games)

### ✅ FMW-200: TMDB API Integration [DONE]
**Shipped with TMDB (themoviedb.org), not TVDB.** Interfaces like `TVDBShow` / `TVDBShowDetail` are legacy names — all endpoints hit `api.themoviedb.org`.
- `src/lib/services/tvdb.ts`, `src/app/api/tv/search/route.ts`, `src/app/api/tv/[id]/route.ts`
- Show IDs prefixed `tmdb-{id}`

### ✅ FMW-201: TV Database Schema [DONE]
- `supabase/migrations/007_tv_shows.sql` — `tv_shows`, `user_shows`, `tv_wiki_progress` with full RLS

### ✅ FMW-202: TV Discover Page [DONE]
- `src/app/(app)/tv/page.tsx` — search, trending, polls, chats, Metacritic, TVGuide feeds

### ✅ FMW-203: TV Show Detail Modal [DONE]
- `src/components/TVShowDetailContent.tsx`, `src/components/TVShowModalContext.tsx`
- Hero, library management, cast, episode guide, per-show chat, TVGuide articles

### ✅ FMW-204: Episode Wiki Content [DONE]
- `WikiArticleView` in `src/components/TVShowModalContext.tsx` (in-modal wiki view)
- Full-page fallback at `src/app/(app)/tv/wiki/[show]/[page]/page.tsx`

### ✅ FMW-205: TV Show Registry [DONE]
- `src/lib/services/tvRegistry.ts` — curated shows with TMDB IDs + Fandom wiki configs
- Lookup via `findTVWikiConfigByTmdbId()`

### ✅ FMW-206: TV Library Page [DONE]
- `src/app/(app)/tv/library/page.tsx` — grid, status filters, sort, progress badges

### ✅ FMW-207: TV Stats Dashboard [DONE]
- `src/app/(app)/tv/stats/page.tsx` — shows/episodes/completion/genres/top-rated

### ✅ FMW-208: TV Polls [DONE]
- `src/app/api/tv/polls/route.ts`, `src/components/TVPollCarousel.tsx`, `src/lib/services/tvPollGenerator.ts`
- `polls` table gained `category` column ('gaming' | 'tv')

### ✅ FMW-209: TV Trending Chats [DONE]
- `src/components/TVTrendingChats.tsx` — animated chat rooms for popular shows

### ✅ FMW-210: TV News — TVGuide & Metacritic [DONE]
- `src/app/api/tv/tvguide/route.ts`, `src/app/api/tv/metacritic/route.ts`, `src/components/TVGuideArticles.tsx`

### ✅ FMW-211: TV Navigation Integration [DONE]
- `BottomNav.tsx` TV tab, `TopNav.tsx` TV_TABS, middleware updates for public TV routes

### ✅ FMW-212: TV Wiki Progress Tracking [DONE]
- Episode checkboxes dual-stored (localStorage + `tv_wiki_progress`)
- Season + overall progress bars in `TVShowDetailContent.tsx`

### ✅ FMW-213: Episode Briefing [DONE]
Gemini-generated spoiler-free recap + "characters to watch" for any episode.
- `src/app/api/tv/briefing/route.ts`
- `BriefingView` in `src/components/TVShowModalContext.tsx`
- Triggered by per-episode "Briefing" button in the episode guide

### ✅ FMW-214: "You Might Like" Recommendations [DONE]
Horizontal card scroll of up to 8 similar shows on the TV show modal.
- TMDB `append_to_response=recommendations` in `src/app/api/tv/[id]/route.ts`
- Rendered in `src/components/TVShowDetailContent.tsx` after the Cast section
- Clicking a card swaps the modal to that show via `openShow(id)`

### ✅ FMW-215: Smart Season Auto-Expand [DONE]
Episode guide auto-opens the latest season with watched episodes (or the last season) and auto-scrolls to it on modal open.
- `TVShowDetailContent.tsx` — `expandedSeason` state + `expandedSeasonRef`

### ✅ FMW-216: TV Auto Wiki Detection [DONE]
Shows not in `tvRegistry` auto-detect a Fandom wiki via `/api/wiki-detect` and store progress under `auto-tv-{tmdbId}`.
- Fallback logic in `src/components/TVShowDetailContent.tsx`

### ✅ FMW-217: Rebrand to FanCompanion [DONE]
- New flame icon across all sizes (`public/icon-*.png`, `public/apple-touch-icon.png`, `public/favicon-*.png`, `src/app/favicon.ico`)
- Wordmark: yellow "Fan" + purple "Companion" wrapped in a single flex item (avoids gap splitting)
- Updated `public/manifest.json`, `src/app/layout.tsx` metadata
- Wordmark applied in `src/app/(app)/layout.tsx`, `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/page.tsx`

---

## Sprint History

**✅ Sprint 4: Polish & Quality of Life [DONE]**
- FMW-104: HowLongToBeat times
- FMW-107: Added 6 games (now 16 total)
- FMW-109: Cloud-synced wiki progress

**✅ Sprint 7: Stats & Discovery [DONE]**
- FMW-106: Stats dashboard
- FMW-105: Game-specific news
- FMW-100: Game wiki auto-detection

**✅ Sprint 8: TV Section — Foundation [DONE]**
- FMW-201: TV database schema
- FMW-200: TMDB API integration
- FMW-205: TV show registry

**✅ Sprint 9: TV Section — Core Pages [DONE]**
- FMW-202: TV Discover page
- FMW-203: TV show detail modal
- FMW-204: Episode wiki content
- FMW-206: TV Library page
- FMW-211: TV navigation integration

**✅ Sprint 10: TV Section — Features [DONE]**
- FMW-208: TV polls
- FMW-209: TV trending chats
- FMW-210: TVGuide & Metacritic
- FMW-212: TV wiki progress tracking
- FMW-207: TV stats dashboard

**✅ Sprint 12: TV Polish + Rebrand [DONE]**
- FMW-213: Episode Briefing (Gemini spoiler-free recap)
- FMW-214: "You Might Like" recommendations
- FMW-215: Smart season auto-expand
- FMW-216: TV auto wiki detection
- FMW-217: Rebrand to FanCompanion

**✅ Sprint 13: Home Section — Personalized Hub [DONE]**
- FMW-300: Personalized hero
- FMW-301: Continue row
- FMW-302: Featured chats (prominent)
- FMW-303: For You recommendations
- FMW-304: Trending now
- FMW-305: Community polls (drop-in)
- FMW-306: Recent activity
- FMW-307: News feed
- FMW-308: Page orchestrator + layout

**✅ Sprint 14: Home Polish + Cross-Cutting Fixes [DONE]**
- FMW-400: Ask FanCompanion chatbot
- FMW-401: GameSpot Guide card
- FMW-402: Episode Briefing polish
- FMW-403: Franchise wiki detection fix
- FMW-404: Back navigation stack fix
- FMW-405: Game modal route navigation fix
- FMW-406: Collections board
- FMW-407: Home section polish (Metacritic badge, unified polls)

**🔲 Sprint 15: Game Data Service Integration**
- FMW-500: Detailed guides carousel from game-data service
- FMW-501: Cyberpunk 2077 build planner
- FMW-502: Latest patch + developer updates sections from game-data service

## Upcoming Sprints

**Sprint 5: Platform Expansion**
- FMW-101: Real PSN trophy import
- FMW-102: Xbox integration

**Sprint 6: Social**
- FMW-103: Friends & activity feed
- FMW-110: Notifications

**Sprint 11: Power User Features**
- FMW-108: Library bulk actions
- FMW-111: Offline PWA mode
- FMW-113: Custom lists / tags
