import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { determineVenueState, useVenueState } from './useVenueState'
import type { Venue } from '@/shared/types/venue'

// Helper to create a minimal venue object
function createVenue(overrides: Partial<Venue> = {}): Venue {
  return {
    id: 'venue-123',
    name: 'Test Venue',
    slug: 'test-venue',
    status: 'draft',
    editors: ['editor@example.com'],
    createdBy: 'editor@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('determineVenueState', () => {
  it('returns "empty" when no liveVersion and no draftVersion', () => {
    const venue = createVenue({
      liveVersion: undefined,
      draftVersion: undefined,
    })

    expect(determineVenueState(venue)).toBe('empty')
  })

  it('returns "draft" when draftVersion exists and no liveVersion', () => {
    const venue = createVenue({
      liveVersion: undefined,
      draftVersion: '2026-01-28T10:00:00Z',
    })

    expect(determineVenueState(venue)).toBe('draft')
  })

  it('returns "draft" when draftVersion differs from liveVersion', () => {
    const venue = createVenue({
      liveVersion: '2026-01-27T10:00:00Z',
      draftVersion: '2026-01-28T10:00:00Z',
    })

    expect(determineVenueState(venue)).toBe('draft')
  })

  it('returns "published" when liveVersion exists and no draftVersion', () => {
    const venue = createVenue({
      liveVersion: '2026-01-28T10:00:00Z',
      draftVersion: undefined,
    })

    expect(determineVenueState(venue)).toBe('published')
  })

  it('returns "published" when liveVersion equals draftVersion', () => {
    const venue = createVenue({
      liveVersion: '2026-01-28T10:00:00Z',
      draftVersion: '2026-01-28T10:00:00Z',
    })

    expect(determineVenueState(venue)).toBe('published')
  })
})

describe('useVenueState', () => {
  it('returns isLoading true when venue is null', () => {
    const { result } = renderHook(() => useVenueState(null))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.state).toBe('empty')
  })

  it('returns correct state for empty venue', () => {
    const venue = createVenue({
      liveVersion: undefined,
      draftVersion: undefined,
    })

    const { result } = renderHook(() => useVenueState(venue))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.state).toBe('empty')
    expect(result.current.liveVersion).toBeUndefined()
    expect(result.current.draftPath).toBeUndefined()
  })

  it('returns correct state and draftPath for draft venue', () => {
    const venue = createVenue({
      id: 'venue-123',
      liveVersion: undefined,
      draftVersion: '2026-01-28T10:00:00Z',
    })

    const { result } = renderHook(() => useVenueState(venue))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.state).toBe('draft')
    expect(result.current.liveVersion).toBeUndefined()
    expect(result.current.draftPath).toBe('venues/venue-123/versions/2026-01-28T10:00:00Z.json')
  })

  it('returns correct state and liveVersion for published venue', () => {
    const venue = createVenue({
      id: 'venue-456',
      liveVersion: '2026-01-28T10:00:00Z',
      draftVersion: undefined,
    })

    const { result } = renderHook(() => useVenueState(venue))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.state).toBe('published')
    expect(result.current.liveVersion).toBe('2026-01-28T10:00:00Z')
    expect(result.current.draftPath).toBeUndefined()
  })

  it('returns draft state with both paths when draft differs from live', () => {
    const venue = createVenue({
      id: 'venue-789',
      liveVersion: '2026-01-27T10:00:00Z',
      draftVersion: '2026-01-28T10:00:00Z',
    })

    const { result } = renderHook(() => useVenueState(venue))

    expect(result.current.state).toBe('draft')
    expect(result.current.liveVersion).toBe('2026-01-27T10:00:00Z')
    expect(result.current.draftPath).toBe('venues/venue-789/versions/2026-01-28T10:00:00Z.json')
  })
})
