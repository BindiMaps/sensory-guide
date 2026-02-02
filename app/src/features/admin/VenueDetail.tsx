import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { Loader2, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useVenue } from '@/shared/hooks/useVenue'
import { useAuthStore } from '@/stores/authStore'
import { functions } from '@/lib/firebase'
import { PdfUpload } from '@/features/admin/guides/PdfUpload'
import { TransformProgress } from '@/features/admin/guides/TransformProgress'
import { RateLimitDisplay, RateLimitBlocker } from '@/features/admin/guides/RateLimitDisplay'
import { GuidePreview } from '@/features/admin/guides/GuidePreview'
import { useGuideData } from '@/features/admin/guides/useGuideData'
import { PublishDialog } from '@/features/admin/guides/PublishDialog'
import { PublishedSuccess } from '@/features/admin/guides/PublishedSuccess'
import { usePublishGuide } from '@/features/admin/guides/usePublishGuide'
import { useVenueState } from '@/features/admin/guides/useVenueState'
import { useVersionHistory } from '@/features/admin/guides/useVersionHistory'
import { VersionHistory } from '@/features/admin/guides/VersionHistory'
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

type PublishState = 'idle' | 'confirming' | 'publishing' | 'success'

interface PublishResult {
  publicUrl: string
  slug: string
}

/**
 * Guide content state machine - single source of truth for UI state.
 * Replaces scattered useState calls with explicit states.
 */
type GuideContentState =
  | { mode: 'upload' }
  | { mode: 'transforming'; logId: string }
  | { mode: 'preview'; outputPath: string }
  | { mode: 'draft'; draftPath: string }
  | { mode: 'published' }
  | { mode: 'error'; message: string }

/**
 * Wrapper component for guide preview that handles data fetching and publishing
 */
function GuidePreviewWrapper({
  outputPath,
  venueId,
  venueSlug,
  isAlreadyPublished,
  onReupload,
  onPublishSuccess,
}: {
  outputPath: string
  venueId: string
  venueSlug: string
  isAlreadyPublished: boolean
  onReupload: () => void
  onPublishSuccess: () => void
}) {
  const { data: guide, isLoading, error, refetch } = useGuideData(outputPath)
  const { publish, isPublishing, error: publishError, reset: resetPublishError } = usePublishGuide()
  const [publishState, setPublishState] = useState<PublishState>('idle')
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null)

  const handlePublishClick = () => {
    resetPublishError()
    setPublishState('confirming')
  }

  const handlePublishCancel = () => {
    setPublishState('idle')
  }

  const handlePublishConfirm = async () => {
    setPublishState('publishing')
    const result = await publish(venueId, outputPath)

    if (result) {
      setPublishResult({ publicUrl: result.publicUrl, slug: result.slug })
      setPublishState('success')
      onPublishSuccess()
    } else {
      // Error is set by the hook
      setPublishState('idle')
    }
  }

  const handleUploadNew = () => {
    setPublishState('idle')
    setPublishResult(null)
    onReupload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading guide preview...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="font-medium text-red-800 mb-2">Failed to load preview</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
          <button
            onClick={onReupload}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Re-upload PDF
          </button>
        </div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  // Show success state after publishing
  if (publishState === 'success' && publishResult) {
    return (
      <PublishedSuccess
        slug={publishResult.slug}
        publicUrl={publishResult.publicUrl}
        onUploadNew={handleUploadNew}
        venueId={venueId}
        areas={guide.areas}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Publish error message */}
      {publishError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
          {publishError}
        </div>
      )}

      <GuidePreview
        guide={guide}
        onPublish={handlePublishClick}
        onReupload={onReupload}
        isPublishing={isPublishing}
        outputPath={outputPath}
        venueId={venueId}
        onImagesSaved={() => refetch()}
      />

      {/* Publish confirmation dialog */}
      <PublishDialog
        open={publishState === 'confirming' || publishState === 'publishing'}
        onOpenChange={(open) => !open && handlePublishCancel()}
        onConfirm={handlePublishConfirm}
        isPublishing={isPublishing}
        isAlreadyPublished={isAlreadyPublished}
        slug={venueSlug}
      />
    </div>
  )
}

