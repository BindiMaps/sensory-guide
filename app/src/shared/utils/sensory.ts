import type { SensoryLevel } from '@/lib/schemas/guideSchema'

interface SensoryDetail {
  category: string
  level: SensoryLevel
}

/**
 * Derive overall sensory level from a list of details.
 * Returns the highest level present (high > medium > low).
 *
 * When activeCategories is provided and non-empty, only considers
 * details matching those categories (personalised calculation).
 */
export function getOverallLevel(
  details: SensoryDetail[],
  activeCategories?: Set<string>
): SensoryLevel {
  // Filter to user's selected categories if provided
  const filtered = activeCategories?.size
    ? details.filter(d => activeCategories.has(d.category))
    : details

  const levels = filtered.map(d => d.level)

  if (levels.includes('high')) return 'high'
  if (levels.includes('medium')) return 'medium'
  return 'low'
}
