import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'

interface SuggestionsPanelProps {
  suggestions: string[]
  defaultExpanded?: boolean
}

/**
 * Collapsible panel showing content improvement suggestions
 * Hidden by default, toggle via button
 */
export function SuggestionsPanel({ suggestions, defaultExpanded = false }: SuggestionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="border border-amber-200 rounded-lg bg-amber-50/50 overflow-hidden">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="suggestions-panel"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-3 px-4 text-left hover:bg-amber-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <span className="font-medium text-amber-800">
            Content Suggestions ({suggestions.length})
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-amber-600 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        id="suggestions-panel"
        hidden={!isExpanded}
        className="px-4 pb-4"
      >
        <p className="text-sm text-amber-700 mb-3">
          To apply these suggestions, update your PDF and re-upload it.
        </p>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="text-sm text-amber-800 flex items-start gap-2"
            >
              <span className="text-amber-500 font-bold mt-0.5" aria-hidden="true">
                •
              </span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
