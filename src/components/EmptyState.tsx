export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 border-2 border-border bg-primary flex items-center justify-center mb-4 shadow-brutal">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="#1A1A1A"
          aria-hidden="true"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </div>
      <p className="text-base font-bold text-text-primary uppercase tracking-wide">No results yet</p>
      <p className="text-sm text-text-muted mt-1">Search for a song to get started</p>
    </div>
  )
}