import type { SensoryLevel } from '@/lib/schemas/guideSchema'

/**
 * Derive overall sensory level from a list of detail levels
 * Returns the highest level present (high > medium > low)
 */
export function getOverallLevel(levels: SensoryLevel[]): SensoryLevel {
  if (levels.includes('high')) return 'high'
  if (levels.includes('medium')) return 'medium'
  return 'low'
}
