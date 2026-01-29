import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { useGuideData } from './useGuideData'

// Mock Firebase storage
vi.mock('@/lib/firebase', () => ({
  storage: null, // Simulate unconfigured
}))

// Mock Firebase storage functions
vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({ fullPath: 'test-path' })),
  getDownloadURL: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useGuideData', () => {
  it('returns loading state initially when path provided', () => {
    const { result } = renderHook(() => useGuideData('test/path.json'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('does not fetch when outputPath is null', () => {
    const { result } = renderHook(() => useGuideData(null), {
      wrapper: createWrapper(),
    })

    // Not loading because query is disabled
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('provides refetch function', () => {
    const { result } = renderHook(() => useGuideData('test/path.json'), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.refetch).toBe('function')
  })

  it('returns correct structure', () => {
    const { result } = renderHook(() => useGuideData('test/path.json'), {
      wrapper: createWrapper(),
    })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('refetch')
  })
})
