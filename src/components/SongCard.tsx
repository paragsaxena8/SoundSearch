'use client'

import { useState } from 'react'
import { cn, getLanguageColor } from '@/lib/utils'
import { ActionsDropdown, MenuItem, MenuDivider, SubMenu, MenuRadioGroup, MenuRadioItem } from './ActionsDropdown'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_OPTIONS, QUALITY_TO_MUSIC_KEY, DEFAULT_QUALITY } from '@/lib/config'

interface SongCardProps {
  song: Song
  onPlay: (song: Song, quality: Quality) => void
  onAddToQueue?: (song: Song) => void
}

export function SongCard({ song, onPlay, onAddToQueue }: SongCardProps) {
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
        {onAddToQueue && (
          <MenuItem
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
            label="Add to queue"
            onClick={() => onAddToQueue(song)}
          />
        )}
        <MenuDivider />
        <SubMenu
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
          label="Add to playlist"
        >
          <AddToPlaylistDropdown song={song} />
        </SubMenu>
        <SubMenu
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          }
          label="Quality"
        >
          <MenuRadioGroup value={quality} onValueChange={(v) => setQuality(v as Quality)}>
            {QUALITY_OPTIONS.map((opt) => (
              <MenuRadioItem key={opt.value} value={opt.value} label={opt.label} checked={quality === opt.value} />
            ))}
          </MenuRadioGroup>
        </SubMenu>
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