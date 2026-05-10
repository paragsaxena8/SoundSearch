interface LoadingSkeletonProps {
  count?: number
}

export function LoadingSkeleton({ count = 4 }: LoadingSkeletonProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Feature card skeleton */}
      <div className="flex flex-col sm:flex-row gap-6 bg-surface border-2 border-border shadow-brutal p-4">
        {/* Album art skeleton */}
        <div className="relative aspect-square sm:w-64 sm:h-64 flex-shrink-0 border-2 border-border overflow-hidden bg-surface-elevated animate-shimmer"
          style={{ background: 'linear-gradient(90deg, #FEF3C7 25%, #FDE68A 50%, #FEF3C7 75%)', backgroundSize: '200% 100%' }}
        />
        {/* Info skeleton */}
        <div className="flex flex-col flex-1 min-w-0 gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-6 w-3/4 bg-surface-elevated border border-border/30" />
              <div className="h-5 w-1/2 bg-surface-elevated border border-border/20" />
            </div>
            <div className="w-10 h-10 border-2 border-border bg-surface-elevated flex-shrink-0" />
          </div>
          <div className="h-4 w-2/3 bg-surface-elevated border border-border/20 mt-2" />
        </div>
      </div>

      {/* Song card skeletons */}
      {count > 0 && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-surface border-2 border-border shadow-brutal-sm">
              {/* Thumbnail skeleton */}
              <div className="w-16 h-16 flex-shrink-0 border-2 border-border bg-surface-elevated animate-shimmer"
                style={{ background: 'linear-gradient(90deg, #FEF3C7 25%, #FDE68A 50%, #FEF3C7 75%)', backgroundSize: '200% 100%', animationDelay: `${i * 80}ms` }}
              />
              {/* Info skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-3/4 bg-surface-elevated border border-border/30" />
                <div className="h-3 w-1/2 bg-surface-elevated border border-border/20" />
                <div className="h-3 w-2/3 bg-surface-elevated border border-border/20" />
              </div>
              {/* Duration skeleton */}
              <div className="w-10 h-3 bg-surface-elevated border border-border/20 hidden sm:block" />
              {/* Actions skeleton */}
              <div className="w-8 h-8 border-2 border-border bg-surface-elevated flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}