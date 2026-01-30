import type { Guide } from '@/lib/schemas/guideSchema'
import { AreaSection } from './AreaSection'
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
 * Shared guide content layout - Design System v5
 * Used by both public GuidePage and admin GuidePreview
 */
export function GuideContent({ guide, venueSlug }: GuideContentProps) {
  const { venue, areas, facilities } = guide

  // Sort areas by order
  const sortedAreas = [...areas].sort((a, b) => a.order - b.order)

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
        <p className="text-sm text-[#595959]">
          {venue.address && <>{venue.address} · </>}
          Updated {formatDate(venue.lastUpdated)}
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
