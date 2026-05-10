'use client'

import { useState } from 'react'
import { cn, getLanguageColor, safeWindowOpen } from '@/lib/utils'
import { ActionsDropdown, MenuItem, MenuDivider, SubMenu } from './ActionsDropdown'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_TO_MUSIC_KEY } from '@/lib/config'

interface SongCardProps {
  song: Song
  onPlay: (song: Song, quality: Quality) => void
  onAddToQueue?: (song: Song) => void
  defaultQuality?: Quality
}

export function SongCard({ song, onPlay, onAddToQueue, defaultQuality = 'high' }: SongCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const musicKey = QUALITY_TO_MUSIC_KEY[defaultQuality]
  const hasUrl = song.music[musicKey] && song.music[musicKey].length > 0

  const handlePlay = () => {
    onPlay(song, defaultQuality)
  }

  const handleDownload = () => {
    const url = song.music[musicKey] || song.music.high || song.music.medium || song.music.low
    if (url) safeWindowOpen(url)
  }

  return (
    <article
      className="group flex items-center gap-4 p-3 bg-surface border-2 border-border shadow-brutal-sm transition-all duration-100 hover:shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album art with play overlay */}
      <div
        className="relative w-16 h-16 flex-shrink-0 border-2 border-border overflow-hidden cursor-pointer"
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
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-border bg-primary flex items-center justify-center transition-all duration-200',
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        )}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A1A">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Language badge */}
        <div
          className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-white text-[9px] font-bold uppercase text-center"
          style={{ backgroundColor: getLanguageColor(song.language) }}
        >
          {song.language}
        </div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-text-primary truncate">{song.title}</h3>
        <p className="text-xs text-text-secondary truncate">{song.artists}</p>
        <p className="text-xs text-text-muted truncate">{song.album}</p>
      </div>

      {/* Duration */}
      <span className="text-xs text-text-muted font-mono w-10 text-right hidden sm:block">{song.duration}</span>

      {/* Actions dropdown */}
      <ActionsDropdown>
        <MenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
          label="Play"
          onClick={handlePlay}
        />
        {onAddToQueue && (
          <MenuItem
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          }
          label="Add to playlist"
        >
          <AddToPlaylistDropdown song={song} />
        </SubMenu>
        <MenuDivider />
        <MenuItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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