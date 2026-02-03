import type { SensoryDetail as SensoryDetailType } from '@/lib/schemas/guideSchema'
import { ClickableImage } from './ImageLightbox'

interface SensoryDetailProps {
  detail: SensoryDetailType
  /** Section/area name for lightbox navigation context */
  sectionTitle?: string
  /** Whether this detail should be visually highlighted (matches active filter) */
  highlighted?: boolean
  /** Whether filters are active but this detail doesn't match (should be muted) */
  muted?: boolean
}

/**
 * Renders a single sensory detail - Design System v5 styling
 * Category title with description text
 * Supports highlight/mute states for sensory profile filtering
 */
export function SensoryDetail({ detail, sectionTitle, highlighted, muted }: SensoryDetailProps) {
  return (
    <div
      className={`mb-4 last:mb-0 rounded-sm p-2 -mx-2 transition-all duration-150 ${
        highlighted
          ? 'ring-2 ring-amber-400 bg-amber-50/50'
          : muted
            ? 'opacity-60'
            : ''
      }`}
      data-highlighted={highlighted || undefined}
      data-muted={muted || undefined}
    >
      <p className="font-semibold text-sm text-[#1A1A1A] mb-0.5">
        {detail.category}
      </p>
      <p className="text-sm text-[#3D3D3D] leading-relaxed">
        {detail.description}
      </p>
      {detail.imageUrl && (
        <ClickableImage
          src={detail.imageUrl}
          alt={`${detail.category} detail for this area`}
          sectionTitle={sectionTitle || detail.category}
          className="mt-3 rounded max-w-full h-auto max-h-48 object-cover"
        />
      )}
    </div>
  )
}
