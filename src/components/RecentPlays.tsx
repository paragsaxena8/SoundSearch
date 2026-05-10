'use client'

import { useCache } from '@/lib/cache'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { getLanguageColor } from '@/lib/utils'
import { QUALITY_OPTIONS, DEFAULT_QUALITY } from '@/lib/config'

interface RecentPlaysProps {
  onPlay: (song: Song, quality: Quality) => void
}

export function RecentPlays({ onPlay }: RecentPlaysProps) {
  const { getRecentPlays } = useCache()
  const recentPlays = getRecentPlays()

  if (recentPlays.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Plays</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recentPlays.map((play) => (
          <div
            key={`${play.song.id}-${play.playedAt}`}
            onClick={() => onPlay(play.song, play.quality)}
            className="flex-shrink-0 w-36 group cursor-pointer"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
              <img
                src={play.song.thumbnail.medium}
                alt={play.song.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-white text-[10px] font-medium"
                style={{ backgroundColor: getLanguageColor(play.song.language) }}
              >
                {play.song.language}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-text-primary truncate">{play.song.title}</p>
            <p className="text-xs text-text-secondary truncate">{play.song.artists}</p>
          </div>
        ))}
      </div>
    </div>
  )
}