import { useState } from 'react'
import { cn, formatDuration, getLanguageColor } from '../lib/utils'
import type { Song, Quality } from '../types/song'
import { QualitySelector } from './QualitySelector'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  const [selectedQuality, setSelectedQuality] = useState<Quality>('high')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative aspect-square rounded-card overflow-hidden transition-all duration-200',
          isHovered && 'shadow-elevated'
        )}
      >
        <img
          src={song.thumbnail.medium}
          alt={`${song.title} album art`}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            isHovered && 'scale-[1.02]'
          )}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-pill bg-black/70 text-white text-xs font-medium">
          {formatDuration(song.duration)}
        </div>

        {/* Language badge */}
        <div
          className="absolute bottom-2 left-2 px-3 py-1 rounded-pill text-white text-xs font-medium"
          style={{ backgroundColor: getLanguageColor(song.language) }}
        >
          {song.language}
        </div>

        {/* Play orb */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d9488">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <div className="pt-3">
        <h3 className="text-base font-semibold text-text-primary truncate">
          {song.title}
        </h3>
        <p className="text-sm text-text-secondary truncate">{song.artists}</p>
        <p className="text-sm text-text-muted italic truncate">{song.album}</p>

        <div className="mt-3">
          <QualitySelector
            selected={selectedQuality}
            onChange={setSelectedQuality}
          />
        </div>
      </div>
    </article>
  )
}