import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock firebase/functions
const mockHttpsCallable = vi.fn()
vi.mock('firebase/functions', () => ({
  httpsCallable: (...args: unknown[]) => mockHttpsCallable(...args),
}))

// Mock firebase config
vi.mock('@/lib/firebase', () => ({
  functions: {},
}))

// Import after mocks
import { useVersionHistory } from './useVersionHistory'

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useVersionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    mockHttpsCallable.mockReturnValue(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(
      () => useVersionHistory('venue-123', undefined),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.versions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns empty array when no versions exist', async () => {
    mockHttpsCallable.mockReturnValue(() =>
      Promise.resolve({ data: { versions: [] } })
    )

    const { result } = renderHook(
      () => useVersionHistory('venue-123', undefined),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.versions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('marks the live version correctly', async () => {
    // API returns pre-sorted (descending)
    mockHttpsCallable.mockReturnValue(() =>
      Promise.resolve({
        data: {
          versions: [
            { timestamp: '2026-01-29T12:00:00Z', previewUrl: 'url-1', size: 1024, created: '2026-01-29T12:00:00.000Z' },
            { timestamp: '2026-01-28T10:00:00Z', previewUrl: 'url-2', size: 2048, created: '2026-01-28T10:00:00.000Z' },
          ],
        },
      })
    )

    const { result } = renderHook(
      () => useVersionHistory('venue-123', '2026-01-28T10:00:00Z'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.versions).toHaveLength(2)
    // Newer one first (pre-sorted by API)
    expect(result.current.versions[0].timestamp).toBe('2026-01-29T12:00:00Z')
    expect(result.current.versions[0].isLive).toBe(false)
    expect(result.current.versions[1].timestamp).toBe('2026-01-28T10:00:00Z')
    expect(result.current.versions[1].isLive).toBe(true)
  })

  it('updates isLive instantly when liveVersion prop changes', async () => {
    mockHttpsCallable.mockReturnValue(() =>
      Promise.resolve({
        data: {
          versions: [
            { timestamp: '2026-01-29T12:00:00Z', previewUrl: 'url-1', size: 1024, created: '2026-01-29T12:00:00.000Z' },
            { timestamp: '2026-01-28T10:00:00Z', previewUrl: 'url-2', size: 2048, created: '2026-01-28T10:00:00.000Z' },
          ],
        },
      })
    )

    const { result, rerender } = renderHook(
      ({ liveVersion }) => useVersionHistory('venue-123', liveVersion),
      {
        wrapper: createWrapper(),
        initialProps: { liveVersion: '2026-01-28T10:00:00Z' },
      }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Initially, older version is live
    expect(result.current.versions[1].isLive).toBe(true)
    expect(result.current.versions[0].isLive).toBe(false)

    // Change liveVersion prop - should update isLive without refetch
    rerender({ liveVersion: '2026-01-29T12:00:00Z' })

    // Now newer version should be live (no API call needed)
    expect(result.current.versions[0].isLive).toBe(true)
    expect(result.current.versions[1].isLive).toBe(false)
  })

  it('preserves server-side descending order', async () => {
    // API returns pre-sorted data (descending by timestamp)
    mockHttpsCallable.mockReturnValue(() =>
      Promise.resolve({
        data: {
          versions: [
            { timestamp: '2026-01-30T12:00:00Z', previewUrl: 'url-1', size: 100, created: '2026-01-30T12:00:00.000Z' },
            { timestamp: '2026-01-29T10:00:00Z', previewUrl: 'url-2', size: 150, created: '2026-01-29T10:00:00.000Z' },
            { timestamp: '2026-01-28T08:00:00Z', previewUrl: 'url-3', size: 200, created: '2026-01-28T08:00:00.000Z' },
          ],
        },
      })
    )

    const { result } = renderHook(
      () => useVersionHistory('venue-123', undefined),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.versions[0].timestamp).toBe('2026-01-30T12:00:00Z')
    expect(result.current.versions[1].timestamp).toBe('2026-01-29T10:00:00Z')
    expect(result.current.versions[2].timestamp).toBe('2026-01-28T08:00:00Z')
  })

  it('returns error when function call fails', async () => {
    mockHttpsCallable.mockReturnValue(() =>
      Promise.reject(new Error('Network error'))
    )

    const { result } = renderHook(
      () => useVersionHistory('venue-123', undefined),
      { wrapper: createWrapper() }
    )

    // Wait for error to appear (after retries complete)
    await waitFor(
      () => expect(result.current.error).toBe('Network error'),
      { timeout: 5000 }
    )

    expect(result.current.versions).toEqual([])
  })

  it('does not fetch when venueId is undefined', () => {
    const { result } = renderHook(
      () => useVersionHistory(undefined, undefined),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.versions).toEqual([])
    expect(mockHttpsCallable).not.toHaveBeenCalled()
  })

  it('provides refetch function', async () => {
    let callCount = 0
    mockHttpsCallable.mockReturnValue(() => {
      callCount++
      return Promise.resolve({
        data: { versions: [{ timestamp: `call-${callCount}`, previewUrl: 'url', size: 100, created: 'date' }] },
      })
    })

    const { result } = renderHook(
      () => useVersionHistory('venue-123', undefined),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.versions[0].timestamp).toBe('call-1')

    // Trigger refetch
    result.current.refetch()

    await waitFor(() => expect(result.current.versions[0].timestamp).toBe('call-2'))
  })
})
