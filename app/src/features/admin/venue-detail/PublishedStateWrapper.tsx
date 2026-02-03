import { Loader2 } from 'lucide-react'
import { useGuideData } from '@/features/admin/guides/useGuideData'
import { PublishedSuccess } from '@/features/admin/guides/PublishedSuccess'

interface PublishedStateWrapperProps {
  venue: { id: string; slug: string; liveVersion: string }
  onUploadNew: () => void
}

/**
 * Wrapper for published state that fetches guide data to get areas for embed editing.
 */
export function PublishedStateWrapper({
  venue,
  onUploadNew,
}: PublishedStateWrapperProps) {
  const path = `venues/${venue.id}/versions/${venue.liveVersion}.json`
  const { data: guide, isLoading, error, refetch } = useGuideData(path)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="font-medium text-red-800 mb-2">Failed to load guide data</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
          <button
            onClick={onUploadNew}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Upload New PDF
          </button>
        </div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <PublishedSuccess
      slug={venue.slug}
      publicUrl={`${window.location.origin}/venue/${venue.slug}`}
      onUploadNew={onUploadNew}
      venueId={venue.id}
      areas={guide.areas}
    />
  )
}
