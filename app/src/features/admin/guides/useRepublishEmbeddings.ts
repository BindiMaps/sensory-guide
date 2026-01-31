import { useState, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface RepublishEmbeddingsRequest {
  venueId: string
}

interface RepublishEmbeddingsResponse {
  success: boolean
}

interface UseRepublishEmbeddingsReturn {
  republish: (venueId: string) => Promise<boolean>
  isRepublishing: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for republishing embeddings on an already-published guide.
 * This allows editing embed URLs without re-uploading the PDF.
 *
 * Calls the republishEmbeddings Firebase Callable Function which:
 * 1. Reads current public JSON
 * 2. Fetches embeddings from Firestore
 * 3. Merges embeddings into areas[].embedUrl
 * 4. Writes back to public path
 */
export function useRepublishEmbeddings(): UseRepublishEmbeddingsReturn {
  const [isRepublishing, setIsRepublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setError(null)
  }, [])

  const republish = useCallback(async (venueId: string): Promise<boolean> => {
    if (!functions) {
      setError('Firebase not configured')
      return false
    }

    setIsRepublishing(true)
    setError(null)

    try {
      const republishEmbeddings = httpsCallable<RepublishEmbeddingsRequest, RepublishEmbeddingsResponse>(
        functions,
        'republishEmbeddings'
      )

      const result = await republishEmbeddings({ venueId })
      return result.data.success
    } catch (err) {
      const error = err as { code?: string; message?: string }

      let friendlyMessage = 'Failed to update embeddings. Please try again.'

      if (error.code === 'unauthenticated') {
        friendlyMessage = 'Please log in to update embeddings.'
      } else if (error.code === 'permission-denied') {
        friendlyMessage = "You don't have permission to update this guide."
      } else if (error.code === 'not-found') {
        friendlyMessage = 'Published guide not found. Please publish first.'
      } else if (error.code === 'failed-precondition') {
        friendlyMessage = 'Guide must be published before updating embeddings.'
      } else if (error.message?.includes('network')) {
        friendlyMessage = 'Network error. Please check your connection.'
      } else if (error.message) {
        friendlyMessage = error.message
      }

      setError(friendlyMessage)
      return false
    } finally {
      setIsRepublishing(false)
    }
  }, [])

  return { republish, isRepublishing, error, reset }
}
