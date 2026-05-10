# SoundSearch

Search and stream millions of songs from Gaana.com with a neo-brutalism UI.

## Features

- Song search with HLS audio streaming
- Queue management with drag reorder
- Playlist creation and persistence (IndexedDB)
- Quality settings (Low / Medium / High)
- Recent plays history
- Responsive dark theme with neon yellow accent

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Environment Setup

Copy the example env file and add your Gaana API key:

```bash
cp .env .env.local
```

Edit `.env.local` and set `GAANA_KEY_BASE64` to your Base64-encoded AES-128 decryption key.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
  app/
    api/search/route.ts   # Server-side search proxy
    page.tsx               # Main search page
    settings/page.tsx       # Quality & limit settings
  components/
    MusicPlayer.tsx         # Audio player with queue
    SearchBar.tsx           # Search input
    SongCard.tsx            # Compact song row
    FeatureCard.tsx         # Featured song card
    PlaylistModal.tsx        # Playlist browser
    ActionsDropdown.tsx     # Radix dropdown menu
    AddToPlaylistDropdown.tsx
    DashboardPlaylists.tsx
    RecentPlays.tsx
    LoadingSkeleton.tsx
    EmptyState.tsx
    ErrorState.tsx
    Toaster.tsx
    Navbar.tsx
  lib/
    gaana.server.ts        # Server-only: API endpoints & decryption key
    gaana.ts                # Server-only: search, decrypt, track detail
    config.ts               # Shared: types, quality config, language colors
    cache.tsx               # Client: search cache, now-playing, recent plays
    playlist.tsx             # Client: playlist context & IndexedDB CRUD
    settings.tsx             # Client: quality & limit settings context
    toast.tsx                # Client: toast notifications
    db.ts                   # Client: IndexedDB wrapper
    utils.ts                # Client: cn, getLanguageColor, safeWindowOpen
```

## Architecture

### Data Flow

1. **Search** — Client calls `/api/search?q=...&limit=...` → server proxies to Gaana API → decrypts stream URLs with AES-128-CBC → returns song data
2. **Streaming** — HLS.js loads encrypted `.m3u8` from Gaana CDN and plays in the browser
3. **Persistence** — Playlists and recent plays stored in IndexedDB; settings in localStorage

### Key Decisions

- **Config split** — `gaana.server.ts` holds the AES key and is never bundled to the client. `config.ts` only exports client-safe types and constants.
- **URL safety** — All `window.open()` calls go through `safeWindowOpen()` which validates the `https:`/`http:` protocol and adds `noopener,noreferrer`.
- **Rate limiting** — In-memory per-IP rate limiting on `/api/search` (30 requests/minute).

## Configuration

| Variable | Description | Required |
|---|---|---|
| `GAANA_KEY_BASE64` | Base64-encoded AES-128 key for decrypting stream URLs | Yes |

Settings (quality, search result limit) are configured in-app at `/settings` and persisted to localStorage.