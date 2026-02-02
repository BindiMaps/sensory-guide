import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

export type TimeRange = '1w' | '2w' | '4w' | 'all'

interface FeedbackComment {
  text: string
  feedback: 'up' | 'down'
  createdAt: string
}

interface VenueFeedbackResponse {
  thumbsUp: number
  thumbsDown: number
  comments: FeedbackComment[]
  dateRange: {
    start: string | null
    end: string
  }
}

interface UseVenueFeedbackResult {
  feedback: VenueFeedbackResponse | null
  loading: boolean
  error: string | null
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  refetch: () => void
}

export function useVenueFeedback(venueId: string | undefined): UseVenueFeedbackResult {
  const [feedback, setFeedback] = useState<VenueFeedbackResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('4w')

  const fetchFeedback = useCallback(async () => {
    if (!venueId || !functions) return

    setLoading(true)
    setError(null)

    try {
      const fn = httpsCallable<
        { venueId: string; timeRange: TimeRange },
        VenueFeedbackResponse
      >(functions, 'getVenueFeedback')

      const result = await fn({ venueId, timeRange })
      setFeedback(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }, [venueId, timeRange])

  useEffect(() => {
    if (venueId) {
      fetchFeedback()
    }
  }, [venueId, fetchFeedback])

  return {
    feedback,
    loading,
    error,
    timeRange,
    setTimeRange,
    refetch: fetchFeedback,
  }
}
