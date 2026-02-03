import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Threshold levels for filtering sensory warnings
export type Threshold = 'all' | 'medium-high' | 'high-only'

interface SensoryProfileState {
  // Categories the user has toggled on for filtering (stored as array for JSON compat)
  activeCategories: Set<string>
  // Per-category threshold settings (defaults to 'all' if not set)
  thresholds: Record<string, Threshold>

  // Actions
  toggleCategory: (category: string) => void
  setThreshold: (category: string, threshold: Threshold) => void
  clearProfile: () => void

  // Selectors
  getThreshold: (category: string) => Threshold
  hasActiveFilters: () => boolean
  isCategoryActive: (category: string) => boolean
}

// Internal state shape for JSON serialisation (Set -> array)
interface PersistedState {
  activeCategories: string[]
  thresholds: Record<string, Threshold>
}

export const useSensoryProfile = create<SensoryProfileState>()(
  persist(
    (set, get) => ({
      activeCategories: new Set(),
      thresholds: {},

      toggleCategory: (category) => {
        set((state) => {
          const newCategories = new Set(state.activeCategories)
          if (newCategories.has(category)) {
            newCategories.delete(category)
          } else {
            newCategories.add(category)
          }
          return { activeCategories: newCategories }
        })
      },

      setThreshold: (category, threshold) => {
        set((state) => ({
          thresholds: {
            ...state.thresholds,
            [category]: threshold,
          },
        }))
      },

      clearProfile: () => {
        set({
          activeCategories: new Set(),
          thresholds: {},
        })
      },

      getThreshold: (category) => {
        return get().thresholds[category] ?? 'all'
      },

      hasActiveFilters: () => {
        return get().activeCategories.size > 0
      },

      isCategoryActive: (category) => {
        return get().activeCategories.has(category)
      },
    }),
    {
      name: 'sensory-profile',
      // Convert Set <-> array for JSON storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str) as { state: PersistedState; version?: number }
          return {
            ...parsed,
            state: {
              ...parsed.state,
              activeCategories: new Set(parsed.state.activeCategories || []),
            },
          }
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              activeCategories: [...value.state.activeCategories],
            },
          }
          localStorage.setItem(name, JSON.stringify(toStore))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
