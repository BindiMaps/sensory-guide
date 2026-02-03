import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { Loader2 } from 'lucide-react'
import { trackEvent, AnalyticsEvent } from '@/lib/analytics'
import { functions } from '@/lib/firebase'
import { PdfUpload } from '@/features/admin/guides/PdfUpload'
import { TransformProgress } from '@/features/admin/guides/TransformProgress'
import { RateLimitDisplay, RateLimitBlocker } from '@/features/admin/guides/RateLimitDisplay'
import { useVenueState } from '@/features/admin/guides/useVenueState'
import { GuidePreviewWrapper } from './GuidePreviewWrapper'
import { PublishedStateWrapper } from './PublishedStateWrapper'
import type { Venue } from '@/shared/types/venue'

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

interface GuideSectionProps {
  venueId: string
  venue: Venue
  onVersionsChange: () => void
}

export function GuideSection({ venueId, venue, onVersionsChange }: GuideSectionProps) {
  const venueState = useVenueState(venue)

  // Guide content state machine - derives initial state from venueState
  const [guideState, setGuideState] = useState<GuideContentState | null>(null)
  const [usageInfo, setUsageInfo] = useState<{ today: number; limit: number; isUnlimited: boolean } | null>(null)

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

  // State transitions
  const startTransform = (logId: string) => setGuideState({ mode: 'transforming', logId })
  const completeTransform = (outputPath: string) => setGuideState({ mode: 'preview', outputPath })
  const failTransform = (message: string) => setGuideState({ mode: 'error', message })
  const startNewUpload = () => setGuideState({ mode: 'upload' })

  // Handle upload complete - trigger transform
  const handleUploadComplete = async (logId: string, uploadPath: string) => {
    trackEvent(AnalyticsEvent.VENUE_TRANSFORM_START, { venue_id: venueId })
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

      const result = await transformPdf({ venueId: venueId, uploadPath, logId })

      trackEvent(AnalyticsEvent.VENUE_TRANSFORM_COMPLETE, { venue_id: venueId })
      setUsageInfo({ today: result.data.usageToday, limit: result.data.usageLimit, isUnlimited: result.data.isUnlimited })
      completeTransform(result.data.outputPath)
      onVersionsChange()
    } catch (err) {
      const error = err as { code?: string; message?: string; details?: { usageToday?: number; usageLimit?: number } }

      // Human-friendly error messages
      let friendlyMessage = 'Something went wrong. Please try again.'
      let errorCode = 'unknown'
      if (error.code === 'deadline-exceeded' || error.message?.includes('deadline')) {
        friendlyMessage = 'The transformation is taking longer than expected. Please try again with a smaller PDF.'
        errorCode = 'deadline-exceeded'
      } else if (error.code === 'resource-exhausted' || error.message?.includes('limit')) {
        friendlyMessage = 'Daily limit reached. Come back tomorrow to create more guides.'
        errorCode = 'resource-exhausted'
      } else if (error.message?.includes('not-found')) {
        friendlyMessage = 'Could not find the uploaded PDF. Please try uploading again.'
        errorCode = 'not-found'
      } else if (error.message?.includes('permission')) {
        friendlyMessage = 'You don\'t have permission to transform guides for this venue.'
        errorCode = 'permission-denied'
      } else if (error.message) {
        friendlyMessage = error.message
      }

      trackEvent(AnalyticsEvent.VENUE_TRANSFORM_ERROR, { venue_id: venueId, error_code: errorCode })

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
    onVersionsChange()
  }

  // Check if rate limit is exhausted (never for superadmins)
  const isRateLimitExhausted = usageInfo && !usageInfo.isUnlimited && usageInfo.today >= usageInfo.limit

  return (
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
            venueId={venueId}
            logId={guideState.logId}
            onComplete={handleTransformComplete}
            onRetry={startNewUpload}
          />
        </div>
      ) : guideState.mode === 'preview' ? (
        <GuidePreviewWrapper
          outputPath={guideState.outputPath}
          venueId={venueId}
          venueSlug={venue.slug}
          isAlreadyPublished={venue.status === 'published'}
          onReupload={startNewUpload}
          onPublishSuccess={onVersionsChange}
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
          venue={{ id: venueId, slug: venue.slug, liveVersion: venue.liveVersion! }}
          onUploadNew={startNewUpload}
        />
      ) : guideState.mode === 'draft' ? (
        <GuidePreviewWrapper
          outputPath={guideState.draftPath}
          venueId={venueId}
          venueSlug={venue.slug}
          isAlreadyPublished={venue.status === 'published'}
          onReupload={startNewUpload}
          onPublishSuccess={onVersionsChange}
        />
      ) : (
        <PdfUpload
          venueId={venueId}
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => failTransform(error)}
        />
      )}
    </section>
  )
}
