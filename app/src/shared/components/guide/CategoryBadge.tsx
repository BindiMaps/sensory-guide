import type { SensoryLevel } from '@/lib/schemas/guideSchema'
import { getCategoryColours, getLevelColour, getLevelLabel } from '@/shared/utils/colours'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const colours = getCategoryColours(category)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[0.75rem] font-semibold tracking-wide rounded-sm contrast-more:shadow-[inset_0_0_0_1px_currentColor] ${className}`}
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

export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  const colour = getLevelColour(level)

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="w-3.5 h-3.5 rounded-sm flex-shrink-0 contrast-more:w-4 contrast-more:h-4"
        style={{ backgroundColor: colour }}
        aria-hidden="true"
      />
      <span
        className="text-[0.75rem] font-semibold tracking-wide"
        style={{ color: colour }}
      >
        {getLevelLabel(level)}
      </span>
    </span>
  )
}
