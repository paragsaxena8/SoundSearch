'use client'

import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react'
import type { LimitOption } from '@/types'
import type { Quality } from './config'
import { DEFAULT_QUALITY } from './config'
import { LIMIT_OPTIONS } from '@/types'

interface SettingsState {
  defaultLimit: LimitOption
  defaultQuality: Quality
  setDefaultLimit: (limit: LimitOption) => void
  setDefaultQuality: (quality: Quality) => void
}

const SettingsContext = createContext<SettingsState | null>(null)

const STORAGE_KEY_LIMIT = 'soundsearch_default_limit'
const STORAGE_KEY_QUALITY = 'soundsearch_default_quality'

function loadLimit(): LimitOption {
  if (typeof window === 'undefined') return LIMIT_OPTIONS[0]
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LIMIT)
    if (stored) {
      const parsed = Number(stored)
      if (LIMIT_OPTIONS.includes(parsed as LimitOption)) return parsed as LimitOption
    }
  } catch {}
  return LIMIT_OPTIONS[0]
}

function loadQuality(): Quality {
  if (typeof window === 'undefined') return DEFAULT_QUALITY
  try {
    const stored = localStorage.getItem(STORAGE_KEY_QUALITY)
    if (stored === 'low' || stored === 'medium' || stored === 'high') return stored
  } catch {}
  return DEFAULT_QUALITY
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [defaultLimit, setDefaultLimitState] = useState<LimitOption>(loadLimit)
  const [defaultQuality, setDefaultQualityState] = useState<Quality>(loadQuality)

  const setDefaultLimit = useCallback((limit: LimitOption) => {
    setDefaultLimitState(limit)
    try { localStorage.setItem(STORAGE_KEY_LIMIT, String(limit)) } catch {}
  }, [])

  const setDefaultQuality = useCallback((quality: Quality) => {
    setDefaultQualityState(quality)
    try { localStorage.setItem(STORAGE_KEY_QUALITY, quality) } catch {}
  }, [])

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_LIMIT && e.newValue) {
        const parsed = Number(e.newValue)
        if (LIMIT_OPTIONS.includes(parsed as LimitOption)) setDefaultLimitState(parsed as LimitOption)
      }
      if (e.key === STORAGE_KEY_QUALITY && e.newValue) {
        const val = e.newValue
        if (val === 'low' || val === 'medium' || val === 'high') setDefaultQualityState(val)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <SettingsContext.Provider value={{ defaultLimit, defaultQuality, setDefaultLimit, setDefaultQuality }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}