import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useEmbeddings } from './useEmbeddings'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Area } from '@/lib/schemas/guideSchema'

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
  // Embeddings format (with titles)
  const mockEmbeddings = {
    'entry-hall': { urls: ['https://bindiweb.com/map/venue123'], title: 'Entry Hall' },
    'main-concourse': { urls: ['https://www.youtube.com/embed/abc123'], title: 'Main Concourse' },
  }

  const mockSimpleEmbeddings = {
    'entry-hall': ['https://bindiweb.com/map/venue123'],
    'main-concourse': ['https://www.youtube.com/embed/abc123'],
  }

  const mockAreas: Area[] = [
    { id: 'entry-hall', name: 'Entry Hall', order: 0, badges: [], details: [], images: [], embedUrls: [] },
    { id: 'main-concourse', name: 'Main Concourse', order: 1, badges: [], details: [], images: [], embedUrls: [] },
  ]

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

    const { result } = renderHook(() => useEmbeddings('venue123', mockAreas))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(doc).toHaveBeenCalledWith({}, 'venues', 'venue123', 'embeddings', 'urls')
    // Returns simple format for backward compatibility
    expect(result.current.embeddings).toEqual(mockSimpleEmbeddings)
    // Also provides metadata format
    expect(result.current.embeddingsWithMeta).toEqual(mockEmbeddings)
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

  it('saves embeddings to Firestore with titles', async () => {
    const mockDocRef = { id: 'embeddings' }
    ;(doc as Mock).mockReturnValue(mockDocRef)
    ;(getDoc as Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockEmbeddings,
    })
    ;(setDoc as Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useEmbeddings('venue123', mockAreas))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const newEmbeddings = {
      'entry-hall': ['https://bindiweb.com/map/updated'],
    }

    await act(async () => {
      await result.current.saveEmbeddings(newEmbeddings)
    })

    // Should save with title metadata
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      'entry-hall': { urls: ['https://bindiweb.com/map/updated'], title: 'Entry Hall' },
    })
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
        data: () =>
          callCount === 1
            ? mockEmbeddings
            : { 'entry-hall': { urls: ['https://updated.com'], title: 'Entry Hall' } },
      })
    })
    ;(setDoc as Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useEmbeddings('venue123', mockAreas))

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

  describe('title-based matching', () => {
    it('matches embeds by title when IDs change', async () => {
      const mockDocRef = { id: 'embeddings' }
      ;(doc as Mock).mockReturnValue(mockDocRef)
      // Stored under old ID but with title
      ;(getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          'old-entry-id': { urls: ['https://example.com/map'], title: 'Entry Hall' },
        }),
      })

      // New areas have different IDs
      const newAreas: Area[] = [
        { id: 'new-entry-id', name: 'Entry Hall', order: 0, badges: [], details: [], images: [], embedUrls: [] },
      ]

      const { result } = renderHook(() => useEmbeddings('venue123', newAreas))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should match to new ID based on title
      expect(result.current.embeddings['new-entry-id']).toEqual(['https://example.com/map'])
      expect(result.current.orphaned).toHaveLength(0)
    })

    it('creates orphans when titles do not match', async () => {
      const mockDocRef = { id: 'embeddings' }
      ;(doc as Mock).mockReturnValue(mockDocRef)
      ;(getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          'removed-section': { urls: ['https://example.com/map'], title: 'Removed Section' },
        }),
      })

      const newAreas: Area[] = [
        { id: 'completely-different', name: 'Completely Different', order: 0, badges: [], details: [], images: [], embedUrls: [] },
      ]

      const { result } = renderHook(() => useEmbeddings('venue123', newAreas))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.orphaned).toHaveLength(1)
      expect(result.current.orphaned[0].title).toBe('Removed Section')
      expect(result.current.orphaned[0].urls).toEqual(['https://example.com/map'])
    })

    it('resolves orphan by assigning to area', async () => {
      const mockDocRef = { id: 'embeddings' }
      ;(doc as Mock).mockReturnValue(mockDocRef)
      ;(getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          'orphan-id': { urls: ['https://example.com/map'], title: 'Orphan' },
        }),
      })
      ;(setDoc as Mock).mockResolvedValue(undefined)

      const newAreas: Area[] = [
        { id: 'target-area', name: 'Target Area', order: 0, badges: [], details: [], images: [], embedUrls: [] },
      ]

      const { result } = renderHook(() => useEmbeddings('venue123', newAreas))

      await waitFor(() => {
        expect(result.current.orphaned).toHaveLength(1)
      })

      await act(async () => {
        await result.current.resolveOrphan('orphan-id', 'target-area')
      })

      // Should save with orphan assigned to target
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        'target-area': { urls: ['https://example.com/map'], title: 'Target Area' },
      })
    })

    it('resolves orphan by deleting', async () => {
      const mockDocRef = { id: 'embeddings' }
      ;(doc as Mock).mockReturnValue(mockDocRef)
      ;(getDoc as Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          'orphan-id': { urls: ['https://example.com/map'], title: 'Orphan' },
        }),
      })
      ;(setDoc as Mock).mockResolvedValue(undefined)

      const newAreas: Area[] = [
        { id: 'some-area', name: 'Some Area', order: 0, badges: [], details: [], images: [], embedUrls: [] },
      ]

      const { result } = renderHook(() => useEmbeddings('venue123', newAreas))

      await waitFor(() => {
        expect(result.current.orphaned).toHaveLength(1)
      })

      await act(async () => {
        await result.current.resolveOrphan('orphan-id', null) // null = delete
      })

      // Should save without the orphan
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {})
    })
  })
})
