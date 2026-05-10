# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoundSearch is a Next.js web application that searches and plays music from Gaana.com. It features HLS streaming, playlist management with IndexedDB persistence, and a dark-themed UI built with Tailwind CSS.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Data Flow
1. **Search API** (`src/app/api/search/route.ts`) - Server-side endpoint that queries Gaana API
2. **Gaana Library** (`src/lib/gaana.ts`) - Handles song search, track detail fetching, and AES-128-CBC decryption of streaming URLs
3. **Cache Layer** (`src/lib/cache.tsx`) - In-memory + localStorage caching for search results, now-playing state, and recent plays
4. **Playlist Storage** (`src/lib/db.ts`) - IndexedDB for persistent playlist data

### Key Libraries
- **HLS.js** - Streams encrypted m3u8 audio files from Gaana CDN
- **Radix UI Dropdown Menu** - Accessible dropdown components
- **Axios** - HTTP client for Gaana API requests

### Configuration
- **Environment Variable**: `GAANA_KEY_BASE64` - Base64-encoded AES key for decrypting stream URLs
- **Path Alias**: `@/*` maps to `./src/*`

### State Management
- React Context providers wrap the main page:
  - `CacheProvider` - Manages search cache, now-playing, recent plays
  - `PlaylistProvider` - Manages playlist CRUD via IndexedDB

### Audio Streaming
The `MusicPlayer` component uses HLS.js to stream encrypted audio. Stream URLs come in encrypted format and are decrypted client-side using AES-128-CBC. Quality options (low/medium/high/very_high) map to different bitrate variants.

### Custom Tailwind Theme
Dark theme with custom colors: `canvas`, `surface`, `surface-elevated`, `primary` (teal), and text opacity variants. See `tailwind.config.ts` for the full palette and custom animations.