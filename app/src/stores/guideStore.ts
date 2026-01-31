import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GuideState {
  // Map of "venueSlug:areaId" -> expanded boolean
  expandedSections: Record<string, boolean>
  toggleSection: (venueSlug: string, areaId: string) => void
  isExpanded: (venueSlug: string, areaId: string) => boolean
  expandAll: (venueSlug: string, areaIds: string[]) => void
  collapseAll: (venueSlug: string) => void
  areAllExpanded: (venueSlug: string, areaIds: string[]) => boolean
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

      expandAll: (venueSlug, areaIds) => {
        set((state) => {
          const updates: Record<string, boolean> = {}
          areaIds.forEach((id) => {
            updates[`${venueSlug}:${id}`] = true
          })
          return {
            expandedSections: { ...state.expandedSections, ...updates },
          }
        })
      },

      collapseAll: (venueSlug) => {
        set((state) => {
          const filtered = Object.fromEntries(
            Object.entries(state.expandedSections).filter(
              ([key]) => !key.startsWith(`${venueSlug}:`)
            )
          )
          return { expandedSections: filtered }
        })
      },

      areAllExpanded: (venueSlug, areaIds) => {
        const state = get()
        return (
          areaIds.length > 0 &&
          areaIds.every((id) => state.expandedSections[`${venueSlug}:${id}`])
        )
      },
    }),
    {
      name: 'sensory-guide-sections',
    }
  )
)
