import { useState, useEffect } from 'react'
import type { Area, SensoryLevel } from '@/lib/schemas/guideSchema'
import { useGuideStore } from '@/stores/guideStore'
import { CategoryBadge, LevelBadge } from './CategoryBadge'
import { SensoryDetail } from './SensoryDetail'
import { ClickableImage } from './ImageLightbox'

interface AreaSectionProps {
  area: Area
  /** If provided, expansion state persists to localStorage via Zustand */
  venueSlug?: string
  /** Controlled expansion state (used when no venueSlug) */
  isExpanded?: boolean
  /** Controlled toggle handler (used when no venueSlug) */
  onToggle?: () => void
}

// Initialize from media query synchronously to avoid animation flash on mount
const getInitialReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Collapsible section for a venue area - Design System v5
 * Shows preview summary when collapsed for guide-like experience
 */
export function AreaSection({ area, venueSlug, isExpanded: controlledExpanded, onToggle }: AreaSectionProps) {
  // Use Zustand for persistence if venueSlug provided, controlled props if given, otherwise local state
  const store = useGuideStore()
  const [localExpanded, setLocalExpanded] = useState(false)

  // Priority: venueSlug (store) > controlled props > local state
  const isExpanded = venueSlug
    ? store.isExpanded(venueSlug, area.id)
    : controlledExpanded !== undefined
      ? controlledExpanded
      : localExpanded

  const toggleExpanded = () => {
    if (venueSlug) {
      store.toggleSection(venueSlug, area.id)
    } else if (onToggle) {
      onToggle()
    } else {
      setLocalExpanded((prev) => !prev)
    }
  }

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialReducedMotion)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    // Only subscribe to changes, initial value already set synchronously
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const panelId = `section-${area.id}`

  // Derive overall level from details (highest level present)
  const getOverallLevel = (): SensoryLevel => {
    const levels = area.details.map((d) => d.level)
    if (levels.includes('high')) return 'high'
    if (levels.includes('medium')) return 'medium'
    return 'low'
  }

  // Get preview text: prefer LLM-generated summary, fallback to first detail for legacy
  const getPreviewText = (): string | null => {
    // Use dedicated summary field if available (new guides)
    if (area.summary) return area.summary

    // Fallback for legacy guides: truncate first detail
    const firstDetail = area.details[0]
    if (!firstDetail?.description) return null
    const maxLen = 120
    if (firstDetail.description.length <= maxLen) return firstDetail.description
    const truncated = firstDetail.description.slice(0, maxLen)
    const lastSpace = truncated.lastIndexOf(' ')
    return (lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated) + '…'
  }

  const previewText = getPreviewText()

  return (
    <article
      className="border-b border-[#E8E8E5] last:border-b-0"
      aria-expanded={isExpanded}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={toggleExpanded}
        className="flex w-full items-start gap-3 py-4 text-left hover:bg-[#F8F8F6] -mx-4 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
      >
        {/* Toggle - 28px circle with v5 styling */}
        <span
          className={`w-7 h-7 min-w-7 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${
            prefersReducedMotion ? '' : 'transition-all duration-150'
          } ${
            isExpanded
              ? 'border-[#B8510D] bg-[#B8510D]'
              : 'border-[#DDDDD9] bg-white'
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-3 h-3 ${
              prefersReducedMotion ? '' : 'transition-transform duration-150'
            } ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke={isExpanded ? 'white' : '#595959'}
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>

        {/* Section info */}
        <span className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1 leading-snug">
            {area.name}
          </h3>
          {/* Preview text - visible when collapsed, shows what to expect */}
          {!isExpanded && previewText && (
            <p className="text-sm text-[#3D3D3D] leading-relaxed mb-2">
              {previewText}
            </p>
          )}
          <span className="flex flex-wrap gap-1.5 items-center" aria-label="Sensory categories">
            {area.badges.map((badge) => (
              <CategoryBadge key={badge} category={badge} />
            ))}
            {/* Embed indicator - shows when collapsed and embed exists */}
            {!isExpanded && area.embedUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#264854] bg-[#E3ECF0] rounded-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Has map
              </span>
            )}
          </span>
        </span>

        {/* Sensory level */}
        <span className="flex-shrink-0 pt-0.5 pl-2">
          <LevelBadge level={getOverallLevel()} />
        </span>
      </button>

      {/* Expandable content */}
      <div
        id={panelId}
        hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
        className="pb-5 pl-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 rounded-sm"
      >
        {/* Media carousel - fixed height, embed square, images scale to fit */}
        {(area.embedUrl || (area.images && area.images.length > 0)) && (
          <div className="mb-4">
            <div className="flex gap-3 overflow-x-auto pb-2 h-72">
              {/* Embed - square */}
              {area.embedUrl && (
                <div className="flex-shrink-0 h-full aspect-square">
                  <div className="w-full h-full rounded-sm border border-[#E8E8E5] overflow-hidden">
                    <iframe
                      src={area.embedUrl}
                      title={`Map for ${area.name}`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}

              {/* Images - scale height to container, width auto */}
              {area.images && area.images.length > 0 && area.images.map((imageUrl, index) => (
                <ClickableImage
                  key={index}
                  src={imageUrl}
                  alt={`${area.name} - Photo ${index + 1}`}
                  sectionTitle={area.name}
                  className="h-full w-auto rounded-sm object-cover flex-shrink-0"
                />
              ))}
            </div>

            {/* Map link below carousel */}
            {area.embedUrl && (
              <a
                href={area.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#595959] hover:text-[#B8510D] mt-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in new tab
              </a>
            )}
          </div>
        )}

        {area.details.length > 0 ? (
          <div className="space-y-4">
            {area.details.map((detail, index) => (
              <SensoryDetail key={`${detail.category}-${index}`} detail={detail} sectionTitle={area.name} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#595959]">
            No sensory details recorded for this area.
          </p>
        )}
      </div>
    </article>
  )
}
