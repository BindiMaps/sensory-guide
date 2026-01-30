import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SuggestionsPanel } from './SuggestionsPanel'

describe('SuggestionsPanel', () => {
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

  const suggestions = [
    'Add more detail to the entry area',
    'Include crowd times for peak hours',
    'Add photos of the quiet zones',
  ]

  it('renders nothing when suggestions array is empty', () => {
    const { container } = render(<SuggestionsPanel suggestions={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders header with suggestion count', () => {
    render(<SuggestionsPanel suggestions={suggestions} />)
    expect(screen.getByText('Content Suggestions (3)')).toBeInTheDocument()
  })

  it('starts collapsed by default', () => {
    render(<SuggestionsPanel suggestions={suggestions} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('starts expanded when defaultExpanded is true', () => {
    render(<SuggestionsPanel suggestions={suggestions} defaultExpanded />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(<SuggestionsPanel suggestions={suggestions} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows suggestions when expanded', async () => {
    const user = userEvent.setup()
    render(<SuggestionsPanel suggestions={suggestions} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('Add more detail to the entry area')).toBeInTheDocument()
    expect(screen.getByText('Include crowd times for peak hours')).toBeInTheDocument()
    expect(screen.getByText('Add photos of the quiet zones')).toBeInTheDocument()
  })

  it('shows re-upload explanation when expanded', async () => {
    const user = userEvent.setup()
    render(<SuggestionsPanel suggestions={suggestions} />)

    await user.click(screen.getByRole('button'))

    expect(
      screen.getByText('To apply these suggestions, update your PDF and re-upload it.')
    ).toBeInTheDocument()
  })

  it('has correct aria-controls attribute', () => {
    render(<SuggestionsPanel suggestions={suggestions} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-controls', 'suggestions-panel')
  })

  it('has minimum touch target height', () => {
    render(<SuggestionsPanel suggestions={suggestions} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('min-h-[44px]')
  })

  it('respects prefers-reduced-motion for animations', () => {
    // Mock prefers-reduced-motion: reduce
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(<SuggestionsPanel suggestions={suggestions} />)
    // When reduced motion is preferred, chevron should not have transition class
    const chevron = document.querySelector('svg.lucide-chevron-down')
    // SVG className is an SVGAnimatedString, need to use baseVal or getAttribute
    const classValue = chevron?.getAttribute('class') || ''
    expect(classValue).not.toContain('transition-transform')
  })
})
