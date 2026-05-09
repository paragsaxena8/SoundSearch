import { cn } from '../lib/utils'
import type { Quality } from '../types/song'
import { QUALITY_LABELS } from '../types/song'

interface QualitySelectorProps {
  selected: Quality
  onChange: (quality: Quality) => void
}

export function QualitySelector({ selected, onChange }: QualitySelectorProps) {
  const qualities: Quality[] = ['low', 'medium', 'high', 'very_high']

  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Audio quality">
      {qualities.map((quality) => (
        <button
          key={quality}
          type="button"
          role="radio"
          aria-checked={selected === quality}
          onClick={() => onChange(quality)}
          className={cn(
            'px-3 py-1 text-[11px] font-semibold rounded transition-all duration-200',
            selected === quality
              ? 'bg-primary text-white'
              : 'bg-white/10 text-text-muted hover:bg-white/15 hover:text-text-secondary'
          )}
        >
          {QUALITY_LABELS[quality]}
        </button>
      ))}
    </div>
  )
}