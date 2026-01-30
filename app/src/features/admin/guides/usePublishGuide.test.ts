import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePublishGuide } from './usePublishGuide'

// Mock Firebase functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}))

vi.mock('@/lib/firebase', () => ({
  functions: {},
}))

import { httpsCallable } from 'firebase/functions'

describe('usePublishGuide', () => {
  const mockCallable = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const mockWithStream = Object.assign(mockCallable, { stream: vi.fn() })
    vi.mocked(httpsCallable).mockReturnValue(mockWithStream)
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => usePublishGuide())

    expect(result.current.isPublishing).toBe(false)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.publish).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('sets isPublishing to true while publishing', async () => {
    mockCallable.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
    )

    const { result } = renderHook(() => usePublishGuide())

    act(() => {
      result.current.publish('venue-123', 'venues/venue-123/versions/123.json')
    })

    expect(result.current.isPublishing).toBe(true)

    await waitFor(() => {
      expect(result.current.isPublishing).toBe(false)
    })
  })

  it('returns response data on success', async () => {
    const mockResponse = {
      data: {
        success: true,
        publicUrl: 'https://storage.googleapis.com/bucket/guide.json',
        liveVersion: '2026-01-30T10-00-00',
        slug: 'test-venue',
      },
    }
    mockCallable.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => usePublishGuide())

    let response: Awaited<ReturnType<typeof result.current.publish>> | undefined
    await act(async () => {
      response = await result.current.publish('venue-123', 'venues/venue-123/versions/123.json')
    })

    expect(response!).toEqual(mockResponse.data)
    expect(result.current.error).toBe(null)
  })

  it('sets error on unauthenticated', async () => {
    mockCallable.mockRejectedValue({ code: 'unauthenticated' })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path')
    })

    expect(result.current.error).toBe('Please log in to publish.')
  })

  it('sets error on permission-denied', async () => {
    mockCallable.mockRejectedValue({ code: 'permission-denied' })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path')
    })

    expect(result.current.error).toBe("You don't have permission to publish this venue.")
  })

  it('sets error on not-found', async () => {
    mockCallable.mockRejectedValue({ code: 'not-found' })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path')
    })

    expect(result.current.error).toBe('Guide file not found. Please re-upload the PDF.')
  })

  it('handles network errors', async () => {
    mockCallable.mockRejectedValue({ message: 'network error occurred' })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path')
    })

    expect(result.current.error).toBe('Network error. Please check your connection.')
  })

  it('reset clears error', async () => {
    mockCallable.mockRejectedValue({ code: 'not-found' })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path')
    })

    expect(result.current.error).not.toBe(null)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBe(null)
  })

  it('calls httpsCallable with correct function name', async () => {
    mockCallable.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-123', 'path/to/guide.json')
    })

    expect(httpsCallable).toHaveBeenCalledWith(
      expect.anything(),
      'publishGuide'
    )
  })

  it('passes correct data to callable', async () => {
    mockCallable.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => usePublishGuide())

    await act(async () => {
      await result.current.publish('venue-abc', 'venues/venue-abc/versions/timestamp.json')
    })

    expect(mockCallable).toHaveBeenCalledWith({
      venueId: 'venue-abc',
      outputPath: 'venues/venue-abc/versions/timestamp.json',
    })
  })
})
