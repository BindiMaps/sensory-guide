import type { SensoryLevel } from '@/lib/schemas/guideSchema'

/**
 * Design System v5 colour tokens
 * Single source of truth for all design colours
 */

// Category badge colours (WCAG AA 4.5:1+ contrast verified)
export const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
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

// Default fallback for unknown categories
export const DEFAULT_CATEGORY_COLOUR = { bg: '#EDE6E0', text: '#3F352C' }

export function getCategoryColours(category: string): { bg: string; text: string } {
  return CATEGORY_COLOURS[category] ?? DEFAULT_CATEGORY_COLOUR
}

/**
 * Fuzzy match for category colours (used in PDF where categories may have different names)
 */
export function getCategoryColoursFuzzy(category: string): { bg: string; text: string } {
  // Exact match first
  if (CATEGORY_COLOURS[category]) return CATEGORY_COLOURS[category]

  // Fuzzy match
  const lowerCat = category.toLowerCase()
  if (lowerCat.includes('sound') || lowerCat.includes('noise')) return CATEGORY_COLOURS.Sound
  if (lowerCat.includes('light') || lowerCat.includes('visual')) return CATEGORY_COLOURS.Light
  if (lowerCat.includes('crowd') || lowerCat.includes('busy')) return CATEGORY_COLOURS.Crowds
  if (lowerCat.includes('smell') || lowerCat.includes('scent')) return CATEGORY_COLOURS.Smells
  return DEFAULT_CATEGORY_COLOUR
}

// Sensory level colours
export const LEVEL_COLOURS: Record<SensoryLevel, string> = {
  low: '#2A6339',
  medium: '#8A5F08',
  high: '#9E3322',
}

export function getLevelColour(level: SensoryLevel): string {
  return LEVEL_COLOURS[level] ?? '#595959'
}

// Level labels
export function getLevelLabel(level: SensoryLevel): string {
  switch (level) {
    case 'low':
      return 'Low'
    case 'medium':
      return 'Medium'
    case 'high':
      return 'High'
    default:
      return level
  }
}
