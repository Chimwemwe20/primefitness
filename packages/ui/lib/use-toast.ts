import * as React from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9)
      const toast: Toast = { id, message, variant, duration }

      setToasts(prev => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
      }
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return React.createElement(ToastContext.Provider, { value }, children)
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    success: (message: string, duration?: number) => context.addToast(message, 'success', duration),
    error: (message: string, duration?: number) => context.addToast(message, 'error', duration),
    info: (message: string, duration?: number) => context.addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => context.addToast(message, 'warning', duration),
    toasts: context.toasts,
    removeToast: context.removeToast,
  }
}
