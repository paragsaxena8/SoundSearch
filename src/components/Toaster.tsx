'use client'

import * as Toast from '@radix-ui/react-toast'
import { useToast } from '@/lib/toast'

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <Toast.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          open
          duration={2500}
          onOpenChange={(open) => {
            if (!open) dismissToast(toast.id)
          }}
          className="rounded-card border border-border bg-surface px-4 py-3 shadow-elevated data-[state=open]:animate-slide-up"
        >
          <Toast.Title className="text-sm font-medium text-text-primary">{toast.title}</Toast.Title>
          {toast.description && (
            <Toast.Description className="mt-1 text-xs text-text-secondary">
              {toast.description}
            </Toast.Description>
          )}
        </Toast.Root>
      ))}

      <Toast.Viewport className="fixed bottom-24 right-4 z-[120] flex w-[320px] max-w-[calc(100vw-1rem)] flex-col gap-2 outline-none" />
    </Toast.Provider>
  )
}
