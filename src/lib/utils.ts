import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LANGUAGE_COLORS, DEFAULT_LANGUAGE_COLOR } from './config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || DEFAULT_LANGUAGE_COLOR
}