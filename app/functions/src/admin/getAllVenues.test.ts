import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpsError } from 'firebase-functions/v2/https'

// Mock firebase-admin/firestore
const mockOrderBy = vi.fn()
const mockGet = vi.fn()
const mockCollection = vi.fn(() => ({
  orderBy: mockOrderBy.mockReturnValue({ get: mockGet }),
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: mockCollection,
  }),
}))

// Mock middleware
vi.mock('../middleware/auth', () => ({
  requireAuth: vi.fn((request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
    return request.auth.token.email
  }),
}))

// Mock access control
const mockIsSuperAdmin = vi.fn()
vi.mock('../utils/accessControl', () => ({
  isSuperAdmin: (email: string) => mockIsSuperAdmin(email),
}))

// Import after mocks
import { getAllVenuesHandler } from './getAllVenues'

describe('getAllVenues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws unauthenticated when not logged in', async () => {
    const request = { auth: null, data: undefined }

    await expect(getAllVenuesHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'unauthenticated' })
    )
  })

  it('throws permission-denied when not a super admin', async () => {
    const request = {
      auth: { token: { email: 'user@example.com' } },
      data: undefined,
    }

    mockIsSuperAdmin.mockResolvedValue(false)

    await expect(getAllVenuesHandler(request as never)).rejects.toThrow(
      expect.objectContaining({ code: 'permission-denied' })
    )

    expect(mockIsSuperAdmin).toHaveBeenCalledWith('user@example.com')
  })

  it('returns all venues for super admin', async () => {
    const request = {
      auth: { token: { email: 'admin@example.com' } },
      data: undefined,
    }

    mockIsSuperAdmin.mockResolvedValue(true)

    const mockDocs = [
      {
        id: 'venue-1',
        data: () => ({
          name: 'Venue One',
          slug: 'venue-one',
          status: 'published',
          editors: ['editor1@example.com', 'editor2@example.com'],
          createdAt: { toDate: () => new Date('2026-01-15T10:00:00Z') },
          updatedAt: { toDate: () => new Date('2026-01-20T14:00:00Z') },
        }),
      },
      {
        id: 'venue-2',
        data: () => ({
          name: 'Venue Two',
          slug: 'venue-two',
          status: 'draft',
          editors: ['editor3@example.com'],
          createdAt: { toDate: () => new Date('2026-01-10T08:00:00Z') },
          updatedAt: { toDate: () => new Date('2026-01-18T16:00:00Z') },
        }),
      },
    ]

    mockGet.mockResolvedValue({ docs: mockDocs })

    const result = await getAllVenuesHandler(request as never)

    expect(mockCollection).toHaveBeenCalledWith('venues')
    expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')

    expect(result.venues).toHaveLength(2)
    expect(result.venues[0]).toEqual({
      id: 'venue-1',
      name: 'Venue One',
      slug: 'venue-one',
      status: 'published',
      editors: ['editor1@example.com', 'editor2@example.com'],
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-20T14:00:00.000Z',
    })
    expect(result.venues[1]).toEqual({
      id: 'venue-2',
      name: 'Venue Two',
      slug: 'venue-two',
      status: 'draft',
      editors: ['editor3@example.com'],
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-18T16:00:00.000Z',
    })
  })

  it('returns empty array when no venues exist', async () => {
    const request = {
      auth: { token: { email: 'admin@example.com' } },
      data: undefined,
    }

    mockIsSuperAdmin.mockResolvedValue(true)
    mockGet.mockResolvedValue({ docs: [] })

    const result = await getAllVenuesHandler(request as never)

    expect(result.venues).toEqual([])
  })

  it('handles venues with missing optional fields', async () => {
    const request = {
      auth: { token: { email: 'admin@example.com' } },
      data: undefined,
    }

    mockIsSuperAdmin.mockResolvedValue(true)

    const mockDocs = [
      {
        id: 'venue-1',
        data: () => ({
          // Missing name, slug, status, editors - should default
        }),
      },
    ]

    mockGet.mockResolvedValue({ docs: mockDocs })

    const result = await getAllVenuesHandler(request as never)

    expect(result.venues[0]).toEqual({
      id: 'venue-1',
      name: '',
      slug: '',
      status: 'draft',
      editors: [],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })
})
