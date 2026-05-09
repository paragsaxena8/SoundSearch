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