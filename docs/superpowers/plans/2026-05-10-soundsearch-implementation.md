# SoundSearch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-themed music search web app with React, TypeScript, Tailwind CSS, and shadcn/ui, following the Airbnb-inspired design spec.

**Architecture:** Single-page React app with component-based architecture. Photo-first song cards with quality selector, pill-shaped search bar with teal accent orb, responsive grid layout (1-4 columns), mock data with simulated search delay.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v3, shadcn/ui, Inter font (Google Fonts)

---

## Task 1: Project Setup

**Files:**
- Create: `package.json` (via Vite)
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore`

- [ ] **Step 1: Create Vite React TypeScript project**

Run:
```bash
cd P:/Work/Projects/ganna_search
npm create vite@latest . -- --template react-ts --force
```

Expected: Project scaffolded with `src/main.tsx`, `src/App.tsx`, `src/index.css`, `vite.config.ts`, `tsconfig.json`

- [ ] **Step 2: Install Tailwind CSS and dependencies**

Run:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Expected: `tailwind.config.js` and `postcss.config.js` created

- [ ] **Step 3: Configure Tailwind with custom theme**

Replace `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-elevated': '#222222',
        primary: {
          DEFAULT: '#0d9488',
          hover: '#0f766e',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.9)',
          secondary: 'rgba(255, 255, 255, 0.6)',
          muted: 'rgba(255, 255, 255, 0.5)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'elevated': 'rgba(0, 0, 0, 0.3) 0 0 0 1px, rgba(0, 0, 0, 0.4) 0 2px 6px, rgba(0, 0, 0, 0.5) 0 4px 8px',
        'search': 'rgba(0, 0, 0, 0.2) 0 2px 8px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Add Tailwind directives to index.css**

Replace `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply bg-canvas text-text-primary antialiased;
  }

  body {
    @apply font-sans;
  }
}
```

- [ ] **Step 5: Add Inter font to index.html**

Update `index.html` to include Inter font in the `<head>`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>SoundSearch</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Install shadcn/ui dependencies**

Run:
```bash
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot
```

- [ ] **Step 7: Create lib/utils.ts**

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: string): string {
  const secs = parseInt(seconds, 10)
  const mins = Math.floor(secs / 60)
  const remainingSecs = secs % 60
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    English: '#0d9488',
    Hindi: '#22c55e',
    Punjabi: '#f97316',
    Tamil: '#a855f7',
    Telugu: '#3b82f6',
  }
  return colors[language] || '#6b7280'
}
```

- [ ] **Step 8: Verify project builds**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 9: Commit project setup**

```bash
git add .
git commit -m "feat: initialize React + TypeScript + Vite + Tailwind project

- Configure Tailwind with custom theme (colors, shadows, animations)
- Add Inter font from Google Fonts
- Install shadcn/ui dependencies
- Create utility functions (cn, formatDuration, getLanguageColor)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Types and Mock Data

**Files:**
- Create: `src/types/song.ts`
- Create: `src/data/mockSongs.ts`

- [ ] **Step 1: Create Song type definition**

Create `src/types/song.ts`:

```typescript
export interface Song {
  id: string
  title: string
  album: string
  artists: string
  duration: string
  language: string
  music: {
    very_high: string
    high: string
    medium: string
    low: string
  }
  thumbnail: {
    large: string
    medium: string
    small: string
  }
}

export type Quality = 'low' | 'medium' | 'high' | 'very_high'

export const QUALITY_LABELS: Record<Quality, string> = {
  low: 'LOW',
  medium: 'MED',
  high: 'HIGH',
  very_high: 'ULTRA',
}

export const LIMIT_OPTIONS = [5, 10, 20, 50] as const
export type LimitOption = typeof LIMIT_OPTIONS[number]
```

- [ ] **Step 2: Create mock data with realistic songs**

Create `src/data/mockSongs.ts`:

