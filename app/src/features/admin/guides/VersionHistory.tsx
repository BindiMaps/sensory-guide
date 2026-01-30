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
  venueId: string
  versions: Version[]
  isLoading: boolean
  error: string | null
  onMakeLive: (timestamp: string) => Promise<void>
  onPreview: (version: Version) => void
}

/**
 * Formats an ISO timestamp to a human-readable date/time string.
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
 * Dialog state machine - tracks confirmation flow.
 * Prevents stale data issues by keeping version + loading state together.
 */
type DialogState =
  | { status: 'closed' }
  | { status: 'confirming'; version: Version }
  | { status: 'processing'; version: Version }

export function VersionHistory({
  versions,
  isLoading,
  error,
  onMakeLive,
  onPreview,
}: VersionHistoryProps) {
  const [dialog, setDialog] = useState<DialogState>({ status: 'closed' })

  // Derived helpers for render
  const confirmVersion = dialog.status !== 'closed' ? dialog.version : null
  const isMakingLive = dialog.status === 'processing'

  const handleMakeLiveClick = (version: Version) => {
    setDialog({ status: 'confirming', version })
  }

  const handleConfirm = async () => {
    if (dialog.status !== 'confirming') return

    const version = dialog.version
    setDialog({ status: 'processing', version })
    try {
      await onMakeLive(version.timestamp)
      setDialog({ status: 'closed' })
    } catch {
      // On error, return to confirming state so user can retry
      setDialog({ status: 'confirming', version })
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
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-sm">
                <span className="font-medium">
                  {formatTimestamp(version.timestamp)}
                </span>
              </div>
              {version.isLive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 uppercase tracking-wide">
                  LIVE
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
            </div>
          </li>
        ))}
      </ul>

      {/* Confirmation Dialog */}
      <Dialog open={dialog.status !== 'closed'} onOpenChange={(open) => !open && handleCancel()}>
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
              onClick={handleConfirm}
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
    </>
  )
}
