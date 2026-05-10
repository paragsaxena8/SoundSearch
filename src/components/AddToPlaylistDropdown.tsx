'use client'

import { useState, useEffect } from 'react'
import { usePlaylist } from '@/lib/playlist'
import { useToast } from '@/lib/toast'
import type { Song } from '@/lib/gaana'
import { MenuItem, MenuDivider } from './ActionsDropdown'

interface AddToPlaylistDropdownProps {
  song: Song
}

export function AddToPlaylistDropdown({ song }: AddToPlaylistDropdownProps) {
  const { playlists, isLoading, createNewPlaylist, addSong, isSongAdded } = usePlaylist()
  const { showToast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set())
  const [addingTo, setAddingTo] = useState<Set<string>>(new Set())

  // Check which playlists already have this song
  useEffect(() => {
    let isCancelled = false

    const checkAdded = async () => {
      // Reset stale state immediately when song/playlists change.
      setAddedTo(new Set())

      const results = await Promise.all(
        playlists.map(async (playlist) => {
          const isAdded = await isSongAdded(playlist.id, song.id)
          return isAdded ? playlist.id : null
        })
      )

      if (isCancelled) return

      const added = new Set<string>()
      for (const playlistId of results) {
        if (playlistId) added.add(playlistId)
      }
      setAddedTo(added)
    }

    if (playlists.length > 0) {
      checkAdded()
    } else {
      setAddedTo(new Set())
      setAddingTo(new Set())
    }

    return () => {
      isCancelled = true
    }
  }, [playlists, song.id, isSongAdded])

  const handleAddToPlaylist = async (playlistId: string) => {
    if (addedTo.has(playlistId) || addingTo.has(playlistId)) return

    setAddingTo((prev) => new Set(prev).add(playlistId))
    try {
      await addSong(playlistId, song)
      setAddedTo((prev) => new Set(prev).add(playlistId))
      const playlistName = playlists.find((playlist) => playlist.id === playlistId)?.name || 'Playlist'
      showToast('Added to playlist', `"${song.title}" added to ${playlistName}`)
    } catch (error) {
      console.error('Failed to add song:', error)
      showToast('Failed to add song', 'Please try again')
    } finally {
      setAddingTo((prev) => {
        const next = new Set(prev)
        next.delete(playlistId)
        return next
      })
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || newPlaylistName.trim().length > 100) return

    setIsCreating(true)
    try {
      const playlist = await createNewPlaylist(newPlaylistName.trim())
      await addSong(playlist.id, song)
      setAddedTo((prev) => new Set(prev).add(playlist.id))
      showToast('Playlist created', `"${song.title}" added to ${playlist.name}`)
      setNewPlaylistName('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create playlist:', error)
      showToast('Failed to create playlist', 'Please try again')
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-3 text-center text-text-muted text-sm">Loading...</div>
    )
  }

  return (
    <>
      {playlists.length === 0 && !isCreating && (
        <div className="px-4 py-3 text-center text-text-muted text-sm">No playlists yet</div>
      )}

      {playlists.map((playlist) => (
        <MenuItem
          key={playlist.id}
          label={playlist.name}
          onClick={() => handleAddToPlaylist(playlist.id)}
          disabled={addedTo.has(playlist.id) || addingTo.has(playlist.id)}
        />
      ))}

      <MenuDivider />

      {isCreating ? (
        <div className="px-3 py-2 flex gap-2">
          <input
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
            autoFocus
          />
          <button
            onClick={handleCreatePlaylist}
            disabled={!newPlaylistName.trim()}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : (
        <MenuItem
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
          label="Create new playlist"
          onClick={() => setIsCreating(true)}
        />
      )}
    </>
  )
}