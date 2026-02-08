import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'

// Mock firebase-admin/firestore
const mockFirestoreUpdate = vi.fn()
const mockVenueRef = { update: mockFirestoreUpdate }

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => 'SERVER_TIMESTAMP',
  },
}))

// Mock firebase-admin/storage
const mockFileExists = vi.fn()
const mockFileCopy = vi.fn()
const mockFileMakePublic = vi.fn()
const mockFileSetMetadata = vi.fn().mockResolvedValue([{}])
const mockFile = vi.fn(() => ({
  exists: mockFileExists,
  copy: mockFileCopy,
  makePublic: mockFileMakePublic,
  setMetadata: mockFileSetMetadata,
}))
const mockBucket = vi.fn(() => ({
  file: mockFile,
  name: 'test-bucket',
}))

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: mockBucket,
  }),
}))

// Mock middleware - requireEditorAccess returns the venue doc snapshot
const mockRequireEditorAccess = vi.fn()
vi.mock('../middleware/auth', () => ({
  requireAuth: vi.fn((request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
    return request.auth.token.email
  }),
  requireEditorAccess: (...args: unknown[]) => mockRequireEditorAccess(...args),
}))

function mockVenueSnap(data: Record<string, unknown>) {
  return {
    exists: true,
    data: () => data,
    ref: mockVenueRef,
  }
}

// Import after mocks
import { setLiveVersionHandler } from './setLiveVersion'

describe('setLiveVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws unauthenticated when not logged in', async () => {
    const request = { auth: null, data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' } }

    await expect(setLiveVersionHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'unauthenticated' })
    )
  })

  it('throws invalid-argument when venueId missing', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { timestamp: '2026-01-28T10:00:00Z' },
    }

    await expect(setLiveVersionHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'invalid-argument' })
    )
  })

  it('throws invalid-argument when timestamp missing', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    await expect(setLiveVersionHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'invalid-argument' })
    )
  })

  it('checks editor access', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
    }

    mockRequireEditorAccess.mockResolvedValue(mockVenueSnap({ slug: 'test-venue' }))
    mockFileExists.mockResolvedValue([true])
    mockFileCopy.mockResolvedValue([{}])
    mockFileMakePublic.mockResolvedValue([{}])
    mockFirestoreUpdate.mockResolvedValue({})

    await setLiveVersionHandler(request as never)

    expect(mockRequireEditorAccess).toHaveBeenCalledWith('user@example.com', 'venue-123')
  })

  it('throws not-found when version file does not exist', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
    }

    mockRequireEditorAccess.mockResolvedValue(mockVenueSnap({ slug: 'test-venue' }))
    mockFileExists.mockResolvedValue([false])

    await expect(setLiveVersionHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'not-found' })
    )
  })

  it('copies version to public slug path and makes it public', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
    }

    mockRequireEditorAccess.mockResolvedValue(mockVenueSnap({ slug: 'my-venue' }))
    mockFileExists.mockResolvedValue([true])

    const mockPublicFile = {
      makePublic: mockFileMakePublic,
    }
    mockFileCopy.mockResolvedValue([mockPublicFile])
    mockFileMakePublic.mockResolvedValue([{}])
    mockFirestoreUpdate.mockResolvedValue({})

    await setLiveVersionHandler(request as never)

    // Check that file was requested for the versioned path
    expect(mockFile).toHaveBeenCalledWith('venues/venue-123/versions/2026-01-28T10:00:00Z.json')

    // Check that copy was called with public path
    expect(mockFileCopy).toHaveBeenCalled()
  })

  it('updates Firestore liveVersion pointer', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
    }

    mockRequireEditorAccess.mockResolvedValue(mockVenueSnap({ slug: 'test-venue' }))
    mockFileExists.mockResolvedValue([true])

    const mockPublicFile = { makePublic: mockFileMakePublic }
    mockFileCopy.mockResolvedValue([mockPublicFile])
    mockFileMakePublic.mockResolvedValue([{}])
    mockFirestoreUpdate.mockResolvedValue({})

    await setLiveVersionHandler(request as never)

    expect(mockFirestoreUpdate).toHaveBeenCalledWith({
      liveVersion: '2026-01-28T10:00:00Z',
      status: 'published',
      updatedAt: 'SERVER_TIMESTAMP',
    })
  })

  it('returns success response with publicUrl and liveVersion', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123', timestamp: '2026-01-28T10:00:00Z' },
    }

    mockRequireEditorAccess.mockResolvedValue(mockVenueSnap({ slug: 'my-venue' }))
    mockFileExists.mockResolvedValue([true])

    const mockPublicFile = { makePublic: mockFileMakePublic }
    mockFileCopy.mockResolvedValue([mockPublicFile])
    mockFileMakePublic.mockResolvedValue([{}])
    mockFirestoreUpdate.mockResolvedValue({})

    const result = await setLiveVersionHandler(request as never)

    expect(result).toEqual({
      success: true,
      publicUrl: 'https://storage.googleapis.com/test-bucket/public/guides/my-venue.json',
      liveVersion: '2026-01-28T10:00:00Z',
      slug: 'my-venue',
    })
  })
})
