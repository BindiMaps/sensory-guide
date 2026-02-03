import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { trackEvent, AnalyticsEvent } from '@/lib/analytics'
import { useVenue } from '@/shared/hooks/useVenue'
import { useAuthStore } from '@/stores/authStore'
import { functions } from '@/lib/firebase'
import { useVersionHistory } from '@/features/admin/guides/useVersionHistory'
import { VersionHistory } from '@/features/admin/guides/VersionHistory'
import { VenueFeedbackModal } from './VenueFeedbackModal'
import {
  VenueHeader,
  EditorSection,
  GuideSection,
  DeleteVenueSection,
} from './venue-detail'

export function VenueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { venue, loading, error, addEditor, removeEditor, deleteVenue, updateName } = useVenue(id)
  const { user } = useAuthStore()

  // Version history
  const {
    versions,
    isLoading: versionsLoading,
    error: versionsError,
    refetch: refetchVersions,
  } = useVersionHistory(id, venue?.liveVersion)

  // Version history expansion
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [makingLiveError, setMakingLiveError] = useState<string | null>(null)

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    document.title = venue ? `${venue.name} - Sensory Guide Admin` : 'Venue - Sensory Guide Admin'
  }, [venue])

  // Handle making a version live (from version history)
  const handleMakeLive = async (timestamp: string) => {
    if (!functions || !id) return

    setMakingLiveError(null)
    trackEvent(AnalyticsEvent.VENUE_VERSION_MAKE_LIVE, { venue_id: id, version_timestamp: timestamp })
    try {
      const setLiveVersion = httpsCallable<
        { venueId: string; timestamp: string },
        { success: boolean; publicUrl: string; liveVersion: string; slug: string }
      >(functions, 'setLiveVersion')

      await setLiveVersion({ venueId: id, timestamp })

      // Refetch versions to update UI
      refetchVersions()
    } catch (err) {
      const error = err as Error
      setMakingLiveError(error.message || 'Failed to make version live')
    }
  }

  // Handle deleting a version (from version history)
  const handleDeleteVersion = async (timestamp: string) => {
    if (!functions || !id) return

    setMakingLiveError(null)
    try {
      const deleteVersion = httpsCallable<
        { venueId: string; timestamp: string },
        { success: boolean; deletedVersion: string }
      >(functions, 'deleteVersion')

      await deleteVersion({ venueId: id, timestamp })

      // Refetch versions to update UI
      refetchVersions()
    } catch (err) {
      const error = err as Error
      setMakingLiveError(error.message || 'Failed to delete version')
      throw error // Re-throw so VersionHistory dialog can handle it
    }
  }

  // Handle preview from version history
  const handleVersionPreview = (version: { previewUrl: string; timestamp: string }) => {
    trackEvent(AnalyticsEvent.VENUE_VERSION_PREVIEW, { venue_id: id!, version_timestamp: version.timestamp })
    // Format timestamp for display
    const date = new Date(version.timestamp).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Build preview URL with query params
    const params = new URLSearchParams({
      url: version.previewUrl,
      date,
      venueId: id!,
    })

    // Open in new tab with proper preview UI
    window.open(`/admin/preview?${params.toString()}`, '_blank')
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading venue...</div>
  }

  if (error || !venue) {
    return (
      <div>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to venues
        </Link>
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
          {error || 'Venue not found'}
        </div>
      </div>
    )
  }

  const isLastEditor = venue.editors.length === 1
  const currentUserIsEditor = user?.email && venue.editors.map(e => e.toLowerCase()).includes(user.email.toLowerCase())

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← Back to venues
      </Link>

      <VenueHeader
        venue={venue}
        onNameUpdate={updateName}
        onShowFeedback={() => setShowFeedbackModal(true)}
      />

      <EditorSection
        venueId={id!}
        editors={venue.editors}
        createdBy={venue.createdBy}
        currentUserEmail={user?.email ?? undefined}
        onAddEditor={addEditor}
        onRemoveEditor={async (email) => {
          await removeEditor(email)
          if (email.toLowerCase() === user?.email?.toLowerCase()) {
            navigate('/admin', { replace: true })
          }
        }}
      />

      <GuideSection
        venueId={id!}
        venue={venue}
        onVersionsChange={refetchVersions}
      />

      {/* Version History */}
      {versions.length > 0 && (
        <section className="border rounded-lg p-4 mb-6">
          <button
            type="button"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold">Version History</h2>
            {showVersionHistory ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showVersionHistory && (
            <div className="mt-4">
              {makingLiveError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800 mb-4">
                  {makingLiveError}
                </div>
              )}
              <VersionHistory
                versions={versions}
                isLoading={versionsLoading}
                error={versionsError}
                onMakeLive={handleMakeLive}
                onDelete={handleDeleteVersion}
                onPreview={handleVersionPreview}
              />
            </div>
          )}
        </section>
      )}

      {/* Delete Venue (only for last editor) */}
      {isLastEditor && currentUserIsEditor && (
        <DeleteVenueSection
          venueName={venue.name}
          onDelete={async () => {
            trackEvent(AnalyticsEvent.VENUE_DELETE, { venue_id: id!, venue_slug: venue.slug })
            await deleteVenue()
            navigate('/admin', { replace: true })
          }}
        />
      )}

      {/* Feedback Modal */}
      <VenueFeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        venueId={id!}
        venueName={venue.name}
      />
    </div>
  )
}
