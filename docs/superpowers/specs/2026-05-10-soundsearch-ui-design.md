# SoundSearch — Music Search Web App Design

**Date:** 2026-05-10
**Status:** Approved
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

## Overview

SoundSearch is a modern dark-themed music search web app that queries the Gaana music service. The design follows Airbnb's philosophy: photo-first cards, modest typography weights, soft rounded corners, single-accent simplicity, and generous spacing adapted for a dark theme.

## Design Principles

1. **Photo-first cards** — Album art dominates, text is secondary
2. **Modest typography** — Weights 400-700, letting imagery carry visual weight
3. **Soft shapes everywhere** — 12px card radius, pill-shaped search/buttons, circular icons
4. **Single accent** — Teal (#0d9488) for primary CTAs only; 90% dark canvas + white text
5. **One shadow tier** — Subtle elevation on hover, flat otherwise
6. **Generous spacing** — 64px section bands, 16px card gutters

## Color Tokens

### Dark Theme Palette

| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#0f0f0f` | Page background |
| `surface` | `#1a1a1a` | Card/surface background |
| `surface-elevated` | `#222222` | Hover states |
| `primary` | `#0d9488` | CTA buttons, accent elements |
| `primary-hover` | `#0f766e` | Primary button hover |
| `text-primary` | `rgba(255,255,255,0.9)` | Headlines, primary text |
| `text-secondary` | `rgba(255,255,255,0.6)` | Secondary text, labels |
| `text-muted` | `rgba(255,255,255,0.5)` | Muted text, placeholders |
| `border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `border-strong` | `rgba(255,255,255,0.12)` | Input borders |

### Language Badge Colors

| Language | Color | Hex |
|----------|-------|-----|
| English | Teal | `#0d9488` |
| Hindi | Green | `#22c55e` |
| Punjabi | Orange | `#f97316` |
| Tamil | Purple | `#a855f7` |
| Telugu | Blue | `#3b82f6` |
| Other | Gray | `#6b7280` |

## Typography

**Font Family:** Inter (Google Fonts)

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `display-xl` | 28px | 700 | 1.4 | Hero h1 |
| `title-md` | 16px | 600 | 1.25 | Song titles, nav |
| `body-md` | 16px | 400 | 1.5 | Primary body text |
| `body-sm` | 14px | 400 | 1.43 | Secondary text, metadata |
| `caption` | 12px | 600 | 1.33 | Labels (uppercase) |
| `badge` | 12px | 500 | 1 | Duration, language badges |

## Spacing System

Base unit: 4px

| Token | Value | Usage |
|--------|-------|-------|
| `xs` | 4px | Micro spacing |
| `sm` | 8px | Button padding, tight gaps |
| `md` | 12px | Card internal padding |
| `base` | 16px | Grid gaps, default padding |
| `lg` | 24px | Section padding |
| `xl` | 32px | Major section padding |
| `section` | 64px | Hero/section bands |

## Layout

### Page Structure

```
┌─────────────────────────────────────────┐
│ Navbar (logo + app name)                 │ 64px
├─────────────────────────────────────────┤
│                                         │
│           Hero Section                   │
│        (h1 + description)                │ 64px padding-top
│                                         │
│         Search Bar (pill)               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         Results Grid                    │ 64px padding-bottom
│    1 col (mobile) | 2 col (tablet)      │
│    3 col (desktop) | 4 col (wide)       │
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

| Name | Width | Grid Columns |
|------|-------|--------------|
| Mobile | < 640px | 1 |
| Tablet | 640–1024px | 2 |
| Desktop | 1024–1280px | 3 |
| Wide | > 1280px | 4 |

## Components

### 1. SearchBar

**Structure:** Pill-shaped container with segmented inputs and circular search orb.

```
┌─────────────────────────────────────────────────────────────┐
│  SEARCH          │  LIMIT    │  [🔍] │
│  Shape of you    │  10       │       │
└─────────────────────────────────────────────────────────────┘
```

- Background: `#1a1a1a`
- Border: 1px `rgba(255,255,255,0.12)`
- Border-radius: 9999px (pill)
- Padding: 8px outer, 12-20px inner segments
- Shadow: `rgba(0,0,0,0.2) 0 2px 8px`

**Segments:**
- Left segment: Search query input
- Divider: 1px `rgba(255,255,255,0.12)`
- Right segment: Limit dropdown (5, 10, 20, 50)
- Orb: 48x48px teal circle with white search icon

**States:**
- Default: As shown
- Loading: Spinner inside orb, orb opacity 0.7
- Focus: Border brightens to `rgba(255,255,255,0.2)`

### 2. SongCard

**Structure:** Square photo-first card with metadata below.

```
┌─────────────────────────┐
│ [3:53]                  │  Duration badge (top-right)
│                         │
│      🎵 Album Art       │  1:1 aspect ratio
│                         │
│ [English]               │  Language badge (bottom-left)
│      ▶                  │  Play orb (center, on hover)
└─────────────────────────┘
┌─────────────────────────┐
│ Shape of You            │  Title (16px/600, white)
│ Ed Sheeran              │  Artists (14px, muted)
│ Shape of You            │  Album (14px italic, muted)
│ [LOW][MED][HIGH][ULTRA] │  Quality buttons
└─────────────────────────┘
```

- Card border-radius: 12px
- Image border-radius: 12px
- Internal padding: 12px
- Hover: Subtle elevation (shadow tier)

**Hover Effects:**
- Image scale: 1.02 (zoom)
- Play orb fade-in: opacity 0 → 1

### 3. QualitySelector

**Structure:** Four individual buttons with teal highlight for selected.

```
┌─────┐ ┌─────┐ ┌─────┐ ┌───────┐
│ LOW │ │ MED │ │HIGH │ │ ULTRA │
└─────┘ └─────┘ └─────┘ └───────┘
```

- Default: `rgba(255,255,255,0.1)` background, muted text
- Selected: `#0d9488` background, white text
- Border-radius: 6px
- Padding: 4px 12px
- Font: 11px/600

### 4. LoadingSkeleton

Animated shimmer cards during fetch.

```
┌─────────────────────────┐
│ ██████████████████████ │  Aspect ratio 1:1
│ ██████████████████████ │  Shimmer animation
│ ██████████████████████ │
└─────────────────────────┘
┌─────────────────────────┐
│ ████████                │  Title skeleton
│ ██████                   │  Artists skeleton
└─────────────────────────┘
```

- Background: `rgba(255,255,255,0.05)`
- Shimmer: `linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)`
- Animation: 1.5s ease-in-out infinite

### 5. EmptyState

Centered illustration with text.

```
        🎵
Search for a song to get started
```

- Icon: 64px, muted color
- Text: 16px, muted
- Padding: 64px vertical

### 6. ErrorState

Card with error message.

```
┌─────────────────────────────┐
│      ⚠️                    │
│   Something went wrong      │
│   Please try again          │
└─────────────────────────────┘
```

- Background: `rgba(239,68,68,0.1)`
- Border: 1px `rgba(239,68,68,0.3)`
- Border-radius: 12px
- Text: `#ef4444`

### 7. Navbar

Simple top bar with logo and app name.

- Height: 64px
- Background: `rgba(255,255,255,0.03)` (subtle)
- Border-bottom: 1px `rgba(255,255,255,0.08)`
- Logo: 36px teal rounded square with music note icon
- App name: 18px/600 white

## Shadow Tier

Single elevation level (adapted from Airbnb for dark theme):

```css
.elevated {
  box-shadow:
    rgba(0, 0, 0, 0.3) 0 0 0 1px,
    rgba(0, 0, 0, 0.4) 0 2px 6px,
    rgba(0, 0, 0, 0.5) 0 4px 8px;
}
```

Used on:
- Card hover
- Search bar (at rest)
- Dropdowns/modals

## File Structure

```
src/
├── components/
│   ├── SearchBar.tsx
│   ├── SongCard.tsx
│   ├── QualitySelector.tsx
│   ├── LoadingSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── Navbar.tsx
├── hooks/
│   └── useSearch.ts
├── lib/
│   └── utils.ts
├── types/
│   └── song.ts
├── data/
│   └── mockSongs.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Mock Data Shape

```typescript
interface Song {
  title: string;
  album: string;
  artists: string;
  duration: string; // "3:53"
  language: string;
  music: {
    very_high: string;
    high: string;
    medium: string;
    low: string;
  };
  thumbnail: {
    large: string;
    medium: string;
    small: string;
  };
}
```

## Implementation Notes

1. **Inter font** — Load from Google Fonts in `index.html`
2. **Tailwind config** — Extend with custom colors and spacing tokens
3. **shadcn/ui** — Install base components (Button, Input, Card skeleton)
4. **Mock data** — 6 sample songs with real-looking thumbnails (use placeholder images)
5. **No API calls** — Search button simulates loading with 500ms delay, returns mock data
6. **Accessibility** — Focus states, ARIA labels, keyboard navigation
7. **Animations** — Tailwind `transition` classes for hover effects

## Success Criteria

- [ ] Search bar with pill shape and teal orb renders correctly
- [ ] Song cards display with photo-first layout
- [ ] Quality buttons highlight selected option in teal
- [ ] Loading skeleton shows shimmer animation
- [ ] Empty state displays when no search performed
- [ ] Responsive grid: 1→2→3→4 columns across breakpoints
- [ ] All hover transitions smooth (200ms)
- [ ] Dark theme with teal accent only on CTAs