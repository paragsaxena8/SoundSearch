'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Song } from './gaana'
import type { Quality } from './config'

interface NowPlaying {
  song: Song
  quality: Quality
}

interface RecentPlay {
  song: Song
  quality: Quality
  playedAt: number
}

interface CacheState {
  searchResults: Map<string, { songs: Song[]; timestamp: number }>
  streamUrls: Map<string, { [key in 'low' | 'medium' | 'high' | 'very_high']?: string }>
  nowPlaying: NowPlaying | null
  recentPlays: RecentPlay[]
}

interface CacheContextType {
  getSearchResults: (query: string, limit: number) => Song[] | null
  setSearchResults: (query: string, limit: number, songs: Song[]) => void
  getStreamUrl: (songId: string, quality: Quality) => string | null
  setStreamUrl: (songId: string, quality: Quality, url: string) => void
  getNowPlaying: () => NowPlaying | null
  setNowPlaying: (song: Song, quality: Quality) => void
  clearNowPlaying: () => void
  getRecentPlays: () => RecentPlay[]
  addRecentPlay: (song: Song, quality: Quality) => void
  clearRecentPlays: () => void
  clearCache: () => void
}

const CacheContext = createContext<CacheContextType | null>(null)

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const NOW_PLAYING_KEY = 'soundsearch_nowplaying'
const RECENT_PLAYS_KEY = 'soundsearch_recentplays'
const MAX_RECENT_PLAYS = 5

// Helper to load now-playing from localStorage
function loadNowPlayingFromStorage(): NowPlaying | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(NOW_PLAYING_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore errors
  }
  return null
}

// Helper to save now-playing to localStorage
function saveNowPlayingToStorage(data: NowPlaying | null) {
  if (typeof window === 'undefined') return
  try {
    if (data) {
      localStorage.setItem(NOW_PLAYING_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(NOW_PLAYING_KEY)
    }
  } catch {
    // Ignore errors
  }
}

// Helper to load recent plays from localStorage
function loadRecentPlaysFromStorage(): RecentPlay[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_PLAYS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore errors
  }
  return []
}

