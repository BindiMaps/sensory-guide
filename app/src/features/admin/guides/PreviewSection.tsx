import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Area } from '@/lib/schemas/guideSchema'
import { CategoryBadge } from './CategoryBadge'
import { SensoryDetail } from './SensoryDetail'

interface PreviewSectionProps {
  area: Area
  defaultExpanded?: boolean
}

/**
 * Collapsible section for a venue area
 * Fully accessible with keyboard navigation and ARIA attributes
 */
export function PreviewSection({ area, defaultExpanded = false }: PreviewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const panelId = `section-${area.id}`

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-3 px-4 text-left bg-muted/30 hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset min-h-[44px]"
      >
        <span className="font-medium text-foreground">{area.name}</span>
        <div className="flex items-center gap-2">
          {area.badges.slice(0, 3).map((badge) => (
            <CategoryBadge key={badge} category={badge} />
          ))}
          {area.badges.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{area.badges.length - 3}
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground flex-shrink-0 ${
              prefersReducedMotion ? '' : 'transition-transform duration-200'
            } ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
      </button>
      <div
        id={panelId}
        hidden={!isExpanded}
        className={`px-4 pb-4 ${
          prefersReducedMotion ? '' : 'animate-in fade-in-0 duration-200'
        }`}
      >
        {area.details.length > 0 ? (
          <div className="pt-2">
            {area.details.map((detail, index) => (
              <SensoryDetail key={`${detail.category}-${index}`} detail={detail} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-4">
            No sensory details recorded for this area.
          </p>
        )}
      </div>
    </div>
  )
}
