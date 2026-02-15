import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

/**
 * Dialog Component
 *
 * A reusable confirmation dialog component with modal overlay.
 * Supports keyboard accessibility (Escape to cancel, Enter to confirm).
 */

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: DialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isProcessing) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange, isProcessing])

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Dialog confirm error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in"
        onClick={() => !isProcessing && onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg',
          'w-full max-w-md mx-4 p-6',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Close button */}
        <button
          onClick={() => !isProcessing && onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          disabled={isProcessing}
        >
          <X className="h-4 w-4 text-neutral-400" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 id="dialog-title" className="text-lg font-semibold text-neutral-100">
              {title}
            </h2>
            <p id="dialog-description" className="text-sm text-neutral-400">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing || isLoading}
              className="border-neutral-700 text-neutral-300 hover:text-neutral-100"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isProcessing || isLoading}
              className={variant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {isProcessing || isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
