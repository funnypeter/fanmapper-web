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
