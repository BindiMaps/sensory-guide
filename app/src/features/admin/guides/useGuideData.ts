import { useQuery } from '@tanstack/react-query'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { guideSchema, type Guide } from '@/lib/schemas/guideSchema'

interface UseGuideDataResult {
  data: Guide | undefined
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Fetches and validates guide JSON from Cloud Storage
 * @param outputPath - Storage path to the guide JSON (e.g., venues/{id}/versions/{ts}.json)
 */
export function useGuideData(outputPath: string | null): UseGuideDataResult {
  const query = useQuery({
    queryKey: ['guide', outputPath],
    queryFn: async (): Promise<Guide> => {
      if (!outputPath) {
        throw new Error('No guide path provided')
      }

      if (!storage) {
        throw new Error('Firebase Storage not configured')
      }

      // Get download URL from Firebase Storage
      const storageRef = ref(storage, outputPath)
      const downloadUrl = await getDownloadURL(storageRef)

      // Fetch the JSON
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch guide: ${response.statusText}`)
      }

      const data = await response.json()

      // Validate against schema
      const result = guideSchema.safeParse(data)
      if (!result.success) {
        const errors = result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')
        throw new Error(`Invalid guide data: ${errors}`)
      }

      return result.data
    },
    enabled: Boolean(outputPath),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  }
}
