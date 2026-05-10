'use client'

import { CacheProvider } from '@/lib/cache'
import { ToastProvider } from '@/lib/toast'
import { PlaylistProvider } from '@/lib/playlist'
import { SettingsProvider } from '@/lib/settings'
import { Toaster } from '@/components'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CacheProvider>
      <ToastProvider>
        <PlaylistProvider>
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </PlaylistProvider>
      </ToastProvider>
    </CacheProvider>
  )
}