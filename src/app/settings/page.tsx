'use client'

import { useSettings } from '@/lib/settings'
import { LIMIT_OPTIONS } from '@/types'
import { QUALITY_OPTIONS, QUALITY_TO_MUSIC_KEY } from '@/lib/config'
import type { Quality } from '@/lib/config'
import Link from 'next/link'

export default function SettingsPage() {
  const { defaultLimit, defaultQuality, setDefaultLimit, setDefaultQuality } = useSettings()

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center h-16 px-6 border-b-2 border-border bg-canvas">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wide">Back</span>
          </Link>
        </div>
        <h1 className="text-lg font-bold text-text-primary uppercase tracking-wide ml-4">Settings</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-8">
        {/* Search Limit */}
        <section>
          <h2 className="text-base font-bold text-text-primary uppercase tracking-wide mb-1">Default Search Limit</h2>
          <p className="text-sm text-text-secondary mb-4">Number of results returned per search. Applies to the next search you perform.</p>
          <div className="grid grid-cols-4 gap-3">
            {LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDefaultLimit(opt)}
                className={`py-3 border-2 border-border font-bold text-center transition-all duration-100 ${
                  defaultLimit === opt
                    ? 'bg-primary text-border shadow-brutal -translate-x-[1px] -translate-y-[1px]'
                    : 'bg-surface text-text-primary hover:border-primary hover:shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        {/* Default Quality */}
        <section>
          <h2 className="text-base font-bold text-text-primary uppercase tracking-wide mb-1">Default Stream Quality</h2>
          <p className="text-sm text-text-secondary mb-4">Audio quality used when playing songs. Higher quality uses more data.</p>
          <div className="space-y-3">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDefaultQuality(opt.value)}
                className={`w-full flex items-center justify-between p-4 border-2 border-border transition-all duration-100 ${
                  defaultQuality === opt.value
                    ? 'bg-primary/10 border-primary shadow-brutal-sm'
                    : 'bg-surface hover:border-primary hover:shadow-brutal-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                    defaultQuality === opt.value ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {defaultQuality === opt.value && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A1A">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                  <span className="font-bold text-text-primary">{opt.label}</span>
                </div>
                <span className="text-xs text-text-muted font-mono uppercase">
                  {opt.value === 'low' ? '~64kbps' : opt.value === 'medium' ? '~128kbps' : '~320kbps'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="p-4 border-2 border-border bg-surface-elevated">
          <p className="text-sm text-text-secondary">
            <span className="font-bold text-text-primary">Note:</span> Settings are saved locally and persist across sessions. Search limit applies to new searches. Default quality applies when you play a song — you can still override it per-song from the quality submenu.
          </p>
        </div>
      </main>
    </div>
  )
}