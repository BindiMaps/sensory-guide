import type { Guide } from '@/lib/schemas/guideSchema'
import { GuideContent } from '@/shared/components/guide'
import { SuggestionsPanel } from './SuggestionsPanel'

interface GuidePreviewProps {
  guide: Guide
  onPublish?: () => void
  onReupload?: () => void
  isPublishing?: boolean
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
}: GuidePreviewProps) {
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
    </div>
  )
}
