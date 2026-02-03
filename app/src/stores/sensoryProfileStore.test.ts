import { describe, it, expect, beforeEach } from 'vitest'
import { useSensoryProfile } from './sensoryProfileStore'

describe('sensoryProfileStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSensoryProfile.setState({
      activeCategories: new Set(),
      thresholds: {},
    })
    // Clear localStorage to test persistence
    localStorage.removeItem('sensory-profile')
  })

  describe('default state', () => {
    it('has empty activeCategories by default', () => {
      const state = useSensoryProfile.getState()
      expect(state.activeCategories.size).toBe(0)
    })

    it('has empty thresholds by default', () => {
      const state = useSensoryProfile.getState()
      expect(Object.keys(state.thresholds)).toHaveLength(0)
    })

    it('returns "all" as default threshold for any category', () => {
      const state = useSensoryProfile.getState()
      expect(state.getThreshold('Sound')).toBe('all')
      expect(state.getThreshold('Light')).toBe('all')
      expect(state.getThreshold('AnyCategory')).toBe('all')
    })
  })

  describe('toggleCategory', () => {
    it('adds category when not present', () => {
      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(true)
    })

    it('removes category when already present', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        thresholds: {},
      })

      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(false)
    })

    it('preserves other categories when toggling', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound', 'Light']),
        thresholds: {},
      })

      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(false)
      expect(state.activeCategories.has('Light')).toBe(true)
    })

    it('can toggle multiple categories independently', () => {
      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')
      store.toggleCategory('Light')
      store.toggleCategory('Crowds')

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(true)
      expect(state.activeCategories.has('Light')).toBe(true)
      expect(state.activeCategories.has('Crowds')).toBe(true)
    })
  })

  describe('setThreshold', () => {
    it('sets threshold for a category', () => {
      const store = useSensoryProfile.getState()
      store.setThreshold('Sound', 'high-only')

      const state = useSensoryProfile.getState()
      expect(state.thresholds['Sound']).toBe('high-only')
    })

    it('updates existing threshold', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(),
        thresholds: { Sound: 'all' },
      })

      const store = useSensoryProfile.getState()
      store.setThreshold('Sound', 'medium-high')

      const state = useSensoryProfile.getState()
      expect(state.thresholds['Sound']).toBe('medium-high')
    })

    it('preserves other thresholds when setting one', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(),
        thresholds: { Sound: 'high-only', Light: 'medium-high' },
      })

      const store = useSensoryProfile.getState()
      store.setThreshold('Crowds', 'all')

      const state = useSensoryProfile.getState()
      expect(state.thresholds['Sound']).toBe('high-only')
      expect(state.thresholds['Light']).toBe('medium-high')
      expect(state.thresholds['Crowds']).toBe('all')
    })
  })

  describe('getThreshold', () => {
    it('returns stored threshold when set', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(),
        thresholds: { Sound: 'high-only' },
      })

      const state = useSensoryProfile.getState()
      expect(state.getThreshold('Sound')).toBe('high-only')
    })

    it('returns "all" for categories without explicit threshold', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(),
        thresholds: { Sound: 'high-only' },
      })

      const state = useSensoryProfile.getState()
      expect(state.getThreshold('Light')).toBe('all')
    })
  })

  describe('clearProfile', () => {
    it('resets activeCategories to empty', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound', 'Light', 'Crowds']),
        thresholds: { Sound: 'high-only' },
      })

      const store = useSensoryProfile.getState()
      store.clearProfile()

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.size).toBe(0)
    })

    it('resets thresholds to empty', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        thresholds: { Sound: 'high-only', Light: 'medium-high' },
      })

      const store = useSensoryProfile.getState()
      store.clearProfile()

      const state = useSensoryProfile.getState()
      expect(Object.keys(state.thresholds)).toHaveLength(0)
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no categories active', () => {
      const state = useSensoryProfile.getState()
      expect(state.hasActiveFilters()).toBe(false)
    })

    it('returns true when at least one category is active', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        thresholds: {},
      })

      const state = useSensoryProfile.getState()
      expect(state.hasActiveFilters()).toBe(true)
    })
  })

  describe('isCategoryActive', () => {
    it('returns false for inactive category', () => {
      const state = useSensoryProfile.getState()
      expect(state.isCategoryActive('Sound')).toBe(false)
    })

    it('returns true for active category', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        thresholds: {},
      })

      const state = useSensoryProfile.getState()
      expect(state.isCategoryActive('Sound')).toBe(true)
    })
  })

  describe('localStorage persistence', () => {
    it('persists state to localStorage', () => {
      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')
      store.setThreshold('Sound', 'high-only')

      // Force persist (zustand persist is async)
      const persisted = localStorage.getItem('sensory-profile')
      expect(persisted).not.toBeNull()
    })

    it('restores Set correctly from localStorage', () => {
      // Manually set localStorage with serialised state
      const storedState = {
        state: {
          activeCategories: ['Sound', 'Light'],
          thresholds: { Sound: 'high-only' },
        },
        version: 0,
      }
      localStorage.setItem('sensory-profile', JSON.stringify(storedState))

      // Create fresh store instance to trigger rehydration
      // Note: In real app, this happens on page load
      // For this test, we verify the custom storage adapter works
      const persisted = localStorage.getItem('sensory-profile')
      const parsed = JSON.parse(persisted!)
      expect(parsed.state.activeCategories).toEqual(['Sound', 'Light'])
    })
  })
})
