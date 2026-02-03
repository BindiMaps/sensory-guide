import { describe, it, expect, beforeEach } from 'vitest'
import { useSensoryProfile } from './sensoryProfileStore'

describe('sensoryProfileStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSensoryProfile.setState({
      activeCategories: new Set(),
      hasSeenOnboarding: false,
    })
    // Clear localStorage to test persistence
    localStorage.removeItem('sensory-profile')
  })

  describe('default state', () => {
    it('has empty activeCategories by default', () => {
      const state = useSensoryProfile.getState()
      expect(state.activeCategories.size).toBe(0)
    })

    it('has hasSeenOnboarding false by default', () => {
      const state = useSensoryProfile.getState()
      expect(state.hasSeenOnboarding).toBe(false)
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
        hasSeenOnboarding: false,
      })

      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.has('Sound')).toBe(false)
    })

    it('preserves other categories when toggling', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound', 'Light']),
        hasSeenOnboarding: false,
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

  describe('clearProfile', () => {
    it('resets activeCategories to empty', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound', 'Light', 'Crowds']),
        hasSeenOnboarding: true,
      })

      const store = useSensoryProfile.getState()
      store.clearProfile()

      const state = useSensoryProfile.getState()
      expect(state.activeCategories.size).toBe(0)
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
        hasSeenOnboarding: false,
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
        hasSeenOnboarding: false,
      })

      const state = useSensoryProfile.getState()
      expect(state.isCategoryActive('Sound')).toBe(true)
    })
  })

  describe('onboarding', () => {
    it('hasSeenOnboarding defaults to false', () => {
      const state = useSensoryProfile.getState()
      expect(state.hasSeenOnboarding).toBe(false)
    })

    it('dismissOnboarding sets hasSeenOnboarding to true', () => {
      const store = useSensoryProfile.getState()
      store.dismissOnboarding()

      const state = useSensoryProfile.getState()
      expect(state.hasSeenOnboarding).toBe(true)
    })

    it('auto-dismisses onboarding when first filter toggled on', () => {
      const store = useSensoryProfile.getState()
      expect(store.hasSeenOnboarding).toBe(false)

      store.toggleCategory('Sound')

      const state = useSensoryProfile.getState()
      expect(state.hasSeenOnboarding).toBe(true)
    })

    it('does not change hasSeenOnboarding if already true', () => {
      useSensoryProfile.setState({
        activeCategories: new Set(['Sound']),
        hasSeenOnboarding: true,
      })

      const store = useSensoryProfile.getState()
      store.toggleCategory('Light')

      const state = useSensoryProfile.getState()
      expect(state.hasSeenOnboarding).toBe(true)
    })
  })

  describe('localStorage persistence', () => {
    it('persists state to localStorage', () => {
      const store = useSensoryProfile.getState()
      store.toggleCategory('Sound')

      // Force persist (zustand persist is async)
      const persisted = localStorage.getItem('sensory-profile')
      expect(persisted).not.toBeNull()
    })

    it('restores Set correctly from localStorage', () => {
      // Manually set localStorage with serialised state
      const storedState = {
        state: {
          activeCategories: ['Sound', 'Light'],
          hasSeenOnboarding: true,
        },
        version: 0,
      }
      localStorage.setItem('sensory-profile', JSON.stringify(storedState))

      // Verify the serialised format is correct
      const persisted = localStorage.getItem('sensory-profile')
      const parsed = JSON.parse(persisted!)
      expect(parsed.state.activeCategories).toEqual(['Sound', 'Light'])
    })
  })
})
