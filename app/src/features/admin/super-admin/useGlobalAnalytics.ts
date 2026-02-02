import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

export interface GlobalAnalyticsResponse {
  venues: {
    total: number
    published: number
    draft: number
  }
  transforms: {
    allTime: number
    thisMonth: number
  }
  published: {
    allTime: number
    thisMonth: number
  }
  activeUsers: {
    thisMonth: number
  }
  generatedAt: string
}

interface UseGlobalAnalyticsResult {
  analytics: GlobalAnalyticsResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch global platform analytics (super admin only).
 * Calls the getGlobalAnalytics Firebase function.
 */
export function useGlobalAnalytics(): UseGlobalAnalyticsResult {
  const [analytics, setAnalytics] = useState<GlobalAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  const refetch = useCallback(() => setFetchCount((c) => c + 1), [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!functions) {
        setError('Functions not configured')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const getGlobalAnalyticsFn = httpsCallable<void, GlobalAnalyticsResponse>(
          functions,
          'getGlobalAnalytics'
        )
        const result = await getGlobalAnalyticsFn()
        setAnalytics(result.data)
      } catch (err) {
        console.error('Failed to fetch global analytics:', err)
        const error = err as { code?: string; message?: string }
        if (error.code === 'functions/permission-denied') {
          setError('You do not have permission to view analytics')
        } else {
          setError('Failed to load analytics')
        }
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [fetchCount])

  return { analytics, loading, error, refetch }
}
