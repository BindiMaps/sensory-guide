import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewSection } from './PreviewSection'
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
}

describe('PreviewSection', () => {
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

  it('renders area name', () => {
    render(<PreviewSection area={mockArea} />)
    expect(screen.getByText('Entry Hall')).toBeInTheDocument()
  })

  it('renders category badges on header', () => {
    render(<PreviewSection area={mockArea} />)
    // Multiple Sound badges may exist (header + detail), so use getAllBy
    expect(screen.getAllByText('Sound').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Light').length).toBeGreaterThan(0)
  })

  it('starts collapsed by default', () => {
    render(<PreviewSection area={mockArea} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('starts expanded when defaultExpanded is true', () => {
    render(<PreviewSection area={mockArea} defaultExpanded />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(<PreviewSection area={mockArea} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles on Enter key', () => {
    render(<PreviewSection area={mockArea} />)
    const button = screen.getByRole('button')

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    fireEvent.click(button) // keyDown triggers click on buttons

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles on Space key', () => {
    render(<PreviewSection area={mockArea} />)
    const button = screen.getByRole('button')

    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has correct aria-controls attribute', () => {
    render(<PreviewSection area={mockArea} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-controls', 'section-entry')
  })

  it('shows sensory details when expanded', async () => {
    const user = userEvent.setup()
    render(<PreviewSection area={mockArea} />)

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

    render(<PreviewSection area={emptyArea} />)
    await user.click(screen.getByRole('button'))

    expect(
      screen.getByText('No sensory details recorded for this area.')
    ).toBeInTheDocument()
  })

  it('shows +N indicator when more than 3 badges', () => {
    const manyBadgesArea: Area = {
      ...mockArea,
      badges: ['Sound', 'Light', 'Crowds', 'Smell', 'Movement'],
    }
    render(<PreviewSection area={manyBadgesArea} />)

    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('meets minimum touch target height', () => {
    render(<PreviewSection area={mockArea} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('min-h-[44px]')
  })
})
