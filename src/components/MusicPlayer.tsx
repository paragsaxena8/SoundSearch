'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Song } from '@/lib/gaana'
import type { Quality } from '@/lib/config'
import { QUALITY_TO_MUSIC_KEY } from '@/lib/config'
import { ActionsDropdown, MenuItem, MenuDivider } from './ActionsDropdown'
import { AddToPlaylistDropdown } from './AddToPlaylistDropdown'
import { QualitySelector } from './QualitySelector'

interface MusicPlayerProps {
  song: Song
  quality: Quality
  onClose: () => void
  onQualityChange?: (quality: Quality) => void
  autoPlay?: boolean
}

export function MusicPlayer({ song, quality, onClose, onQualityChange, autoPlay = false }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hlsRef = useRef<any>(null)
  const hasAutoPlayed = useRef(false)

  const musicKey = QUALITY_TO_MUSIC_KEY[quality]
  const streamUrl = song.music[musicKey]

  useEffect(() => {
    // Dynamically import HLS.js for m3u8 support
    const loadHls = async () => {
      if (!streamUrl) return

      const Hls = (await import('hls.js')).default

      if (Hls.isSupported() && audioRef.current) {
        const hls = new Hls()
        hls.loadSource(streamUrl)
        hls.attachMedia(audioRef.current)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false)
          // Auto-play when ready
          if (autoPlay && !hasAutoPlayed.current && audioRef.current) {
            hasAutoPlayed.current = true
            audioRef.current.play().catch(() => {
              // Auto-play might be blocked by browser
              setIsPlaying(false)
            })
          }
        })
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS error:', data)
          setIsLoading(false)
        })
        hlsRef.current = hls
      } else if (audioRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        audioRef.current.src = streamUrl
        setIsLoading(false)
        if (autoPlay && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true
          audioRef.current.play().catch(() => {
            setIsPlaying(false)
          })
        }
      }
    }

    setIsLoading(true)
    setCurrentTime(0)
    setDuration(0)
    hasAutoPlayed.current = false
    loadHls()

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [streamUrl, autoPlay])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  const seekTo = useCallback((percent: number) => {
    if (!audioRef.current) return
    const newTime = (percent / 100) * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          seek(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          seek(30)
          break
        case 'ArrowDown':
          e.preventDefault()
          seek(-30)
          break
        case 'Home':
          e.preventDefault()
          seekTo(0)
          break
        case 'End':
          e.preventDefault()
          seekTo(100)
          break
        case 'KeyH':
          e.preventDefault()
          setShowShortcuts((prev) => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, seek, seekTo, onClose])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleDownload = () => {
    if (!streamUrl) return
    window.open(streamUrl, '_blank')
  }

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!streamUrl) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 animate-slide-up">
        <div className="max-w-4xl mx-auto text-center text-text-secondary">
          No streaming URL available
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border shadow-elevated animate-slide-up">
      {/* Animated progress bar background */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-surface-elevated overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
        />
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-4">
          {/* Album art with subtle pulse when playing */}
          <div className="relative group">
            <img
              src={song.thumbnail.small}
              alt={song.title}
              className={`w-12 h-12 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                isPlaying && !isLoading ? 'animate-pulse-subtle' : ''
              }`}
            />
            {isPlaying && !isLoading && (
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping-slow" />
            )}
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary truncate">{song.title}</h4>
            <p className="text-xs text-text-secondary truncate">{song.artists}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className={`
                w-10 h-10 rounded-full bg-primary flex items-center justify-center
                transition-all duration-200 transform
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-110 active:scale-95
                ${isPlaying ? 'animate-pulse-button' : ''}
              `}
              title="Play/Pause (Space)"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* More actions dropdown */}
            <ActionsDropdown side="top">
              <div className="px-4 py-2">
                <p className="text-xs text-text-muted mb-1">Quality</p>
                <QualitySelector value={quality} onChange={(q) => onQualityChange?.(q)} />
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
              <MenuItem
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
                  </svg>
                }
                label="Keyboard shortcuts"
                onClick={() => setShowShortcuts(true)}
              />
              <MenuItem
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                }
                label="Close player"
                onClick={onClose}
                danger
              />
            </ActionsDropdown>
          </div>
        </div>

        {/* Progress bar with time */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-text-muted w-10 text-right font-mono">{formatTime(currentTime)}</span>
          <div className="flex-1 relative group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="
                w-full h-1 bg-surface-elevated rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:duration-200
                group-hover:[&::-webkit-slider-thumb]:scale-125
              "
            />
          </div>
          <span className="text-xs text-text-muted w-10 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Keyboard shortcuts help */}
        {showShortcuts && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface-elevated border border-border rounded-card p-3 shadow-elevated animate-slide-up z-50">
            <div className="text-xs text-text-primary space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-text-secondary">Keyboard Shortcuts</p>
                <button onClick={() => setShowShortcuts(false)} className="text-text-muted hover:text-text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">Space</kbd>
                  <span className="text-text-muted">Play/Pause</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">←</kbd>
                  <span className="text-text-muted">Back 10s</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">→</kbd>
                  <span className="text-text-muted">Forward 10s</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">↑</kbd>
                  <span className="text-text-muted">Forward 30s</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px]">↓</kbd>
                  <span className="text-text-muted">Back 30s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    </div>
  )
}