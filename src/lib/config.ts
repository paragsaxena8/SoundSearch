// Gaana API configuration

export const GAANA_ENDPOINTS = {
  search: 'https://gaana.com/apiv2',
  detail: 'https://gaana.com/apiv2',
} as const

export const GAANA_DEFAULTS = {
  country: 'IN',
  page: 0,
  secType: 'track',
  type: 'search',
  limit: 5,
  key: process.env.GAANA_KEY_BASE64 || '', // Base64-encoded AES key from environment variable
} as const

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


// Language badge colors (hex values for inline styles)
export const LANGUAGE_COLORS: Record<string, string> = {
  English: '#0d9488', // primary teal
  Hindi: '#22c55e', // green
  Punjabi: '#f97316', // orange
  Tamil: '#a855f7', // purple
  Telugu: '#3b82f6', // blue
} as const

export const DEFAULT_LANGUAGE_COLOR = '#6b7280' // gray