/**
 * Wrapper for published state that fetches guide data to get areas for embed editing.
 */
function PublishedStateWrapper({
  venue,
  onUploadNew,
}: {
  venue: { id: string; slug: string; liveVersion: string }
  onUploadNew: () => void
}) {
  const path = `venues/${venue.id}/versions/${venue.liveVersion}.json`
  const { data: guide, isLoading, error, refetch } = useGuideData(path)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="font-medium text-red-800 mb-2">Failed to load guide data</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
          <button
            onClick={onUploadNew}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Upload New PDF
          </button>
        </div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <PublishedSuccess
      slug={venue.slug}
      publicUrl={`${window.location.origin}/venue/${venue.slug}`}
      onUploadNew={onUploadNew}
      venueId={venue.id}
      areas={guide.areas}
    />
  )
}

export function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { venue, loading, error, addEditor, removeEditor, deleteVenue, updateName } = useVenue(id)
  const { user } = useAuthStore()

  // Venue lifecycle state (persisted in Firestore)
  const venueState = useVenueState(venue)

  // Version history
  const {
    versions,
    isLoading: versionsLoading,
    error: versionsError,
    refetch: refetchVersions,
  } = useVersionHistory(id, venue?.liveVersion)

  const [newEditorEmail, setNewEditorEmail] = useState('')
  const [editorError, setEditorError] = useState('')
  const [addingEditor, setAddingEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showSelfRemoveConfirm, setShowSelfRemoveConfirm] = useState(false)
  const [removingEditor, setRemovingEditor] = useState(false)
  const [editorToRemove, setEditorToRemove] = useState<string | null>(null)

  // Guide content state machine - derives initial state from venueState
  const [guideState, setGuideState] = useState<GuideContentState | null>(null)
  const [usageInfo, setUsageInfo] = useState<{ today: number; limit: number; isUnlimited: boolean } | null>(null)

  // Version history expansion
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [makingLiveError, setMakingLiveError] = useState<string | null>(null)

  // Venue name editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  // Derive initial guide state from Firestore venueState (only when not actively uploading/transforming)
  useEffect(() => {
    if (venueState.isLoading) return
    // Only set initial state if we haven't started a local workflow
    if (guideState === null) {
      if (venueState.state === 'published') {
        setGuideState({ mode: 'published' })
      } else if (venueState.state === 'draft' && venueState.draftPath) {
        setGuideState({ mode: 'draft', draftPath: venueState.draftPath })
      } else {
        setGuideState({ mode: 'upload' })
      }
    }
  }, [venueState, guideState])

  useEffect(() => {
    document.title = venue ? `${venue.name} - Sensory Guide Admin` : 'Venue - Sensory Guide Admin'
  }, [venue])

  // State transitions
  const startTransform = (logId: string) => setGuideState({ mode: 'transforming', logId })
  const completeTransform = (outputPath: string) => setGuideState({ mode: 'preview', outputPath })
  const failTransform = (message: string) => setGuideState({ mode: 'error', message })
  const startNewUpload = () => setGuideState({ mode: 'upload' })

  // Handle upload complete - trigger transform
  const handleUploadComplete = async (logId: string, uploadPath: string) => {
    startTransform(logId)

    if (!functions) {
      failTransform('Firebase not configured')
      return
    }

    try {
      const transformPdf = httpsCallable<
        { venueId: string; uploadPath: string; logId: string },
        { success: boolean; outputPath: string; suggestions: string[]; usageToday: number; usageLimit: number; isUnlimited: boolean }
      >(functions, 'transformPdf', { timeout: 540000 }) // 9 min timeout for LLM processing

      const result = await transformPdf({ venueId: id!, uploadPath, logId })

      setUsageInfo({ today: result.data.usageToday, limit: result.data.usageLimit, isUnlimited: result.data.isUnlimited })
      completeTransform(result.data.outputPath)
      refetchVersions()
    } catch (err) {
      const error = err as { code?: string; message?: string; details?: { usageToday?: number; usageLimit?: number } }

      // Human-friendly error messages
      let friendlyMessage = 'Something went wrong. Please try again.'
      if (error.code === 'deadline-exceeded' || error.message?.includes('deadline')) {
        friendlyMessage = 'The transformation is taking longer than expected. Please try again with a smaller PDF.'
      } else if (error.code === 'resource-exhausted' || error.message?.includes('limit')) {
        friendlyMessage = 'Daily limit reached. Come back tomorrow to create more guides.'
      } else if (error.message?.includes('not-found')) {
        friendlyMessage = 'Could not find the uploaded PDF. Please try uploading again.'
      } else if (error.message?.includes('permission')) {
        friendlyMessage = 'You don\'t have permission to transform guides for this venue.'
      } else if (error.message) {
        friendlyMessage = error.message
      }

      // Extract usage info from error if rate limit exceeded
      if (error.details?.usageToday !== undefined) {
        setUsageInfo({ today: error.details.usageToday, limit: error.details.usageLimit || 20, isUnlimited: false })
      }

      failTransform(friendlyMessage)
    }
  }

  // Handle transform complete (from progress component)
  const handleTransformComplete = (path: string) => {
    completeTransform(path)
    refetchVersions()
  }

  // Check if rate limit is exhausted (never for superadmins)
  const isRateLimitExhausted = usageInfo && !usageInfo.isUnlimited && usageInfo.today >= usageInfo.limit

  // Handle making a version live (from version history)
  const handleMakeLive = async (timestamp: string) => {
    if (!functions || !id) return

    setMakingLiveError(null)
    try {
      const setLiveVersion = httpsCallable<
        { venueId: string; timestamp: string },
        { success: boolean; publicUrl: string; liveVersion: string; slug: string }
      >(functions, 'setLiveVersion')

      await setLiveVersion({ venueId: id, timestamp })

      // Refetch versions to update UI
      refetchVersions()
    } catch (err) {
      const error = err as Error
      setMakingLiveError(error.message || 'Failed to make version live')
    }
  }

  // Handle deleting a version (from version history)
  const handleDeleteVersion = async (timestamp: string) => {
    if (!functions || !id) return

    setMakingLiveError(null)
    try {
      const deleteVersion = httpsCallable<
        { venueId: string; timestamp: string },
        { success: boolean; deletedVersion: string }
      >(functions, 'deleteVersion')

      await deleteVersion({ venueId: id, timestamp })

      // Refetch versions to update UI
      refetchVersions()
    } catch (err) {
      const error = err as Error
      setMakingLiveError(error.message || 'Failed to delete version')
      throw error // Re-throw so VersionHistory dialog can handle it
    }
  }

  // Handle preview from version history
  const handleVersionPreview = (version: { previewUrl: string; timestamp: string }) => {
    // Format timestamp for display
    const date = new Date(version.timestamp).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Build preview URL with query params
    const params = new URLSearchParams({
      url: version.previewUrl,
      date,
      venueId: id!,
    })

    // Open in new tab with proper preview UI
    window.open(`/admin/preview?${params.toString()}`, '_blank')
  }

  const handleAddEditor = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditorError('')

    const email = newEditorEmail.trim().toLowerCase()

    if (!isValidEmail(email)) {
      setEditorError('Please enter a valid email address')
      return
    }

    if (email === user?.email?.toLowerCase()) {
      setEditorError("You're already an editor")
      return
    }

    if (venue?.editors.map(e => e.toLowerCase()).includes(email)) {
      setEditorError('This person is already an editor')
      return
    }

    setAddingEditor(true)

    try {
      await addEditor(email)
      setNewEditorEmail('')
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Failed to add editor')
    } finally {
      setAddingEditor(false)
    }
  }

  const handleRemoveEditor = async (email: string) => {
    const isSelf = email.toLowerCase() === user?.email?.toLowerCase()

    if (isSelf && !showSelfRemoveConfirm) {
      setShowSelfRemoveConfirm(true)
      return
    }

    setRemovingEditor(true)
    try {
      await removeEditor(email)
      if (isSelf) {
        navigate('/admin', { replace: true })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove editor')
    } finally {
      setRemovingEditor(false)
      setShowSelfRemoveConfirm(false)
    }
  }

  const handleDeleteVenue = async () => {
    if (deleteConfirmName !== venue?.name) {
      return
    }

    setDeleting(true)

    try {
      await deleteVenue()
      navigate('/admin', { replace: true })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete venue')
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading venue...</div>
  }

  if (error || !venue) {
    return (
      <div>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to venues
        </Link>
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
          {error || 'Venue not found'}
        </div>
      </div>
    )
  }

  const isLastEditor = venue.editors.length === 1
  const currentUserIsEditor = user?.email && venue.editors.map(e => e.toLowerCase()).includes(user.email.toLowerCase())
  const currentUserIsOwner = user?.email?.toLowerCase() === venue.createdBy?.toLowerCase()

  /**
   * Determines if the current user can remove a specific editor.
   * - Can't remove the owner unless you ARE the owner
   * - Can't remove if you're the last editor
   * - Must be an editor yourself to remove anyone
   */
  const canRemoveEditor = (targetEmail: string): boolean => {
    const isTargetOwner = targetEmail.toLowerCase() === venue.createdBy?.toLowerCase()

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
    const isSelf = email.toLowerCase() === user?.email?.toLowerCase()

    if (isSelf) {
      // Use existing self-removal flow
      setShowSelfRemoveConfirm(true)
    } else {
      // Show confirmation dialog for removing others
      setEditorToRemove(email)
    }
  }

  const handleConfirmRemoveEditor = async () => {
    if (!editorToRemove) return

    setRemovingEditor(true)
    try {
      await removeEditor(editorToRemove)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove editor')
    } finally {
      setRemovingEditor(false)
      setEditorToRemove(null)
    }
  }

  const handleStartEditName = () => {
    setEditedName(venue?.name || '')
    setNameError('')
    setNameSuccess(false)
    setIsEditingName(true)
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedName('')
    setNameError('')
  }

  const handleSaveName = async () => {
    const trimmed = editedName.trim()
    if (!trimmed) {
      setNameError('Venue name is required')
      return
    }

    setNameSaving(true)
    setNameError('')

    try {
      await updateName(trimmed)
      setIsEditingName(false)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 2500)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setNameSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to venues
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          {isEditingName ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold px-2 py-1 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  disabled={nameSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelEditName()
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={nameSaving}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
                >
                  {nameSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEditName}
                  disabled={nameSaving}
                  className="px-3 py-1.5 border rounded-md hover:bg-accent text-sm"
                >
                  Cancel
                </button>
              </div>
              {nameError && (
                <p className="text-sm text-red-600">{nameError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{venue.name}</h1>
              <button
                onClick={handleStartEditName}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
                title="Edit venue name"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {nameSuccess && (
                <span className="text-sm text-green-600">Name updated</span>
              )}
            </div>
          )}
          <p className="text-muted-foreground">/venue/{venue.slug}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            venue.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {venue.status}
        </span>
      </div>

      {/* Editor Management */}
      <section className="border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Editors</h2>

        <ul className="space-y-2 mb-4">
          {venue.editors.map((email) => (
            <li key={email} className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded">
              <span className="text-sm">
                {email}
                {email === venue.createdBy && (
                  <span className="text-xs text-muted-foreground ml-2">(owner)</span>
                )}
                {email.toLowerCase() === user?.email?.toLowerCase() && (
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
                onClick={() => handleRemoveEditor(user?.email || '')}
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

        {venue.editors.length < 5 && (
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

        {venue.editors.length >= 5 && (
          <p className="text-sm text-muted-foreground">Maximum 5 editors per venue</p>
        )}

        {editorError && (
          <p className="text-sm text-red-600 mt-2">{editorError}</p>
        )}
      </section>

      {/* Guide Upload & Transform */}
      <section className="border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Guide Content</h2>

        {/* Rate limit display */}
        {usageInfo && !isRateLimitExhausted && (
          <RateLimitDisplay
            usageToday={usageInfo.today}
            usageLimit={usageInfo.limit}
            isUnlimited={usageInfo.isUnlimited}
            className="mb-4"
          />
        )}

        {/* Rate limit blocker takes precedence */}
        {isRateLimitExhausted ? (
          <RateLimitBlocker usageToday={usageInfo!.today} usageLimit={usageInfo!.limit} isUnlimited={usageInfo!.isUnlimited} />
        ) : !guideState ? (
          /* Loading initial state */
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : guideState.mode === 'transforming' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transforming your PDF into a Sensory Guide...
            </p>
            <TransformProgress
              venueId={id!}
              logId={guideState.logId}
              onComplete={handleTransformComplete}
              onRetry={startNewUpload}
            />
          </div>
        ) : guideState.mode === 'preview' ? (
          <GuidePreviewWrapper
            outputPath={guideState.outputPath}
            venueId={id!}
            venueSlug={venue.slug}
            isAlreadyPublished={venue.status === 'published'}
            onReupload={startNewUpload}
            onPublishSuccess={refetchVersions}
          />
        ) : guideState.mode === 'error' ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="font-medium text-red-800 mb-2">Transform failed</h3>
              <p className="text-sm text-red-700">{guideState.message}</p>
            </div>
            <button
              onClick={startNewUpload}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : guideState.mode === 'published' ? (
          <PublishedStateWrapper
            venue={{ id: id!, slug: venue.slug, liveVersion: venue.liveVersion! }}
            onUploadNew={startNewUpload}
          />
        ) : guideState.mode === 'draft' ? (
          <GuidePreviewWrapper
            outputPath={guideState.draftPath}
            venueId={id!}
            venueSlug={venue.slug}
            isAlreadyPublished={venue.status === 'published'}
            onReupload={startNewUpload}
            onPublishSuccess={refetchVersions}
          />
        ) : (
          <PdfUpload
            venueId={id!}
            onUploadComplete={handleUploadComplete}
            onUploadError={(error) => failTransform(error)}
          />
        )}
      </section>

      {/* Version History */}
      {versions.length > 0 && (
        <section className="border rounded-lg p-4 mb-6">
          <button
            type="button"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">Version History</h2>
            {showVersionHistory ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showVersionHistory && (
            <div className="mt-4">
              {makingLiveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800 mb-4">
                  {makingLiveError}
                </div>
              )}
              <VersionHistory
                versions={versions}
                isLoading={versionsLoading}
                error={versionsError}
                onMakeLive={handleMakeLive}
                onDelete={handleDeleteVersion}
                onPreview={handleVersionPreview}
              />
            </div>
          )}
        </section>
      )}

      {/* Delete Venue (only for last editor) */}
      {isLastEditor && currentUserIsEditor && (
        <section className="border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
            >
              Delete Venue
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700">
                This will permanently delete <strong>{venue.name}</strong> and all its data.
                Type the venue name to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={venue.name}
                className="w-full px-3 py-2 border border-red-300 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={deleting}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteVenue}
                  disabled={deleting || deleteConfirmName !== venue.name}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmName('')
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
