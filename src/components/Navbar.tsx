import Link from "next/link"

interface NavbarProps {
  onOpenPlaylists?: () => void
}

export function Navbar({ onOpenPlaylists }: NavbarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b-2 border-border bg-canvas">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
        <div className="flex items-center justify-center w-9 h-9 border-2 border-border bg-primary shadow-brutal-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#1A1A1A"
            aria-hidden="true"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-text-primary tracking-tight">SoundSearch</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="btn-brutal flex items-center gap-2 px-4 py-2 bg-surface text-text-primary hover:bg-surface-elevated"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-sm font-bold uppercase hidden sm:inline">Settings</span>
        </Link>

        {onOpenPlaylists && (
          <button
            onClick={onOpenPlaylists}
            className="btn-brutal flex items-center gap-2 px-4 py-2 bg-primary text-border hover:shadow-brutal hover:-translate-x-[1px] hover:-translate-y-[1px]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="text-sm font-bold uppercase">Playlists</span>
          </button>
        )}
      </div>
    </header>
  )
}