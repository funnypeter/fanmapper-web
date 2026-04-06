# FanMapper Web — Project Tickets

**Priority: P0 (MVP), P1 (V1.0), P2 (V2.0)**
**Status: ✅ Done | 🔲 Todo**

---

## What's Built

- ✅ Landing page with cover art and feature cards
- ✅ Auth (signup/login with Supabase)
- ✅ Explore page (game search via IGDB, trending games grid, genre filters)
- ✅ Game detail page (hero, rating, genres, platforms, Add to Library, Remove)
- ✅ Game detail — YouTube videos (horizontal scroll from IGDB)
- ✅ Game detail — Screenshots (horizontal scroll)
- ✅ Game detail — Track Progress link to wiki (for 10 supported games)
- ✅ Library page (cover art grid, status badges, playtime, ratings)
- ✅ Library — status management, star rating, playtime editing
- ✅ Wiki browser (10 games, category tabs with icons, search, article viewer)
- ✅ Wiki — progress checkmarks with localStorage persistence + progress bar
- ✅ Wiki — recursive subcategory expansion for actual page results
- ✅ Profile page (avatar, stats, linked platforms, sign out)
- ✅ Bottom nav bar (Explore, Library, Profile)
- ✅ Supabase schema (profiles, games, user_games, achievements, user_achievements, RLS)
- ✅ Middleware (public routes for explore/wiki/game, auth-protected for library/profile)
- ✅ IGDB API proxy (server-side Twitch OAuth, search + detail endpoints)
- ✅ Game registry with 10 titles (covers, IGDB IDs, wiki configs)

---

## Epic 1: Game Detail & Progress Tracking

### FMW-001: Game Detail Page [P0] ✅
### FMW-002: Game Detail — Wiki & Map Quick Links [P0] ✅

---

## Epic 2: Interactive Maps

### FMW-003: Interactive Map Page [P0] 🔲
**Type:** Story
**Description:** Leaflet.js interactive map viewer for Fandom game maps.
**Acceptance Criteria:**
- Route: `/map/[game]`
- Loads Fandom interactive map data via API
- Renders tile layers and markers using Leaflet.js
- Marker category filter sidebar (Bosses, Items, Locations, NPCs, etc.)
- Click marker to see popup with title and description
- Pan/zoom controls
- Dark theme styled
- CC BY-SA attribution
**Estimate:** L

### FMW-004: Map Marker Search [P1] 🔲
**Type:** Story
**Description:** Search for specific markers/locations on the map.
**Estimate:** S

---

## Epic 3: Achievement Tracking

### FMW-005: Achievements Page [P0] 🔲
**Type:** Story
**Description:** Per-game achievement list with earned/unearned status and progress bar.
**Acceptance Criteria:**
- Route: `/game/[id]/achievements`
- Overall progress bar (earned / total, percentage)
- Achievement list: icon, name, description, earned status, date earned
- Filter: All, Earned, Unearned
**Estimate:** M

### FMW-006: Achievement Stats on Profile [P1] 🔲
**Type:** Story
**Description:** Show aggregate achievement stats on the profile page.
**Estimate:** S

---

## Epic 4: Platform Linking & Import

### FMW-007: Steam Linking Page [P0] 🔲
**Type:** Story
**Description:** Link Steam account and import owned games + achievements.
**Acceptance Criteria:**
- Route: `/profile/link-steam`
- User enters SteamID64, preview profile
- Import owned games, playtime, achievements into Supabase
- Progress indicator during import
**Estimate:** M

### FMW-008: Steam API Proxy [P0] 🔲
**Type:** Task
**Description:** Server-side API routes for Steam Web API (keeps key secret).
**Estimate:** S

### FMW-009: PSN Linking Page [P1] 🔲
**Type:** Story
**Description:** Link PSN account via NPSSO token and import trophies.
**Estimate:** M

---

## Epic 5: Library Enhancements

### FMW-010: Library Filter & Sort Controls [P0] 🔲
**Type:** Story
**Description:** Add filter chips and sort options to the library page.
**Acceptance Criteria:**
- Filter by status: All, Playing, Completed, Backlog, Wishlist, Dropped
- Sort by: Recently updated, Alphabetical, Playtime
**Estimate:** S

### FMW-011: Text Reviews [P1] 🔲
**Type:** Story
**Description:** Write and display text reviews on game detail pages.
**Acceptance Criteria:**
- Review form on game detail (when in library)
- Reviews stored in Supabase
- Display reviews on game detail page
**Estimate:** M

---

## Remaining Sprint Plan

### Sprint 1 (next): Library Polish + Achievements
FMW-010, FMW-005, FMW-008

### Sprint 2: Steam Import + Maps
FMW-007, FMW-003

### Sprint 3: Polish
FMW-004, FMW-006, FMW-009, FMW-011
