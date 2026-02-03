import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from './FilterBar'
import { useSensoryProfile } from '@/stores/sensoryProfileStore'
import { AnalyticsEvent } from '@/lib/analytics'

// Mock useAnalytics
const mockTrack = vi.fn()
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({ track: mockTrack }),
}))

describe('FilterBar', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSensoryProfile.setState({
      activeCategories: new Set(),
      hasSeenOnboarding: false,
    })
    mockTrack.mockClear()
  })

  describe('rendering', () => {
    it('renders nothing when categories array is empty', () => {
      const { container } = render(<FilterBar categories={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders all provided categories as buttons', () => {
      render(<FilterBar categories={['Sound', 'Light', 'Crowds']} />)

      expect(screen.getByRole('button', { name: /add sound highlight/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add light highlight/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add crowds highlight/i })).toBeInTheDocument()
    })

    it('has correct role group with label', () => {
      render(<FilterBar categories={['Sound']} />)

      const group = screen.getByRole('group', { name: /highlight by sensory category/i })
      expect(group).toBeInTheDocument()
    })
  })

  describe('toggle interaction', () => {
    it('calls toggleCategory when badge clicked', () => {
      render(<FilterBar categories={['Sound', 'Light']} />)

      const soundButton = screen.getByRole('button', { name: /sound/i })
      fireEvent.click(soundButton)

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(true)
    })

    it('removes category when already active', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        hasSeenOnboarding: false,
      })

      render(<FilterBar categories={['Sound', 'Light']} />)

      const soundButton = screen.getByRole('button', { name: /sound/i })
      fireEvent.click(soundButton)

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(false)
    })
  })

  describe('visual state', () => {
    it('shows inactive state for non-active categories', () => {
      render(<FilterBar categories={['Sound']} />)

      const button = screen.getByRole('button', { name: /sound/i })
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('shows active state for active categories', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        hasSeenOnboarding: false,
      })

      render(<FilterBar categories={['Sound']} />)

      const button = screen.getByRole('button', { name: /sound/i })
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('accessibility', () => {
    it('uses button elements', () => {
      render(<FilterBar categories={['Sound']} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(1)
    })

    it('has aria-pressed attribute', () => {
      render(<FilterBar categories={['Sound']} />)

      const button = screen.getByRole('button', { name: /sound/i })
      expect(button).toHaveAttribute('aria-pressed')
    })

    it('has descriptive aria-label for inactive filter', () => {
      render(<FilterBar categories={['Sound']} />)

      const button = screen.getByRole('button', { name: /add sound highlight/i })
      expect(button).toBeInTheDocument()
    })

    it('has descriptive aria-label for active filter', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        hasSeenOnboarding: false,
      })

      render(<FilterBar categories={['Sound']} />)

      const button = screen.getByRole('button', { name: /remove sound highlight/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('analytics', () => {
    it('tracks filter_toggled with action "on" when enabling category', () => {
      render(<FilterBar categories={['Sound']} />)

      const soundButton = screen.getByRole('button', { name: /sound/i })
      fireEvent.click(soundButton)

      expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.FILTER_TOGGLED, {
        category: 'Sound',
        action: 'on',
      })
    })

    it('tracks filter_toggled with action "off" when disabling category', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        hasSeenOnboarding: false,
      })

      render(<FilterBar categories={['Sound']} />)

      const soundButton = screen.getByRole('button', { name: /sound/i })
      fireEvent.click(soundButton)

      expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.FILTER_TOGGLED, {
        category: 'Sound',
        action: 'off',
      })
    })

    it('tracks each category toggle independently', () => {
      render(<FilterBar categories={['Sound', 'Light']} />)

      fireEvent.click(screen.getByRole('button', { name: /add sound highlight/i }))
      fireEvent.click(screen.getByRole('button', { name: /add light highlight/i }))

      expect(mockTrack).toHaveBeenCalledTimes(2)
      expect(mockTrack).toHaveBeenNthCalledWith(1, AnalyticsEvent.FILTER_TOGGLED, {
        category: 'Sound',
        action: 'on',
      })
      expect(mockTrack).toHaveBeenNthCalledWith(2, AnalyticsEvent.FILTER_TOGGLED, {
        category: 'Light',
        action: 'on',
      })
    })
  })
})
