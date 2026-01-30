import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuideState {
  // Map of "venueSlug:areaId" -> expanded boolean
  expandedSections: Record<string, boolean>
  toggleSection: (venueSlug: string, areaId: string) => void
  isExpanded: (venueSlug: string, areaId: string) => boolean
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      expandedSections: {},

      toggleSection: (venueSlug, areaId) => {
        const key = `${venueSlug}:${areaId}`
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [key]: !state.expandedSections[key],
          },
        }))
      },

      isExpanded: (venueSlug, areaId) => {
        const key = `${venueSlug}:${areaId}`
        return get().expandedSections[key] ?? false
      },
    }),
    {
      name: 'sensory-guide-sections',
    }
  )
)
