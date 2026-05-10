'use client'

import { ReactNode, useRef } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

interface ActionsDropdownProps {
  children: ReactNode
  side?: 'top' | 'bottom'
}

export function ActionsDropdown({ children, side = 'bottom' }: ActionsDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (!open) {
          triggerRef.current?.blur()
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          className={cn(
            'p-2 rounded-lg',
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
            'min-w-[180px] max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))]',
            'bg-surface border border-border rounded-card shadow-elevated z-50 overflow-y-auto'
          )}
          sideOffset={4}
          align="end"
          side={side}
          avoidCollisions
          collisionPadding={8}
          sticky="partial"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

interface MenuItemProps {
  icon?: ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}

export function MenuItem({ icon, label, onClick, danger, disabled }: MenuItemProps) {
  return (
    <DropdownMenu.Item
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3',
        'outline-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        danger
          ? 'text-error focus:bg-error/10'
          : 'text-text-primary focus:bg-surface-elevated'
      )}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
    </DropdownMenu.Item>
  )
}

interface SubMenuProps {
  icon?: ReactNode
  label: string
  children: ReactNode
}

export function SubMenu({ icon, label, children }: SubMenuProps) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3',
          'outline-none cursor-pointer text-text-primary',
          'focus:bg-surface-elevated data-[state=open]:bg-surface-elevated'
        )}
      >
        {icon && <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>}
        <span className="flex-1">{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className="min-w-[140px] max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] bg-surface border border-border rounded-card shadow-elevated z-50 overflow-y-auto"
          sideOffset={-1}
          alignOffset={-2}
          avoidCollisions
          collisionPadding={8}
          sticky="partial"
        >
          {children}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}

interface RadioItemProps {
  value: string
  label: string
  checked?: boolean
  onSelect?: () => void
}

export function MenuRadioItem({ value, label, checked, onSelect }: RadioItemProps) {
  return (
    <DropdownMenu.RadioItem
      value={value}
      onSelect={onSelect}
      className={cn(
        'w-full px-4 py-2 text-left text-sm flex items-center gap-3',
        'outline-none cursor-pointer',
        checked
          ? 'text-primary bg-primary/10'
          : 'text-text-primary focus:bg-surface-elevated'
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </DropdownMenu.RadioItem>
  )
}

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

export function MenuRadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </DropdownMenu.RadioGroup>
  )
}

export function MenuDivider() {
  return <DropdownMenu.Separator className="h-px bg-border my-1" />
}