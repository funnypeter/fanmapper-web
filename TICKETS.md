# FanMapper Web — Project Tickets

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

## 🔲 TV Section (Feature Parity with Games)

### FMW-200: TVDB API Integration [Foundation]
**Description:** Create TVDB API client and search/detail endpoints, mirroring the IGDB pattern.
**Acceptance Criteria:**
- `src/lib/services/tvdb.ts` — Client-side service with `searchShows(query)` and `getShowDetails(id)`
- `POST /api/tv/search` — Search TVDB for shows (title, poster, genres, network, year)
- `GET /api/tv/[id]` — Show detail (title, poster, genres, network, cast, seasons/episodes, summary, rating)
- TVDB auth token caching (same pattern as IGDB Twitch token)
- Show IDs prefixed as `tvdb-{id}`
**Estimate:** M

### FMW-201: TV Database Schema [Foundation]
**Description:** Supabase migration for TV show tables.
**Acceptance Criteria:**
- `tv_shows` table (id, tvdb_id, title, poster_url, genres, network, release_date, summary)
- `user_shows` table (id, user_id, show_id, status, rating, review, current_season, current_episode) — statuses: watching, completed, backlog, wishlist, dropped
- `tv_wiki_progress` table (id, user_id, show_key, page_id, page_title, checked_at)
- RLS policies mirroring game tables
- Migration: `supabase/migrations/007_tv_shows.sql`
**Estimate:** S

### FMW-202: TV Discover Page [Core]
**Description:** Create the TV Discover page at `/tv` with search, trending shows, polls, chats, Metacritic, and TVGuide sections.
**Acceptance Criteria:**
- Hero search with debounced TVDB search
- TV Poll carousel (TV-specific polls via Gemini)
- Trending Chats for TV (mocked: House of the Dragon, Severance, The Last of Us, Squid Game, etc.)
- Trending on Metacritic (TV shows via `productType=tv`)
- Trending on TVGuide (RSS + Gemini relevance filtering)
- Trending Shows horizontal scroll (from TV_SHOW_REGISTRY)
**Estimate:** L

### FMW-203: TV Show Detail Modal [Core]
**Description:** TV show detail view in a modal (mirrors GameDetailContent).
**Acceptance Criteria:**
- Hero with poster, title, network, rating, genres
- Add to Library / status management (watching, completed, backlog, wishlist, dropped)
- Star rating (1-5), current season/episode tracker
- **Cast section** — horizontal scroll of cast cards with photos and character names (from TVDB)
- **Episode guide** — collapsible season accordion, each episode with checkbox, title, air date, thumbnail
- Episode checkboxes sync to `tv_wiki_progress` (localStorage + Supabase)
- Progress bar per season and overall
- Live Chat card, TVGuide articles, About, User reviews
- `TVShowModalContext.tsx` — Modal provider
**Estimate:** XL

### FMW-204: Episode Wiki Content [Core]
**Description:** Clicking an episode opens Fandom wiki content with styled CSS and proxied images.
**Acceptance Criteria:**
- Episode detail shows wiki article content (reuses existing `.wiki-content` CSS)
- Images proxied through `/api/img`
- Back navigation to episode guide
- Works for shows with Fandom wikis (auto-detected or from registry)
**Estimate:** M

### FMW-205: TV Show Registry [Core]
**Description:** Curated registry of ~15 popular TV shows with TVDB IDs and Fandom wiki configs.
**Acceptance Criteria:**
- `src/lib/services/tvRegistry.ts`
- Shows: House of the Dragon, Severance, The Last of Us, Squid Game, Stranger Things, The Mandalorian, Breaking Bad, Game of Thrones, The Bear, Shogun, Fallout (TV), Wednesday, Arcane, The Boys, Andor
- Each entry: title, tvdbId, wiki subdomain, poster URL, genre, network, category mappings
- Lookup functions: `findTVWikiConfig()`, `findTVWikiConfigByTvdbId()`
**Estimate:** M

### FMW-206: TV Library Page [Core]
**Description:** Library page for tracked TV shows at `/tv/library`.
**Acceptance Criteria:**
- Grid of show posters with status badges
- Filter by status, Sort by: Recent, A-Z, Rating
- Show current season/episode progress on cards
- Empty state with Discover CTA
**Estimate:** M

### FMW-207: TV Stats Dashboard [Core]
**Description:** Stats page for TV shows at `/tv/stats`.
**Acceptance Criteria:**
- Top stats: Shows tracked, Episodes watched, Completed, Completion %
- Status breakdown bars, Top genres, Most watched, Highest rated
**Estimate:** M

### FMW-208: TV Polls [Feature]
**Description:** TV-specific community polls via Gemini.
**Acceptance Criteria:**
- TV poll generator with TV-themed prompts (best show, character matchups, renewal predictions, streaming platform debates)
- Poster art from TVDB
- Add `category` column to `polls` table ('gaming' | 'tv')
- `GET /api/tv/polls` and `POST /api/tv/polls/vote` endpoints
**Estimate:** M

### FMW-209: TV Trending Chats [Feature]
**Description:** Mocked live chat rooms for TV shows.
**Acceptance Criteria:**
- `TVTrendingChats.tsx` — 5 animated chat rooms for popular shows
- `TVShowChat.tsx` — Per-show chat on detail page
- Demo content for all 15 registry shows + generic fallback
**Estimate:** M

### FMW-210: TV News — TVGuide & Metacritic [Feature]
**Description:** TVGuide and Metacritic integration for TV shows.
**Acceptance Criteria:**
- `GET /api/tv/tvguide` — TVGuide RSS + Gemini relevance filtering
- `GET /api/tv/metacritic` — Metacritic API with `productType=tv`
- `TVGuideArticles.tsx` component
**Estimate:** M

### FMW-211: TV Navigation Integration [Polish]
**Description:** Wire up bottom nav TV tab and top tab navigation.
**Acceptance Criteria:**
- Bottom nav TV tab links to `/tv` (Discover)
- TV section has own top tabs: Discover, Library, Stats
- TV tab highlights when on any `/tv/*` route
- Update middleware for public TV routes
**Estimate:** S

### FMW-212: TV Wiki Progress Tracking [Feature]
**Description:** Episode-level and wiki progress tracking for TV shows.
**Acceptance Criteria:**
- Episode checkboxes persist to localStorage + Supabase `tv_wiki_progress`
- Season-level progress bars, overall completion %
- Cloud sync across devices
**Estimate:** M

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

## Upcoming Sprints

**Sprint 5: Platform Expansion**
- FMW-101: Real PSN trophy import
- FMW-102: Xbox integration

**Sprint 6: Social**
- FMW-103: Friends & activity feed
- FMW-110: Notifications

**Sprint 8: TV Section — Foundation**
- FMW-201: TV database schema
- FMW-200: TVDB API integration
- FMW-205: TV show registry

**Sprint 9: TV Section — Core Pages**
- FMW-202: TV Discover page
- FMW-203: TV show detail modal
- FMW-204: Episode wiki content
- FMW-206: TV Library page
- FMW-211: TV navigation integration

**Sprint 10: TV Section — Features**
- FMW-208: TV polls
- FMW-209: TV trending chats
- FMW-210: TVGuide & Metacritic
- FMW-212: TV wiki progress tracking
- FMW-207: TV stats dashboard

**Sprint 11: Power User Features**
- FMW-108: Library bulk actions
- FMW-111: Offline PWA mode
- FMW-113: Custom lists / tags