```typescript
import type { Song } from '../types/song'

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Shape of You',
    album: '÷ (Divide)',
    artists: 'Ed Sheeran',
    duration: '233',
    language: 'English',
    music: {
      very_high: 'https://example.com/shape-of-you-320.mp4',
      high: 'https://example.com/shape-of-you-128.mp4',
      medium: 'https://example.com/shape-of-you-64.mp4',
      low: 'https://example.com/shape-of-you-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song1/400/400',
      medium: 'https://picsum.photos/seed/song1/300/300',
      small: 'https://picsum.photos/seed/song1/150/150',
    },
  },
  {
    id: '2',
    title: 'Tum Hi Ho',
    album: 'Aashiqui 2',
    artists: 'Arijit Singh',
    duration: '265',
    language: 'Hindi',
    music: {
      very_high: 'https://example.com/tum-hi-ho-320.mp4',
      high: 'https://example.com/tum-hi-ho-128.mp4',
      medium: 'https://example.com/tum-hi-ho-64.mp4',
      low: 'https://example.com/tum-hi-ho-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song2/400/400',
      medium: 'https://picsum.photos/seed/song2/300/300',
      small: 'https://picsum.photos/seed/song2/150/150',
    },
  },
  {
    id: '3',
    title: 'Lahore',
    album: 'Lahore',
    artists: 'Guru Randhawa',
    duration: '199',
    language: 'Punjabi',
    music: {
      very_high: 'https://example.com/lahore-320.mp4',
      high: 'https://example.com/lahore-128.mp4',
      medium: 'https://example.com/lahore-64.mp4',
      low: 'https://example.com/lahore-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song3/400/400',
      medium: 'https://picsum.photos/seed/song3/300/300',
      small: 'https://picsum.photos/seed/song3/150/150',
    },
  },
  {
    id: '4',
    title: 'Senorita',
    album: 'Shawn Mendes',
    artists: 'Shawn Mendes, Camila Cabello',
    duration: '191',
    language: 'English',
    music: {
      very_high: 'https://example.com/senorita-320.mp4',
      high: 'https://example.com/senorita-128.mp4',
      medium: 'https://example.com/senorita-64.mp4',
      low: 'https://example.com/senorita-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song4/400/400',
      medium: 'https://picsum.photos/seed/song4/300/300',
      small: 'https://picsum.photos/seed/song4/150/150',
    },
  },
  {
    id: '5',
    title: 'Veer Zaara',
    album: 'Veer-Zaara',
    artists: 'Lata Mangeshkar, Sonu Nigam',
    duration: '312',
    language: 'Hindi',
    music: {
      very_high: 'https://example.com/veer-zaara-320.mp4',
      high: 'https://example.com/veer-zaara-128.mp4',
      medium: 'https://example.com/veer-zaara-64.mp4',
      low: 'https://example.com/veer-zaara-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song5/400/400',
      medium: 'https://picsum.photos/seed/song5/300/300',
      small: 'https://picsum.photos/seed/song5/150/150',
    },
  },
  {
    id: '6',
    title: 'Kolaveri Di',
    album: '3',
    artists: 'Anirudh Ravichander',
    duration: '254',
    language: 'Tamil',
    music: {
      very_high: 'https://example.com/kolaveri-320.mp4',
      high: 'https://example.com/kolaveri-128.mp4',
      medium: 'https://example.com/kolaveri-64.mp4',
      low: 'https://example.com/kolaveri-16.mp4',
    },
    thumbnail: {
      large: 'https://picsum.photos/seed/song6/400/400',
      medium: 'https://picsum.photos/seed/song6/300/300',
      small: 'https://picsum.photos/seed/song6/150/150',
    },
  },
]
```

- [ ] **Step 3: Commit types and mock data**

```bash
git add src/types src/data
git commit -m "feat: add Song types and mock data

- Define Song interface with music quality levels
- Add Quality type and labels
- Create 6 realistic mock songs with placeholder images

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Navbar Component

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Create Navbar component**

Create `src/components/Navbar.tsx`:

```typescript
export function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-canvas">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-primary transition-opacity group-hover:opacity-90">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden="true"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-text-primary">SoundSearch</span>
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit Navbar**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add Navbar component with logo and app name

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: EmptyState Component

**Files:**
- Create: `src/components/EmptyState.tsx`

- [ ] **Step 1: Create EmptyState component**

Create `src/components/EmptyState.tsx`:

```typescript
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-text-muted mb-4"
        aria-hidden="true"
      >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
      <p className="text-base text-text-muted">
        Search for a song to get started
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit EmptyState**

```bash
git add src/components/EmptyState.tsx
git commit -m "feat: add EmptyState component with music icon

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: ErrorState Component

**Files:**
- Create: `src/components/ErrorState.tsx`

- [ ] **Step 1: Create ErrorState component**

Create `src/components/ErrorState.tsx`:

```typescript
interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Something went wrong' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-6 rounded-xl border bg-error/10 border-error/30">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mx-auto mb-3 text-error"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-medium text-error">{message}</p>
        <p className="mt-1 text-sm text-error/80">Please try again</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit ErrorState**

```bash
git add src/components/ErrorState.tsx
git commit -m "feat: add ErrorState component with error styling

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: LoadingSkeleton Component

**Files:**
- Create: `src/components/LoadingSkeleton.tsx`

- [ ] **Step 1: Create LoadingSkeleton component**

Create `src/components/LoadingSkeleton.tsx`:

