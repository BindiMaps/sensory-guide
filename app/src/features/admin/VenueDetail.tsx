import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { Loader2 } from 'lucide-react'
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

type PublishState = 'idle' | 'confirming' | 'publishing' | 'success'

interface PublishResult {
  publicUrl: string
  slug: string
}

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

export function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { venue, loading, error, addEditor, removeEditor, deleteVenue } = useVenue(id)
  const { user } = useAuthStore()

  const [newEditorEmail, setNewEditorEmail] = useState('')
  const [editorError, setEditorError] = useState('')
  const [addingEditor, setAddingEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showSelfRemoveConfirm, setShowSelfRemoveConfirm] = useState(false)
  const [removingEditor, setRemovingEditor] = useState(false)

  // Transform state
  const [transformState, setTransformState] = useState<'idle' | 'transforming' | 'complete' | 'error'>('idle')
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)
  const [transformError, setTransformError] = useState<string | null>(null)
  const [outputPath, setOutputPath] = useState<string | null>(null)
  const [usageInfo, setUsageInfo] = useState<{ today: number; limit: number } | null>(null)

  useEffect(() => {
    document.title = venue ? `${venue.name} - Sensory Guide Admin` : 'Venue - Sensory Guide Admin'
  }, [venue])

  // Handle upload complete - trigger transform
  const handleUploadComplete = async (logId: string, uploadPath: string) => {
    setCurrentLogId(logId)
    setTransformState('transforming')
    setTransformError(null)

    if (!functions) {
      setTransformError('Firebase not configured')
      setTransformState('error')
      return
    }

    try {
      const transformPdf = httpsCallable<
        { venueId: string; uploadPath: string; logId: string },
        { success: boolean; outputPath: string; suggestions: string[]; usageToday: number; usageLimit: number }
      >(functions, 'transformPdf', { timeout: 540000 }) // 9 min timeout for LLM processing

      const result = await transformPdf({ venueId: id!, uploadPath, logId })

      setOutputPath(result.data.outputPath)
      setUsageInfo({ today: result.data.usageToday, limit: result.data.usageLimit })
      setTransformState('complete')
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

      setTransformError(friendlyMessage)

      // Extract usage info from error if rate limit exceeded
      if (error.details?.usageToday !== undefined) {
        setUsageInfo({ today: error.details.usageToday, limit: error.details.usageLimit || 50 })
      }

      setTransformState('error')
    }
  }

  // Handle transform complete (from progress component)
  const handleTransformComplete = (path: string) => {
    setOutputPath(path)
    setTransformState('complete')
  }

  // Handle retry
  const handleRetry = () => {
    setTransformState('idle')
    setCurrentLogId(null)
    setTransformError(null)
    setOutputPath(null)
  }

  // Check if rate limit is exhausted
  const isRateLimitExhausted = usageInfo && usageInfo.today >= usageInfo.limit

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
          <h1 className="text-3xl font-bold">{venue.name}</h1>
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
              {!isLastEditor && currentUserIsEditor && (
                <button
                  onClick={() => handleRemoveEditor(email)}
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
            className="mb-4"
          />
        )}

        {/* Rate limit blocker */}
        {isRateLimitExhausted ? (
          <RateLimitBlocker usageToday={usageInfo!.today} usageLimit={usageInfo!.limit} />
        ) : transformState === 'idle' ? (
          /* Upload component - shown when idle */
          <PdfUpload
            venueId={id!}
            onUploadComplete={handleUploadComplete}
            onUploadError={(error) => {
              setTransformError(error)
              setTransformState('error')
            }}
          />
        ) : transformState === 'transforming' && currentLogId ? (
          /* Transform progress - shown while transforming */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Transforming your PDF into a Sensory Guide...
            </p>
            <TransformProgress
              venueId={id!}
              logId={currentLogId}
              onComplete={handleTransformComplete}
              onRetry={handleRetry}
            />
          </div>
        ) : transformState === 'complete' && outputPath ? (
          /* Preview state - show full guide preview */
          <GuidePreviewWrapper
            outputPath={outputPath}
            venueId={id!}
            venueSlug={venue.slug}
            isAlreadyPublished={venue.status === 'published'}
            onReupload={handleRetry}
            onPublishSuccess={() => {
              // Refetch venue to update status badge
              // The useVenue hook will automatically update
            }}
          />
        ) : transformState === 'error' ? (
          /* Error state */
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="font-medium text-red-800 mb-2">Transform failed</h3>
              <p className="text-sm text-red-700">{transformError || 'An unexpected error occurred'}</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </section>

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
