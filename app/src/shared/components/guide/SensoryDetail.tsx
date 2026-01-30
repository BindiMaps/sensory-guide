import type { SensoryDetail as SensoryDetailType } from '@/lib/schemas/guideSchema'

interface SensoryDetailProps {
  detail: SensoryDetailType
}

/**
 * Renders a single sensory detail - Design System v5 styling
 * Category title with description text
 */
export function SensoryDetail({ detail }: SensoryDetailProps) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="font-semibold text-sm text-[#1A1A1A] mb-0.5">
        {detail.category}
      </p>
      <p className="text-sm text-[#3D3D3D] leading-relaxed">
        {detail.description}
      </p>
      {detail.imageUrl && (
        <img
          src={detail.imageUrl}
          alt={`${detail.category} detail for this area`}
          className="mt-3 rounded max-w-full h-auto max-h-48 object-cover"
          loading="lazy"
        />
      )}
    </div>
  )
}
