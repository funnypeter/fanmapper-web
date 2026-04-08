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

**Sprint 8: Power User Features**
- FMW-108: Library bulk actions
- FMW-111: Offline PWA mode
- FMW-113: Custom lists / tags
