'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'
import type { Quality } from '@/lib/config'
import { QUALITY_OPTIONS } from '@/lib/config'

interface QualitySelectorProps {
  value: Quality
  onChange: (quality: Quality) => void
  compact?: boolean
}

export function QualitySelector({ value, onChange, compact = false }: QualitySelectorProps) {
  const currentOption = QUALITY_OPTIONS.find((opt) => opt.value === value)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 transition-colors outline-none',
            compact
              ? 'text-xs text-text-secondary hover:text-text-primary'
              : 'text-sm text-text-secondary hover:text-text-primary bg-surface-elevated px-2 py-1 rounded'
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {compact ? currentOption?.label : `Quality: ${currentOption?.label}`}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-32 bg-surface border border-border rounded-card shadow-elevated z-50 overflow-hidden animate-slide-up"
          sideOffset={4}
        >
          {QUALITY_OPTIONS.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors outline-none cursor-pointer',
                value === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-primary focus:bg-surface-elevated'
              )}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}