```typescript
interface LoadingSkeletonProps {
  count?: number
}

export function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div
            className="aspect-square rounded-card bg-surface animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="pt-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-surface" />
            <div className="h-3 w-1/2 rounded bg-surface" />
            <div className="h-3 w-2/3 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit LoadingSkeleton**

```bash
git add src/components/LoadingSkeleton.tsx
git commit -m "feat: add LoadingSkeleton with shimmer animation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: QualitySelector Component

**Files:**
- Create: `src/components/QualitySelector.tsx`

- [ ] **Step 1: Create QualitySelector component**

Create `src/components/QualitySelector.tsx`:

```typescript
import { cn } from '../lib/utils'
import type { Quality } from '../types/song'
import { QUALITY_LABELS } from '../types/song'

interface QualitySelectorProps {
  selected: Quality
  onChange: (quality: Quality) => void
}

export function QualitySelector({ selected, onChange }: QualitySelectorProps) {
  const qualities: Quality[] = ['low', 'medium', 'high', 'very_high']

  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Audio quality">
      {qualities.map((quality) => (
        <button
          key={quality}
          type="button"
          role="radio"
          aria-checked={selected === quality}
          onClick={() => onChange(quality)}
          className={cn(
            'px-3 py-1 text-[11px] font-semibold rounded transition-all duration-200',
            selected === quality
              ? 'bg-primary text-white'
              : 'bg-white/10 text-text-muted hover:bg-white/15 hover:text-text-secondary'
          )}
        >
          {QUALITY_LABELS[quality]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit QualitySelector**

```bash
git add src/components/QualitySelector.tsx
git commit -m "feat: add QualitySelector with teal highlight for selected

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: SongCard Component

**Files:**
- Create: `src/components/SongCard.tsx`

- [ ] **Step 1: Create SongCard component**

Create `src/components/SongCard.tsx`:

```typescript
import { useState } from 'react'
import { cn, formatDuration, getLanguageColor } from '../lib/utils'
import type { Song, Quality } from '../types/song'
import { QualitySelector } from './QualitySelector'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  const [selectedQuality, setSelectedQuality] = useState<Quality>('high')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative aspect-square rounded-card overflow-hidden transition-all duration-200',
          isHovered && 'shadow-elevated'
        )}
      >
        <img
          src={song.thumbnail.medium}
          alt={`${song.title} album art`}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            isHovered && 'scale-[1.02]'
          )}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-pill bg-black/70 text-white text-xs font-medium">
          {formatDuration(song.duration)}
        </div>

        {/* Language badge */}
        <div
          className="absolute bottom-2 left-2 px-3 py-1 rounded-pill text-white text-xs font-medium"
          style={{ backgroundColor: getLanguageColor(song.language) }}
        >
          {song.language}
        </div>

        {/* Play orb */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d9488">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <div className="pt-3">
        <h3 className="text-base font-semibold text-text-primary truncate">
          {song.title}
        </h3>
        <p className="text-sm text-text-secondary truncate">{song.artists}</p>
        <p className="text-sm text-text-muted italic truncate">{song.album}</p>

        <div className="mt-3">
          <QualitySelector
            selected={selectedQuality}
            onChange={setSelectedQuality}
          />
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Commit SongCard**

```bash
git add src/components/SongCard.tsx
git commit -m "feat: add SongCard with photo-first layout and quality selector

- Album art with hover zoom
- Duration and language badges
- Play orb on hover
- Quality selector with teal highlight

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: SearchBar Component

**Files:**
- Create: `src/components/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar component**

Create `src/components/SearchBar.tsx`:

```typescript
import { useState } from 'react'
import { cn } from '../lib/utils'
import { LIMIT_OPTIONS, type LimitOption } from '../types/song'

interface SearchBarProps {
  onSearch: (query: string, limit: LimitOption) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState<LimitOption>(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim(), limit)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
      <div className="flex items-center bg-surface border border-border-strong rounded-pill shadow-search overflow-hidden">
        {/* Search input segment */}
        <div className="flex-1 px-5 py-3">
          <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide">
            Search
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter song name..."
            className="block w-full bg-transparent text-text-primary text-base mt-1 outline-none placeholder:text-text-muted"
            aria-label="Search for songs"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border-strong" />

