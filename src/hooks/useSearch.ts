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