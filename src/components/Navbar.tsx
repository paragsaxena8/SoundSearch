export function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-canvas">
      <div className="flex items-center gap-3">
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
      </div>
    </header>
  )
}