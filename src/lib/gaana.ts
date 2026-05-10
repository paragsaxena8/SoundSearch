import axios from 'axios'
import crypto from 'crypto'
import { GAANA_ENDPOINTS, GAANA_DEFAULTS } from './gaana.server'

interface GaanaTrack {
  seo: string
}

interface GaanaTrackDetail {
  track_title: string
  album_title: string
  artist: Array<{ name: string }>
  duration: string
  language: string
  artwork_large: string
  artwork_web: string
  artwork: string
  urls?: {
    medium?: { message: string }
  }
}

interface GaanaSearchResponse {
  gr?: Array<{
    gd: GaanaTrack[]
  }>
}

interface GaanaDetailResponse {
  tracks: GaanaTrackDetail[]
}

function getKey(): Buffer {
  return Buffer.from(GAANA_DEFAULTS.key, 'base64')
}

function decrypt(encryptedData: string): string {
  const key = getKey()
  const offset = parseInt(encryptedData[0])
  if (Number.isNaN(offset) || offset < 0 || offset + 16 > encryptedData.length) {
    throw new Error('Invalid encrypted data format')
  }
  const iv = Buffer.from(encryptedData.slice(offset, offset + 16), 'utf8')
  const encrypted = Buffer.from(encryptedData.slice(offset + 16), 'base64')

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  return decrypted.toString('utf8')
}

function formatDuration(seconds: string): string {
  const secs = parseInt(seconds, 10)
  const mins = Math.floor(secs / 60)
  const remainingSecs = secs % 60
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
}

export interface Song {
  id: string
  title: string
  album: string
  artists: string
  duration: string
  language: string
  music: {
    very_high: string
    high: string
    medium: string
    low: string
  }
  thumbnail: {
    large: string
    medium: string
    small: string
  }
}

export async function searchSongs(query: string, limit: number = GAANA_DEFAULTS.limit): Promise<Song[]> {
  const searchUrl = `${GAANA_ENDPOINTS.search}?country=${GAANA_DEFAULTS.country}&page=${GAANA_DEFAULTS.page}&secType=${GAANA_DEFAULTS.secType}&type=${GAANA_DEFAULTS.type}&keyword=${encodeURIComponent(query)}`

  const { data } = await axios.post<GaanaSearchResponse>(searchUrl)

  try {
    const tracks = data.gr?.[0]?.gd?.slice(0, limit) || []
    const seoKeys = tracks.map((t) => t.seo)

    const songDetails = await Promise.all(seoKeys.map((seoKey) => getTrackDetail(seoKey)))
    return songDetails.filter((s): s is Song => s !== null)
  } catch {
    return []
  }
}

async function getTrackDetail(seoKey: string): Promise<Song | null> {
  try {
    const detailUrl = `${GAANA_ENDPOINTS.detail}?type=songDetail&seokey=${encodeURIComponent(seoKey)}`
    const { data } = await axios.post<GaanaDetailResponse>(detailUrl)
    const track = data.tracks[0]

    if (!track) return null

    const artists = track.artist.map((a) => a.name).join(', ')
    const music: Song['music'] = { very_high: '', high: '', medium: '', low: '' }

    if (track.urls?.medium?.message) {
      try {
        const baseUrl = decrypt(track.urls.medium.message)
        music.very_high = baseUrl.replace('64.mp4', '320.mp4')
        music.high = baseUrl.replace('64.mp4', '128.mp4')
        music.medium = baseUrl
        music.low = baseUrl.replace('64.mp4', '16.mp4')
      } catch {
        // Decryption failed, leave empty
      }
    }

    // Handle case where URLs might be direct m3u8
    if (!music.medium && track.urls?.medium?.message) {
      try {
        const decrypted = decrypt(track.urls.medium.message)
        music.medium = decrypted
        music.high = decrypted.replace('/64/', '/128/')
        music.very_high = decrypted.replace('/64/', '/320/')
        music.low = decrypted.replace('/64/', '/16/')
      } catch {
        // Leave empty
      }
    }

    return {
      id: seoKey,
      title: track.track_title,
      album: track.album_title,
      artists,
      duration: formatDuration(track.duration),
      language: track.language,
      music,
      thumbnail: {
        large: track.artwork_large?.trim() || '',
        medium: track.artwork_web?.trim() || '',
        small: track.artwork?.trim() || '',
      },
    }
  } catch {
    return null
  }
}