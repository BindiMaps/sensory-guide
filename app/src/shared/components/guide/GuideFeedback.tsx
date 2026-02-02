import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

interface GuideFeedbackProps {
  venueSlug: string
  venueName: string
}

export function GuideFeedback({ venueSlug, venueName: _venueName }: GuideFeedbackProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const { track } = useAnalytics({ useGtag: true })

  const handleFeedback = (value: 'up' | 'down') => {
    if (feedback) return // Already submitted

    setFeedback(value)
    track(AnalyticsEvent.GUIDE_FEEDBACK_SUBMIT, {
      venue_slug: venueSlug,
      feedback: value,
    })
  }

  const submitted = feedback !== null

  return (
    <div className="max-w-[720px] mx-auto pt-6 border-t border-[#E8E8E5]">
      {submitted ? (
        <p className="text-center text-[#595959] text-sm">Thanks for your feedback!</p>
      ) : (
        <div className="text-center">
          <p className="text-[#595959] text-sm mb-3">Was this guide helpful?</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleFeedback('up')}
              disabled={submitted}
              aria-label="Yes, helpful"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              Yes
            </button>
            <button
              onClick={() => handleFeedback('down')}
              disabled={submitted}
              aria-label="No, not helpful"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
              </svg>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
