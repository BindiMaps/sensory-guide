import { useMemo } from 'react'
import type { Venue } from '@/shared/types/venue'

export type VenueState = 'empty' | 'draft' | 'published'

interface UseVenueStateResult {
  state: VenueState
  liveVersion: string | undefined
  draftPath: string | undefined
  isLoading: boolean
}

/**
 * Determines venue state based on liveVersion and draftVersion fields.
 *
 * State logic:
 * - 'empty': No liveVersion AND no draftVersion
 * - 'draft': draftVersion exists AND (no liveVersion OR draftVersion !== liveVersion)
 * - 'published': liveVersion exists AND (no draftVersion OR draftVersion === liveVersion)
 */
export function determineVenueState(venue: Venue | null): VenueState {
  if (!venue) return 'empty'

  const { liveVersion, draftVersion } = venue

  // Empty: no versions at all
  if (!liveVersion && !draftVersion) {
    return 'empty'
  }

  // Draft: has unpublished draft
  if (draftVersion && (!liveVersion || draftVersion !== liveVersion)) {
    return 'draft'
  }

  // Published: has live version (and no newer draft)
  if (liveVersion) {
    return 'published'
  }

  return 'empty'
}

/**
 * Hook for determining venue lifecycle state from Firestore data.
 *
 * Returns the current state of the venue:
 * - 'empty': No guide content (show upload prompt)
 * - 'draft': Has unpublished draft (show draft preview with Publish button)
 * - 'published': Has live guide (show live preview + shareable URL)
 *
 * Also returns paths to guide JSON files for loading preview data.
 */
export function useVenueState(venue: Venue | null): UseVenueStateResult {
  return useMemo(() => {
    if (!venue) {
      return {
        state: 'empty' as VenueState,
        liveVersion: undefined,
        draftPath: undefined,
        isLoading: true,
      }
    }

    const state = determineVenueState(venue)

    // Build draft path if draftVersion exists
    const draftPath = venue.draftVersion
      ? `venues/${venue.id}/versions/${venue.draftVersion}.json`
      : undefined

    return {
      state,
      liveVersion: venue.liveVersion,
      draftPath,
      isLoading: false,
    }
  }, [venue])
}
