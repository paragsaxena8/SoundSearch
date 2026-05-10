const DB_NAME = 'soundsearch'
const DB_VERSION = 1
const PLAYLISTS_STORE = 'playlists'
const SONGS_STORE = 'songs'

export interface StoredSong {
  id: string // song id
  title: string
  album: string
  artists: string
  duration: string
  language: string
  musicUrl: string // high quality url
  thumbnail: {
    large: string
    medium: string
    small: string
  }
  addedAt: number
}

export interface Playlist {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  songIds: string[]
}

let dbInstance: IDBDatabase | null = null

export function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create playlists store
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' })
      }

      // Create songs store
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        const songsStore = db.createObjectStore(SONGS_STORE, { keyPath: 'id' })
        songsStore.createIndex('playlistId', 'playlistId', { unique: false })
      }
    }
  })
}

// Playlist operations
export async function createPlaylist(name: string): Promise<Playlist> {
  const db = await getDB()
  const playlist: Playlist = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    songIds: [],
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PLAYLISTS_STORE, 'readwrite')
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const request = store.add(playlist)

    request.onsuccess = () => resolve(playlist)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PLAYLISTS_STORE, 'readonly')
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getPlaylist(id: string): Promise<Playlist | null> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PLAYLISTS_STORE, 'readonly')
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYLISTS_STORE, SONGS_STORE], 'readwrite')

    // Delete all songs in playlist
    const songsStore = transaction.objectStore(SONGS_STORE)
    const songsRequest = songsStore.getAll()
    songsRequest.onsuccess = () => {
      const songs = songsRequest.result as StoredSong[]
      songs.forEach((song) => {
        if (song.id.startsWith(id)) {
          songsStore.delete(song.id)
        }
      })
    }

    // Delete playlist
    const playlistsStore = transaction.objectStore(PLAYLISTS_STORE)
    const request = playlistsStore.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function renamePlaylist(id: string, name: string): Promise<Playlist> {
  const db = await getDB()
  const playlist = await getPlaylist(id)
  if (!playlist) throw new Error('Playlist not found')

  playlist.name = name
  playlist.updatedAt = Date.now()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PLAYLISTS_STORE, 'readwrite')
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const request = store.put(playlist)

    request.onsuccess = () => resolve(playlist)
    request.onerror = () => reject(request.error)
  })
}

// Song operations
export async function addSongToPlaylist(
  playlistId: string,
  song: {
    id: string
    title: string
    album: string
    artists: string
    duration: string
    language: string
    music: { very_high: string; high: string; medium: string; low: string }
    thumbnail: { large: string; medium: string; small: string }
  }
): Promise<StoredSong> {
  const db = await getDB()
  const playlist = await getPlaylist(playlistId)
  if (!playlist) throw new Error('Playlist not found')

  const storedSong: StoredSong = {
    id: `${playlistId}-${song.id}`,
    title: song.title,
    album: song.album,
    artists: song.artists,
    duration: song.duration,
    language: song.language,
    musicUrl: song.music.very_high || song.music.high || song.music.medium || song.music.low,
    thumbnail: song.thumbnail,
    addedAt: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYLISTS_STORE, SONGS_STORE], 'readwrite')

    // Add song
    const songsStore = transaction.objectStore(SONGS_STORE)
    songsStore.add(storedSong)

    // Update playlist
    if (!playlist.songIds.includes(storedSong.id)) {
      playlist.songIds.push(storedSong.id)
      playlist.updatedAt = Date.now()
      const playlistsStore = transaction.objectStore(PLAYLISTS_STORE)
      playlistsStore.put(playlist)
    }

    transaction.oncomplete = () => resolve(storedSong)
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const db = await getDB()
  const playlist = await getPlaylist(playlistId)
  if (!playlist) throw new Error('Playlist not found')

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PLAYLISTS_STORE, SONGS_STORE], 'readwrite')

    // Delete song
    const songsStore = transaction.objectStore(SONGS_STORE)
    songsStore.delete(songId)

    // Update playlist
    playlist.songIds = playlist.songIds.filter((id) => id !== songId)
    playlist.updatedAt = Date.now()
    const playlistsStore = transaction.objectStore(PLAYLISTS_STORE)
    playlistsStore.put(playlist)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getPlaylistSongs(playlistId: string): Promise<StoredSong[]> {
  const db = await getDB()
  const playlist = await getPlaylist(playlistId)
  if (!playlist) return []

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SONGS_STORE, 'readonly')
    const store = transaction.objectStore(SONGS_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const allSongs = request.result as StoredSong[]
      const playlistSongs = allSongs
        .filter((song) => song.id.startsWith(playlistId))
        .sort((a, b) => a.addedAt - b.addedAt)
      resolve(playlistSongs)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function isSongInPlaylist(playlistId: string, songId: string): Promise<boolean> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SONGS_STORE, 'readonly')
    const store = transaction.objectStore(SONGS_STORE)
    const request = store.get(`${playlistId}-${songId}`)

    request.onsuccess = () => resolve(!!request.result)
    request.onerror = () => reject(request.error)
  })
}