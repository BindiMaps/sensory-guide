import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Version } from './useVersionHistory'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

interface VersionHistoryProps {
  versions: Version[]
  isLoading: boolean
  error: string | null
  onMakeLive: (timestamp: string) => Promise<void>
  onDelete: (timestamp: string) => Promise<void>
  onPreview: (version: Version) => void
}

/**
 * Formats an ISO timestamp to a relative time string ("2 days ago", "Just now").
 */
function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

    // Fall back to absolute date for older versions
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return timestamp
  }
}

/**
 * Formats an ISO timestamp to a full date/time string for dialogs.
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timestamp
  }
}

/**
 * Version history list component.
 *
 * Displays all versions for a venue with:
 * - Formatted timestamp
 * - LIVE badge on the current live version
 * - Preview button to view version content
 * - Make Live button to set a version as live (with confirmation)
 */
/**
 * Dialog state machine - tracks confirmation flow for make-live and delete.
 * Prevents stale data issues by keeping version + loading state together.
 */
type DialogState =
  | { status: 'closed' }
  | { status: 'confirming-live'; version: Version }
  | { status: 'processing-live'; version: Version }
  | { status: 'confirming-delete'; version: Version }
  | { status: 'processing-delete'; version: Version }

export function VersionHistory({
  versions,
  isLoading,
  error,
  onMakeLive,
  onDelete,
  onPreview,
}: VersionHistoryProps) {
  const [dialog, setDialog] = useState<DialogState>({ status: 'closed' })

  // Derived helpers for render
  const confirmVersion = dialog.status !== 'closed' ? dialog.version : null
  const isMakingLive = dialog.status === 'processing-live'
  const isDeleting = dialog.status === 'processing-delete'
  const isLiveDialog = dialog.status === 'confirming-live' || dialog.status === 'processing-live'
  const isDeleteDialog = dialog.status === 'confirming-delete' || dialog.status === 'processing-delete'

  const handleMakeLiveClick = (version: Version) => {
    setDialog({ status: 'confirming-live', version })
  }

  const handleDeleteClick = (version: Version) => {
    setDialog({ status: 'confirming-delete', version })
  }

  const handleConfirmLive = async () => {
    if (dialog.status !== 'confirming-live') return

    const version = dialog.version
    setDialog({ status: 'processing-live', version })
    try {
      await onMakeLive(version.timestamp)
      setDialog({ status: 'closed' })
    } catch {
      setDialog({ status: 'confirming-live', version })
    }
  }

  const handleConfirmDelete = async () => {
    if (dialog.status !== 'confirming-delete') return

    const version = dialog.version
    setDialog({ status: 'processing-delete', version })
    try {
      await onDelete(version.timestamp)
      setDialog({ status: 'closed' })
    } catch {
      setDialog({ status: 'confirming-delete', version })
    }
  }

  const handleCancel = () => {
    setDialog({ status: 'closed' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading version history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
        {error}
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No versions yet. Upload a PDF to create your first version.
      </div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-border" role="list">
        {versions.map((version) => (
          <li
            key={version.timestamp}
            className="flex items-center justify-between py-3 gap-4"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {formatRelativeTime(version.timestamp)}
                </span>
                {version.isLive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 uppercase tracking-wide">
                    LIVE
                  </span>
                )}
              </div>
              {version.publishedBy && (
                <span className="text-xs text-muted-foreground">
                  Published by {version.publishedBy}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => onPreview(version)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => handleMakeLiveClick(version)}
                disabled={version.isLive}
                className="px-3 py-1.5 text-sm font-medium text-white bg-[#B8510D] rounded-md hover:bg-[#9A4409] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Make Live
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(version)}
                disabled={version.isLive}
                title="Delete version"
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Make Live Confirmation Dialog */}
      <Dialog open={isLiveDialog} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make this version live?</DialogTitle>
            <DialogDescription>
              Are you sure you want to make the version from{' '}
              <span className="font-medium text-foreground">
                {confirmVersion && formatTimestamp(confirmVersion.timestamp)}
              </span>{' '}
              the live version? This will replace the current published guide.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isMakingLive}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLive}
              disabled={isMakingLive}
              className="inline-flex items-center justify-center rounded-md bg-[#B8510D] px-4 py-2 text-sm font-medium text-white hover:bg-[#9A4409] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 disabled:opacity-50"
            >
              {isMakingLive ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Making Live...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialog} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this version?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the version from{' '}
              <span className="font-medium text-foreground">
                {confirmVersion && formatTimestamp(confirmVersion.timestamp)}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
