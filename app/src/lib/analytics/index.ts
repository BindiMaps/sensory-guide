/**
 * Analytics Layer
 *
 * Hybrid approach:
 * - Admin pages: Firebase Analytics (SDK already loaded)
 * - Public pages: Raw gtag (no Firebase SDK in bundle)
 */

// Re-export types
export * from './types'

// Re-export services
export { initAnalytics, trackEvent, isAnalyticsReady } from './analyticsService'
export { initGtag, trackGtagEvent, isGtagReady } from './gtagService'
