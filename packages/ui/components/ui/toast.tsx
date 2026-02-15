import * as React from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useToast, type Toast as ToastType } from '../../lib/use-toast'

const variantStyles = {
  success: {
    container: 'bg-green-950/95 border-green-800/50 ring-1 ring-green-500/10',
    icon: CheckCircle,
    iconColor: 'text-green-400',
    progressBar: 'bg-green-400/30',
  },
  error: {
    container: 'bg-red-950/95 border-red-800/50 ring-1 ring-red-500/10',
    icon: XCircle,
    iconColor: 'text-red-400',
    progressBar: 'bg-red-400/30',
  },
  info: {
    container: 'bg-blue-950/95 border-blue-800/50 ring-1 ring-blue-500/10',
    icon: Info,
    iconColor: 'text-blue-400',
    progressBar: 'bg-blue-400/30',
  },
  warning: {
    container: 'bg-yellow-950/95 border-yellow-800/50 ring-1 ring-yellow-500/10',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    progressBar: 'bg-yellow-400/30',
  },
}

const TOAST_DURATION = 5000
const EXIT_DURATION = 300

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [elapsed, setElapsed] = React.useState(0)
  const lastTickRef = React.useRef(Date.now())

  const variant = variantStyles[toast.variant]
  const Icon = variant.icon

  const dismiss = React.useCallback(() => {
    if (isExiting) return
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), EXIT_DURATION)
  }, [onRemove, toast.id, isExiting])

  // Auto-dismiss with smooth progress
  React.useEffect(() => {
    if (isPaused || isExiting) return

    lastTickRef.current = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      setElapsed(prev => {
        const next = prev + (now - lastTickRef.current)
        lastTickRef.current = now
        if (next >= TOAST_DURATION) {
          clearInterval(interval)
          dismiss()
          return TOAST_DURATION
        }
        return next
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPaused, isExiting, dismiss])

  const progress = Math.min(elapsed / TOAST_DURATION, 1)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-4 rounded-xl border',
        'min-w-[320px] max-w-md overflow-hidden',
        'shadow-xl shadow-black/30 backdrop-blur-sm',
        'transition-all ease-out',
        isExiting
          ? 'opacity-0 translate-x-8 scale-95 duration-300'
          : 'opacity-100 translate-x-0 scale-100 duration-500 animate-in slide-in-from-right-full fade-in',
        variant.container
      )}
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false)
        lastTickRef.current = Date.now()
      }}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', variant.iconColor)} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-300 leading-relaxed">{toast.message}</p>
      </div>

      <button
        onClick={dismiss}
        className={cn(
          'flex-shrink-0 rounded-md p-1 -m-1',
          'opacity-0 group-hover:opacity-100',
          'transition-all duration-150',
          'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:opacity-100',
          'text-neutral-500 hover:text-neutral-300'
        )}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.03]">
        <div
          className={cn('h-full rounded-full', variant.progressBar)}
          style={{ width: `${(1 - progress) * 100}%`, transition: 'none' }}
        />
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col items-end gap-3 p-6 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}
