import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useApprovalStatus } from './useApprovalStatus'

// Mock firebase/functions
const mockHttpsCallable = vi.fn()
vi.mock('firebase/functions', () => ({
  httpsCallable: (...args: unknown[]) => mockHttpsCallable(...args),
}))

// Mock firebase lib
vi.mock('@/lib/firebase', () => ({
  functions: { name: 'mock-functions' },
}))

// Mock auth store
const mockUseAuthStore = vi.fn()
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

describe('useApprovalStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially when auth is initialising', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      initialised: false,
    })

    const { result } = renderHook(() => useApprovalStatus())

    expect(result.current.loading).toBe(true)
    expect(result.current.approved).toBe(false)
  })

  it('returns not approved when user is not logged in', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      initialised: true,
    })

    const { result } = renderHook(() => useApprovalStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.approved).toBe(false)
    expect(result.current.isSuperAdmin).toBe(false)
  })

  it('calls checkApproval function when user is logged in', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { email: 'user@example.com' },
      initialised: true,
    })

    const mockCheckApprovalFn = vi.fn().mockResolvedValue({
      data: { approved: true, isSuperAdmin: false, needsSetup: false },
    })
    mockHttpsCallable.mockReturnValue(mockCheckApprovalFn)

    const { result } = renderHook(() => useApprovalStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.approved).toBe(true)
    expect(result.current.isSuperAdmin).toBe(false)
    expect(result.current.needsSetup).toBe(false)
    expect(mockHttpsCallable).toHaveBeenCalledWith(
      expect.anything(),
      'checkApproval'
    )
  })

  it('returns super admin status when user is super admin', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { email: 'admin@example.com' },
      initialised: true,
    })

    const mockCheckApprovalFn = vi.fn().mockResolvedValue({
      data: { approved: true, isSuperAdmin: true, needsSetup: false },
    })
    mockHttpsCallable.mockReturnValue(mockCheckApprovalFn)

    const { result } = renderHook(() => useApprovalStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.approved).toBe(true)
    expect(result.current.isSuperAdmin).toBe(true)
  })

  it('returns needsSetup when config does not exist', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { email: 'user@example.com' },
      initialised: true,
    })

    const mockCheckApprovalFn = vi.fn().mockResolvedValue({
      data: { approved: false, isSuperAdmin: false, needsSetup: true },
    })
    mockHttpsCallable.mockReturnValue(mockCheckApprovalFn)

    const { result } = renderHook(() => useApprovalStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.needsSetup).toBe(true)
  })

  it('handles API errors gracefully (fail secure)', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { email: 'user@example.com' },
      initialised: true,
    })

    const mockCheckApprovalFn = vi.fn().mockRejectedValue(new Error('Network error'))
    mockHttpsCallable.mockReturnValue(mockCheckApprovalFn)

    const { result } = renderHook(() => useApprovalStatus())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.approved).toBe(false)
    expect(result.current.isSuperAdmin).toBe(false)
    expect(result.current.error).toBe('Failed to check approval status')
  })
})
