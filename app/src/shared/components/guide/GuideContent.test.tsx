import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GuideContent } from './GuideContent'
import { useGuideStore } from '@/stores/guideStore'
import type { Guide } from '@/lib/schemas/guideSchema'

const mockGuide: Guide = {
  schemaVersion: '1.0',
  venue: {
    name: 'Adelaide Railway Station',
    address: '125 North Terrace, Adelaide SA 5000',
    contact: '08 8218 2222',
    summary: 'A historic railway station in the heart of Adelaide.',
    lastUpdated: '2026-01-15',
  },
  categories: ['Sound', 'Light', 'Crowds'],
  areas: [
    {
      id: 'entry',
      name: 'Main Entry',
      order: 0,
      badges: ['Sound'],
      details: [
        {
          category: 'Sound',
          level: 'medium',
          description: 'Moderate noise from foot traffic.',
        },
      ],
    },
  ],
  facilities: {
    exits: [],
    bathrooms: [],
    quietZones: [],
  },
  suggestions: [],
  generatedAt: '2026-01-15T10:00:00Z',
}

const mockGuideWithoutContact: Guide = {
  ...mockGuide,
  venue: {
    ...mockGuide.venue,
    contact: undefined,
  },
}

const mockGuideWithoutCategories: Guide = {
  ...mockGuide,
  categories: [],
}

const mockGuideWithPhoneAndEmail: Guide = {
  ...mockGuide,
  venue: {
    ...mockGuide.venue,
    contact: '03 9876 5432 | info@testvenue.com.au',
  },
}

const mockGuideWithMultipleAreas: Guide = {
  ...mockGuide,
  areas: [
    {
      id: 'entry',
      name: 'Main Entry',
      order: 0,
      badges: ['Sound'],
      details: [{ category: 'Sound', level: 'medium', description: 'Moderate noise.' }],
    },
    {
      id: 'concourse',
      name: 'Main Concourse',
      order: 1,
      badges: ['Light', 'Crowds'],
      details: [{ category: 'Light', level: 'high', description: 'Bright lighting.' }],
    },
    {
      id: 'platforms',
      name: 'Platforms',
      order: 2,
      badges: ['Sound'],
      details: [{ category: 'Sound', level: 'high', description: 'Train announcements.' }],
    },
  ],
}

