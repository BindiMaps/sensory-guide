import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useEmbeddings } from './useEmbeddings'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  db: {},
}))

describe('useEmbeddings', () => {
  const mockEmbeddings = {
    'entry-hall': ['https://bindiweb.com/map/venue123'],
    'main-concourse': ['https://www.youtube.com/embed/abc123'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches embeddings from Firestore on load', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)
    ;(getDoc as Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockEmbeddings,
    })

    const { result } = renderHook(() => useEmbeddings('venue123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(doc).toHaveBeenCalledWith({}, 'venues', 'venue123', 'embeddings', 'urls')
    expect(result.current.embeddings).toEqual(mockEmbeddings)
    expect(result.current.error).toBeNull()
  })

  it('returns empty object when embeddings doc does not exist', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)
    ;(getDoc as Mock).mockResolvedValue({
      exists: () => false,
      data: () => null,
    })

    const { result } = renderHook(() => useEmbeddings('venue123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.embeddings).toEqual({})
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error gracefully', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)
    ;(getDoc as Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useEmbeddings('venue123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.embeddings).toEqual({})
    expect(result.current.error).toBe('Failed to load embeddings')
  })

  it('saves embeddings to Firestore', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)
    ;(getDoc as Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockEmbeddings,
    })
    ;(setDoc as Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useEmbeddings('venue123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const newEmbeddings = {
      'entry-hall': ['https://bindiweb.com/map/updated'],
    }

    await act(async () => {
      await result.current.saveEmbeddings(newEmbeddings)
    })

    expect(setDoc).toHaveBeenCalledWith(mockDocRef, newEmbeddings)
  })

  it('does not fetch when venueId is undefined', () => {
    renderHook(() => useEmbeddings(undefined))

    expect(getDoc).not.toHaveBeenCalled()
  })

  it('refetches embeddings after save', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)

    let callCount = 0
    ;(getDoc as Mock).mockImplementation(() => {
      callCount++
      return Promise.resolve({
        exists: () => true,
        data: () => callCount === 1 ? mockEmbeddings : { 'entry-hall': ['https://updated.com'] },
      })
    })
    ;(setDoc as Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useEmbeddings('venue123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.saveEmbeddings({ 'entry-hall': ['https://updated.com'] })
    })

    await waitFor(() => {
      expect(result.current.embeddings).toEqual({ 'entry-hall': ['https://updated.com'] })
    })
  })
})
