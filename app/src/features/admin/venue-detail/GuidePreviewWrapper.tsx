import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { trackEvent, AnalyticsEvent } from '@/lib/analytics'
import { GuidePreview } from '@/features/admin/guides/GuidePreview'
import { PublishDialog } from '@/features/admin/guides/PublishDialog'
import { PublishedSuccess } from '@/features/admin/guides/PublishedSuccess'
import { useGuideData } from '@/features/admin/guides/useGuideData'
import { usePublishGuide } from '@/features/admin/guides/usePublishGuide'

type PublishState = 'idle' | 'confirming' | 'publishing' | 'success'

interface PublishResult {
  publicUrl: string
  slug: string
}

interface GuidePreviewWrapperProps {
  outputPath: string
  venueId: string
  venueSlug: string
  isAlreadyPublished: boolean
  onReupload: () => void
  onPublishSuccess: () => void
}

export function GuidePreviewWrapper({
  outputPath,
  venueId,
  venueSlug,
  isAlreadyPublished,
  onReupload,
  onPublishSuccess,
}: GuidePreviewWrapperProps) {
  const { data: guide, isLoading, error, refetch } = useGuideData(outputPath)
  const { publish, isPublishing, error: publishError, reset: resetPublishError } = usePublishGuide()
  const [publishState, setPublishState] = useState<PublishState>('idle')
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null)

  const handlePublishClick = () => {
    trackEvent(AnalyticsEvent.VENUE_PUBLISH_CLICK, { venue_id: venueId, venue_slug: venueSlug })
    resetPublishError()
    setPublishState('confirming')
  }

  const handlePublishCancel = () => {
    setPublishState('idle')
  }

  const handlePublishConfirm = async () => {
    trackEvent(AnalyticsEvent.VENUE_PUBLISH_CONFIRM, { venue_id: venueId, venue_slug: venueSlug })
    setPublishState('publishing')
    const result = await publish(venueId, outputPath)

    if (result) {
      trackEvent(AnalyticsEvent.VENUE_PUBLISH_SUCCESS, { venue_id: venueId, venue_slug: result.slug })
      setPublishResult({ publicUrl: result.publicUrl, slug: result.slug })
      setPublishState('success')
      onPublishSuccess()
    } else {
      trackEvent(AnalyticsEvent.VENUE_PUBLISH_ERROR, { venue_id: venueId })
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
