import * as React from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useToast, type Toast as ToastType } from '../../lib/use-toast'

/**
 * Toast Component
 *
 * Displays toast notifications with auto-dismiss functionality.
 * Supports multiple variants: success, error, info, warning.
 */

const variantStyles = {
  success: {
    container: 'bg-green-900/90 border-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-red-900/90 border-red-700',
    icon: XCircle,
    iconColor: 'text-red-400',
  },
  info: {
    container: 'bg-blue-900/90 border-blue-700',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  warning: {
    container: 'bg-yellow-900/90 border-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
}

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast()
  const variant = variantStyles[toast.variant]
  const Icon = variant.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'min-w-[300px] max-w-md',
        'animate-in slide-in-from-right duration-300',
        variant.container
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', variant.iconColor)} />
      <p className="flex-1 text-sm text-neutral-100">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4 text-neutral-300" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
