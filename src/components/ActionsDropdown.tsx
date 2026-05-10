'use client'

import { ReactNode } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

interface ActionsDropdownProps {
  children: ReactNode
  side?: 'top' | 'bottom'
}

export function ActionsDropdown({ children, side = 'bottom' }: ActionsDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
          )}
          title="More actions"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'w-48 bg-surface border border-border rounded-card shadow-elevated z-50 overflow-hidden',
            side === 'top' ? 'animate-slide-down' : 'animate-slide-up'
          )}
          sideOffset={4}
          align="end"
          side={side}
        >
          <DropdownMenu.Arrow className="fill-surface" />
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

interface MenuItemProps {
  icon?: ReactNode
  label: string
  onClick: () => void
  close?: () => void
  danger?: boolean
}

export function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      onClick={onClick}
      className={cn(
        'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors',
        'outline-none cursor-pointer',
        danger
          ? 'text-error focus:bg-error/10'
          : 'text-text-primary focus:bg-surface-elevated'
      )}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {label}
    </DropdownMenu.Item>
  )
}

export function MenuDivider() {
  return <DropdownMenu.Separator className="h-px bg-border my-1" />
}