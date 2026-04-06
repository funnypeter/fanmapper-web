# FanMapper Web — Project Tickets

**Priority: P0 (MVP), P1 (V1.0), P2 (V2.0)**
**Status: ✅ Done | 🔲 Todo**

---

## What's Built

- ✅ Landing page
- ✅ Auth (signup/login with Supabase)
- ✅ Library page (list games, status, playtime, rating)
- ✅ Explore page (game search via IGDB, Fandom wiki links)
- ✅ Wiki browser (category tabs, search, article viewer)
- ✅ Profile page (user info, sign out)
- ✅ Supabase schema (profiles, games, user_games, achievements, user_achievements)
- ✅ Middleware (auth-protected routes)
- ✅ IGDB API proxy (server-side credentials)

---

## Epic 1: Game Detail & Progress Tracking

### FMW-001: Game Detail Page [P0]
**Type:** Story
**Description:** Full game detail page with cover art, metadata, status management, and playtime logging.
**Acceptance Criteria:**
- Route: `/game/[id]`
- Hero section with cover art, title, genres, platforms, release year
- Status picker (Playing, Completed, Backlog, Wishlist, Dropped)
- Playtime input (hours)
- Star rating (1-5)
- Text review field
- "Add to Library" / "Remove from Library" toggle
- All changes persist to Supabase immediately
**Estimate:** M

### FMW-002: Game Detail — Wiki & Map Quick Links [P0]
**Type:** Story
**Description:** Show quick-access buttons on game detail for wiki and map when the game is in the registry.
**Acceptance Criteria:**
- "Wiki" button links to `/wiki/{gameKey}`
- "Map" button links to `/map/{gameKey}`
- "Achievements" button links to `/game/{id}/achievements`
- Buttons only show for games with wiki config
- Styled as icon+label cards
**Estimate:** S

---

## Epic 2: Interactive Maps

### FMW-003: Interactive Map Page [P0]
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

### FMW-004: Map Marker Search [P1]
**Type:** Story
**Description:** Search for specific markers/locations on the map.
**Acceptance Criteria:**
- Search bar above the map
- Filters visible markers by name
- Clicking a result pans/zooms to that marker
**Estimate:** S

---

## Epic 3: Achievement Tracking

### FMW-005: Achievements Page [P0]
**Type:** Story
**Description:** Per-game achievement list with earned/unearned status and progress bar.
**Acceptance Criteria:**
- Route: `/game/[id]/achievements`
- Overall progress bar (earned / total, percentage)
- Achievement list: icon, name, description, earned status, date earned
- Filter: All, Earned, Unearned
- Sort: Default, Rarity (global unlock %), Recently earned
**Estimate:** M

### FMW-006: Achievement Stats on Profile [P1]
**Type:** Story
**Description:** Show aggregate achievement stats on the profile page.
**Acceptance Criteria:**
- Total achievements earned across all games
- Completion rate (earned / total)
- Most recently earned achievement
**Estimate:** S

---

## Epic 4: Platform Linking & Import

### FMW-007: Steam Linking Page [P0]
**Type:** Story
**Description:** Link Steam account and import owned games + achievements.
**Acceptance Criteria:**
- Route: `/profile/link-steam`
- User enters SteamID64
- Preview Steam profile (name, avatar)
- "Import" button syncs owned games, playtime, and achievements
- Progress indicator during import
- Imports go into Supabase games, user_games, achievements, user_achievements
- Accessible from Profile page
**Estimate:** M

### FMW-008: Steam API Proxy [P0]
**Type:** Task
**Description:** Server-side API routes to proxy Steam Web API calls (keeps API key secret).
**Acceptance Criteria:**
- `GET /api/steam/profile?steamid=X` — returns player summary
- `GET /api/steam/games?steamid=X` — returns owned games
- `GET /api/steam/achievements?steamid=X&appid=Y` — returns achievements
- Steam API key stored as env var, never exposed to client
**Estimate:** S

### FMW-009: PSN Linking Page [P1]
**Type:** Story
**Description:** Link PSN account via NPSSO token and import trophies.
**Acceptance Criteria:**
- Route: `/profile/link-psn`
- Instructions for getting NPSSO token
- Import trophies and games
- Warning about unofficial API
**Estimate:** M

---

## Epic 5: Home Dashboard

### FMW-010: Dashboard Home Page [P0]
**Type:** Story
**Description:** Replace the current redirect with a real dashboard showing gaming activity.
**Acceptance Criteria:**
- Route: `/dashboard` (default after login)
- "Continue Playing" section: games with status=playing, cover art, playtime
- "Recent Activity" section: last 5 game status changes
- Quick stats: total games, total playtime, completion rate
- Links to wiki/map for currently playing games
**Estimate:** M

---

## Epic 6: Library Enhancements

### FMW-011: Add Game to Library from Search [P0]
**Type:** Story
**Description:** Allow adding a game directly from search results with a status picker.
**Acceptance Criteria:**
- "Add to Library" button on each search result in Explore
- Status picker dropdown (Playing, Backlog, Wishlist, etc.)
- Game upserted into Supabase games table, then user_games
- Visual confirmation (toast or inline)
**Estimate:** S

### FMW-012: Library Filter & Sort Controls [P0]
**Type:** Story
**Description:** Add filter chips and sort options to the library page.
**Acceptance Criteria:**
- Filter by status: All, Playing, Completed, Backlog, Wishlist, Dropped
- Sort by: Recently updated, Alphabetical, Playtime
- Persist filter/sort in URL params
**Estimate:** S

### FMW-013: Library Grid View [P1]
**Type:** Story
**Description:** Toggle between list and grid (cover art tiles) view.
**Acceptance Criteria:**
- Grid view shows cover art tiles with title overlay
- List view (current) remains default
- Toggle button in header
- Preference saved in localStorage
**Estimate:** S

---

## Sprint Plan

### Sprint 1: Core Gameplay Loop
FMW-001, FMW-002, FMW-011, FMW-012

### Sprint 2: Maps & Achievements
FMW-003, FMW-005, FMW-008

### Sprint 3: Steam Import & Dashboard
FMW-007, FMW-010

### Sprint 4: Polish
FMW-004, FMW-006, FMW-009, FMW-013
