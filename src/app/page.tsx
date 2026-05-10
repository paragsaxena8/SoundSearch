'use client'

import { useState, useEffect } from 'react'
import { Navbar, SearchBar, SongCard, FeatureCard, LoadingSkeleton, EmptyState, ErrorState, MusicPlayer, PlaylistModal, RecentPlays, Toaster, DashboardPlaylists } from '@/components'
import { CacheProvider, useSearchCache, useCache } from '@/lib/cache'
import { PlaylistProvider, usePlaylist } from '@/lib/playlist'
import { ToastProvider, useToast } from '@/lib/toast'
import { SettingsProvider, useSettings } from '@/lib/settings'
import type { Song } from '@/lib/gaana'
import type { LimitOption } from '@/types'
import type { Quality } from '@/lib/config'

function SearchPage() {
  const { songs, isLoading, error, hasSearched, search } = useSearchCache()
  const { playlists } = usePlaylist()
  const { getNowPlaying, getRecentPlays, setNowPlaying, clearNowPlaying, addRecentPlay, getRecentSearches, addRecentSearch, clearRecentSearches } = useCache()
  const { showToast } = useToast()
  const { defaultLimit, defaultQuality } = useSettings()
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [currentQuality, setCurrentQuality] = useState<Quality>(defaultQuality)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null)

  // Restore now-playing and queue from cache on mount
  useEffect(() => {
    const cached = getNowPlaying()
    if (cached) {
      setCurrentSong(cached.song)
      setCurrentQuality(cached.quality)
    }
    try {
      const savedQueue = localStorage.getItem('soundsearch_queue')
      if (savedQueue) {
        const parsed = JSON.parse(savedQueue) as Song[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQueue(parsed)
        } else if (cached) {
          setQueue([cached.song])
        }
      } else if (cached) {
        setQueue([cached.song])
      }
    } catch {
      if (cached) setQueue([cached.song])
    }
    // Don't auto-play on restore - user needs to hit play
  }, [getNowPlaying])

  // Persist queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('soundsearch_queue', JSON.stringify(queue))
    } catch {
      // Ignore storage errors
    }
  }, [queue])

  const handleSearch = (query: string, limit: LimitOption) => {
    addRecentSearch(query)
    search(query, limit)
  }

  const handlePlay = (song: Song, quality: Quality) => {
    setCurrentSong(song)
    setQueue((prev) => prev.some((s) => s.id === song.id) ? prev : [...prev, song])
    setCurrentQuality(quality)
    setIsPlaying(true)
    setNowPlaying(song, quality)
    // Add to recent plays
    addRecentPlay(song, quality)
  }

  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => prev.some((s) => s.id === song.id) ? prev : [...prev, song])
    showToast('Added to queue', song.title)
  }

  const handleClosePlayer = () => {
    setCurrentSong(null)
    setIsPlaying(false)
    clearNowPlaying()
  }

  const handlePlayFromPlaylist = (song: Song, quality: Quality) => {
    setCurrentSong(song)
    setQueue((prev) => prev.some((s) => s.id === song.id) ? prev : [...prev, song])
    setCurrentQuality(quality)
    setIsPlaying(true)
    setNowPlaying(song, quality)
    addRecentPlay(song, quality)
    setIsPlaylistModalOpen(false)
    setOpenPlaylistId(null)
  }

  const handlePlayFromQueue = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    setNowPlaying(song, currentQuality)
    addRecentPlay(song, currentQuality)
  }

  const getQueueIndex = () => {
    if (!currentSong) return -1
    return queue.findIndex((queuedSong) => queuedSong.id === currentSong.id)
  }

  const handlePlayNextInQueue = () => {
    const currentIndex = getQueueIndex()
    if (currentIndex < 0 || currentIndex >= queue.length - 1) {
      setIsPlaying(false)
      return
    }
    handlePlayFromQueue(queue[currentIndex + 1])
  }

  const handlePlayPrevInQueue = () => {
    const currentIndex = getQueueIndex()
    if (currentIndex <= 0) return
    handlePlayFromQueue(queue[currentIndex - 1])
  }

  const handleRemoveFromQueue = (songId: string) => {
    setQueue((prev) => {
      const removingIndex = prev.findIndex((queuedSong) => queuedSong.id === songId)
      const nextQueue = prev.filter((queuedSong) => queuedSong.id !== songId)

      if (removingIndex === -1) return prev
      if (!currentSong || currentSong.id !== songId) return nextQueue

      if (nextQueue.length === 0) {
        setCurrentSong(null)
        setIsPlaying(false)
        clearNowPlaying()
        return nextQueue
      }

      const fallbackIndex = Math.min(removingIndex, nextQueue.length - 1)
      const nextSong = nextQueue[fallbackIndex]
      setCurrentSong(nextSong)
      setNowPlaying(nextSong, currentQuality)
      setIsPlaying(true)
      return nextQueue
    })
  }

  const handleMoveQueueItem = (songId: string, direction: 'up' | 'down') => {
    setQueue((prev) => {
      const index = prev.findIndex((queuedSong) => queuedSong.id === songId)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const swapIndex = direction === 'up' ? index - 1 : index + 1
      const nextQueue = [...prev]
      const temp = nextQueue[index]
      nextQueue[index] = nextQueue[swapIndex]
      nextQueue[swapIndex] = temp
      return nextQueue
    })
  }

  const handleClearQueue = () => {
    if (!currentSong) {
      setQueue([])
    } else {
      setQueue([currentSong])
    }
  }

  const featuredSong = songs[0]
  const restSongs = songs.slice(1)
  const hasDashboardContent = getRecentPlays().length > 0 || playlists.length > 0

  return (
    <div className={currentSong ? 'pb-32' : ''}>
      <div className="min-h-screen bg-canvas">
        <Navbar onOpenPlaylists={() => { setOpenPlaylistId(null); setIsPlaylistModalOpen(true) }} />

        <main className="flex flex-col items-center px-6 py-16">
          <h1 className="text-[28px] font-bold text-text-primary uppercase tracking-wide">
            Find your music
          </h1>
          <p className="text-base text-text-secondary mt-2 mb-8 font-mono">
            Search millions of songs from Gaana
          </p>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} recentSearches={getRecentSearches()} onClearRecentSearches={clearRecentSearches} defaultLimit={defaultLimit} />
        </main>

        <section className="px-6 pb-16">
          {/* Recent Plays - shown when not searching */}
          {!hasSearched && <RecentPlays onPlay={handlePlay} />}
          {!hasSearched && (
            <DashboardPlaylists
              playlists={playlists}
              onOpenPlaylists={() => { setOpenPlaylistId(null); setIsPlaylistModalOpen(true) }}
              onOpenPlaylist={(playlistId) => { setOpenPlaylistId(playlistId); setIsPlaylistModalOpen(true) }}
            />
          )}

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState message={error} />
          ) : !hasSearched ? (
            hasDashboardContent ? null : <EmptyState />
          ) : songs.length === 0 ? (
            <ErrorState message="No songs found. Try a different search." />
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Featured song */}
              {featuredSong && (
                <FeatureCard song={featuredSong} onPlay={handlePlay} onAddToQueue={handleAddToQueue} defaultQuality={defaultQuality} />
              )}

              {/* Rest as list */}
              {restSongs.length > 0 && (
                <div className="space-y-3">
                  {restSongs.map((song) => (
                    <SongCard key={song.id} song={song} onPlay={handlePlay} onAddToQueue={handleAddToQueue} defaultQuality={defaultQuality} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {currentSong && (
        <MusicPlayer
          song={currentSong}
          queue={queue}
          quality={currentQuality}
          onClose={handleClosePlayer}
          onPlayFromQueue={handlePlayFromQueue}
          onPlayNextInQueue={handlePlayNextInQueue}
          onPlayPrevInQueue={handlePlayPrevInQueue}
          onRemoveFromQueue={handleRemoveFromQueue}
          onMoveQueueItem={handleMoveQueueItem}
          onClearQueue={handleClearQueue}
          autoPlay={isPlaying}
        />
      )}

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => { setIsPlaylistModalOpen(false); setOpenPlaylistId(null) }}
        onPlaySong={handlePlayFromPlaylist}
        onAddToQueue={handleAddToQueue}
        defaultQuality={defaultQuality}
        initialPlaylistId={openPlaylistId}
      />
    </div>
  )
}

export default function Home() {
  return (
    <CacheProvider>
      <ToastProvider>
        <PlaylistProvider>
          <SettingsProvider>
            <SearchPage />
            <Toaster />
          </SettingsProvider>
        </PlaylistProvider>
      </ToastProvider>
    </CacheProvider>
  )
}