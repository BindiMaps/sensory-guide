import type { Guide } from '@/lib/schemas/guideSchema'
import { useGuideStore } from '@/stores/guideStore'
import { AreaSection } from './AreaSection'
import { CategoryBadge } from './CategoryBadge'
import { FacilitiesSection } from './FacilitiesSection'
import { SensoryKey } from './SensoryKey'

interface GuideContentProps {
  guide: Guide
  /** If provided, expansion state persists to localStorage */
  venueSlug?: string
}

/**
 * Format date for display
 */
function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
    })
  } catch {
    return isoString
  }
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

  // Sort areas by order
  const sortedAreas = [...areas].sort((a, b) => a.order - b.order)
  const areaIds = sortedAreas.map((a) => a.id)

  // Check if all sections are expanded (only when venueSlug provided for persistence)
  const allExpanded = venueSlug ? store.areAllExpanded(venueSlug, areaIds) : false

  const handleExpandCollapseAll = () => {
    if (!venueSlug) return
    if (allExpanded) {
      store.collapseAll(venueSlug)
    } else {
      store.expandAll(venueSlug, areaIds)
    }
  }

  return (
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
                className="hover:text-[#B8510D] hover:underline"
              >
                {venue.address}
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
                    className="hover:text-[#B8510D] hover:underline"
                  >
                    {segment.display}
                  </a>
                ) : (
                  <span key={i}>{segment.display}</span>
                )
              )}
            </>
          )}
          {' · '}Updated {formatDate(venue.lastUpdated)}
        </p>

        {/* Top-level category badges */}
        {categories && categories.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-3"
            role="list"
            aria-label="Sensory categories covered in this guide"
          >
            {categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} />
            ))}
          </div>
        )}

        {/* Accuracy disclaimer */}
        <p className="text-sm text-[#595959] italic">
          Information may change. Verify details on arrival.
        </p>
      </header>

      {/* Intro Card - v5 styling with terracotta left border */}
      <div className="bg-[#F8F8F6] rounded p-5 mb-10 border-l-[3px] border-l-[#B8510D]">
        <p className="font-semibold text-[15px] mb-1">About this guide</p>
        <p className="text-[15px] text-[#3D3D3D] leading-relaxed">
          {venue.summary || 'This guide describes what you might see, hear, and experience at each area of the venue. Select a section to view detailed sensory information.'}
        </p>
      </div>

      {/* Areas - v5 divider-separated sections */}
      <section className="mb-10">
        {/* Expand/Collapse All button */}
        {venueSlug && areaIds.length > 1 && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleExpandCollapseAll}
              className="text-sm text-[#595959] hover:text-[#B8510D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
              aria-label={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
            >
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        )}
        <div>
          {sortedAreas.map((area) => (
            <AreaSection
              key={area.id}
              area={area}
              venueSlug={venueSlug}
            />
          ))}
        </div>
      </section>

      {/* Facilities */}
      <FacilitiesSection facilities={facilities} />

      {/* Sensory Key */}
      <SensoryKey />
    </div>
  )
}
