'use client'

import { useState, useEffect } from 'react'
import { Navbar, SearchBar, SongCard, FeatureCard, LoadingSkeleton, EmptyState, ErrorState, MusicPlayer, PlaylistModal, RecentPlays } from '@/components'
import { CacheProvider, useSearchCache, useCache } from '@/lib/cache'
import { PlaylistProvider } from '@/lib/playlist'
import type { Song } from '@/lib/gaana'
import type { LimitOption } from '@/types'
import type { Quality } from '@/lib/config'

function SearchPage() {
  const { songs, isLoading, error, hasSearched, search } = useSearchCache()
  const { getNowPlaying, setNowPlaying, clearNowPlaying, addRecentPlay } = useCache()
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentQuality, setCurrentQuality] = useState<Quality>('high')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)

  // Restore now-playing from cache on mount
  useEffect(() => {
    const cached = getNowPlaying()
    if (cached) {
      setCurrentSong(cached.song)
      setCurrentQuality(cached.quality)
      // Don't auto-play on restore - user needs to hit play
    }
  }, [getNowPlaying])

  const handleSearch = (query: string, limit: LimitOption) => {
    // Don't clear player on new search - keep playing
    search(query, limit)
  }

  const handlePlay = (song: Song, quality: Quality) => {
    setCurrentSong(song)
    setCurrentQuality(quality)
    setIsPlaying(true)
    setNowPlaying(song, quality)
    // Add to recent plays
    addRecentPlay(song, quality)
  }

  const handleClosePlayer = () => {
    setCurrentSong(null)
    setIsPlaying(false)
    clearNowPlaying()
  }

  const handlePlayFromPlaylist = (song: Song, quality: Quality) => {
    setCurrentSong(song)
    setCurrentQuality(quality)
    setIsPlaying(true)
    setNowPlaying(song, quality)
    addRecentPlay(song, quality)
    setIsPlaylistModalOpen(false)
  }

  const featuredSong = songs[0]
  const restSongs = songs.slice(1)

  return (
    <div className={currentSong ? 'pb-32' : ''}>
      <div className="min-h-screen bg-canvas">
        <Navbar onOpenPlaylists={() => setIsPlaylistModalOpen(true)} />

        <main className="flex flex-col items-center px-6 py-16">
          <h1 className="text-[28px] font-bold text-text-primary tracking-[-0.02em]">
            Find your music
          </h1>
          <p className="text-base text-text-secondary mt-2 mb-8">
            Search millions of songs from Gaana
          </p>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </main>

        <section className="px-6 pb-16">
          {/* Recent Plays - shown when not searching */}
          {!hasSearched && <RecentPlays onPlay={handlePlay} />}

          {isLoading ? (
            <LoadingSkeleton count={5} />
          ) : error ? (
            <ErrorState message={error} />
          ) : !hasSearched ? (
            <EmptyState />
          ) : songs.length === 0 ? (
            <ErrorState message="No songs found. Try a different search." />
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Featured song */}
              {featuredSong && (
                <FeatureCard song={featuredSong} onPlay={handlePlay} />
              )}

              {/* Rest as list */}
              {restSongs.length > 0 && (
                <div className="space-y-3">
                  {restSongs.map((song) => (
                    <SongCard key={song.id} song={song} onPlay={handlePlay} />
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
          quality={currentQuality}
          onClose={handleClosePlayer}
          onQualityChange={setCurrentQuality}
          autoPlay={isPlaying}
        />
      )}

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onPlaySong={handlePlayFromPlaylist}
      />
    </div>
  )
}

export default function Home() {
  return (
    <CacheProvider>
      <PlaylistProvider>
        <SearchPage />
      </PlaylistProvider>
    </CacheProvider>
  )
}