import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface VersionFromApi {
  timestamp: string
  previewUrl: string
  size: number
  created: string
}

export interface Version extends VersionFromApi {
  isLive: boolean
}

interface ListVersionsResponse {
  versions: VersionFromApi[]
}

interface UseVersionHistoryResult {
  versions: Version[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook for fetching version history for a venue.
 *
 * Calls the listVersions Firebase function and enriches the response
 * with isLive flag based on the current liveVersion.
 *
 * @param venueId - The venue ID to fetch versions for
 * @param liveVersion - The current live version timestamp (to mark isLive)
 */
export function useVersionHistory(
  venueId: string | undefined,
  liveVersion: string | undefined
): UseVersionHistoryResult {
  // Fetch raw versions from API (without isLive - that's computed below)
  const query = useQuery({
    queryKey: ['versions', venueId],
    queryFn: async (): Promise<VersionFromApi[]> => {
      if (!venueId || !functions) {
        return []
      }

      const listVersions = httpsCallable<{ venueId: string }, ListVersionsResponse>(
        functions,
        'listVersions'
      )

      const result = await listVersions({ venueId })
      // Already sorted descending by listVersions function
      return result.data.versions
    },
    enabled: Boolean(venueId),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  })

  // Compute isLive separately - this updates instantly when liveVersion changes
  // without needing to refetch from API (efficient!)
  const versions = useMemo((): Version[] => {
    const rawVersions = query.data ?? []
    return rawVersions.map((v) => ({
      ...v,
      isLive: v.timestamp === liveVersion,
    }))
  }, [query.data, liveVersion])

  return {
    versions,
    isLoading: query.isLoading && Boolean(venueId),
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  }
}
