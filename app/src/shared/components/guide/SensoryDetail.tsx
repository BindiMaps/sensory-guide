import type { SensoryDetail as SensoryDetailType } from '@/lib/schemas/guideSchema'
import { ClickableImage } from './ImageLightbox'

interface SensoryDetailProps {
  detail: SensoryDetailType
  /** Section/area name for lightbox navigation context */
  sectionTitle?: string
}

/**
 * Renders a single sensory detail - Design System v5 styling
 * Category title with description text
 */
export function SensoryDetail({ detail, sectionTitle }: SensoryDetailProps) {
  return (
    <div className="mb-4 last:mb-0">
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
