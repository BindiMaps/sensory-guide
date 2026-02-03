import { useSensoryProfile } from '@/stores/sensoryProfileStore'
import { getCategoryColours } from '@/shared/utils/colours'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

interface FilterBarProps {
  /** Available categories to filter (derived from guide content) */
  categories: string[]
}

/**
 * FilterBar - Design System v5
 * Toggleable category badges for highlighting guide content by sensory sensitivities.
 * Active filters persist via localStorage through the sensory profile store.
 * All buttons show category colours; active state indicated by ring outline.
 */
export function FilterBar({ categories }: FilterBarProps) {
  const { activeCategories, toggleCategory, isCategoryActive, clearProfile } = useSensoryProfile()
  const { track } = useAnalytics({ useGtag: true })

  if (categories.length === 0) return null

  const activeCount = activeCategories.size

  const handleClearAll = () => {
    track(AnalyticsEvent.FILTER_PROFILE_CLEARED, {})
    clearProfile()
  }

  return (
    <div className="mb-6">
      <p className="text-[11px] text-[#595959] mb-2">
        Tap to highlight
        {activeCount > 0 && (
          <>
            {' '}
            <span className="text-[#3D3D3D]">({activeCount} active)</span>
            {' · '}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[#B8510D] hover:underline focus:outline-none focus-visible:underline"
            >
              Clear all
            </button>
          </>
        )}
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Highlight by sensory category"
      >
      {categories.map((category) => {
        const isActive = isCategoryActive(category)
        const colours = getCategoryColours(category)

        return (
          <button
            key={category}
            type="button"
            onClick={() => {
              const wasActive = isCategoryActive(category)
              toggleCategory(category)
              track(AnalyticsEvent.FILTER_TOGGLED, {
                category,
                action: wasActive ? 'off' : 'on',
              })
            }}
            aria-pressed={isActive}
            aria-label={`${isActive ? 'Remove' : 'Add'} ${category} highlight`}
            className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide rounded-sm transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2"
            style={{
              backgroundColor: colours.bg,
              color: colours.text,
              boxShadow: isActive ? `inset 0 0 0 2px ${colours.text}` : 'none',
            }}
          >
            {category}
          </button>
        )
      })}
      </div>
    </div>
  )
}