        {/* Limit segment */}
        <div className="px-5 py-3 min-w-[100px]">
          <label className="block text-[12px] font-semibold text-text-muted uppercase tracking-wide">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) as LimitOption)}
            className="block w-full bg-transparent text-text-primary text-base mt-1 outline-none cursor-pointer"
            aria-label="Number of results"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-surface">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Search orb */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={cn(
            'w-12 h-12 m-2 rounded-full bg-primary flex items-center justify-center transition-all',
            'hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Search"
        >
          {isLoading ? (
            <svg
              className="animate-spin w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit SearchBar**

```bash
git add src/components/SearchBar.tsx
git commit -m "feat: add SearchBar with pill shape and teal orb

- Segmented input with search query and limit dropdown
- Circular search orb with loading spinner
- Form submission handling

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: useSearch Hook

**Files:**
- Create: `src/hooks/useSearch.ts`

- [ ] **Step 1: Create useSearch hook**

Create `src/hooks/useSearch.ts`:

```typescript
import { useState, useCallback } from 'react'
import type { Song, LimitOption } from '../types/song'
import { mockSongs } from '../data/mockSongs'

interface UseSearchReturn {
  songs: Song[]
  isLoading: boolean
  error: string | null
  search: (query: string, limit: LimitOption) => Promise<void>
  clearError: () => void
}

export function useSearch(): UseSearchReturn {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, limit: LimitOption) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filter mock songs by query (case-insensitive title/artist match)
      const filtered = mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artists.toLowerCase().includes(query.toLowerCase())
      )

      // Limit results
      const limited = filtered.slice(0, limit)

      setSongs(limited)
    } catch (err) {
      setError('Failed to search. Please try again.')
      setSongs([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { songs, isLoading, error, search, clearError }
}
```

- [ ] **Step 2: Commit useSearch hook**

```bash
git add src/hooks/useSearch.ts
git commit -m "feat: add useSearch hook with mock data simulation

- 500ms simulated delay
- Query filtering by title/artist
- Error handling

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: App Component Integration

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Create integrated App component**

Replace `src/App.tsx`:

```typescript
import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { SearchBar } from './components/SearchBar'
import { SongCard } from './components/SongCard'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { useSearch } from './hooks/useSearch'

function App() {
  const { songs, isLoading, error, search, clearError } = useSearch()
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query: string, limit: typeof import('./types/song').LIMIT_OPTIONS[number]) => {
    setHasSearched(true)
    await search(query, limit)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="flex flex-col items-center px-6 py-16">
        <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.02em]">
          Find your music
        </h1>
        <p className="text-base text-text-secondary mt-2 mb-8">
          Search millions of songs from Globe
        </p>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </main>

      <section className="px-6 pb-16">
        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : error ? (
          <ErrorState message={error} />
        ) : !hasSearched ? (
          <EmptyState />
        ) : songs.length === 0 ? (
          <ErrorState message="No songs found. Try a different search." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Commit App integration**

```bash
git add src/App.tsx
git commit -m "feat: integrate all components in App

- Hero section with title and search bar
- Responsive grid (1-4 columns)
- Loading, error, and empty states
- Song card rendering

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run development server**

Run:
```bash
npm run dev
```

Expected: Dev server starts at http://localhost:5173

- [ ] **Step 3: Manual verification checklist**

Open browser to http://localhost:5173 and verify:

1. [ ] Dark theme with canvas background (#0f0f0f)
2. [ ] Navbar shows logo and "SoundSearch"
3. [ ] Hero section with h1 "Find your music"
4. [ ] Search bar with pill shape, segments, and teal orb
5. [ ] Limit dropdown shows 5, 10, 20, 50
6. [ ] Empty state shows before search
7. [ ] Search triggers loading skeleton (500ms)
8. [ ] Song cards display with photo-first layout
9. [ ] Duration badge top-right, language badge bottom-left
10. [ ] Play orb appears on card hover
11. [ ] Quality selector highlights selected in teal
12. [ ] Responsive grid: 1 column (mobile), 2 columns (sm), 3 columns (lg), 4 columns (xl)
13. [ ] All hover transitions smooth (200ms)

- [ ] **Step 4: Build for production**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add .
git commit -m "fix: any issues found during verification

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project setup (Vite + React + TypeScript + Tailwind) | package.json, vite.config.ts, tailwind.config.js, index.css, index.html |
| 2 | Types and mock data | src/types/song.ts, src/data/mockSongs.ts |
| 3 | Navbar component | src/components/Navbar.tsx |
| 4 | EmptyState component | src/components/EmptyState.tsx |
| 5 | ErrorState component | src/components/ErrorState.tsx |
| 6 | LoadingSkeleton component | src/components/LoadingSkeleton.tsx |
| 7 | QualitySelector component | src/components/QualitySelector.tsx |
| 8 | SongCard component | src/components/SongCard.tsx |
| 9 | SearchBar component | src/components/SearchBar.tsx |
| 10 | useSearch hook | src/hooks/useSearch.ts |
| 11 | App integration | src/App.tsx |
| 12 | Final verification | - |

**Total: 12 tasks, ~40 steps**