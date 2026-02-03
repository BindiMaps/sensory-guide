import { useState } from 'react'
import { trackEvent, AnalyticsEvent } from '@/lib/analytics'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface EditorSectionProps {
  venueId: string
  editors: string[]
  createdBy: string | undefined
  currentUserEmail: string | undefined
  onAddEditor: (email: string) => Promise<void>
  onRemoveEditor: (email: string) => Promise<void>
}

export function EditorSection({
  venueId,
  editors,
  createdBy,
  currentUserEmail,
  onAddEditor,
  onRemoveEditor,
}: EditorSectionProps) {
  const [newEditorEmail, setNewEditorEmail] = useState('')
  const [editorError, setEditorError] = useState('')
  const [addingEditor, setAddingEditor] = useState(false)
  const [showSelfRemoveConfirm, setShowSelfRemoveConfirm] = useState(false)
  const [removingEditor, setRemovingEditor] = useState(false)
  const [editorToRemove, setEditorToRemove] = useState<string | null>(null)

  const isLastEditor = editors.length === 1
  const currentUserIsEditor = currentUserEmail && editors.map(e => e.toLowerCase()).includes(currentUserEmail.toLowerCase())
  const currentUserIsOwner = currentUserEmail?.toLowerCase() === createdBy?.toLowerCase()

  /**
   * Determines if the current user can remove a specific editor.
   * - Can't remove the owner unless you ARE the owner
   * - Can't remove if you're the last editor
   * - Must be an editor yourself to remove anyone
   */
  const canRemoveEditor = (targetEmail: string): boolean => {
    const isTargetOwner = targetEmail.toLowerCase() === createdBy?.toLowerCase()

    // Can't remove owner unless current user IS the owner
    if (isTargetOwner && !currentUserIsOwner) return false

    // Can't remove if last editor
    if (isLastEditor) return false

    // Must be an editor to remove anyone
    return !!currentUserIsEditor
  }

  /**
   * Handles click on remove button.
   * - Self-removal: uses existing inline confirmation flow
   * - Other editor removal: shows dialog confirmation
   */
  const handleRemoveClick = (email: string) => {
    const isSelf = email.toLowerCase() === currentUserEmail?.toLowerCase()

    if (isSelf) {
      // Use existing self-removal flow
      setShowSelfRemoveConfirm(true)
    } else {
      // Show confirmation dialog for removing others
      setEditorToRemove(email)
    }
  }

  const handleAddEditor = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditorError('')

    const email = newEditorEmail.trim().toLowerCase()

    if (!isValidEmail(email)) {
      setEditorError('Please enter a valid email address')
      return
    }

    if (email === currentUserEmail?.toLowerCase()) {
      setEditorError("You're already an editor")
      return
    }

    if (editors.map(e => e.toLowerCase()).includes(email)) {
      setEditorError('This person is already an editor')
      return
    }

    setAddingEditor(true)

    try {
      await onAddEditor(email)
      trackEvent(AnalyticsEvent.VENUE_EDITOR_ADD, { venue_id: venueId, editor_email: email, action: 'add' })
      setNewEditorEmail('')
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Failed to add editor')
    } finally {
      setAddingEditor(false)
    }
  }

  const handleRemoveEditor = async (email: string) => {
    const isSelf = email.toLowerCase() === currentUserEmail?.toLowerCase()

    setRemovingEditor(true)
    try {
      await onRemoveEditor(email)
      trackEvent(AnalyticsEvent.VENUE_EDITOR_REMOVE, { venue_id: venueId, editor_email: email, action: 'remove' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove editor')
    } finally {
      setRemovingEditor(false)
      if (isSelf) {
        setShowSelfRemoveConfirm(false)
      }
    }
  }

  const handleConfirmRemoveEditor = async () => {
    if (!editorToRemove) return

    setRemovingEditor(true)
    try {
      await onRemoveEditor(editorToRemove)
      trackEvent(AnalyticsEvent.VENUE_EDITOR_REMOVE, { venue_id: venueId, editor_email: editorToRemove, action: 'remove' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove editor')
    } finally {
      setRemovingEditor(false)
      setEditorToRemove(null)
    }
  }

  return (
    <section className="border rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Editors</h2>

      <ul className="space-y-2 mb-4">
        {editors.map((email) => (
          <li key={email} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded">
            <span className="text-sm">
              {email}
              {email === createdBy && (
                <span className="text-xs text-muted-foreground ml-2">(owner)</span>
              )}
              {email.toLowerCase() === currentUserEmail?.toLowerCase() && (
                <span className="text-xs text-muted-foreground ml-2">(you)</span>
              )}
            </span>
            {canRemoveEditor(email) && (
              <button
                onClick={() => handleRemoveClick(email)}
                className="text-sm text-red-600 hover:text-red-800"
                title="Remove editor"
                disabled={removingEditor}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>

      {showSelfRemoveConfirm && (
        <div className="mb-4 p-3 border border-amber-300 bg-amber-50 rounded-md">
          <p className="text-sm text-amber-800 mb-3">
            You're about to remove yourself from this venue. You will lose access and won't be able to edit it anymore.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSelfRemoveConfirm(false)}
              className="px-3 py-1.5 border rounded-md hover:bg-white text-sm"
              disabled={removingEditor}
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemoveEditor(currentUserEmail || '')}
              disabled={removingEditor}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 text-sm"
            >
              {removingEditor ? 'Removing...' : 'Remove myself'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation dialog for removing other editors */}
      <Dialog open={!!editorToRemove} onOpenChange={(open) => !open && setEditorToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Editor</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{editorToRemove}</span> from this venue? They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setEditorToRemove(null)}
              disabled={removingEditor}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemoveEditor}
              disabled={removingEditor}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {removingEditor ? 'Removing...' : 'Remove'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editors.length < 5 && (
        <form onSubmit={handleAddEditor} className="flex gap-2">
          <input
            type="email"
            value={newEditorEmail}
            onChange={(e) => setNewEditorEmail(e.target.value)}
            placeholder="Add editor by email"
            className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            disabled={addingEditor}
          />
          <button
            type="submit"
            disabled={addingEditor || !newEditorEmail.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
          >
            Add
          </button>
        </form>
      )}

      {editors.length >= 5 && (
        <p className="text-sm text-muted-foreground">Maximum 5 editors per venue</p>
      )}

      {editorError && (
        <p className="text-sm text-red-600 mt-2">{editorError}</p>
      )}
    </section>
  )
}
