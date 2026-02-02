import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAllVenues } from './useAllVenues'
import { httpsCallable } from 'firebase/functions'

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  functions: {},
}))

describe('useAllVenues', () => {
  const mockVenues = [
    {
      id: 'venue-1',
      name: 'Venue One',
      slug: 'venue-one',
      status: 'published',
      editors: ['editor1@example.com'],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-20T14:00:00Z',
    },
    {
      id: 'venue-2',
      name: 'Venue Two',
      slug: 'venue-two',
      status: 'draft',
      editors: ['editor2@example.com', 'editor3@example.com'],
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-18T16:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches all venues on mount', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: { venues: mockVenues } })
    ;(httpsCallable as Mock).mockReturnValue(mockFn)

    const { result } = renderHook(() => useAllVenues())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(httpsCallable).toHaveBeenCalledWith({}, 'getAllVenues')
    expect(result.current.venues).toEqual(mockVenues)
    expect(result.current.error).toBeNull()
  })

  it('returns empty array when no venues exist', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: { venues: [] } })
    ;(httpsCallable as Mock).mockReturnValue(mockFn)

    const { result } = renderHook(() => useAllVenues())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.venues).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('handles permission denied error', async () => {
    const mockFn = vi.fn().mockRejectedValue({ code: 'functions/permission-denied' })
    ;(httpsCallable as Mock).mockReturnValue(mockFn)

    const { result } = renderHook(() => useAllVenues())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.venues).toEqual([])
    expect(result.current.error).toBe('You do not have permission to view all venues')
  })

  it('handles generic error', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Network error'))
    ;(httpsCallable as Mock).mockReturnValue(mockFn)

    const { result } = renderHook(() => useAllVenues())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.venues).toEqual([])
    expect(result.current.error).toBe('Failed to load venues')
  })

  it('refetches when refetch is called', async () => {
    let callCount = 0
    const mockFn = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve({
        data: {
          venues: callCount === 1 ? mockVenues : [mockVenues[0]],
        },
      })
    })
    ;(httpsCallable as Mock).mockReturnValue(mockFn)

    const { result } = renderHook(() => useAllVenues())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.venues).toHaveLength(2)

    result.current.refetch()

    await waitFor(() => {
      expect(result.current.venues).toHaveLength(1)
    })

    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
