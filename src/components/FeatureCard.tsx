'use client'

import { useState } from 'react'
import { cn, getLanguageColor, safeWindowOpen } from '@/lib/utils'
import { ActionsDropdown, MenuItem, MenuDivider, SubMenu } from './ActionsDropdown'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_TO_MUSIC_KEY } from '@/lib/config'

interface FeatureCardProps {
  song: Song
  onPlay: (song: Song, quality: Quality) => void
  onAddToQueue?: (song: Song) => void
  defaultQuality?: Quality
}

export function FeatureCard({ song, onPlay, onAddToQueue, defaultQuality = 'high' }: FeatureCardProps) {
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
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row gap-6 bg-surface border-2 border-border shadow-brutal p-4 transition-all duration-100 hover:shadow-brutal-lg hover:-translate-x-[1px] hover:-translate-y-[1px]">
        {/* Album art */}
        <div
          className="relative aspect-square sm:w-64 sm:h-64 flex-shrink-0 border-2 border-border overflow-hidden cursor-pointer"
          onClick={hasUrl ? handlePlay : undefined}
        >
          <img
            src={song.thumbnail.large}
            alt={`${song.title} album art`}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              isHovered && 'scale-105'
            )}
          />
          <div className={cn(
            'absolute inset-0 bg-primary/30 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />

          {/* Duration badge */}
          <div className="absolute top-3 right-3 px-3 py-1.5 border-2 border-border bg-surface text-text-primary text-sm font-bold font-mono">
            {song.duration}
          </div>

          {/* Language badge */}
          <div
            className="absolute bottom-3 left-3 px-4 py-1.5 border-2 border-border text-white text-sm font-bold uppercase"
            style={{ backgroundColor: getLanguageColor(song.language) }}
          >
            {song.language}
          </div>

          {/* Play button overlay */}
          <div className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-border bg-primary flex items-center justify-center transition-all duration-200',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          )}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Song info + actions */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Title row with play button and dropdown */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-text-primary mb-1 truncate">{song.title}</h2>
              <p className="text-lg text-text-secondary truncate">{song.artists}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button
                onClick={handlePlay}
                disabled={!hasUrl}
                className="w-10 h-10 border-2 border-border bg-primary flex items-center justify-center transition-all duration-100 hover:shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Play"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1A1A">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
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
            </div>
          </div>

          <p className="text-base text-text-muted italic mb-4">{song.album}</p>
        </div>
      </div>
    </article>
  )
}