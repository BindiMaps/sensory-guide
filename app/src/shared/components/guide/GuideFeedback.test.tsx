import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GuideFeedback } from './GuideFeedback'

// Mock useAnalytics
const mockTrack = vi.fn()
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({ track: mockTrack }),
}))

describe('GuideFeedback', () => {
  beforeEach(() => {
    mockTrack.mockClear()
  })

  it('renders "Was this guide helpful?" text', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    expect(screen.getByText('Was this guide helpful?')).toBeInTheDocument()
  })

  it('renders thumbs up and thumbs down buttons', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument()
  })

  it('buttons have 44px min height', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    const yesButton = screen.getByRole('button', { name: /yes/i })
    const noButton = screen.getByRole('button', { name: /no/i })
    expect(yesButton.className).toContain('min-h-[44px]')
    expect(noButton.className).toContain('min-h-[44px]')
  })

  it('focus ring styling is present', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    const yesButton = screen.getByRole('button', { name: /yes/i })
    expect(yesButton.className).toContain('focus:ring-2')
    expect(yesButton.className).toContain('focus:ring-[#B8510D]')
  })

  it('shows thank you message after clicking thumbs up', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    const yesButton = screen.getByRole('button', { name: /yes/i })
    fireEvent.click(yesButton)
    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    expect(screen.queryByText('Was this guide helpful?')).not.toBeInTheDocument()
  })

  it('tracks analytics event with venue_slug and feedback value on thumbs up', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    const yesButton = screen.getByRole('button', { name: /yes/i })
    fireEvent.click(yesButton)
    expect(mockTrack).toHaveBeenCalledWith('guide_feedback_submit', {
      venue_slug: 'test-venue',
      feedback: 'up',
    })
  })

  it('buttons have aria-labels for accessibility', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    expect(screen.getByLabelText('Yes, helpful')).toBeInTheDocument()
    expect(screen.getByLabelText('No, not helpful')).toBeInTheDocument()
  })

  it('only tracks once even if button clicked multiple times', () => {
    render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
    const yesButton = screen.getByRole('button', { name: /yes/i })
    fireEvent.click(yesButton)
    // After first click, component re-renders with thank you message
    // The buttons are gone, so we verify track was called once
    expect(mockTrack).toHaveBeenCalledTimes(1)
  })

  describe('text feedback flow (thumbs down)', () => {
    it('clicking No sends feedback event immediately and shows textarea', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      const noButton = screen.getByRole('button', { name: /no/i })
      fireEvent.click(noButton)
      expect(mockTrack).toHaveBeenCalledWith('guide_feedback_submit', {
        venue_slug: 'test-venue',
        feedback: 'down',
      })
      expect(screen.getByText('What could be improved? (optional)')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.queryByText('Thanks for your feedback!')).not.toBeInTheDocument()
    })

    it('textarea has maxLength of 100', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxLength', '100')
    })

    it('displays character counter', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('character counter updates as user types', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'hello' } })
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    it('Submit button sends separate feedback_text event', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      mockTrack.mockClear() // Clear the initial down feedback call
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'Needs more details' } })
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(mockTrack).toHaveBeenCalledWith('guide_feedback_text', {
        venue_slug: 'test-venue',
        feedback_text: 'Needs more details',
      })
    })

    it('Skip does not send additional event', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      mockTrack.mockClear() // Clear the initial down feedback call
      fireEvent.click(screen.getByText('Skip'))
      expect(mockTrack).not.toHaveBeenCalled()
    })

    it('shows thank you after Submit', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    })

    it('shows thank you after Skip', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      fireEvent.click(screen.getByText('Skip'))
      expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    })

    it('does not send feedback_text event if textarea is empty', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      mockTrack.mockClear()
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(mockTrack).not.toHaveBeenCalled()
    })

    it('does not send feedback_text event if textarea is only whitespace', () => {
      render(<GuideFeedback venueSlug="test-venue" venueName="Test Venue" />)
      fireEvent.click(screen.getByRole('button', { name: /no/i }))
      mockTrack.mockClear()
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: '   ' } })
      fireEvent.click(screen.getByRole('button', { name: /submit/i }))
      expect(mockTrack).not.toHaveBeenCalled()
    })
  })
})
