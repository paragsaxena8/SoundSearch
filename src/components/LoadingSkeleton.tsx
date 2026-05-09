interface LoadingSkeletonProps {
  count?: number
}

export function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div
            className="aspect-square rounded-card bg-surface animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className="pt-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-surface" />
            <div className="h-3 w-1/2 rounded bg-surface" />
            <div className="h-3 w-2/3 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}