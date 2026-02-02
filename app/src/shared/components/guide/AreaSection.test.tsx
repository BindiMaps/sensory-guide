import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AreaSection } from './AreaSection'
import type { Area } from '@/lib/schemas/guideSchema'

const mockArea: Area = {
  id: 'entry',
  name: 'Entry Hall',
  order: 0,
  badges: ['Sound', 'Light'],
  details: [
    {
      category: 'Sound',
      level: 'low',
      description: 'Quiet entrance area with minimal background noise.',
    },
    {
      category: 'Light',
      level: 'medium',
      description: 'Bright fluorescent lighting throughout.',
    },
  ],
  images: [],
  embedUrls: [],
}

const mockAreaWithSummary: Area = {
  ...mockArea,
  summary: 'A calm entry point with soft lighting and quiet ambience.',
}

const mockAreaWithEmbed: Area = {
  ...mockArea,
  embedUrls: ['https://bindiweb.com/map/venue123'],
}

describe('AreaSection', () => {
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
    // Clear localStorage for clean state
    localStorage.clear()
  })

  it('renders area name', () => {
    render(<AreaSection area={mockArea} />)
    expect(screen.getByText('Entry Hall')).toBeInTheDocument()
  })

  it('renders category badges', () => {
    render(<AreaSection area={mockArea} />)
    expect(screen.getAllByText('Sound').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Light').length).toBeGreaterThan(0)
  })

  it('starts collapsed by default', () => {
    render(<AreaSection area={mockArea} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(<AreaSection area={mockArea} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('has correct aria-controls attribute', () => {
    render(<AreaSection area={mockArea} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-controls', 'section-entry')
  })

  it('shows sensory details when expanded', async () => {
    const user = userEvent.setup()
    render(<AreaSection area={mockArea} />)

    await user.click(screen.getByRole('button'))

    expect(
      screen.getByText('Quiet entrance area with minimal background noise.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Bright fluorescent lighting throughout.')
    ).toBeInTheDocument()
  })

  it('shows message when area has no details', async () => {
    const emptyArea: Area = { ...mockArea, details: [] }
    const user = userEvent.setup()

    render(<AreaSection area={emptyArea} />)
    await user.click(screen.getByRole('button'))

    expect(
      screen.getByText('No sensory details recorded for this area.')
    ).toBeInTheDocument()
  })

  describe('preview text', () => {
    it('shows first detail as preview when collapsed (legacy fallback)', () => {
      render(<AreaSection area={mockArea} />)
      // Preview paragraph should exist with the first detail text
      const previewParagraph = screen.getByRole('button').querySelector('p.text-sm')
      expect(previewParagraph).toBeInTheDocument()
      expect(previewParagraph).toHaveTextContent(/Quiet entrance area/i)
    })

    it('shows summary field as preview when available', () => {
      render(<AreaSection area={mockAreaWithSummary} />)
      expect(
        screen.getByText('A calm entry point with soft lighting and quiet ambience.')
      ).toBeInTheDocument()
    })

    it('hides preview when expanded', async () => {
      const user = userEvent.setup()
      render(<AreaSection area={mockAreaWithSummary} />)

      // Preview visible when collapsed
      expect(
        screen.getByText('A calm entry point with soft lighting and quiet ambience.')
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button'))

      // After expanding, the preview paragraph should be hidden
      // But the details should be visible
      expect(
        screen.getByText('Quiet entrance area with minimal background noise.')
      ).toBeInTheDocument()
    })
  })

  describe('with venueSlug (Zustand persistence)', () => {
    it('uses Zustand store when venueSlug provided', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AreaSection area={mockArea} venueSlug="test-venue" />)

      const button = screen.getByRole('button')
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      // Re-render should maintain state via Zustand
      rerender(<AreaSection area={mockArea} venueSlug="test-venue" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('embedUrls', () => {
    it('shows "Has map" indicator when collapsed and embedUrls exists', () => {
      render(<AreaSection area={mockAreaWithEmbed} />)
      expect(screen.getByText('Has map')).toBeInTheDocument()
    })

    it('does not show indicator when no embedUrls', () => {
      render(<AreaSection area={mockArea} />)
      expect(screen.queryByText('Has map')).not.toBeInTheDocument()
    })

    it('renders iframe when expanded and embedUrls exists', async () => {
      const user = userEvent.setup()
      render(<AreaSection area={mockAreaWithEmbed} />)

      await user.click(screen.getByRole('button'))

      const iframe = screen.getByTitle(`Map 1 for ${mockAreaWithEmbed.name}`)
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', mockAreaWithEmbed.embedUrls[0])
    })

    it('includes accessible title on iframe', async () => {
      const user = userEvent.setup()
      render(<AreaSection area={mockAreaWithEmbed} />)

      await user.click(screen.getByRole('button'))

      const iframe = screen.getByTitle('Map 1 for Entry Hall')
      expect(iframe).toBeInTheDocument()
    })

  })
})
