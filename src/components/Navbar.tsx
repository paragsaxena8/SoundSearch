import Link from "next/link"

interface NavbarProps {
  onOpenPlaylists?: () => void
}

export function Navbar({ onOpenPlaylists }: NavbarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-canvas">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
        <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-primary">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span className="text-lg font-semibold text-text-primary">SoundSearch</span>
        </Link>
      </div>

      {onOpenPlaylists && (
        <button
          onClick={onOpenPlaylists}
          className="flex items-center gap-2 px-4 py-2 rounded-pill bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-sm font-medium">Playlists</span>
        </button>
      )}
    </header>
  )
}