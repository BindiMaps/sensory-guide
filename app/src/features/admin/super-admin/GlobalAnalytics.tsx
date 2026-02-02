import { useEffect } from 'react'
import { useGlobalAnalytics } from './useGlobalAnalytics'
import { trackEvent } from '@/lib/analytics'
import { AnalyticsEvent } from '@/lib/analytics/types'

function MetricCard({
  title,
  value,
  details,
}: {
  title: string
  value: number | string
  details?: string
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold" aria-label={`${title}: ${value}`}>
        {value}
      </p>
      {details && <p className="text-sm text-muted-foreground">{details}</p>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-busy="true" aria-live="polite">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2" />
          <div className="h-8 bg-muted rounded w-16 mb-1" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-destructive/50 rounded-lg p-4 text-center" role="alert">
      <p className="text-sm text-destructive mb-2">{message}</p>
      <button
        onClick={onRetry}
        className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
      >
        Try again
      </button>
    </div>
  )
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return '1 hour ago'
  return `${diffHours} hours ago`
}

export function GlobalAnalytics() {
  const { analytics, loading, error, refetch } = useGlobalAnalytics()

  useEffect(() => {
    if (analytics) {
      trackEvent(AnalyticsEvent.SUPER_ADMIN_ANALYTICS_VIEW)
    }
  }, [analytics])

  return (
    <section aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="text-lg font-semibold mb-4">
        Platform Analytics
      </h2>

      {loading && <LoadingState />}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {analytics && !loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Venues"
              value={analytics.venues.total}
              details={`${analytics.venues.published} published, ${analytics.venues.draft} draft`}
            />
            <MetricCard
              title="Transforms"
              value={analytics.transforms.allTime}
              details={`${analytics.transforms.thisMonth} this month`}
            />
            <MetricCard
              title="Published"
              value={analytics.published.allTime}
              details={`${analytics.published.thisMonth} this month`}
            />
            <MetricCard
              title="Active Users"
              value={analytics.activeUsers.thisMonth}
              details="this month"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {formatTimeAgo(analytics.generatedAt)}
          </p>
        </>
      )}
    </section>
  )
}
