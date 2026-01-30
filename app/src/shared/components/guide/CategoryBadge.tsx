import type { SensoryLevel } from '@/lib/schemas/guideSchema'

/**
 * Category badge colours from Design System v5
 * All colours verified for 4.5:1+ contrast ratio (WCAG AA)
 */
const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
  Sound: { bg: '#E3ECF0', text: '#264854' },
  Light: { bg: '#F4EBDA', text: '#4D3F14' },
  Crowds: { bg: '#EDE6E0', text: '#3F352C' },
  Smells: { bg: '#E6EEE7', text: '#263D29' },
  Smell: { bg: '#E6EEE7', text: '#263D29' },
  'Touch/Texture': { bg: '#EDE6E0', text: '#3F352C' },
  Touch: { bg: '#EDE6E0', text: '#3F352C' },
  Texture: { bg: '#EDE6E0', text: '#3F352C' },
  Movement: { bg: '#E3ECF0', text: '#264854' },
  Temperature: { bg: '#F4EBDA', text: '#4D3F14' },
  Vibration: { bg: '#E3ECF0', text: '#264854' },
  'Air Quality': { bg: '#E6EEE7', text: '#263D29' },
}

function getCategoryColours(category: string): { bg: string; text: string } {
  return CATEGORY_COLOURS[category] ?? { bg: '#EDE6E0', text: '#3F352C' }
}

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

/**
 * Sensory level indicator colours from Design System v5
 */
const LEVEL_COLOURS: Record<SensoryLevel, string> = {
  low: '#2A6339',
  medium: '#8A5F08',
  high: '#9E3322',
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
  const colour = LEVEL_COLOURS[level]

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