// Helper to save recent plays to localStorage
function saveRecentPlaysToStorage(data: RecentPlay[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_PLAYS_KEY, JSON.stringify(data))
  } catch {
    // Ignore errors
  }
}

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<CacheState>({
    searchResults: new Map(),
    streamUrls: new Map(),
    nowPlaying: null,
    recentPlays: [],
  })

  // Load now-playing and recent plays from localStorage on mount
  useEffect(() => {
    const stored = loadNowPlayingFromStorage()
    const recentPlays = loadRecentPlaysFromStorage()
    setCache((prev) => ({
      ...prev,
      nowPlaying: stored,
      recentPlays,
    }))
  }, [])

  const getSearchResults = useCallback((query: string, limit: number): Song[] | null => {
    const key = `${query}-${limit}`
    const cached = cache.searchResults.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.songs
    }
    return null
  }, [cache.searchResults])

  const setSearchResults = useCallback((query: string, limit: number, songs: Song[]) => {
    const key = `${query}-${limit}`
    setCache((prev) => {
      const newSearchResults = new Map(prev.searchResults)
      newSearchResults.set(key, { songs, timestamp: Date.now() })
      return { ...prev, searchResults: newSearchResults }
    })
  }, [])

  const getStreamUrl = useCallback((songId: string, quality: Quality): string | null => {
    const urls = cache.streamUrls.get(songId)
    if (!urls) return null

    const qualityMap: Record<Quality, 'low' | 'medium' | 'high' | 'very_high'> = {
      low: 'low',
      medium: 'medium',
      high: 'very_high',
    }
    return urls[qualityMap[quality]] || null
  }, [cache.streamUrls])

  const setStreamUrl = useCallback((songId: string, quality: Quality, url: string) => {
    const qualityMap: Record<Quality, 'low' | 'medium' | 'high' | 'very_high'> = {
      low: 'low',
      medium: 'medium',
      high: 'very_high',
    }
    setCache((prev) => {
      const newStreamUrls = new Map(prev.streamUrls)
      const existing = newStreamUrls.get(songId) || {}
      newStreamUrls.set(songId, { ...existing, [qualityMap[quality]]: url })
      return { ...prev, streamUrls: newStreamUrls }
    })
  }, [])

  const getNowPlaying = useCallback((): NowPlaying | null => {
    return cache.nowPlaying
  }, [cache.nowPlaying])

  const setNowPlaying = useCallback((song: Song, quality: Quality) => {
    const data: NowPlaying = { song, quality }
    saveNowPlayingToStorage(data)
    setCache((prev) => ({
      ...prev,
      nowPlaying: data,
    }))
  }, [])

  const clearNowPlaying = useCallback(() => {
    saveNowPlayingToStorage(null)
    setCache((prev) => ({
      ...prev,
      nowPlaying: null,
    }))
  }, [])

  const getRecentPlays = useCallback((): RecentPlay[] => {
    return cache.recentPlays
  }, [cache.recentPlays])

  const addRecentPlay = useCallback((song: Song, quality: Quality) => {
    setCache((prev) => {
      // Remove existing entry for this song if present
      const filtered = prev.recentPlays.filter((rp) => rp.song.id !== song.id)
      // Add new entry at the beginning
      const newRecentPlays = [
        { song, quality, playedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_PLAYS)
      // Save to localStorage
      saveRecentPlaysToStorage(newRecentPlays)
      return {
        ...prev,
        recentPlays: newRecentPlays,
      }
    })
  }, [])

  const clearRecentPlays = useCallback(() => {
    saveRecentPlaysToStorage([])
    setCache((prev) => ({
      ...prev,
      recentPlays: [],
    }))
  }, [])

  const clearCache = useCallback(() => {
    saveNowPlayingToStorage(null)
    saveRecentPlaysToStorage([])
    setCache({
      searchResults: new Map(),
      streamUrls: new Map(),
      nowPlaying: null,
      recentPlays: [],
    })
  }, [])

  return (
    <CacheContext.Provider
      value={{
        getSearchResults,
        setSearchResults,
        getStreamUrl,
        setStreamUrl,
        getNowPlaying,
        setNowPlaying,
        clearNowPlaying,
        getRecentPlays,
        addRecentPlay,
        clearRecentPlays,
        clearCache,
      }}
    >
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (!context) {
    throw new Error('useCache must be used within CacheProvider')
  }
  return context
}

// Hook to manage search state with caching
export function useSearchCache() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { getSearchResults, setSearchResults } = useCache()

  const search = useCallback(async (query: string, limit: number) => {
    // Check cache first
    const cached = getSearchResults(query, limit)
    if (cached) {
      setSongs(cached)
      setHasSearched(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to search')
      }
      const data = await response.json()
      setSongs(data)
      setSearchResults(query, limit, data)
    } catch {
      setError('Failed to search. Please try again.')
      setSongs([])
    } finally {
      setIsLoading(false)
    }
  }, [getSearchResults, setSearchResults])

  const clear = useCallback(() => {
    setSongs([])
    setError(null)
    setHasSearched(false)
  }, [])

  return { songs, isLoading, error, hasSearched, search, clear }
}

// Hook to manage now-playing state
export function useNowPlaying() {
  const { getNowPlaying, setNowPlaying, clearNowPlaying } = useCache()

  return {
    nowPlaying: getNowPlaying(),
    play: setNowPlaying,
    stop: clearNowPlaying,
  }
}

// Hook to manage recent plays
export function useRecentPlays() {
  const { getRecentPlays, addRecentPlay, clearRecentPlays } = useCache()

  return {
    recentPlays: getRecentPlays(),
    add: addRecentPlay,
    clear: clearRecentPlays,
  }
}