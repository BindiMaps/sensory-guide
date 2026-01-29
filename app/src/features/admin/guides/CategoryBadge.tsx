import type { SensoryLevel } from '@/lib/schemas/guideSchema'

/**
 * Category badge colours from UX spec
 * All colours have been verified for WCAG 2.2 AA contrast with dark text
 */
const CATEGORY_COLOURS: Record<string, string> = {
  Sound: '#CDE7FF',
  Light: '#FFF4CC',
  Crowds: '#FFE0CC',
  'Touch/Texture': '#E8D5FF',
  Touch: '#E8D5FF',
  Texture: '#E8D5FF',
  Smell: '#D5F5E3',
  Movement: '#FFD6E8',
  Temperature: '#FFE4E1',
  Vibration: '#E0E7FF',
  'Air Quality': '#E0F2FE',
}

/**
 * Sensory level colours from design system
 */
const LEVEL_COLOURS: Record<SensoryLevel, { bg: string; text: string }> = {
  low: { bg: '#D5F5E3', text: '#2A6339' },
  medium: { bg: '#FEF3C7', text: '#8A5F08' },
  high: { bg: '#FEE2E2', text: '#9E3322' },
}

/**
 * Get background colour for a category
 * Falls back to neutral grey if category not in map
 */
function getCategoryColour(category: string): string {
  return CATEGORY_COLOURS[category] ?? '#E5E7EB'
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

/**
 * Category badge showing sensory category name
 * Uses colours from UX spec with verified contrast
 */
export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const bgColour = getCategoryColour(category)

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full text-gray-800 ${className}`}
      style={{ backgroundColor: bgColour }}
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
 * Level badge showing sensory intensity (low/medium/high)
 * Uses traffic light colours from design system
 */
export function LevelBadge({ level, className = '' }: LevelBadgeProps) {
  const colours = LEVEL_COLOURS[level]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize ${className}`}
      style={{ backgroundColor: colours.bg, color: colours.text }}
    >
      {level}
    </span>
  )
}
