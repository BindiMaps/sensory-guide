import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SensoryProfileState {
  // Categories the user has toggled on for filtering
  activeCategories: Set<string>
  // Whether user has seen the onboarding prompt (auto-dismisses on first filter)
  hasSeenOnboarding: boolean

  // Actions
  toggleCategory: (category: string) => void
  clearProfile: () => void
  dismissOnboarding: () => void

  // Selectors
  hasActiveFilters: () => boolean
  isCategoryActive: (category: string) => boolean
}

// Internal state shape for JSON serialisation (Set -> array)
interface PersistedState {
  activeCategories: string[]
  hasSeenOnboarding: boolean
}

export const useSensoryProfile = create<SensoryProfileState>()(
  persist(
    (set, get) => ({
      activeCategories: new Set(),
      hasSeenOnboarding: false,

      toggleCategory: (category) => {
        set((state) => {
          const newCategories = new Set(state.activeCategories)
          if (newCategories.has(category)) {
            newCategories.delete(category)
          } else {
            newCategories.add(category)
          }
          // Auto-dismiss onboarding when first filter is toggled on
          const shouldDismissOnboarding = !state.hasSeenOnboarding && newCategories.size > 0
          return {
            activeCategories: newCategories,
            hasSeenOnboarding: shouldDismissOnboarding ? true : state.hasSeenOnboarding,
          }
        })
      },

      clearProfile: () => {
        set({ activeCategories: new Set() })
      },

      dismissOnboarding: () => {
        set({ hasSeenOnboarding: true })
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
