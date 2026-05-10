'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Song } from './gaana'
import {
  getDB,
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  deletePlaylist,
  renamePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistSongs,
  isSongInPlaylist,
  type Playlist,
  type StoredSong,
} from './db'

interface PlaylistContextType {
  playlists: Playlist[]
  isLoading: boolean
  createNewPlaylist: (name: string) => Promise<Playlist>
  removePlaylist: (id: string) => Promise<void>
  renamePlaylistById: (id: string, name: string) => Promise<void>
  addSong: (playlistId: string, song: Song) => Promise<void>
  removeSong: (playlistId: string, songId: string) => Promise<void>
  getSongs: (playlistId: string) => Promise<StoredSong[]>
  isSongAdded: (playlistId: string, songId: string) => Promise<boolean>
  refreshPlaylists: () => Promise<void>
}

const PlaylistContext = createContext<PlaylistContextType | null>(null)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize DB and load playlists
  useEffect(() => {
    const init = async () => {
      try {
        await getDB()
        const allPlaylists = await getAllPlaylists()
        setPlaylists(allPlaylists.sort((a, b) => b.updatedAt - a.updatedAt))
      } catch (error) {
        console.error('Failed to initialize playlists:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const refreshPlaylists = useCallback(async () => {
    try {
      const allPlaylists = await getAllPlaylists()
      setPlaylists(allPlaylists.sort((a, b) => b.updatedAt - a.updatedAt))
    } catch (error) {
      console.error('Failed to refresh playlists:', error)
    }
  }, [])

  const createNewPlaylist = useCallback(async (name: string) => {
    const playlist = await createPlaylist(name)
    await refreshPlaylists()
    return playlist
  }, [refreshPlaylists])

  const removePlaylist = useCallback(async (id: string) => {
    await deletePlaylist(id)
    await refreshPlaylists()
  }, [refreshPlaylists])

  const renamePlaylistById = useCallback(async (id: string, name: string) => {
    await renamePlaylist(id, name)
    await refreshPlaylists()
  }, [refreshPlaylists])

  const addSong = useCallback(async (playlistId: string, song: Song) => {
    const exists = await isSongInPlaylist(playlistId, song.id)
    if (exists) return
    await addSongToPlaylist(playlistId, song)
    await refreshPlaylists()
  }, [refreshPlaylists])

  const removeSong = useCallback(async (playlistId: string, songId: string) => {
    await removeSongFromPlaylist(playlistId, songId)
    await refreshPlaylists()
  }, [refreshPlaylists])

  const getSongs = useCallback(async (playlistId: string) => {
    return getPlaylistSongs(playlistId)
  }, [])

  const isSongAdded = useCallback(async (playlistId: string, songId: string) => {
    return isSongInPlaylist(playlistId, songId)
  }, [])

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        isLoading,
        createNewPlaylist,
        removePlaylist,
        renamePlaylistById,
        addSong,
        removeSong,
        getSongs,
        isSongAdded,
        refreshPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (!context) {
    throw new Error('usePlaylist must be used within PlaylistProvider')
  }
  return context
}

// Convert stored song back to Song format for playback
export function storedSongToSong(stored: StoredSong): Song {
  return {
    id: stored.id.split('-').slice(1).join('-'), // Remove playlist prefix
    title: stored.title,
    album: stored.album,
    artists: stored.artists,
    duration: stored.duration,
    language: stored.language,
    music: {
      very_high: stored.musicUrl,
      high: stored.musicUrl,
      medium: stored.musicUrl,
      low: stored.musicUrl,
    },
    thumbnail: stored.thumbnail,
  }
}