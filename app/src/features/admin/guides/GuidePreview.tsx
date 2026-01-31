import { useState } from 'react'
import type { Guide, Area } from '@/lib/schemas/guideSchema'
import { GuideContent } from '@/shared/components/guide'
import { SuggestionsPanel } from './SuggestionsPanel'
import { ImageAssignmentEditor } from './components/ImageAssignmentEditor'

interface GuidePreviewProps {
  guide: Guide
  onPublish?: () => void
  onReupload?: () => void
  isPublishing?: boolean
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
  outputPath,
  venueId,
  onImagesSaved,
}: GuidePreviewProps) {
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)
  const [isSavingImages, setIsSavingImages] = useState(false)

  // Check if guide has any images to edit
  const hasImages = guide.areas.some((area) => area.images && area.images.length > 0)

  const handleSaveImages = async (updatedAreas: Area[]) => {
    if (!outputPath || !venueId) {
      throw new Error('Missing outputPath or venueId')
    }

    setIsSavingImages(true)

    try {
      // Dynamic import to avoid loading Firebase in public bundle
      const { getFunctions, httpsCallable } = await import('firebase/functions')
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

      {/* Guide content - shared with public view */}
      <GuideContent guide={guide} />

      {/* Action Bar - v5 styling */}
      <div className="max-w-[720px] mx-auto">
        <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E8E8E5]">
          {/* Edit Images button - only show if guide has images and we have the required props */}
          {hasImages && outputPath && venueId && (
            <button
              type="button"
              onClick={() => setIsImageEditorOpen(true)}
              disabled={isPublishing || isSavingImages}
              className="px-5 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-h-[44px] transition-colors"
            >
              Edit Images
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
    </div>
  )
}
