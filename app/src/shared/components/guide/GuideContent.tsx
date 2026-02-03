import { useState, useCallback } from 'react'
import type { Guide } from '@/lib/schemas/guideSchema'
import { useGuideStore } from '@/stores/guideStore'
import { formatDate } from '@/shared/utils/formatDate'
import { AreaSection } from './AreaSection'
import { FilterBar } from './FilterBar'
import { FacilitiesSection } from './FacilitiesSection'
import { ImageLightboxProvider } from './ImageLightbox'
import { SensoryKey } from './SensoryKey'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

interface GuideContentProps {
  guide: Guide
  /** If provided, expansion state persists to localStorage */
  venueSlug?: string
}

/**
 * Generate maps URL that works across devices
 * Uses Google Maps URL which iOS will offer to open in Apple Maps
 */
function getMapsUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
}

/**
 * Parse contact string and return array of linkable segments
 * Handles: phones (tel:), emails (mailto:), and plain text
 */
type ContactSegment =
  | { type: 'phone'; display: string; href: string }
  | { type: 'email'; display: string; href: string }
  | { type: 'text'; display: string }

function parseContact(contact: string): ContactSegment[] {
  const segments: ContactSegment[] = []

  // Split by common separators while keeping them
  const parts = contact.split(/(\s*[|·•,]\s*)/).filter(Boolean)

  for (const part of parts) {
    const trimmed = part.trim()

    // Check for email
    const emailMatch = trimmed.match(/^[\w.+-]+@[\w.-]+\.\w{2,}$/)
    if (emailMatch) {
      segments.push({ type: 'email', display: trimmed, href: `mailto:${trimmed}` })
      continue
    }

    // Check for phone (8+ digits with optional formatting)
    const phoneMatch = trimmed.match(/^[\d\s\-+()]{8,}$/)
    if (phoneMatch) {
      const digits = trimmed.replace(/[^\d+]/g, '')
      if (digits.length >= 8) {
        segments.push({ type: 'phone', display: trimmed, href: `tel:${digits}` })
        continue
      }
    }

    // Plain text (including separators)
    if (trimmed) {
      segments.push({ type: 'text', display: part })
    }
  }

  return segments
}

/**
 * Shared guide content layout - Design System v5
 * Used by both public GuidePage and admin GuidePreview
 */
