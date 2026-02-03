import { useState, useEffect, useRef, useCallback } from 'react'
import type { Area } from '@/lib/schemas/guideSchema'
import { useGuideStore } from '@/stores/guideStore'
import { useSensoryProfile } from '@/stores/sensoryProfileStore'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { getOverallLevel } from '@/shared/utils/sensory'
import { CategoryBadge, LevelBadge } from './CategoryBadge'
import { SensoryDetail } from './SensoryDetail'
import { ClickableImage } from './ImageLightbox'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

interface AreaSectionProps {
  area: Area
  /** If provided, expansion state persists to localStorage via Zustand */
  venueSlug?: string
  /** Controlled expansion state (used when no venueSlug) */
  isExpanded?: boolean
  /** Controlled toggle handler (used when no venueSlug) */
  onToggle?: () => void
}

// Normalise embedUrls - handles both old (embedUrl: string) and new (embedUrls: string[]) formats
function getEmbedUrls(area: Area): string[] {
  // New format
  if (Array.isArray(area.embedUrls) && area.embedUrls.length > 0) {
    return area.embedUrls
  }
  // Old format (runtime data from published guides)
  const legacy = (area as unknown as { embedUrl?: string }).embedUrl
  if (legacy && typeof legacy === 'string') {
    return [legacy]
  }
  return []
}

/**
 * Collapsible section for a venue area - Design System v5
 * Shows preview summary when collapsed for guide-like experience
 */
