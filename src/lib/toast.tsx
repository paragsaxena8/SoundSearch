'use client'

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: ToastMessage[]
  showToast: (title: string, description?: string) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((title: string, description?: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, title, description }])
  }, [])

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
    }),
    [toasts, showToast, dismissToast]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
