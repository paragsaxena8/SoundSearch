// Shared (client-safe) configuration — no secrets

export type Quality = 'low' | 'medium' | 'high'

export const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const DEFAULT_QUALITY: Quality = 'high'

export const QUALITY_TO_MUSIC_KEY: Record<Quality, 'low' | 'medium' | 'high' | 'very_high'> = {
  low: 'low',
  medium: 'medium',
  high: 'very_high',
}

// Language badge colors — neon brutalism palette
export const LANGUAGE_COLORS: Record<string, string> = {
  English: '#EAB308',  // neon yellow
  Hindi: '#22C55E',   // neon green
  Punjabi: '#FF6B35', // neon orange
  Tamil: '#EC4899',    // neon pink
  Telugu: '#3B82F6',  // neon blue
} as const

export const DEFAULT_LANGUAGE_COLOR = '#1A1A1A' // black for unknown