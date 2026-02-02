/**
 * Raw gtag Service
 *
 * For public pages only - no Firebase SDK dependency.
 * Injects gtag script and provides tracking function.
 */
import type { AnalyticsEventName, AnalyticsEventParams } from './types'

// gtag type for window
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetOrName: string | Date,
      params?: Record<string, unknown>
    ) => void
  }
}

let gtagInitialised = false

/**
 * Initialise gtag by injecting the script.
 * Safe to call multiple times - only injects once.
 */
export function initGtag(): void {
  if (import.meta.env.DEV) {
    console.log('[gtag] Skipping init in development')
    return
  }
  if (gtagInitialised) return
  if (typeof window === 'undefined') return

  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  if (!measurementId) {
    console.warn('[gtag] No measurement ID configured')
    return
  }

  // Initialise dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId)

  // Inject script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  gtagInitialised = true

  if (import.meta.env.DEV) {
    console.log('[gtag] Initialised with measurement ID:', measurementId)
  }
}

/**
 * Track an event via raw gtag.
 * Used for public pages only.
 */
export function trackGtagEvent(
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams
): void {
  // Always log in dev
  if (import.meta.env.DEV) {
    console.log('[gtag]', eventName, params)
  }

  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  try {
    window.gtag('event', eventName, params as Record<string, unknown> | undefined)
  } catch (err) {
    console.error('[gtag] Failed to track event:', eventName, err)
  }
}

/**
 * Check if gtag is ready
 */
export function isGtagReady(): boolean {
  return gtagInitialised && typeof window !== 'undefined' && !!window.gtag
}
