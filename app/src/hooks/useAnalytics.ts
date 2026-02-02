/**
 * useAnalytics Hook
 *
 * Provides analytics tracking for React components.
 * - Admin pages: Uses Firebase Analytics (default)
 * - Public pages: Uses raw gtag ({ useGtag: true })
 */
import { useCallback, useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics/analyticsService'
import { trackGtagEvent, initGtag } from '@/lib/analytics/gtagService'
import type { AnalyticsEventName, AnalyticsEventParams } from '@/lib/analytics/types'

interface UseAnalyticsOptions {
  /**
   * Use raw gtag instead of Firebase Analytics.
   * Required for public pages to avoid Firebase SDK in bundle.
   */
  useGtag?: boolean
}

interface UseAnalyticsReturn {
  /**
   * Track an analytics event
   */
  track: (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => void
}

/**
 * Hook for tracking analytics events.
 *
 * @example Admin page
 * const { track } = useAnalytics()
 * track(AnalyticsEvent.ADMIN_DASHBOARD_VIEW)
 *
 * @example Public page
 * const { track } = useAnalytics({ useGtag: true })
 * track(AnalyticsEvent.GUIDE_VIEW, { venue_slug: slug })
 */
export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { useGtag = false } = options
  const gtagInitialisedRef = useRef(false)

  // Initialise gtag on mount if needed (public pages only)
  useEffect(() => {
    if (useGtag && !gtagInitialisedRef.current) {
      initGtag()
      gtagInitialisedRef.current = true
    }
  }, [useGtag])

  const track = useCallback(
    (eventName: AnalyticsEventName, params?: AnalyticsEventParams) => {
      if (useGtag) {
        trackGtagEvent(eventName, params)
      } else {
        trackEvent(eventName, params)
      }
    },
    [useGtag]
  )

  return { track }
}
