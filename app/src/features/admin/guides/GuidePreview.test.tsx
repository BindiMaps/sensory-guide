import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GuidePreview } from './GuidePreview'
import type { Guide } from '@/lib/schemas/guideSchema'

const mockGuide: Guide = {
  schemaVersion: '1.0',
  venue: {
    name: 'Test Venue',
    address: '123 Test Street',
    contact: '1800 TEST',
    summary: 'A test venue for testing purposes.',
    lastUpdated: '2026-01-29T00:00:00.000Z',
  },
  categories: ['Sound', 'Light', 'Crowds'],
  areas: [
    {
      id: 'entry',
      name: 'Entry Hall',
      order: 0,
      badges: ['Sound'],
      details: [
        {
          category: 'Sound',
          level: 'low',
          description: 'Quiet area.',
        },
      ],
    },
    {
      id: 'main',
      name: 'Main Hall',
      order: 1,
      badges: ['Light', 'Crowds'],
      details: [
        {
          category: 'Light',
          level: 'high',
          description: 'Bright lights.',
        },
      ],
    },
  ],
  facilities: {
    exits: [{ description: 'Main exit at front' }],
    bathrooms: [{ description: 'Ground floor accessible' }],
    quietZones: [{ description: 'Reading room' }],
  },
  suggestions: ['Add more detail to entry area', 'Include crowd times'],
  generatedAt: '2026-01-29T00:00:00.000Z',
}

describe('GuidePreview', () => {
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
  })

  it('renders venue name', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
  })

  it('renders venue address with date', () => {
    render(<GuidePreview guide={mockGuide} />)
    // Address and date are combined in the header
    expect(screen.getByText(/123 Test Street/)).toBeInTheDocument()
    expect(screen.getByText(/January 2026/)).toBeInTheDocument()
  })

  it('renders venue summary', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(
      screen.getByText('A test venue for testing purposes.')
    ).toBeInTheDocument()
  })

  it('renders all category badges', () => {
    render(<GuidePreview guide={mockGuide} />)
    // Header badges
    const soundBadges = screen.getAllByText('Sound')
    const lightBadges = screen.getAllByText('Light')
    expect(soundBadges.length).toBeGreaterThan(0)
    expect(lightBadges.length).toBeGreaterThan(0)
    expect(screen.getAllByText('Crowds').length).toBeGreaterThan(0)
  })

  it('renders all areas sorted by order', () => {
    render(<GuidePreview guide={mockGuide} />)
    const areaButtons = screen.getAllByRole('button', { name: /Entry Hall|Main Hall/ })
    expect(areaButtons[0]).toHaveTextContent('Entry Hall')
    expect(areaButtons[1]).toHaveTextContent('Main Hall')
  })

  it('renders facilities section', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(screen.getByText('Exits')).toBeInTheDocument()
    expect(screen.getByText('Main exit at front')).toBeInTheDocument()
    expect(screen.getByText('Ground floor accessible')).toBeInTheDocument()
    expect(screen.getByText('Reading room')).toBeInTheDocument()
  })

  it('renders suggestions panel', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(screen.getByText('Content Suggestions (2)')).toBeInTheDocument()
  })

  it('renders Publish button', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(screen.getByRole('button', { name: 'Publish Guide' })).toBeInTheDocument()
  })

  it('renders Re-upload button', () => {
    render(<GuidePreview guide={mockGuide} />)
    expect(screen.getByRole('button', { name: 'Re-upload PDF' })).toBeInTheDocument()
  })

  it('calls onPublish when Publish clicked', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn()

    render(<GuidePreview guide={mockGuide} onPublish={onPublish} />)
    await user.click(screen.getByRole('button', { name: 'Publish Guide' }))

    expect(onPublish).toHaveBeenCalled()
  })

  it('calls onReupload when Re-upload clicked', async () => {
    const user = userEvent.setup()
    const onReupload = vi.fn()

    render(<GuidePreview guide={mockGuide} onReupload={onReupload} />)
    await user.click(screen.getByRole('button', { name: 'Re-upload PDF' }))

    expect(onReupload).toHaveBeenCalled()
  })

  it('disables buttons when isPublishing', () => {
    render(<GuidePreview guide={mockGuide} isPublishing />)

    expect(screen.getByRole('button', { name: 'Publishing...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Re-upload PDF' })).toBeDisabled()
  })

  it('renders guide without optional fields', () => {
    const minimalGuide: Guide = {
      ...mockGuide,
      venue: {
        ...mockGuide.venue,
        contact: undefined,
      },
      facilities: {
        exits: [],
        bathrooms: [],
        quietZones: [],
      },
      suggestions: [],
    }

    render(<GuidePreview guide={minimalGuide} />)
    expect(screen.getByText('Test Venue')).toBeInTheDocument()
    // No facilities section rendered when empty
    expect(screen.queryByText('Exits')).not.toBeInTheDocument()
    // No suggestions panel when empty
    expect(screen.queryByText(/Content Suggestions/)).not.toBeInTheDocument()
  })
})
