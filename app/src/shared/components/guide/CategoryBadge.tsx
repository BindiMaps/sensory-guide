import type { SensoryLevel } from '@/lib/schemas/guideSchema'
import { getCategoryColours, getLevelColour } from '@/shared/utils/colours'

interface CategoryBadgeProps {
  category: string
  className?: string
}

/**
 * Category badge from Design System v5
 * Uppercase, small text, 2px radius
 */
export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const colours = getCategoryColours(category)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-sm ${className}`}
      style={{ backgroundColor: colours.bg, color: colours.text }}
    >
      {category}
    </span>
  )
}

interface LevelBadgeProps {
  level: SensoryLevel
  className?: string
}

/**
 * Sensory level indicator from Design System v5
 * 12px square + uppercase text label
 */
export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  const colour = getLevelColour(level)

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ backgroundColor: colour }}
        aria-hidden="true"
      />
      <span
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: colour }}
      >
        {level}
      </span>
    </span>
  )
}
