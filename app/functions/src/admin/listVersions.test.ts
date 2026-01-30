import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'

// Mock firebase-admin/firestore
const mockFirestoreGet = vi.fn()
const mockFirestoreDoc = vi.fn(() => ({
  get: mockFirestoreGet,
}))
const mockFirestoreCollection = vi.fn(() => ({
  doc: mockFirestoreDoc,
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: mockFirestoreCollection,
  }),
}))

// Mock firebase-admin/storage
const mockGetFiles = vi.fn()
const mockBucket = vi.fn(() => ({
  getFiles: mockGetFiles,
}))

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: mockBucket,
  }),
}))

// Mock middleware
vi.mock('../middleware/auth', () => ({
  requireAuth: vi.fn((request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
    return request.auth.token.email
  }),
  requireEditorAccess: vi.fn(),
}))

// Import after mocks
import { listVersionsHandler } from './listVersions'
import { requireEditorAccess } from '../middleware/auth'

describe('listVersions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws unauthenticated when not logged in', async () => {
    const request = { auth: null, data: { venueId: 'venue-123' } }

    await expect(listVersionsHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'unauthenticated' })
    )
  })

  it('throws invalid-argument when venueId missing', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: {},
    }

    await expect(listVersionsHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'invalid-argument' })
    )
  })

  it('checks editor access', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    // No files in storage
    mockGetFiles.mockResolvedValue([[]])

    await listVersionsHandler(request as never)

    expect(requireEditorAccess).toHaveBeenCalledWith('user@example.com', 'venue-123')
  })

  it('returns empty array when no versions exist', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    mockGetFiles.mockResolvedValue([[]])

    const result = await listVersionsHandler(request as never)

    expect(result.versions).toEqual([])
  })

  it('lists versions with metadata from Cloud Storage', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    const mockFiles = [
      {
        name: 'venues/venue-123/versions/2026-01-28T10:00:00Z.json',
        metadata: {
          size: '1024',
          timeCreated: '2026-01-28T10:00:00.000Z',
        },
        getSignedUrl: vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url-1']),
      },
      {
        name: 'venues/venue-123/versions/2026-01-29T12:00:00Z.json',
        metadata: {
          size: '2048',
          timeCreated: '2026-01-29T12:00:00.000Z',
        },
        getSignedUrl: vi.fn().mockResolvedValue(['https://storage.googleapis.com/signed-url-2']),
      },
    ]

    mockGetFiles.mockResolvedValue([mockFiles])

    const result = await listVersionsHandler(request as never)

    expect(result.versions).toHaveLength(2)
    expect(result.versions[0]).toEqual({
      timestamp: '2026-01-29T12:00:00Z',
      previewUrl: 'https://storage.googleapis.com/signed-url-2',
      size: 2048,
      created: '2026-01-29T12:00:00.000Z',
    })
    expect(result.versions[1]).toEqual({
      timestamp: '2026-01-28T10:00:00Z',
      previewUrl: 'https://storage.googleapis.com/signed-url-1',
      size: 1024,
      created: '2026-01-28T10:00:00.000Z',
    })
  })

  it('sorts versions by timestamp descending (newest first)', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    const mockFiles = [
      {
        name: 'venues/venue-123/versions/2026-01-28T08:00:00Z.json',
        metadata: { size: '100', timeCreated: '2026-01-28T08:00:00.000Z' },
        getSignedUrl: vi.fn().mockResolvedValue(['url-1']),
      },
      {
        name: 'venues/venue-123/versions/2026-01-30T12:00:00Z.json',
        metadata: { size: '200', timeCreated: '2026-01-30T12:00:00.000Z' },
        getSignedUrl: vi.fn().mockResolvedValue(['url-2']),
      },
      {
        name: 'venues/venue-123/versions/2026-01-29T10:00:00Z.json',
        metadata: { size: '150', timeCreated: '2026-01-29T10:00:00.000Z' },
        getSignedUrl: vi.fn().mockResolvedValue(['url-3']),
      },
    ]

    mockGetFiles.mockResolvedValue([mockFiles])

    const result = await listVersionsHandler(request as never)

    expect(result.versions[0].timestamp).toBe('2026-01-30T12:00:00Z')
    expect(result.versions[1].timestamp).toBe('2026-01-29T10:00:00Z')
    expect(result.versions[2].timestamp).toBe('2026-01-28T08:00:00Z')
  })

  it('filters out non-json files', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: { venueId: 'venue-123' },
    }

    const mockFiles = [
      {
        name: 'venues/venue-123/versions/2026-01-28T10:00:00Z.json',
        metadata: { size: '1024', timeCreated: '2026-01-28T10:00:00.000Z' },
        getSignedUrl: vi.fn().mockResolvedValue(['url-1']),
      },
      {
        name: 'venues/venue-123/versions/.DS_Store',
        metadata: { size: '100', timeCreated: '2026-01-28T10:00:00.000Z' },
        getSignedUrl: vi.fn().mockResolvedValue(['url-2']),
      },
    ]

    mockGetFiles.mockResolvedValue([mockFiles])

    const result = await listVersionsHandler(request as never)

    expect(result.versions).toHaveLength(1)
    expect(result.versions[0].timestamp).toBe('2026-01-28T10:00:00Z')
  })
})
