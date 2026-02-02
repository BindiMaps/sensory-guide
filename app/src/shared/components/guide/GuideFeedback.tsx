import { useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsEvent } from '@/lib/analytics'

interface GuideFeedbackProps {
  venueSlug: string
  venueName: string
}

const MAX_FEEDBACK_LENGTH = 100

// Endpoint URL based on environment
const FEEDBACK_ENDPOINT =
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'
    ? 'http://localhost:5001/sensory-guide/us-central1/submitGuideFeedback'
    : 'https://us-central1-sensory-guide.cloudfunctions.net/submitGuideFeedback'

async function submitFeedbackToServer(
  venueSlug: string,
  feedback: 'up' | 'down',
  comment?: string
): Promise<boolean> {
  try {
    const response = await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueSlug, feedback, comment }),
    })
    return response.ok
  } catch {
    // Fail silently - we still want to show "thanks" to the user
    console.error('Failed to submit feedback to server')
    return false
  }
}

export function GuideFeedback({ venueSlug }: GuideFeedbackProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [showTextInput, setShowTextInput] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { track } = useAnalytics({ useGtag: true })

  const handleThumbClick = (type: 'up' | 'down') => {
    if (submitted) return
    setFeedback(type)
    setShowTextInput(true)

    // Track in GA
    track(AnalyticsEvent.GUIDE_FEEDBACK_SUBMIT, {
      venue_slug: venueSlug,
      feedback: type,
    })
  }

  const handleSubmitFeedback = async () => {
    if (!feedback) return
    setSubmitted(true)
    await submitFeedbackToServer(venueSlug, feedback, feedbackText.trim() || undefined)
  }

  const handleSkip = async () => {
    if (!feedback) return
    setSubmitted(true)
    await submitFeedbackToServer(venueSlug, feedback)
  }

  if (submitted) {
    return (
      <div className="max-w-[720px] mx-auto py-8 mt-4 border-t border-[#E8E8E5]">
        <p className="text-center text-[#595959] text-sm">Thanks for your feedback!</p>
      </div>
    )
  }

  if (showTextInput && feedback) {
    return (
      <div className="max-w-[720px] mx-auto py-8 mt-4 border-t border-[#E8E8E5]">
        <div className="max-w-md mx-auto">
          <label htmlFor="feedback-text" className="block text-[#595959] text-sm mb-2 text-center">
            {feedback === 'up' ? 'What did you find helpful? (optional)' : 'What could be improved? (optional)'}
          </label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            maxLength={MAX_FEEDBACK_LENGTH}
            rows={3}
            className="w-full px-3 py-2 border border-[#DDDDD9] rounded text-sm text-[#3D3D3D] placeholder-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:border-transparent resize-none"
            placeholder="Tell us how we can improve..."
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#9A9A9A]">
              {feedbackText.length}/{MAX_FEEDBACK_LENGTH}
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-[#595959] hover:text-[#3D3D3D] underline focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 rounded"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-[#B8510D] text-white rounded text-sm font-medium hover:bg-[#9A440B] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[720px] mx-auto py-8 mt-4 border-t border-[#E8E8E5]">
      <div className="text-center">
        <p className="text-[#595959] text-sm mb-3">Was this guide helpful?</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleThumbClick('up')}
            aria-label="Yes, helpful"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2"
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
            onClick={() => handleThumbClick('down')}
            aria-label="No, not helpful"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2"
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
    </div>
  )
}
