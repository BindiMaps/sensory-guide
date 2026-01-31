import { describe, it, expect, beforeEach } from 'vitest'
import { useGuideStore } from './guideStore'

describe('guideStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGuideStore.setState({ expandedSections: {} })
  })

  describe('toggleSection', () => {
    it('expands a collapsed section', () => {
      const store = useGuideStore.getState()
      store.toggleSection('test-venue', 'entry')
      expect(useGuideStore.getState().expandedSections['test-venue:entry']).toBe(true)
    })

    it('collapses an expanded section', () => {
      useGuideStore.setState({ expandedSections: { 'test-venue:entry': true } })
      const store = useGuideStore.getState()
      store.toggleSection('test-venue', 'entry')
      expect(useGuideStore.getState().expandedSections['test-venue:entry']).toBe(false)
    })
  })

  describe('isExpanded', () => {
    it('returns false for non-existent section', () => {
      const store = useGuideStore.getState()
      expect(store.isExpanded('test-venue', 'entry')).toBe(false)
    })

    it('returns true for expanded section', () => {
      useGuideStore.setState({ expandedSections: { 'test-venue:entry': true } })
      const store = useGuideStore.getState()
      expect(store.isExpanded('test-venue', 'entry')).toBe(true)
    })
  })

  describe('expandAll', () => {
    it('expands all specified sections', () => {
      const store = useGuideStore.getState()
      store.expandAll('test-venue', ['entry', 'concourse', 'platforms'])

      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBe(true)
      expect(state.expandedSections['test-venue:concourse']).toBe(true)
      expect(state.expandedSections['test-venue:platforms']).toBe(true)
    })

    it('preserves other venue sections', () => {
      useGuideStore.setState({ expandedSections: { 'other-venue:lobby': true } })
      const store = useGuideStore.getState()
      store.expandAll('test-venue', ['entry'])

      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBe(true)
      expect(state.expandedSections['other-venue:lobby']).toBe(true)
    })

    it('handles empty areaIds array', () => {
      const store = useGuideStore.getState()
      store.expandAll('test-venue', [])
      expect(useGuideStore.getState().expandedSections).toEqual({})
    })
  })

  describe('collapseAll', () => {
    it('collapses all sections for the venue', () => {
      useGuideStore.setState({
        expandedSections: {
          'test-venue:entry': true,
          'test-venue:concourse': true,
          'test-venue:platforms': true,
        },
      })

      const store = useGuideStore.getState()
      store.collapseAll('test-venue')

      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBeUndefined()
      expect(state.expandedSections['test-venue:concourse']).toBeUndefined()
      expect(state.expandedSections['test-venue:platforms']).toBeUndefined()
    })

    it('preserves other venue sections', () => {
      useGuideStore.setState({
        expandedSections: {
          'test-venue:entry': true,
          'other-venue:lobby': true,
        },
      })

      const store = useGuideStore.getState()
      store.collapseAll('test-venue')

      const state = useGuideStore.getState()
      expect(state.expandedSections['test-venue:entry']).toBeUndefined()
      expect(state.expandedSections['other-venue:lobby']).toBe(true)
    })
  })

  describe('areAllExpanded', () => {
    it('returns false when no sections are expanded', () => {
      const store = useGuideStore.getState()
      expect(store.areAllExpanded('test-venue', ['entry', 'concourse'])).toBe(false)
    })

    it('returns false when only some sections are expanded', () => {
      useGuideStore.setState({
        expandedSections: { 'test-venue:entry': true },
      })
      const store = useGuideStore.getState()
      expect(store.areAllExpanded('test-venue', ['entry', 'concourse'])).toBe(false)
    })

    it('returns true when all sections are expanded', () => {
      useGuideStore.setState({
        expandedSections: {
          'test-venue:entry': true,
          'test-venue:concourse': true,
        },
      })
      const store = useGuideStore.getState()
      expect(store.areAllExpanded('test-venue', ['entry', 'concourse'])).toBe(true)
    })

    it('returns false for empty areaIds array', () => {
      const store = useGuideStore.getState()
      expect(store.areAllExpanded('test-venue', [])).toBe(false)
    })
  })
})
