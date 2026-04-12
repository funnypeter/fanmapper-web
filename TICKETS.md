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

## 🔲 Home Section — Personalized Hub

The Home route (`/home`) is currently a "Coming soon" placeholder. Goal: turn it into the app's engagement anchor — an amalgamation of the best content from games, TV, polls, chats, news, and recommendations, tailored to the user when signed in.

**Design principles:**
- **Personalized first** — Continue + For You above the fold for returning users
- **Density over minimalism** — 8 sections, trim later based on usage
- **Chats prominently featured** — treated as a hero-style section with its own visual weight, not a small rail
- **Cross-media** — games and TV always mixed, since Home is the one place they converge
- **Free recommendation sources** — TMDB `recommendations` + IGDB `similar_games` / registry; no Gemini calls on Home (latency matters here)
- **Mobile-first** — horizontal rails, big tap targets, bottom nav already wired
- **Empty-state graceful** — logged-out users see trending/polls/chats previews instead of blank personalized rails

**Section order (top → bottom):**
1. Personalized Hero (FMW-300)
2. Continue (FMW-301)
3. Live Chats — Featured (FMW-302)
4. For You (FMW-303)
5. Trending Now (FMW-304)
6. Community Polls (FMW-305 — reuse existing carousels)
7. Recent Activity (FMW-306)
8. Latest News (FMW-307)

### FMW-300: Home Hero — Personalized Greeting [Core]
**Description:** Top-of-page hero with personalized greeting, time-of-day awareness, and a quick stats band.
**Acceptance Criteria:**
- Greeting tailored to time of day (Good morning / afternoon / evening / up late)
- Display name pulled from `profiles.display_name` (fallback to email prefix)
- Stat chips: games playing, shows watching, total games tracked, total shows tracked
- Logged-out state: hero pitch + CTAs to Sign Up / Browse Games / Browse TV
- Gradient background with blurred glow to match the brand
- Server component fetches the stats; client component handles rendering
**Estimate:** S

### FMW-301: Home Continue Row [Core]
**Description:** Horizontal scroll of in-progress games and shows, interleaved. Most engagement-critical section — this is why users return daily.
**Acceptance Criteria:**
- Query `user_games` where status='playing' + `user_shows` where status='watching', ordered by `updated_at desc`
- Interleave so games and shows mix (not two separate rails)
- Each card shows cover art, title, a "Game" or "TV" badge, and a subtitle (`{hours}h played` or `S{n} · E{n}`)
- Clicking a card opens the existing game modal or TV show modal (use `useGameModal().openGame` / `useTVShowModal().openShow`)
- Hide the entire section when there are zero in-progress items
- Logged-out: section doesn't render at all
**Estimate:** M

### FMW-302: Home Featured Chats [Core — prominently featured]
**Description:** Live Chats is the signature section on Home — bigger visual treatment than on Explore/TV Discover pages.
**Acceptance Criteria:**
- Wrapped in a gradient card with "🔴 Live Now — Join the conversation" as a 2xl/3xl heading
- Subtitle emphasizing community activity ("Thousands of fans are talking right now")
- Stacks `<TrendingChats />` (games) and `<TVTrendingChats />` (TV) with small "🎮 Games" and "📺 TV Shows" labels between them
- Reuses existing chat components as-is; no new data sources needed
- Red/error glow accent + primary glow to make the section visually dominant
- Consider extracting shared chat data to `src/lib/data/chatRooms.ts` as a future refactor
**Estimate:** S (it's a wrapper; the heavy lifting is already built)

### FMW-303: Home For You — Cross-Media Recommendations [Core]
**Description:** Hand-picked games and shows based on the user's library (or trending when empty).
**Acceptance Criteria:**
- If logged in with library items: pull recommendations for the user's top show via TMDB `/tv/{id}/recommendations` (already cached in `/api/tv/[id]`) and similar games via a new `similar_games` field on `/api/games/[id]` (add to IGDB query) or fall back to `GAME_REGISTRY` shuffled by genre overlap
- If logged out / empty library: fall back to trending games + trending shows (same sources as FMW-304)
- Two horizontal rails: Games (120px wide), Shows (120px wide)
- Each card clicks into the respective modal
- Header: "For You" with subcopy "Hand-picked based on {top_show or top_genre}"
**Estimate:** M

### FMW-304: Home Trending Now [Core]
**Description:** What the rest of the community is engaging with right now.
**Acceptance Criteria:**
- Games rail: `/api/metacritic` top-scored recent releases (existing endpoint)
- Shows rail: `/api/tv/trending` TMDB weekly trending (existing endpoint)
- Metacritic cards open metacritic external link (no internal ID); TMDB trending cards open the TV modal
- Score badges on cards where available
- Header: "Trending Now" with a small "updated weekly" or "live" timestamp
**Estimate:** S

### FMW-305: Home Community Polls [Reuse]
**Description:** Drop `<PollCarousel />` and `<TVPollCarousel />` onto the Home page, stacked.
**Acceptance Criteria:**
- Both existing carousels render with their built-in empty-state handling
- No new code beyond imports — these widgets are already self-fetching and self-contained
- Consider a subtle section wrapper/divider if visual continuity suffers
**Estimate:** XS

### FMW-306: Home Recent Activity [Feature]
**Description:** Feed of the user's recent actions — games updated, shows updated, episodes checked, achievements unlocked.
**Acceptance Criteria:**
- Query `user_games` + `user_shows` ordered by `updated_at desc`, limit 10
- Also pull recent `tv_wiki_progress` rows (last 5 episodes checked)
- Each activity item: icon, short sentence, relative timestamp ("2h ago")
- Clicking an item opens the relevant modal or wiki view
- Logged-out: section hidden entirely
**Estimate:** M

### FMW-307: Home News Feed [Feature]
**Description:** Interleaved game + TV news from GameSpot, IGN, Kotaku, TVGuide feeds.
**Acceptance Criteria:**
- Fetch `/api/news` (games) + `/api/tv/tvguide` in parallel
- Interleave so articles alternate between game and TV sources
- Filter chip at the top: All / Games / TV
- Cards show thumbnail, headline, source logo, relative time
- Link out to the article in a new tab
- Limit to ~12 items initially with a "See more" link
**Estimate:** M

### FMW-308: Home Page Orchestrator + Layout [Core — ties it all together]
**Description:** The Home server component that assembles all sections, handles logged-in vs logged-out branching, and manages section ordering + empty-state hiding.
**Acceptance Criteria:**
- `src/app/(app)/home/page.tsx` — server component
- Fetches user + basic stats in parallel using `Promise.all`
- Passes `userId` and counts down to the client components
- Section order matches the design principles doc at the top of this section
- Logged-out: skips `HomeContinue` and `HomeRecentActivity` entirely (no empty shells)
- All sections wrapped in `<div className="space-y-12">` for consistent spacing
- Bottom nav "Home" already points at `/home` — no nav changes needed
**Estimate:** S

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

## Upcoming Sprints

**Sprint 13: Home Section — Personalized Hub [NEXT]**
- FMW-308: Page orchestrator + layout (scaffold first)
- FMW-300: Personalized hero
- FMW-301: Continue row
- FMW-302: Featured chats (prominent)
- FMW-303: For You recommendations
- FMW-304: Trending now
- FMW-305: Community polls (drop-in)
- FMW-306: Recent activity
- FMW-307: News feed

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
