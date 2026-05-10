'use client'

import { useState, useEffect, useRef } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import { usePlaylist } from '@/lib/playlist'
import type { Song } from '@/lib/gaana'

interface AddToPlaylistDropdownProps {
  song: Song
  onClose?: () => void
}

export function AddToPlaylistDropdown({ song, onClose }: AddToPlaylistDropdownProps) {
  const { playlists, isLoading, createNewPlaylist, addSong, isSongAdded } = usePlaylist()
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // Check which playlists already have this song
  useEffect(() => {
    const checkAdded = async () => {
      const added = new Set<string>()
      for (const playlist of playlists) {
        const isAdded = await isSongAdded(playlist.id, song.id)
        if (isAdded) added.add(playlist.id)
      }
      setAddedTo(added)
    }
    if (playlists.length > 0) {
      checkAdded()
    }
  }, [playlists, song.id, isSongAdded])

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addSong(playlistId, song)
      setAddedTo((prev) => new Set(prev).add(playlistId))
    } catch (error) {
      console.error('Failed to add song:', error)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    setIsCreating(true)
    try {
      const playlist = await createNewPlaylist(newPlaylistName.trim())
      await addSong(playlist.id, song)
      setAddedTo((prev) => new Set(prev).add(playlist.id))
      setNewPlaylistName('')
      setIsCreating(false)
      onClose?.()
    } catch (error) {
      console.error('Failed to create playlist:', error)
      setIsCreating(false)
    }
  }

  return (
    <div className="py-1">
      {isLoading ? (
        <div className="px-4 py-3 text-center text-text-muted text-sm">Loading...</div>
      ) : (
        <>
          {playlists.length === 0 && !isCreating && (
            <div className="px-4 py-3 text-center text-text-muted text-sm">
              No playlists yet
            </div>
          )}

          <div className="max-h-40 overflow-y-auto">
            {playlists.map((playlist) => (
              <DropdownMenu.Item
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={addedTo.has(playlist.id)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors outline-none cursor-pointer',
                  'hover:bg-surface-elevated focus:bg-surface-elevated',
                  addedTo.has(playlist.id)
                    ? 'text-primary opacity-60 cursor-default'
                    : 'text-text-primary'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{playlist.name}</span>
                  {addedTo.has(playlist.id) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
              </DropdownMenu.Item>
            ))}
          </div>

          {/* Create new playlist */}
          <div className="border-t border-border mt-1 pt-1">
            {isCreating ? (
              <div className="px-3 py-2 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="flex-1 bg-surface-elevated text-text-primary text-sm px-3 py-1.5 rounded border border-border outline-none focus:border-primary"
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
                  className="px-3 py-1.5 bg-primary text-white text-sm rounded disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ) : (
              <DropdownMenu.Item
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors outline-none cursor-pointer flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create new playlist
              </DropdownMenu.Item>
            )}
          </div>
        </>
      )}
    </div>
  )
}