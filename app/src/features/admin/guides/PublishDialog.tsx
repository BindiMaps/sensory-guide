import { useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPublishing: boolean
  isAlreadyPublished: boolean
  slug: string
}

/**
 * Confirmation dialog for publishing a guide.
 *
 * Accessibility:
 * - Focus trapped in dialog (Radix handles this)
 * - Escape key closes dialog
 * - Cancel button has initial focus (destructive action is secondary)
 * - aria-describedby links description to dialog
 */
export function PublishDialog({
  open,
  onOpenChange,
  onConfirm,
  isPublishing,
  isAlreadyPublished,
  slug,
}: PublishDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Focus cancel button when dialog opens (safer default action)
  useEffect(() => {
    if (open && cancelButtonRef.current) {
      // Small delay to ensure dialog has rendered
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleCancel = () => {
    if (!isPublishing) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isPublishing ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isAlreadyPublished ? 'Update Live Guide' : 'Publish Guide'}
          </DialogTitle>
          <DialogDescription>
            {isAlreadyPublished ? (
              <>
                This will update the live guide at{' '}
                <span className="font-mono text-gray-700">/venue/{slug}</span>.
                The current published version will be replaced.
              </>
            ) : (
              <>
                This will make the guide publicly visible at{' '}
                <span className="font-mono text-gray-700">/venue/{slug}</span>.
                Anyone with the link will be able to view it.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            disabled={isPublishing}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="inline-flex items-center justify-center rounded-md bg-[#B8510D] px-4 py-2 text-sm font-medium text-white hover:bg-[#9A4410] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : isAlreadyPublished ? (
              'Update Guide'
            ) : (
              'Publish'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
