interface ErrorStateProps {
  message?: string
}

export function ErrorState({ message = 'Something went wrong' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-6 rounded-xl border bg-error/10 border-error/30">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mx-auto mb-3 text-error"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="font-medium text-error">{message}</p>
        <p className="mt-1 text-sm text-error/80">Please try again</p>
      </div>
    </div>
  )
}