import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { GuideContent } from '@/shared/components/guide'
import { guideSchema } from '@/lib/schemas/guideSchema'

/**
 * Standalone page for previewing a specific version.
 *
 * Query params:
 * - url: The signed URL to fetch the version JSON from
 * - date: Human-readable date string for the banner
 * - venueId: For the back link
 */
export function VersionPreviewPage() {
  const [searchParams] = useSearchParams()
  const url = searchParams.get('url')
  const date = searchParams.get('date')
  const venueId = searchParams.get('venueId')

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['version-preview', url],
    queryFn: async () => {
      if (!url) throw new Error('No URL provided')

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const json = await response.json()
      return guideSchema.parse(json)
    },
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (!url) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          No preview URL provided
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading preview...</span>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="font-medium text-red-800 mb-2">Failed to load preview</h3>
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
        {venueId && (
          <Link
            to={`/admin/venues/${venueId}`}
            className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to venue
          </Link>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Preview Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 mb-6">
        <div className="max-w-[720px] mx-auto flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Previewing version from {date || 'unknown date'}</span>
            {' — '}
            <span>not currently live</span>
          </p>
          {venueId && (
            <Link
              to={`/admin/venues/${venueId}`}
              className="text-sm font-medium text-amber-800 hover:text-amber-900"
            >
              ← Back to version list
            </Link>
          )}
        </div>
      </div>

      {/* Guide content - same as public view */}
      <GuideContent guide={guide} />
    </div>
  )
}
