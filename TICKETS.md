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

### Wiki Progress Tracking (10 supported games)
- ✅ Elden Ring, Skyrim, Fallout 4, Genshin Impact, Zelda TotK
- ✅ The Witcher 3, GTA V, God of War, Hades, Stardew Valley
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

---

## 🔲 Backlog

### FMW-100: Game Wiki Auto-Detection [P1]
**Description:** Automatically detect if any game in the user's library has a Fandom wiki, even if not in the registry. Show "Track Progress" link with a generic Fandom search.
**Estimate:** M

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

### FMW-104: HowLongToBeat Integration [P1]
**Description:** Show estimated completion times on game detail pages.
**Estimate:** S

### FMW-105: Game-Specific News [P2]
**Description:** Filter news to a specific game on its detail page.
**Estimate:** M

### FMW-106: Stats Dashboard [P2]
**Description:** Visual charts for playtime trends, genre breakdown, weekly activity.
**Estimate:** M

### FMW-107: Add More Wiki Games [P1]
**Description:** Expand the registry beyond 10 games.
**Estimate:** S per game

### FMW-108: Library Bulk Actions [P2]
**Description:** Select multiple games to bulk-change status, export, or delete.
**Estimate:** M

### FMW-109: Cloud Save Sync [P2]
**Description:** Sync wiki checkboxes to Supabase instead of localStorage so progress is shared across devices.
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

## Recommended Next Sprint

**Sprint 4: Polish & Quality of Life**
- FMW-104: HowLongToBeat times
- FMW-107: Add 5-10 more games to wiki registry
- FMW-109: Sync wiki progress to Supabase (cross-device)

**Sprint 5: Platform Expansion**
- FMW-101: Real PSN trophy import
- FMW-102: Xbox integration

**Sprint 6: Social**
- FMW-103: Friends & activity feed
- FMW-110: Notifications
