import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from './config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR
}

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function safeWindowOpen(url: string): Window | null | undefined {
  if (!url || !isSafeUrl(url)) return null
  return window.open(url, '_blank', 'noopener,noreferrer')
}