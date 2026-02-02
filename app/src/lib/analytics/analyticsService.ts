/**
 * Firebase Analytics Service
 *
 * For admin pages only - uses Firebase SDK.
 * DO NOT import in public bundle.
 */
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics'
import { app } from '@/lib/firebase'
import type { AnalyticsEventName, AnalyticsEventParams } from './types'

let analytics: Analytics | null = null

/**
 * Initialise Firebase Analytics (admin only).
 * Should be called once at app startup for admin routes.
 */
export function initAnalytics(): void {
  if (import.meta.env.DEV) {
    console.log('[Analytics] Skipping Firebase Analytics init in development')
    return
  }
  if (!app) {
    console.warn('[Analytics] Firebase not configured - skipping analytics init')
    return
  }

  try {
    analytics = getAnalytics(app)
    if (import.meta.env.DEV) {
      console.log('[Analytics] Firebase Analytics initialised')
    }
  } catch (err) {
    console.error('[Analytics] Failed to initialise:', err)
  }
}

/**
 * Track an event via Firebase Analytics.
 * Used for admin pages only.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  params?: AnalyticsEventParams
): void {
  // Always log in dev
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, params)
  }

  if (!analytics) {
    return
  }

  try {
    logEvent(analytics, eventName, params)
  } catch (err) {
    console.error('[Analytics] Failed to track event:', eventName, err)
  }
}

/**
 * Check if analytics is ready
 */
export function isAnalyticsReady(): boolean {
  return analytics !== null
}
