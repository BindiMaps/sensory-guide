import { describe, it, expect } from 'vitest'
import { getOverallLevel } from './sensory'

describe('getOverallLevel', () => {
  const mockDetails = [
    { category: 'Sound', level: 'high' as const },
    { category: 'Light', level: 'low' as const },
    { category: 'Crowds', level: 'medium' as const },
  ]

  describe('without active categories (all details)', () => {
    it('returns high when any detail is high', () => {
      expect(getOverallLevel(mockDetails)).toBe('high')
    })

    it('returns medium when highest is medium', () => {
      const details = [
        { category: 'Light', level: 'low' as const },
        { category: 'Crowds', level: 'medium' as const },
      ]
      expect(getOverallLevel(details)).toBe('medium')
    })

    it('returns low when all details are low', () => {
      const details = [
        { category: 'Light', level: 'low' as const },
        { category: 'Crowds', level: 'low' as const },
      ]
      expect(getOverallLevel(details)).toBe('low')
    })

    it('returns low for empty details array', () => {
      expect(getOverallLevel([])).toBe('low')
    })
  })

  describe('with active categories (filtered)', () => {
    it('returns level from only selected categories', () => {
      // Sound is high, but if we only select Light (low), should return low
      const activeCategories = new Set(['Light'])
      expect(getOverallLevel(mockDetails, activeCategories)).toBe('low')
    })

    it('returns high when selected category has high', () => {
      const activeCategories = new Set(['Sound'])
      expect(getOverallLevel(mockDetails, activeCategories)).toBe('high')
    })

    it('returns medium when selected categories max at medium', () => {
      const activeCategories = new Set(['Light', 'Crowds'])
      expect(getOverallLevel(mockDetails, activeCategories)).toBe('medium')
    })

    it('returns low when no selected categories match any details', () => {
      const activeCategories = new Set(['Temperature'])
      expect(getOverallLevel(mockDetails, activeCategories)).toBe('low')
    })

    it('considers multiple selected categories', () => {
      // Sound(high) + Light(low) = high
      const activeCategories = new Set(['Sound', 'Light'])
      expect(getOverallLevel(mockDetails, activeCategories)).toBe('high')
    })
  })

  describe('empty activeCategories set', () => {
    it('falls back to all details when activeCategories is empty set', () => {
      const emptySet = new Set<string>()
      // Should consider all details, so returns high
      expect(getOverallLevel(mockDetails, emptySet)).toBe('high')
    })
  })
})
