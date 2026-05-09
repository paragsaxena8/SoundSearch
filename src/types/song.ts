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