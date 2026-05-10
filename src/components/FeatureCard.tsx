'use client'

import { useState } from 'react'
import { cn, getLanguageColor } from '@/lib/utils'
import { ActionsDropdown, MenuItem, MenuDivider } from './ActionsDropdown'
import { QualitySelector } from './QualitySelector'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_OPTIONS, DEFAULT_QUALITY, QUALITY_TO_MUSIC_KEY } from '@/lib/config'

interface FeatureCardProps {
  song: Song
  onPlay: (song: Song, quality: Quality) => void
}

export function FeatureCard({ song, onPlay }: FeatureCardProps) {
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
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row gap-6 bg-surface rounded-card p-4 transition-all duration-200 hover:shadow-elevated">
        {/* Album art with play overlay */}
        <div
          className="relative aspect-square sm:w-64 sm:h-64 flex-shrink-0 rounded-card overflow-hidden cursor-pointer"
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
            'absolute inset-0 bg-black/40 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />

          {/* Duration badge */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-pill bg-black/70 text-white text-sm font-medium">
            {song.duration}
          </div>

          {/* Language badge */}
          <div
            className="absolute bottom-3 left-3 px-4 py-1.5 rounded-pill text-white text-sm font-medium"
            style={{ backgroundColor: getLanguageColor(song.language) }}
          >
            {song.language}
          </div>

          {/* Play button overlay */}
          <div className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center transition-all duration-200',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          )}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Song info */}
        <div className="flex flex-col justify-center flex-1">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{song.title}</h2>
          <p className="text-lg text-text-secondary mb-1">{song.artists}</p>
          <p className="text-base text-text-muted italic mb-6">{song.album}</p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quality selector */}
            <QualitySelector value={quality} onChange={setQuality} />

            {/* Actions dropdown */}
            <ActionsDropdown>
              <div className="py-1">
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
          </div>
        </div>
      </div>
    </article>
  )
}