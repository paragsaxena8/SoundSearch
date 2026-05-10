'use client'

import type { Playlist } from '@/lib/db'

interface DashboardPlaylistsProps {
  playlists: Playlist[]
  onOpenPlaylists: () => void
  onOpenPlaylist: (playlistId: string) => void
}

export function DashboardPlaylists({ playlists, onOpenPlaylists, onOpenPlaylist }: DashboardPlaylistsProps) {
  if (playlists.length === 0) return null

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary uppercase tracking-wide">Playlists</h2>
        <button
          onClick={onOpenPlaylists}
          className="text-sm font-bold text-primary hover:text-primary-hover transition-colors uppercase tracking-wide"
        >
          Manage all
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[92px]">
        {playlists.map((playlist, index) => {
          const isLarge = index % 5 === 0
          return (
            <button
              key={playlist.id}
              onClick={() => onOpenPlaylist(playlist.id)}
              className={[
                'group relative overflow-hidden border-2 border-border bg-surface-elevated p-3 text-left transition-all duration-100',
                'hover:border-primary hover:shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px]',
                isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1',
              ].join(' ')}
            >
              <div className="relative h-full flex flex-col">
                <div className="w-8 h-8 border-2 border-border bg-primary/20 text-border flex items-center justify-center mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <p className={`text-text-primary font-bold truncate ${isLarge ? 'text-sm' : 'text-xs'}`}>
                  {playlist.name}
                </p>
                <p className={`text-text-muted mt-auto font-mono ${isLarge ? 'text-xs' : 'text-[11px]'}`}>
                  {playlist.songIds.length} songs
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}