import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

export interface VenueListItem {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdAt: string
  updatedAt: string
}

interface UseAllVenuesResult {
  venues: VenueListItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch all venues in the system (super admin only).
 * Calls the getAllVenues Firebase function.
 */
export function useAllVenues(): UseAllVenuesResult {
  const [venues, setVenues] = useState<VenueListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchCount, setFetchCount] = useState(0)

  const refetch = useCallback(() => setFetchCount((c) => c + 1), [])

  useEffect(() => {
    const fetchVenues = async () => {
      if (!functions) {
        setError('Functions not configured')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const getAllVenuesFn = httpsCallable<void, { venues: VenueListItem[] }>(
          functions,
          'getAllVenues'
        )
        const result = await getAllVenuesFn()
        setVenues(result.data.venues)
      } catch (err) {
        console.error('Failed to fetch all venues:', err)
        const error = err as { code?: string; message?: string }
        if (error.code === 'functions/permission-denied') {
          setError('You do not have permission to view all venues')
        } else {
          setError('Failed to load venues')
        }
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [fetchCount])

  return { venues, loading, error, refetch }
}