export function GuideContent({ guide, venueSlug }: GuideContentProps) {
  const { venue, areas, facilities, categories } = guide
  const store = useGuideStore()
  // Only use gtag for public pages (when venueSlug is provided)
  const { track } = useAnalytics({ useGtag: !!venueSlug })

  // Local state for expansion when no venueSlug (no persistence)
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set())

  // Sort areas by order
  const sortedAreas = [...areas].sort((a, b) => a.order - b.order)
  const areaIds = sortedAreas.map((a) => a.id)

  // Check if all sections are expanded
  const allExpanded = venueSlug
    ? store.areAllExpanded(venueSlug, areaIds)
    : areaIds.every((id) => localExpanded.has(id))

  const handleExpandCollapseAll = () => {
    // Track expand/collapse all (only for public pages)
    if (venueSlug) {
      track(
        allExpanded ? AnalyticsEvent.GUIDE_COLLAPSE_ALL : AnalyticsEvent.GUIDE_EXPAND_ALL,
        { venue_slug: venueSlug }
      )
    }

    if (venueSlug) {
      if (allExpanded) {
        store.collapseAll(venueSlug)
      } else {
        store.expandAll(venueSlug, areaIds)
      }
    } else {
      if (allExpanded) {
        setLocalExpanded(new Set())
      } else {
        setLocalExpanded(new Set(areaIds))
      }
    }
  }

  // Handlers for local state (used when no venueSlug)
  const isLocalExpanded = useCallback((id: string) => localExpanded.has(id), [localExpanded])
  const toggleLocal = useCallback((id: string) => {
    setLocalExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Image view tracking callback
  const handleImageOpen = useCallback((image: { sectionTitle: string }, index: number) => {
    if (venueSlug) {
      track(AnalyticsEvent.GUIDE_IMAGE_VIEW, {
        venue_slug: venueSlug,
        section_name: image.sectionTitle,
        image_index: index,
      })
    }
  }, [venueSlug, track])

  return (
    <ImageLightboxProvider onImageOpen={handleImageOpen}>
      <div
        className="max-w-[720px] mx-auto font-['Inter',system-ui,sans-serif] text-[15px] leading-relaxed text-[#1A1A1A]"
        style={{ WebkitFontSmoothing: 'antialiased' }}
      >
        {/* Venue Header - v5 styling */}
        <header className="mb-8">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight mb-1.5">
            {venue.name}
          </h1>

          {/* Address, Contact, Last Updated */}
          <p className="text-sm text-[#595959] mb-3">
            {venue.address && (
              <>
                <a
                  href={getMapsUrl(venue.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B8510D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-1 rounded-sm"
                  onClick={() => venueSlug && track(AnalyticsEvent.GUIDE_EXTERNAL_LINK, {
                    venue_slug: venueSlug,
                    link_type: 'maps',
                  })}
                >
                  {venue.address}
                  <span aria-hidden="true" className="ml-0.5 text-xs">↗</span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </>
            )}
            {venue.contact && (
              <>
                {' · '}
                {parseContact(venue.contact).map((segment, i) =>
                  segment.type === 'phone' || segment.type === 'email' ? (
                    <a
                      key={i}
                      href={segment.href}
                      className="hover:text-[#B8510D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-1 rounded-sm"
                      onClick={() => venueSlug && track(AnalyticsEvent.GUIDE_EXTERNAL_LINK, {
                        venue_slug: venueSlug,
                        link_type: segment.type,
                      })}
                    >
                      {segment.display}
                    </a>
                  ) : (
                    <span key={i}>{segment.display}</span>
                  )
                )}
              </>
            )}
            {' · '}
            <span className="whitespace-nowrap">
              Updated {formatDate(venue.lastUpdated || guide.generatedAt)}
            </span>
          </p>

          {/* Accuracy disclaimer */}
          <p className="text-sm text-[#595959] italic">
            Information may change. Verify details on arrival.
          </p>
        </header>

        {/* Intro Card - v5 styling with terracotta left border */}
        <div className="bg-[#F8F8F6] rounded p-5 mb-6 border-l-[3px] border-l-[#B8510D]">
          <p className="font-semibold text-[15px] mb-1">About this guide</p>
          <p className="text-[15px] text-[#3D3D3D] leading-relaxed">
            {venue.summary || 'This guide describes what you might see, hear, and experience at each area of the venue. Select a section to view detailed sensory information.'}
          </p>
        </div>

        {/* FilterBar - toggleable category highlights */}
        {categories && categories.length > 0 && (
          <FilterBar categories={categories} />
        )}

        {/* Areas - v5 divider-separated sections */}
        <section className="mb-10">
          {/* Expand/Collapse All button */}
          {areaIds.length > 1 && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleExpandCollapseAll}
                className="inline-flex items-center gap-1 text-sm text-[#595959] hover:text-[#B8510D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
                aria-label={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
                <svg
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 ${allExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <polyline
                    points="6 9 12 15 18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
          <div>
            {sortedAreas.map((area) => (
              <AreaSection
                key={area.id}
                area={area}
                venueSlug={venueSlug}
                isExpanded={venueSlug ? undefined : isLocalExpanded(area.id)}
                onToggle={venueSlug ? undefined : () => toggleLocal(area.id)}
              />
            ))}
          </div>
        </section>

        {/* Facilities */}
        <FacilitiesSection facilities={facilities} />

        {/* Sensory Key */}
        <SensoryKey />
      </div>
    </ImageLightboxProvider>
  )
}
