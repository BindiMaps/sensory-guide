import type { Area } from '@/lib/schemas/guideSchema'

/**
 * Embedding data with title for matching across re-uploads
 */
export interface EmbedData {
  urls: string[]
  title: string
}

/**
 * Embeddings format with title metadata
 */
export type EmbeddingsWithMeta = Record<string, EmbedData>

/**
 * Orphaned embed that couldn't be matched to a section
 */
export interface OrphanedEmbed {
  originalId: string
  title: string
  urls: string[]
  /** Suggested match based on title similarity, if any */
  suggestedAreaId?: string
  suggestedAreaName?: string
  /** Similarity score 0-1 */
  similarity?: number
}

/**
 * Result of matching embeddings to new guide areas
 */
export interface MatchResult {
  /** Embeddings keyed by new area ID */
  matched: EmbeddingsWithMeta
  /** Embeds that couldn't be matched */
  orphaned: OrphanedEmbed[]
}

/**
 * Normalise string for comparison - lowercase, remove extra whitespace, strip punctuation
 */
function normalise(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokenise string into words for comparison
 */
function tokenise(str: string): Set<string> {
  return new Set(normalise(str).split(' ').filter(Boolean))
}

/**
 * Calculate Jaccard similarity between two strings (0-1)
 * Based on word overlap
 */
export function calculateSimilarity(a: string, b: string): number {
  const tokensA = tokenise(a)
  const tokensB = tokenise(b)

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++
    }
  }

  const union = tokensA.size + tokensB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Minimum similarity threshold for auto-matching (0.5 = 50% word overlap)
 */
const AUTO_MATCH_THRESHOLD = 0.5

/**
 * Minimum similarity for suggestion (0.25 = at least some word overlap)
 */
const SUGGESTION_THRESHOLD = 0.25

/**
 * Match embeddings to new guide areas by title similarity
 */
export function matchEmbeddingsToAreas(
  embeddings: EmbeddingsWithMeta,
  areas: Area[]
): MatchResult {
  const matched: EmbeddingsWithMeta = {}
  const orphaned: OrphanedEmbed[] = []
  const usedAreaIds = new Set<string>()

  // First pass: exact ID matches
  for (const [oldId, data] of Object.entries(embeddings)) {
    const exactMatch = areas.find((a) => a.id === oldId)
    if (exactMatch) {
      matched[exactMatch.id] = {
        urls: data.urls,
        title: exactMatch.name, // Update to current name
      }
      usedAreaIds.add(exactMatch.id)
    }
  }

  // Second pass: title matching for unmatched embeddings
  for (const [oldId, data] of Object.entries(embeddings)) {
    if (matched[oldId]) continue // Already matched by ID

    const availableAreas = areas.filter((a) => !usedAreaIds.has(a.id))
    let bestMatch: { area: Area; similarity: number } | null = null

    for (const area of availableAreas) {
      const similarity = calculateSimilarity(data.title, area.name)
      if (similarity >= AUTO_MATCH_THRESHOLD) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { area, similarity }
        }
      }
    }

    if (bestMatch) {
      // Auto-match with high confidence
      matched[bestMatch.area.id] = {
        urls: data.urls,
        title: bestMatch.area.name,
      }
      usedAreaIds.add(bestMatch.area.id)
    } else {
      // Find best suggestion for orphan
      let suggestion: { area: Area; similarity: number } | null = null
      for (const area of availableAreas) {
        const similarity = calculateSimilarity(data.title, area.name)
        if (similarity >= SUGGESTION_THRESHOLD) {
          if (!suggestion || similarity > suggestion.similarity) {
            suggestion = { area, similarity }
          }
        }
      }

      orphaned.push({
        originalId: oldId,
        title: data.title,
        urls: data.urls,
        suggestedAreaId: suggestion?.area.id,
        suggestedAreaName: suggestion?.area.name,
        similarity: suggestion?.similarity,
      })
    }
  }

  return { matched, orphaned }
}

/**
 * Convert to simple Record<string, string[]> for components that need it
 */
export function toSimpleFormat(embeddings: EmbeddingsWithMeta): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const [id, data] of Object.entries(embeddings)) {
    result[id] = data.urls
  }
  return result
}
