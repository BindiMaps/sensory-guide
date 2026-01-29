import type { SensoryDetail as SensoryDetailType } from '@/lib/schemas/guideSchema'
import { CategoryBadge, LevelBadge } from './CategoryBadge'

interface SensoryDetailProps {
  detail: SensoryDetailType
}

/**
 * Renders a single sensory detail within a venue area
 * Shows category, level, description, and optional image
 */
export function SensoryDetail({ detail }: SensoryDetailProps) {
  return (
    <div className="py-3 border-b border-muted last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <CategoryBadge category={detail.category} />
        <LevelBadge level={detail.level} />
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        {detail.description}
      </p>
      {detail.imageUrl && (
        <img
          src={detail.imageUrl}
          alt={`${detail.category} detail for this area`}
          className="mt-3 rounded-md max-w-full h-auto max-h-48 object-cover"
          loading="lazy"
        />
      )}
    </div>
  )
}