describe('GuideContent', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    localStorage.clear()
  })

  describe('venue header', () => {
    it('renders venue name', () => {
      render(<GuideContent guide={mockGuide} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Adelaide Railway Station')
    })

    it('renders venue address as maps link', () => {
      render(<GuideContent guide={mockGuide} />)
      const addressLink = screen.getByRole('link', { name: /125 North Terrace, Adelaide SA 5000/ })
      expect(addressLink).toBeInTheDocument()
      expect(addressLink).toHaveAttribute('href', expect.stringContaining('maps.google.com'))
      expect(addressLink).toHaveAttribute('target', '_blank')
      expect(addressLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders phone as tel link when present', () => {
      render(<GuideContent guide={mockGuide} />)
      const phoneLink = screen.getByRole('link', { name: /08 8218 2222/ })
      expect(phoneLink).toBeInTheDocument()
      expect(phoneLink).toHaveAttribute('href', 'tel:0882182222')
    })

    it('renders phone and email as separate links', () => {
      render(<GuideContent guide={mockGuideWithPhoneAndEmail} />)
      const phoneLink = screen.getByRole('link', { name: /03 9876 5432/ })
      const emailLink = screen.getByRole('link', { name: /info@testvenue.com.au/ })
      expect(phoneLink).toHaveAttribute('href', 'tel:0398765432')
      expect(emailLink).toHaveAttribute('href', 'mailto:info@testvenue.com.au')
    })

    it('does not render contact info when absent', () => {
      render(<GuideContent guide={mockGuideWithoutContact} />)
      expect(screen.queryByText(/08 8218 2222/)).not.toBeInTheDocument()
    })

    it('renders last updated date', () => {
      render(<GuideContent guide={mockGuide} />)
      expect(screen.getByText(/Updated January 2026/)).toBeInTheDocument()
    })
  })

  describe('accuracy disclaimer', () => {
    it('always renders accuracy disclaimer', () => {
      render(<GuideContent guide={mockGuide} />)
      expect(screen.getByText('Information may change. Verify details on arrival.')).toBeInTheDocument()
    })

    it('disclaimer has italic styling', () => {
      render(<GuideContent guide={mockGuide} />)
      const disclaimer = screen.getByText('Information may change. Verify details on arrival.')
      expect(disclaimer).toHaveClass('italic')
    })
  })

  describe('category badges', () => {
    it('renders top-level category badges when present', () => {
      render(<GuideContent guide={mockGuide} />)
      // Categories are rendered as badges (may appear elsewhere too)
      const badgeContainer = screen.getByRole('list', { name: /sensory categories covered/i })
      expect(badgeContainer).toBeInTheDocument()
      // Check that all 3 category badges exist within the container
      expect(badgeContainer.children).toHaveLength(3)
    })

    it('does not render category badges container when categories empty', () => {
      render(<GuideContent guide={mockGuideWithoutCategories} />)
      const badgeContainer = screen.queryByRole('list', { name: /sensory categories covered/i })
      expect(badgeContainer).not.toBeInTheDocument()
    })

    it('category badges container has accessible label', () => {
      render(<GuideContent guide={mockGuide} />)
      const badgeContainer = screen.getByRole('list', { name: /sensory categories covered in this guide/i })
      expect(badgeContainer).toBeInTheDocument()
    })
  })

  describe('intro card', () => {
    it('renders intro card with summary', () => {
      render(<GuideContent guide={mockGuide} />)
      expect(screen.getByText('About this guide')).toBeInTheDocument()
      expect(screen.getByText('A historic railway station in the heart of Adelaide.')).toBeInTheDocument()
    })
  })

  describe('areas', () => {
    it('renders area sections', () => {
      render(<GuideContent guide={mockGuide} />)
      expect(screen.getByText('Main Entry')).toBeInTheDocument()
    })
  })

  describe('expand/collapse all', () => {
    beforeEach(() => {
      // Reset store state before each test
      useGuideStore.setState({ expandedSections: {} })
    })

    it('does not render button when no venueSlug provided', () => {
      render(<GuideContent guide={mockGuideWithMultipleAreas} />)
      expect(screen.queryByRole('button', { name: /expand all/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /collapse all/i })).not.toBeInTheDocument()
    })

    it('does not render button when only one area', () => {
      render(<GuideContent guide={mockGuide} venueSlug="test-venue" />)
      expect(screen.queryByRole('button', { name: /expand all/i })).not.toBeInTheDocument()
    })

    it('renders "Expand all" button when venueSlug provided and multiple areas', () => {
      render(<GuideContent guide={mockGuideWithMultipleAreas} venueSlug="test-venue" />)
      expect(screen.getByRole('button', { name: /expand all sections/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /expand all sections/i })).toHaveTextContent('Expand all')
    })

    it('expands all sections when Expand all clicked', async () => {
      const user = userEvent.setup()
      render(<GuideContent guide={mockGuideWithMultipleAreas} venueSlug="test-venue" />)

      const button = screen.getByRole('button', { name: /expand all sections/i })
      await user.click(button)

      // Button should now say Collapse all
      expect(screen.getByRole('button', { name: /collapse all sections/i })).toHaveTextContent('Collapse all')

      // Verify store state
      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBe(true)
      expect(state.expandedSections['test-venue:concourse']).toBe(true)
      expect(state.expandedSections['test-venue:platforms']).toBe(true)
    })

    it('collapses all sections when Collapse all clicked', async () => {
      const user = userEvent.setup()

      // Pre-expand all sections
      useGuideStore.setState({
        expandedSections: {
          'test-venue:entry': true,
          'test-venue:concourse': true,
          'test-venue:platforms': true,
        },
      })

      render(<GuideContent guide={mockGuideWithMultipleAreas} venueSlug="test-venue" />)

      const button = screen.getByRole('button', { name: /collapse all sections/i })
      expect(button).toHaveTextContent('Collapse all')

      await user.click(button)

      // Button should now say Expand all
      expect(screen.getByRole('button', { name: /expand all sections/i })).toHaveTextContent('Expand all')

      // Verify store state - all venue sections removed
      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBeUndefined()
      expect(state.expandedSections['test-venue:concourse']).toBeUndefined()
      expect(state.expandedSections['test-venue:platforms']).toBeUndefined()
    })

    it('has accessible aria-label on button', () => {
      render(<GuideContent guide={mockGuideWithMultipleAreas} venueSlug="test-venue" />)
      const button = screen.getByRole('button', { name: /expand all sections/i })
      expect(button).toHaveAttribute('aria-label', 'Expand all sections')
    })
  })
})
