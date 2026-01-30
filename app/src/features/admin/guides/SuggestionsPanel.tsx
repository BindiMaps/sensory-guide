import { useState, useEffect } from 'react'

interface SuggestionsPanelProps {
  suggestions: string[]
  defaultExpanded?: boolean
}

// Initialize from media query synchronously to avoid animation flash on mount
const getInitialReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Collapsible panel showing content improvement suggestions
 * Admin-only UI with amber styling to distinguish from guide content
 */
export function SuggestionsPanel({ suggestions, defaultExpanded = false }: SuggestionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialReducedMotion)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    // Only subscribe to changes, initial value already set synchronously
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="border border-[#E5D9C3] rounded bg-[#FDF8F0] overflow-hidden mb-6">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="suggestions-panel"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-3 px-4 text-left hover:bg-[#F8F0E3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          {/* Lightbulb icon */}
          <svg
            className="w-5 h-5 text-[#8A5F08]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <span className="font-semibold text-sm text-[#5C4A1F]">
            Content Suggestions ({suggestions.length})
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`w-4 h-4 text-[#8A5F08] ${
            prefersReducedMotion ? '' : 'transition-transform duration-150'
          } ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id="suggestions-panel"
        hidden={!isExpanded}
        className="px-4 pb-4"
      >
        <p className="text-sm text-[#6B5A2E] mb-3">
          To apply these suggestions, update your PDF and re-upload it.
        </p>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="text-sm text-[#5C4A1F] flex items-start gap-2"
            >
              <span className="text-[#8A5F08] mt-0.5" aria-hidden="true">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
