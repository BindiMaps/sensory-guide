import { useState, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface PublishGuideRequest {
  venueId: string
  outputPath: string
}

interface PublishGuideResponse {
  success: boolean
  publicUrl: string
  liveVersion: string
  slug: string
}

interface UsePublishGuideReturn {
  publish: (venueId: string, outputPath: string) => Promise<PublishGuideResponse | null>
  isPublishing: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for publishing a guide to make it publicly accessible.
 *
 * Calls the publishGuide Firebase Callable Function which:
 * 1. Makes the guide JSON publicly readable
 * 2. Updates the venue's liveVersion pointer
 * 3. Sets venue status to "published"
 *
 * @returns publish function, loading state, error state, and reset function
 */
export function usePublishGuide(): UsePublishGuideReturn {
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setError(null)
  }, [])

  const publish = useCallback(
    async (venueId: string, outputPath: string): Promise<PublishGuideResponse | null> => {
      if (!functions) {
        setError('Firebase not configured')
        return null
      }

      setIsPublishing(true)
      setError(null)

      try {
        const publishGuide = httpsCallable<PublishGuideRequest, PublishGuideResponse>(
          functions,
          'publishGuide'
        )

        const result = await publishGuide({ venueId, outputPath })
        return result.data
      } catch (err) {
        const error = err as { code?: string; message?: string }

        // Map Firebase error codes to user-friendly messages
        let friendlyMessage = 'Failed to publish. Please try again.'

        if (error.code === 'unauthenticated') {
          friendlyMessage = 'Please log in to publish.'
        } else if (error.code === 'permission-denied') {
          friendlyMessage = "You don't have permission to publish this venue."
        } else if (error.code === 'not-found') {
          friendlyMessage = 'Guide file not found. Please re-upload the PDF.'
        } else if (error.message?.includes('network')) {
          friendlyMessage = 'Network error. Please check your connection.'
        } else if (error.message) {
          // Use server message if available
          friendlyMessage = error.message
        }

        setError(friendlyMessage)
        return null
      } finally {
        setIsPublishing(false)
      }
    },
    []
  )

  return { publish, isPublishing, error, reset }
}
