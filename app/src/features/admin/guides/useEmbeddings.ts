import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Area } from '@/lib/schemas/guideSchema'
import {
  type EmbeddingsWithMeta,
  type OrphanedEmbed,
  matchEmbeddingsToAreas,
  toSimpleFormat,
} from './embedMatcher'

/** Simple format for backward compatibility */
export type Embeddings = Record<string, string[]>

interface UseEmbeddingsResult {
  /** Embeddings in simple format (for existing consumers) */
  embeddings: Embeddings
  /** Raw embeddings with metadata */
  embeddingsWithMeta: EmbeddingsWithMeta
  /** Orphaned embeds that couldn't be matched to current areas */
  orphaned: OrphanedEmbed[]
  isLoading: boolean
  error: string | null
  /** Save embeddings (simple format, auto-adds titles from areas) */
  saveEmbeddings: (embeddings: Embeddings) => Promise<void>
  /** Save embeddings with metadata */
  saveEmbeddingsWithMeta: (embeddings: EmbeddingsWithMeta) => Promise<void>
  /** Resolve orphan by assigning to area or deleting */
  resolveOrphan: (originalId: string, targetAreaId: string | null) => Promise<void>
  refetch: () => void
}

/**
 * Hook to fetch and save embed URLs for venue sections.
 * Embeddings are stored in Firestore at /venues/{venueId}/embeddings/urls
 *
 * Supports both legacy format (just URLs) and new format (URLs + title for matching).
 * When areas are provided, performs title-based matching to preserve embeds across re-uploads.
 */
export function useEmbeddings(
  venueId: string | undefined,
  areas?: Area[]
): UseEmbeddingsResult {
  const [embeddingsWithMeta, setEmbeddingsWithMeta] = useState<EmbeddingsWithMeta>({})
  const [orphaned, setOrphaned] = useState<OrphanedEmbed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track if we've already migrated/matched to avoid duplicate work
  const lastAreasRef = useRef<Area[] | undefined>(undefined)
  const rawDataRef = useRef<EmbeddingsWithMeta>({})

  const fetchEmbeddings = useCallback(async () => {
    if (!venueId || !db) {
      setEmbeddingsWithMeta({})
      setOrphaned([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const embeddingsRef = doc(db, 'venues', venueId, 'embeddings', 'urls')
      const snapshot = await getDoc(embeddingsRef)

      if (snapshot.exists()) {
        const withMeta = snapshot.data() as EmbeddingsWithMeta
        rawDataRef.current = withMeta

        // If we have areas, perform matching
        if (areas && areas.length > 0) {
          const result = matchEmbeddingsToAreas(withMeta, areas)
          setEmbeddingsWithMeta(result.matched)
          setOrphaned(result.orphaned)
          lastAreasRef.current = areas
        } else {
          setEmbeddingsWithMeta(withMeta)
          setOrphaned([])
        }
      } else {
        setEmbeddingsWithMeta({})
        setOrphaned([])
        rawDataRef.current = {}
      }
    } catch (err) {
      console.error('Error fetching embeddings:', err)
      setError('Failed to load embeddings')
      setEmbeddingsWithMeta({})
      setOrphaned([])
    } finally {
      setIsLoading(false)
    }
  }, [venueId, areas])

  // Re-match when areas change
  useEffect(() => {
    if (areas && areas !== lastAreasRef.current && Object.keys(rawDataRef.current).length > 0) {
      const result = matchEmbeddingsToAreas(rawDataRef.current, areas)
      setEmbeddingsWithMeta(result.matched)
      setOrphaned(result.orphaned)
      lastAreasRef.current = areas
    }
  }, [areas])

  useEffect(() => {
    fetchEmbeddings()
  }, [fetchEmbeddings])

  const saveEmbeddingsWithMeta = useCallback(
    async (newEmbeddings: EmbeddingsWithMeta) => {
      if (!venueId || !db) {
        throw new Error('No venue ID provided')
      }

      const embeddingsRef = doc(db, 'venues', venueId, 'embeddings', 'urls')
      await setDoc(embeddingsRef, newEmbeddings)
      rawDataRef.current = newEmbeddings
      await fetchEmbeddings()
    },
    [venueId, fetchEmbeddings]
  )

  const saveEmbeddings = useCallback(
    async (newEmbeddings: Embeddings) => {
      // Convert simple format to format with titles
      const withMeta: EmbeddingsWithMeta = {}
      for (const [id, urls] of Object.entries(newEmbeddings)) {
        if (urls.length === 0) continue
        const area = areas?.find((a) => a.id === id)
        withMeta[id] = {
          urls,
          title: area?.name || id,
        }
      }
      await saveEmbeddingsWithMeta(withMeta)
    },
    [areas, saveEmbeddingsWithMeta]
  )

  const resolveOrphan = useCallback(
    async (originalId: string, targetAreaId: string | null) => {
      const orphan = orphaned.find((o) => o.originalId === originalId)
      if (!orphan) return

      const newEmbeddings = { ...embeddingsWithMeta }

      if (targetAreaId) {
        // Assign orphan to target area
        const area = areas?.find((a) => a.id === targetAreaId)
        const existing = newEmbeddings[targetAreaId]

        if (existing) {
          // Merge URLs into existing
          newEmbeddings[targetAreaId] = {
            urls: [...existing.urls, ...orphan.urls],
            title: area?.name || existing.title,
          }
        } else {
          newEmbeddings[targetAreaId] = {
            urls: orphan.urls,
            title: area?.name || targetAreaId,
          }
        }
      }
      // If targetAreaId is null, we're deleting the orphan (don't add it anywhere)

      await saveEmbeddingsWithMeta(newEmbeddings)
    },
    [orphaned, embeddingsWithMeta, areas, saveEmbeddingsWithMeta]
  )

  return {
    embeddings: toSimpleFormat(embeddingsWithMeta),
    embeddingsWithMeta,
    orphaned,
    isLoading,
    error,
    saveEmbeddings,
    saveEmbeddingsWithMeta,
    resolveOrphan,
    refetch: fetchEmbeddings,
  }
}
