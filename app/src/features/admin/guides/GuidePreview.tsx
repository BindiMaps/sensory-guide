import { useState, useMemo } from 'react'
import type { Guide, Area } from '@/lib/schemas/guideSchema'
import { GuideContent } from '@/shared/components/guide'
import { SuggestionsPanel } from './SuggestionsPanel'
import { ImageAssignmentEditor } from './components/ImageAssignmentEditor'
import { EmbedEditor } from './EmbedEditor'
import { useEmbeddings, type Embeddings } from './useEmbeddings'
import { useGlobalMapUrl } from './useGlobalMapUrl'
import { useRepublishEmbeddings } from './useRepublishEmbeddings'
import { trackEvent, AnalyticsEvent } from '@/lib/analytics'

/**
 * Merge embeddings and global map URL into guide.
 * Creates a new guide object with embedUrls + venue.mapUrl populated.
 */
function mergeEmbeddingsIntoGuide(guide: Guide, embeddings: Embeddings, globalMapUrl?: string): Guide {
  const hasEmbeds = Object.keys(embeddings).length > 0
  if (!hasEmbeds && !globalMapUrl) {
    return guide
  }

  return {
    ...guide,
    venue: globalMapUrl
      ? { ...guide.venue, mapUrl: globalMapUrl }
      : guide.venue,
    areas: hasEmbeds
      ? guide.areas.map((area) => ({
          ...area,
          embedUrls: embeddings[area.id] || area.embedUrls || [],
        }))
      : guide.areas,
  }
}

interface GuidePreviewProps {
  guide: Guide
  onPublish?: () => void
  onReupload?: () => void
  isPublishing?: boolean
  isPublished?: boolean
  outputPath?: string
  venueId?: string
  onImagesSaved?: () => void
}

/**
 * Full preview of a generated guide - Design System v5
 * Renders exactly as end users will see it, with admin actions
 */
