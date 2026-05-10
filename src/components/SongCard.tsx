'use client'

import { useState } from 'react'
import { cn, getLanguageColor } from '@/lib/utils'
import { ActionsDropdown, MenuItem, MenuDivider } from './ActionsDropdown'
import { QualitySelector } from './QualitySelector'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_TO_MUSIC_KEY, DEFAULT_QUALITY } from '@/lib/config'

interface SongCardProps {
  song: Song
  onPlay: (song: Song, quality: Quality) => void
}

export function SongCard({ song, onPlay }: SongCardProps) {
  const [quality, setQuality] = useState<Quality>(DEFAULT_QUALITY)
  const [isHovered, setIsHovered] = useState(false)

  const handlePlay = () => {
    onPlay(song, quality)
  }

  const musicKey = QUALITY_TO_MUSIC_KEY[quality]
  const hasUrl = song.music[musicKey] && song.music[musicKey].length > 0

  const handleDownload = () => {
    const url = song.music[musicKey] || song.music.high || song.music.medium || song.music.low
    if (url) window.open(url, '_blank')
  }

  return (
    <article
      className="group flex items-center gap-4 p-3 bg-surface rounded-card transition-all duration-200 hover:bg-surface-elevated hover:shadow-elevated"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album art with play overlay */}
      <div
        className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
        onClick={hasUrl ? handlePlay : undefined}
      >
        <img
          src={song.thumbnail.medium}
          alt={song.title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            isHovered && 'scale-110'
          )}
        />
        <div className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )} />

        {/* Play button overlay */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-all duration-200',
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        )}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Language badge */}
        <div
          className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded text-white text-[9px] font-medium"
          style={{ backgroundColor: getLanguageColor(song.language) }}
        >
          {song.language}
        </div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate">{song.title}</h3>
        <p className="text-xs text-text-secondary truncate">{song.artists}</p>
        <p className="text-xs text-text-muted truncate">{song.album}</p>
      </div>

      {/* Duration */}
      <span className="text-xs text-text-muted w-10 text-right hidden sm:block">{song.duration}</span>

      {/* Actions dropdown */}
      <ActionsDropdown>
        <MenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
          label="Play"
          onClick={handlePlay}
        />
        <div className="px-4 py-2">
          <p className="text-xs text-text-muted mb-1">Quality</p>
          <QualitySelector value={quality} onChange={setQuality} compact />
        </div>
        <MenuDivider />
        <div className="py-1">
          <div className="px-4 py-2 text-xs text-text-muted font-medium">Add to playlist</div>
          <AddToPlaylistDropdown song={song} />
        </div>
        <MenuDivider />
        <MenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          }
          label="Download"
          onClick={handleDownload}
        />
      </ActionsDropdown>
    </article>
  )
}