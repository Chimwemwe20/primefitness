import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: DialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const busy = isProcessing || isLoading

  // Entry animation
  React.useEffect(() => {
    if (open) {
      // Small delay to trigger CSS transition from initial state
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
    } else {
      setIsVisible(false)
    }
  }, [open])

  // Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !busy) handleClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, busy])

  // Focus trap — auto-focus panel on open
  React.useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus()
    }
  }, [open])

  const handleClose = React.useCallback(() => {
    if (busy) return
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(() => {
      setIsClosing(false)
      onOpenChange(false)
    }, 200)
  }, [busy, onOpenChange])

  const handleConfirm = async () => {
    if (!onConfirm) return
    setIsProcessing(true)
    try {
      await onConfirm()
      handleClose()
    } catch (error) {
      console.error('Dialog confirm error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!open && !isClosing) return null

  const hasCustomContent = !!children

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 backdrop-blur-sm',
          'transition-opacity duration-200 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative bg-neutral-900 border border-neutral-800/80 rounded-2xl',
          'shadow-2xl shadow-black/40 ring-1 ring-white/[0.03]',
          'w-full mx-4 overflow-hidden',
          'transition-all duration-200 ease-out',
          'outline-none',
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.97] translate-y-2',
          sizeMap[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Subtle top highlight line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Header */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-neutral-50 tracking-tight"
              >
                {title}
              </h2>
              {description && (
                <p id="dialog-description" className="text-sm text-neutral-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={busy}
              className={cn(
                'flex-shrink-0 rounded-lg p-1.5 -mr-1.5 -mt-1.5',
                'text-neutral-500 transition-all duration-150',
                'hover:text-neutral-200 hover:bg-white/[0.06]',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0',
                'disabled:pointer-events-none disabled:opacity-30'
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 mt-4 border-t border-neutral-800/60" />

        {hasCustomContent ? (
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{children}</div>
        ) : (
          /* Confirmation footer */
          <div className="px-6 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={busy}
              className={cn(
                'border-neutral-700/80 text-neutral-300 bg-transparent',
                'hover:bg-white/[0.04] hover:text-neutral-100 hover:border-neutral-600',
                'transition-all duration-150'
              )}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={busy}
              className={cn(
                'transition-all duration-150 font-medium',
                variant === 'default'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30'
              )}
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Processing…
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
