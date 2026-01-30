import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useVenues } from '@/shared/hooks/useVenues'
import { useApproval } from './useApproval'
import { AccessSetup } from './AccessSetup'

export function AdminDashboard() {
  const { venues, loading, error } = useVenues()
  const { approved, needsSetup, refetch } = useApproval()

  useEffect(() => {
    document.title = 'Dashboard - Sensory Guide Admin'
  }, [])

  if (loading) {
    return (
      <div className="text-muted-foreground">Loading venues...</div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">
        {error}
      </div>
    )
  }

  // Show setup UI if access config doesn't exist yet
  if (needsSetup) {
    return <AccessSetup onSetupComplete={refetch} />
  }

  // Show pending approval message for non-approved users
  const showPendingApproval = !approved

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Venues</h1>
        {venues.length > 0 && approved && (
          <Link
            to="/admin/venues/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create New Venue
          </Link>
        )}
      </div>

      {/* Pending approval notice */}
      {showPendingApproval && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="font-semibold text-amber-800 mb-1">Account Pending Approval</h2>
          <p className="text-sm text-amber-700">
            Your account is pending approval. Contact support to request access to create venues.
          </p>
        </div>
      )}

      {venues.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          {approved ? (
            <>
              <p className="text-muted-foreground mb-4">No venues yet</p>
              <Link
                to="/admin/venues/new"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create New Venue
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground">
              You don't have any venues yet. Contact support to get approved for venue creation.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {venues.map((venue) => (
            <Link
              key={venue.id}
              to={`/admin/venues/${venue.id}`}
              className="block p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{venue.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    /{venue.slug}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    venue.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {venue.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
