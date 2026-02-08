import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CategoryBadge, LevelBadge } from './CategoryBadge'

describe('CategoryBadge', () => {
  it('renders category name', () => {
    render(<CategoryBadge category="Sound" />)
    expect(screen.getByText('Sound')).toBeInTheDocument()
  })

  it('applies known category colour (v5 design system)', () => {
    const { container } = render(<CategoryBadge category="Sound" />)
    const badge = container.firstChild as HTMLElement
    // Sound: #E3ECF0 = rgb(227, 236, 240)
    expect(badge.style.backgroundColor).toBe('rgb(227, 236, 240)')
  })

  it('applies fallback colour for unknown category', () => {
    const { container } = render(<CategoryBadge category="Unknown" />)
    const badge = container.firstChild as HTMLElement
    // Fallback: #EDE6E0 = rgb(237, 230, 224)
    expect(badge.style.backgroundColor).toBe('rgb(237, 230, 224)')
  })

  it('accepts custom className', () => {
    const { container } = render(<CategoryBadge category="Light" className="custom-class" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('custom-class')
  })

  it('uses rem-based font size', () => {
    const { container } = render(<CategoryBadge category="Crowds" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('text-[0.75rem]')
  })
})

describe('LevelBadge', () => {
  it('renders title-case level name', () => {
    render(<LevelBadge level="low" />)
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('includes colour square indicator', () => {
    const { container } = render(<LevelBadge level="low" />)
    const square = container.querySelector('span > span:first-child') as HTMLElement
    // Low: #2A6339 = rgb(42, 99, 57)
    expect(square.style.backgroundColor).toBe('rgb(42, 99, 57)')
  })

  it('applies medium level colour', () => {
    const { container } = render(<LevelBadge level="medium" />)
    const square = container.querySelector('span > span:first-child') as HTMLElement
    // Medium: #8A5F08 = rgb(138, 95, 8)
    expect(square.style.backgroundColor).toBe('rgb(138, 95, 8)')
  })

  it('applies high level colour', () => {
    const { container } = render(<LevelBadge level="high" />)
    const square = container.querySelector('span > span:first-child') as HTMLElement
    // High: #9E3322 = rgb(158, 51, 34)
    expect(square.style.backgroundColor).toBe('rgb(158, 51, 34)')
  })
})