export function GuidePreview({
  guide,
  onPublish,
  onReupload,
  isPublishing = false,
  isPublished = false,
  outputPath,
  venueId,
  onImagesSaved,
}: GuidePreviewProps) {
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [isSavingImages, setIsSavingImages] = useState(false)
  const [isEmbedEditorOpen, setIsEmbedEditorOpen] = useState(false)
  const [isSavingEmbeds, setIsSavingEmbeds] = useState(false)
  const [republishSuccess, setRepublishSuccess] = useState(false)

  // Fetch embeddings for this venue, with title-based matching
  const { embeddings, orphaned, saveEmbeddings, resolveOrphan } =
    useEmbeddings(venueId, guide.areas)

  // Fetch global venue map URL
  const { globalMapUrl, save: saveGlobalMapUrl } = useGlobalMapUrl(venueId)

  // Auto-republish when guide is already published
  const { republish, isRepublishing, error: republishError } = useRepublishEmbeddings()

  // Merge embeddings + global map URL into guide for display
  const guideWithEmbeds = useMemo(
    () => mergeEmbeddingsIntoGuide(guide, embeddings, globalMapUrl),
    [guide, embeddings, globalMapUrl]
  )

  // Check if guide has any images to edit
  const hasImages = guide.areas.some((area) => area.images && area.images.length > 0)

  const handleOpenEmbedEditor = () => {
    if (venueId) {
      trackEvent(AnalyticsEvent.VENUE_EMBED_EDITOR_OPEN, { venue_id: venueId })
    }
    setIsEmbedEditorOpen(true)
  }

  const handleSaveEmbeds = async (newEmbeddings: Embeddings, newGlobalMapUrl: string) => {
    setIsSavingEmbeds(true)
    try {
      await saveEmbeddings(newEmbeddings)
      await saveGlobalMapUrl(newGlobalMapUrl)
      if (venueId) {
        trackEvent(AnalyticsEvent.VENUE_EMBED_EDITOR_SAVE, { venue_id: venueId })
      }
      // Auto-republish if guide is already live so changes appear immediately
      if (isPublished && venueId) {
        const success = await republish(venueId)
        if (success) {
          setRepublishSuccess(true)
          setTimeout(() => setRepublishSuccess(false), 3000)
        }
      }
      setIsEmbedEditorOpen(false)
    } finally {
      setIsSavingEmbeds(false)
    }
  }

  const handleOpenImageEditor = () => {
    if (venueId) {
      trackEvent(AnalyticsEvent.VENUE_IMAGE_EDITOR_OPEN, { venue_id: venueId })
    }
    setIsImageEditorOpen(true)
  }

  const handleSaveImages = async (updatedAreas: Area[]) => {
    if (!outputPath || !venueId) {
      throw new Error('Missing outputPath or venueId')
    }

    setIsSavingImages(true)

    try {
      // Dynamic import to avoid loading Firebase in public bundle
      const { httpsCallable } = await import('firebase/functions')
      const { functions } = await import('@/lib/firebase')

      if (!functions) {
        throw new Error('Firebase not configured')
      }

      const updateGuideImages = httpsCallable<
        { venueId: string; outputPath: string; updates: { id: string; images: string[] }[] },
        { success: boolean }
      >(functions, 'updateGuideImages')

      const updates = updatedAreas.map((area) => ({
        id: area.id,
        images: area.images || [],
      }))

      await updateGuideImages({ venueId, outputPath, updates })
      trackEvent(AnalyticsEvent.VENUE_IMAGE_EDITOR_SAVE, { venue_id: venueId })

      // Trigger refetch of guide data
      onImagesSaved?.()
    } finally {
      setIsSavingImages(false)
    }
  }

  return (
    <div>
      {/* Suggestions Panel - admin only, shown first for immediate visibility */}
      <div className="max-w-[720px] mx-auto mb-6">
        <SuggestionsPanel suggestions={guide.suggestions} defaultExpanded />
      </div>

      {/* Republish feedback */}
      {republishSuccess && (
        <div className="max-w-[720px] mx-auto mb-4">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800" role="status" aria-live="polite">
              Maps &amp; media updated on live guide.
            </p>
          </div>
        </div>
      )}
      {republishError && (
        <div className="max-w-[720px] mx-auto mb-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800" role="alert">{republishError}</p>
          </div>
        </div>
      )}

      {/* Guide content - shared with public view, with embeddings merged */}
      <GuideContent guide={guideWithEmbeds} />

      {/* Action Bar - v5 styling */}
      <div className="max-w-[720px] mx-auto">
        <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E8E8E5]">
          {/* Edit Images button - only show if guide has images and we have the required props */}
          {hasImages && outputPath && venueId && (
            <button
              type="button"
              onClick={handleOpenImageEditor}
              disabled={isPublishing || isSavingImages}
              className="px-5 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-h-[44px] transition-colors"
            >
              Edit Images
            </button>
          )}
          {/* Edit Maps & Media button - show when we have venueId */}
          {venueId && (
            <button
              type="button"
              onClick={handleOpenEmbedEditor}
              disabled={isPublishing || isSavingEmbeds}
              className="px-5 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-h-[44px] transition-colors"
            >
              Edit Maps &amp; Media
            </button>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="px-6 py-2.5 bg-[#B8510D] text-white rounded hover:bg-[#9A4409] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm min-h-[44px] transition-colors"
          >
            {isPublishing ? 'Publishing...' : 'Publish Guide'}
          </button>
          <button
            type="button"
            onClick={onReupload}
            disabled={isPublishing}
            className="px-5 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-h-[44px] transition-colors"
          >
            Re-upload PDF
          </button>
        </div>
      </div>

      {/* Image Assignment Editor Modal */}
      {outputPath && venueId && (
        <ImageAssignmentEditor
          guide={guide}
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          onSave={handleSaveImages}
        />
      )}

      {/* Embed Editor Modal */}
      {venueId && (
        <EmbedEditor
          open={isEmbedEditorOpen}
          onOpenChange={setIsEmbedEditorOpen}
          areas={guide.areas}
          embeddings={embeddings}
          orphaned={orphaned}
          onSave={handleSaveEmbeds}
          onResolveOrphan={resolveOrphan}
          isSaving={isSavingEmbeds || isRepublishing}
          globalMapUrl={globalMapUrl}
        />
      )}
    </div>
  )
}
