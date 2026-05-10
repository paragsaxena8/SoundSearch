'use client'

import { useState, useEffect } from 'react'
import { cn, safeWindowOpen } from '@/lib/utils'
import { usePlaylist, storedSongToSong } from '@/lib/playlist'
import { ActionsDropdown, MenuItem, MenuDivider } from './ActionsDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_TO_MUSIC_KEY } from '@/lib/config'
import type { StoredSong } from '@/lib/db'

interface PlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  onPlaySong: (song: Song, quality: Quality) => void
  onAddToQueue?: (song: Song) => void
  initialPlaylistId?: string | null
  defaultQuality?: Quality
}

export function PlaylistModal({ isOpen, onClose, onPlaySong, onAddToQueue, initialPlaylistId, defaultQuality = 'high' }: PlaylistModalProps) {
  const { playlists, isLoading, createNewPlaylist, removePlaylist, getSongs } = usePlaylist()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(initialPlaylistId ?? null)
  const [songs, setSongs] = useState<StoredSong[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  // Auto-load songs when opened directly to a specific playlist
  useEffect(() => {
    let isCancelled = false
    if (isOpen && initialPlaylistId) {
      setSelectedPlaylist(initialPlaylistId)
      getSongs(initialPlaylistId).then((playlistSongs) => {
        if (!isCancelled) setSongs(playlistSongs)
      })
    }
    if (!isOpen) {
      setSelectedPlaylist(null)
      setSongs([])
    }
    return () => { isCancelled = true }
  }, [isOpen, initialPlaylistId, getSongs])

  const handleSelectPlaylist = async (playlistId: string) => {
    setSelectedPlaylist(playlistId)
    const playlistSongs = await getSongs(playlistId)
    setSongs(playlistSongs)
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || newPlaylistName.trim().length > 100) return
    setIsCreating(true)
    try {
      await createNewPlaylist(newPlaylistName.trim())
      setNewPlaylistName('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create playlist:', error)
      setIsCreating(false)
    }
  }

  const toSong = (storedSong: StoredSong): Song => ({
    id: storedSong.id,
    title: storedSong.title,
    artists: storedSong.artists,
    album: storedSong.album,
    duration: storedSong.duration,
    language: storedSong.language,
    music: {
      very_high: storedSong.musicUrl,
      high: storedSong.musicUrl,
      medium: storedSong.musicUrl,
      low: storedSong.musicUrl,
    },
    thumbnail: storedSong.thumbnail,
  })

  const handlePlaySong = (storedSong: StoredSong) => {
    const song = toSong(storedSong)
    onPlaySong(song, defaultQuality)
  }

  const handleAddToQueue = (storedSong: StoredSong) => {
    if (!onAddToQueue) return
    const song = toSong(storedSong)
    onAddToQueue(song)
  }

  const handleDownload = (storedSong: StoredSong) => {
    const song = toSong(storedSong)
    const musicKey = QUALITY_TO_MUSIC_KEY[defaultQuality]
    const url = song.music[musicKey] || song.music.high || song.music.medium || song.music.low
    if (url) safeWindowOpen(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border-2 border-border shadow-brutal-lg w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border">
          <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide">
            {selectedPlaylist
              ? playlists.find(p => p.id === selectedPlaylist)?.name ?? 'Playlist'
              : 'My Playlists'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-error transition-colors border-2 border-transparent hover:border-error"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center text-text-muted font-bold uppercase py-8">Loading...</div>
          ) : selectedPlaylist ? (
            /* Songs in playlist */
            <div className="space-y-2">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4 font-bold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to playlists
              </button>

              {songs.length === 0 ? (
                <div className="text-center text-text-muted font-bold uppercase py-8">No songs in this playlist</div>
              ) : (
                songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-2 border-2 border-border bg-surface-elevated hover:border-primary transition-colors"
                  >
                    <img
                      src={song.thumbnail.small}
                      alt={song.title}
                      className="w-10 h-10 border border-border object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{song.title}</p>
                      <p className="text-xs text-text-secondary truncate">{song.artists}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="w-8 h-8 border-2 border-border bg-primary flex items-center justify-center hover:shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                        title="Play"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A1A">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <ActionsDropdown>
                        {onAddToQueue && (
                          <MenuItem
                            icon={
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            }
                            label="Add to queue"
                            onClick={() => handleAddToQueue(song)}
                          />
                        )}
                        <MenuDivider />
                        <MenuItem
                          icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                          }
                          label="Download"
                          onClick={() => handleDownload(song)}
                        />
                      </ActionsDropdown>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Playlists list */
            <div className="space-y-2">
              {/* Create new playlist */}
              {isCreating ? (
                <div className="flex gap-2 p-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="flex-1 bg-surface-elevated text-text-primary text-sm font-medium px-3 py-2 border-2 border-border outline-none focus:border-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreatePlaylist()
                      if (e.key === 'Escape') {
                        setIsCreating(false)
                        setNewPlaylistName('')
                      }
                    }}
                  />
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim() || isCreating}
                    className="px-4 py-2 bg-primary text-border text-sm font-bold border-2 border-border disabled:opacity-50 hover:shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    Create
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full p-3 border-2 border-dashed border-border text-text-secondary hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-wide"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Create new playlist
                </button>
              )}

              {/* Playlist items */}
              {playlists.length === 0 && !isCreating && (
                <div className="text-center text-text-muted font-bold uppercase py-8">
                  No playlists yet. Create one to save your favorite songs!
                </div>
              )}

              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-3 p-3 border-2 border-border bg-surface-elevated hover:border-primary transition-colors cursor-pointer group"
                  onClick={() => handleSelectPlaylist(playlist.id)}
                >
                  <div className="w-12 h-12 bg-primary/20 border-2 border-border flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2.5" />
                      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{playlist.name}</p>
                    <p className="text-xs text-text-muted font-mono">{playlist.songIds.length} songs</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this playlist?')) {
                        removePlaylist(playlist.id)
                      }
                    }}
                    className="p-2 text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}