export function AreaSection({ area, venueSlug, isExpanded: controlledExpanded, onToggle }: AreaSectionProps) {
  // Use Zustand for persistence if venueSlug provided, controlled props if given, otherwise local state
  const store = useGuideStore()
  const { activeCategories, hasActiveFilters, isCategoryActive } = useSensoryProfile()
  const [localExpanded, setLocalExpanded] = useState(false)

  // Sensory profile filtering
  const filtersActive = hasActiveFilters()
  const filteredBadges = filtersActive
    ? area.badges.filter((badge) => isCategoryActive(badge))
    : area.badges
  // Only use gtag for public pages (when venueSlug is provided)
  const { track } = useAnalytics({ useGtag: !!venueSlug })

  // Normalise embed URLs (handles legacy embedUrl string format)
  const embedUrls = getEmbedUrls(area)

  // Priority: venueSlug (store) > controlled props > local state
  const isExpanded = venueSlug
    ? store.isExpanded(venueSlug, area.id)
    : controlledExpanded !== undefined
      ? controlledExpanded
      : localExpanded

  const toggleExpanded = () => {
    // Track section expand/collapse (only for public pages)
    if (venueSlug) {
      const willBeExpanded = !isExpanded
      track(
        willBeExpanded ? AnalyticsEvent.GUIDE_SECTION_EXPAND : AnalyticsEvent.GUIDE_SECTION_COLLAPSE,
        {
          venue_slug: venueSlug,
          section_name: area.name,
          section_id: area.id,
        }
      )
    }

    if (venueSlug) {
      store.toggleSection(venueSlug, area.id)
    } else if (onToggle) {
      onToggle()
    } else {
      setLocalExpanded((prev) => !prev)
    }
  }

  const prefersReducedMotion = useReducedMotion()

  // Carousel scroll state
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const canLeft = el.scrollLeft > 0
    const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
    setCanScrollLeft(canLeft)
    setCanScrollRight(canRight)
  }, [])

  useEffect(() => {
    if (!isExpanded) return

    let resizeObserver: ResizeObserver | null = null
    let capturedEl: HTMLDivElement | null = null

    // Double-RAF: first to exit hidden state, second after layout
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        capturedEl = carouselRef.current
        if (!capturedEl) return

        updateScrollState()

        capturedEl.addEventListener('scroll', updateScrollState)

        resizeObserver = new ResizeObserver(updateScrollState)
        resizeObserver.observe(capturedEl)

        // Listen for iframe loads (they load async after initial layout)
        const iframes = capturedEl.querySelectorAll('iframe')
        iframes.forEach((iframe) => {
          iframe.addEventListener('load', updateScrollState)
        })
      })
    })

    return () => {
      cancelAnimationFrame(frameId)
      if (capturedEl) {
        capturedEl.removeEventListener('scroll', updateScrollState)
        const iframes = capturedEl.querySelectorAll('iframe')
        iframes.forEach((iframe) => {
          iframe.removeEventListener('load', updateScrollState)
        })
      }
      resizeObserver?.disconnect()
    }
  }, [isExpanded, updateScrollState, embedUrls, area.images])

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.8
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }

  const panelId = `section-${area.id}`

  // Derive overall level from details (personalised when filters active)
  const overallLevel = getOverallLevel(
    area.details,
    filtersActive ? activeCategories : undefined
  )

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
    <article className="border-b border-[#E8E8E5] last:border-b-0">
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
            {filteredBadges.map((badge) => (
              <CategoryBadge key={badge} category={badge} />
            ))}
            {/* Embed indicator - shows when collapsed and embeds exist */}
            {!isExpanded && embedUrls && embedUrls.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[#264854] bg-[#E3ECF0] rounded-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {embedUrls.length === 1 ? 'Has map' : `${embedUrls.length} maps`}
              </span>
            )}
          </span>
        </span>

        {/* Sensory level */}
        <span className="flex-shrink-0 pt-0.5 pl-2">
          <LevelBadge level={overallLevel} />
        </span>
      </button>

      {/* Expandable content */}
      <div
        id={panelId}
        hidden={!isExpanded}
        className="pb-5 pl-10"
      >
        {/* Media carousel - fixed height, embeds square, images scale to fit */}
        {((embedUrls && embedUrls.length > 0) || (area.images && area.images.length > 0)) && (
          <div className="mb-4">
            <div className="relative group">
              {/* Left arrow and gradient - only show when overflow exists */}
              {canScrollLeft && (
                <>
                  <div className="absolute left-0 top-0 bottom-2 w-12 z-10 bg-gradient-to-r from-white/90 to-transparent pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#E8E8E5] shadow-md flex items-center justify-center hover:bg-[#F8F8F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D]"
                    aria-label="Scroll left"
                  >
                    <svg className="w-4 h-4 text-[#595959]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Right arrow and gradient - only show when overflow exists */}
              {canScrollRight && (
                <>
                  <div className="absolute right-0 top-0 bottom-2 w-12 z-10 bg-gradient-to-l from-white/90 to-transparent pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[#E8E8E5] shadow-md flex items-center justify-center hover:bg-[#F8F8F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D]"
                    aria-label="Scroll right"
                  >
                    <svg className="w-4 h-4 text-[#595959]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-2 h-72 scrollbar-hide snap-x snap-mandatory"
              >
                {/* Embeds - square */}
                {embedUrls && embedUrls.map((embedUrl, index) => (
                  <div key={`embed-${index}`} className="flex-shrink-0 w-72 h-72 snap-start">
                    <div className="w-full h-full rounded-sm border border-[#E8E8E5] overflow-hidden">
                      <iframe
                        src={embedUrl}
                        title={`Map ${index + 1} for ${area.name}`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-popups"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                ))}

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
            </div>

          </div>
        )}

        {area.details.length > 0 ? (
          <div className="space-y-4">
            {area.details.map((detail, index) => {
              const categoryActive = isCategoryActive(detail.category)
              const isHighlighted = filtersActive && categoryActive
              const isMuted = filtersActive && !categoryActive
              return (
                <SensoryDetail
                  key={`${detail.category}-${index}`}
                  detail={detail}
                  sectionTitle={area.name}
                  highlighted={isHighlighted}
                  muted={isMuted}
                />
              )
            })}
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
