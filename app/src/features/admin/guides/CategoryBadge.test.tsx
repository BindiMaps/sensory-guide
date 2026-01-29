import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CategoryBadge, LevelBadge } from './CategoryBadge'

describe('CategoryBadge', () => {
  it('renders category name', () => {
    render(<CategoryBadge category="Sound" />)
    expect(screen.getByText('Sound')).toBeInTheDocument()
  })

  it('applies known category colour', () => {
    const { container } = render(<CategoryBadge category="Sound" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(205, 231, 255)') // #CDE7FF
  })

  it('applies fallback colour for unknown category', () => {
    const { container } = render(<CategoryBadge category="Unknown" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(229, 231, 235)') // #E5E7EB grey
  })

  it('accepts custom className', () => {
    const { container } = render(<CategoryBadge category="Light" className="custom-class" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('custom-class')
  })
})

describe('LevelBadge', () => {
  it('renders level name capitalised', () => {
    render(<LevelBadge level="low" />)
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('applies low level colours (green)', () => {
    const { container } = render(<LevelBadge level="low" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(213, 245, 227)') // #D5F5E3
    expect(badge.style.color).toBe('rgb(42, 99, 57)') // #2A6339
  })

  it('applies medium level colours (amber)', () => {
    const { container } = render(<LevelBadge level="medium" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(254, 243, 199)') // #FEF3C7
    expect(badge.style.color).toBe('rgb(138, 95, 8)') // #8A5F08
  })

  it('applies high level colours (red)', () => {
    const { container } = render(<LevelBadge level="high" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.style.backgroundColor).toBe('rgb(254, 226, 226)') // #FEE2E2
    expect(badge.style.color).toBe('rgb(158, 51, 34)') // #9E3322
  })
})
