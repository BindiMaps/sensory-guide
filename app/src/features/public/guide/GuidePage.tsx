import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Guide } from '@/lib/schemas/guideSchema'
import { GuideContent, GuidePdfActions } from '@/shared/components/guide'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET

/**
 * Fetch guide JSON directly from Cloud Storage using slug-based path.
 * No Firestore lookup needed - publish copies to public/guides/{slug}.json
 */
async function fetchGuide(slug: string): Promise<Guide | null> {
  const url = `https://storage.googleapis.com/${STORAGE_BUCKET}/public/guides/${slug}.json`

  try {
    const response = await fetch(url, { cache: 'no-store' })

    if (response.status === 404) {
      return null // Not found = not published
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error('Error fetching guide:', err)
    return null
  }
}

/**
 * Page state machine - single source of truth for loading/error/success.
 */
type PageState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'notfound' }
  | { status: 'ready'; guide: Guide }

/**
 * Public guide page - Design System v5
 * Displays the sensory guide for a published venue.
 *
 * Architecture:
 * - Single fetch to Storage: public/guides/{slug}.json
 * - NO Firestore, NO Firebase SDK
 * - Pure CDN delivery
 */
export function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  const [state, setState] = useState<PageState>({ status: 'loading' })
  const { track } = useAnalytics({ useGtag: true })
  const viewTracked = useRef(false)

  useEffect(() => {
    if (!slug) {
      setState({ status: 'error', error: 'No venue specified' })
      return
    }

    // Track if this effect is still current (handles race conditions)
    let cancelled = false

    async function loadGuide() {
      setState({ status: 'loading' })

      const guideData = await fetchGuide(slug!)

      // Don't update state if slug changed or component unmounted
      if (cancelled) return

      if (!guideData) {
        setState({ status: 'notfound' })
        return
      }

      document.title = `${guideData.venue.name} - Sensory Guide`
      setState({ status: 'ready', guide: guideData })

      // Track guide view (only once per page load)
      if (!viewTracked.current) {
        track(AnalyticsEvent.GUIDE_VIEW, {
          venue_slug: slug!,
          venue_name: guideData.venue.name,
        })
        viewTracked.current = true
      }
    }

    loadGuide()

    return () => {
      cancelled = true
    }
  }, [slug, track])

  // Derive values for render
  const loading = state.status === 'loading'
  const error = state.status === 'error' ? state.error : state.status === 'notfound' ? 'notfound' : null
  const guide = state.status === 'ready' ? state.guide : null

  if (loading) {
    return (
      <div
        className="max-w-[720px] mx-auto px-4 py-16 font-['Inter',system-ui,sans-serif]"
        style={{ WebkitFontSmoothing: 'antialiased' }}
      >
        <div className="flex flex-col items-center justify-center py-12">
          {/* Loading spinner */}
          <svg
            className="w-8 h-8 animate-spin text-[#B8510D]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="12"
            />
          </svg>
          <p className="mt-4 text-[#595959] text-sm">Loading guide...</p>
        </div>
      </div>
    )
  }

  if (error === 'notfound') {
    return (
      <div
        className="max-w-[720px] mx-auto px-4 py-16 font-['Inter',system-ui,sans-serif]"
        style={{ WebkitFontSmoothing: 'antialiased' }}
      >
        <div className="text-center py-12">
          {/* Alert icon */}
          <svg
            className="w-12 h-12 text-[#595959] mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 className="text-[26px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
            Guide Not Found
          </h1>
          <p className="text-[#595959] mb-6 text-[15px]">
            The venue you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#B8510D] text-white rounded hover:bg-[#9A4409] font-semibold text-sm min-h-[44px] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="max-w-[720px] mx-auto px-4 py-16 font-['Inter',system-ui,sans-serif]"
        style={{ WebkitFontSmoothing: 'antialiased' }}
      >
        <div className="text-center py-12">
          {/* Error icon */}
          <svg
            className="w-12 h-12 text-[#9E3322] mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 className="text-[26px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-[#595959] mb-6 text-[15px]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!guide) {
    return null
  }

  return (
    <div className="px-4 py-8">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 rounded shadow-lg text-[#B8510D] font-medium"
      >
        Skip to content
      </a>

      {/* Download PDF button */}
      <div className="max-w-[720px] mx-auto mb-4 flex justify-end">
        <GuidePdfActions guide={guide} venueSlug={slug} />
      </div>

      <main id="main-content">
        <GuideContent guide={guide} venueSlug={slug} />
      </main>

      {/* Footer */}
      <footer className="max-w-[720px] mx-auto pt-6 border-t border-[#E8E8E5] text-center text-sm text-[#595959]">
        <p className="mb-2">
          <a href="/" className="text-[#B8510D] hover:underline font-medium">
            Sensory Guide
          </a>
        </p>
      </footer>
    </div>
  )
}
