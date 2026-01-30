import { useState, useEffect } from 'react'
import type { Area, SensoryLevel } from '@/lib/schemas/guideSchema'
import { useGuideStore } from '@/stores/guideStore'
import { CategoryBadge, LevelBadge } from './CategoryBadge'
import { SensoryDetail } from './SensoryDetail'

interface AreaSectionProps {
  area: Area
  /** If provided, expansion state persists to localStorage via Zustand */
  venueSlug?: string
}

/**
 * Collapsible section for a venue area - Design System v5
 * Shows preview summary when collapsed for guide-like experience
 */
export function AreaSection({ area, venueSlug }: AreaSectionProps) {
  // Use Zustand for persistence if venueSlug provided, otherwise local state
  const store = useGuideStore()
  const [localExpanded, setLocalExpanded] = useState(false)

  const isExpanded = venueSlug
    ? store.isExpanded(venueSlug, area.id)
    : localExpanded

  const toggleExpanded = () => {
    if (venueSlug) {
      store.toggleSection(venueSlug, area.id)
    } else {
      setLocalExpanded((prev) => !prev)
    }
  }

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

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
          <span className="flex flex-wrap gap-1.5" aria-label="Sensory categories">
            {area.badges.map((badge) => (
              <CategoryBadge key={badge} category={badge} />
            ))}
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
        className="pb-5 pl-10"
      >
        {area.details.length > 0 ? (
          <div className="space-y-4">
            {area.details.map((detail, index) => (
              <SensoryDetail key={`${detail.category}-${index}`} detail={detail} />
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
