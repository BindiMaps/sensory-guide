import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type Embeddings = Record<string, string>

interface UseEmbeddingsResult {
  embeddings: Embeddings
  isLoading: boolean
  error: string | null
  saveEmbeddings: (embeddings: Embeddings) => Promise<void>
  refetch: () => void
}

/**
 * Hook to fetch and save embed URLs for venue sections.
 * Embeddings are stored in Firestore at /venues/{venueId}/embeddings/urls
 * Keys are section IDs, values are embed URLs.
 */
export function useEmbeddings(venueId: string | undefined): UseEmbeddingsResult {
  const [embeddings, setEmbeddings] = useState<Embeddings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmbeddings = useCallback(async () => {
    if (!venueId || !db) {
      setEmbeddings({})
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const embeddingsRef = doc(db, 'venues', venueId, 'embeddings', 'urls')
      const snapshot = await getDoc(embeddingsRef)

      if (snapshot.exists()) {
        setEmbeddings(snapshot.data() as Embeddings)
      } else {
        setEmbeddings({})
      }
    } catch (err) {
      console.error('Error fetching embeddings:', err)
      setError('Failed to load embeddings')
      setEmbeddings({})
    } finally {
      setIsLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    fetchEmbeddings()
  }, [fetchEmbeddings])

  const saveEmbeddings = useCallback(async (newEmbeddings: Embeddings) => {
    if (!venueId || !db) {
      throw new Error('No venue ID provided')
    }

    const embeddingsRef = doc(db, 'venues', venueId, 'embeddings', 'urls')
    await setDoc(embeddingsRef, newEmbeddings)
    await fetchEmbeddings()
  }, [venueId, fetchEmbeddings])

  return {
    embeddings,
    isLoading,
    error,
    saveEmbeddings,
    refetch: fetchEmbeddings,
  }
}
