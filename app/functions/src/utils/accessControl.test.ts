import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase-admin/firestore
const mockGet = vi.fn()
const mockSet = vi.fn()
const mockUpdate = vi.fn()
const mockDoc = vi.fn(() => ({
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
}))
const mockCollection = vi.fn(() => ({
  doc: mockDoc,
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: mockCollection,
  }),
}))

// Import after mock
import {
  isSuperAdmin,
  isApprovedUser,
  getAllowedEmails,
  addAllowedEmail,
  removeAllowedEmail,
} from './accessControl'

describe('accessControl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isSuperAdmin', () => {
    it('returns true when email is in superAdmins list', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ emails: ['admin@example.com', 'super@example.com'] }),
      })

      const result = await isSuperAdmin('admin@example.com')

      expect(result).toBe(true)
      expect(mockCollection).toHaveBeenCalledWith('config')
      expect(mockDoc).toHaveBeenCalledWith('superAdmins')
    })

    it('returns true for case-insensitive match', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ emails: ['Admin@Example.com'] }),
      })

      const result = await isSuperAdmin('admin@example.com')

      expect(result).toBe(true)
    })

    it('returns false when email is not in list', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ emails: ['other@example.com'] }),
      })

      const result = await isSuperAdmin('admin@example.com')

      expect(result).toBe(false)
    })

    it('returns false when superAdmins doc does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      const result = await isSuperAdmin('admin@example.com')

      expect(result).toBe(false)
    })

    it('returns false when emails array is missing', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({}),
      })

      const result = await isSuperAdmin('admin@example.com')

      expect(result).toBe(false)
    })
  })

  describe('isApprovedUser', () => {
    it('returns true for super admin even if not in allow-list', async () => {
      // First call: superAdmins check
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ emails: ['admin@example.com'] }),
      })

      const result = await isApprovedUser('admin@example.com')

      expect(result).toBe(true)
    })

    it('returns true for email in allow-list', async () => {
      // First call: superAdmins check (not a super admin)
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ emails: ['other@example.com'] }),
      })
      // Second call: access check
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ allowedEmails: ['user@example.com'] }),
      })

      const result = await isApprovedUser('user@example.com')

      expect(result).toBe(true)
    })

    it('returns false when not in allow-list and not super admin', async () => {
      // First call: superAdmins check
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ emails: ['other@example.com'] }),
      })
      // Second call: access check
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ allowedEmails: ['different@example.com'] }),
      })

      const result = await isApprovedUser('user@example.com')

      expect(result).toBe(false)
    })

    it('returns false when access doc does not exist (fail secure)', async () => {
      // First call: superAdmins check
      mockGet.mockResolvedValueOnce({
        exists: false,
      })
      // Second call: access check
      mockGet.mockResolvedValueOnce({
        exists: false,
      })

      const result = await isApprovedUser('user@example.com')

      expect(result).toBe(false)
    })
  })

  describe('getAllowedEmails', () => {
    it('returns empty array when access doc does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      const result = await getAllowedEmails()

      expect(result).toEqual([])
    })

    it('returns emails array when exists', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ allowedEmails: ['a@example.com', 'b@example.com'] }),
      })

      const result = await getAllowedEmails()

      expect(result).toEqual(['a@example.com', 'b@example.com'])
    })
  })

  describe('addAllowedEmail', () => {
    it('creates access doc if it does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      await addAllowedEmail('new@example.com')

      expect(mockSet).toHaveBeenCalledWith({ allowedEmails: ['new@example.com'] })
    })

    it('appends email to existing list', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ allowedEmails: ['existing@example.com'] }),
      })

      await addAllowedEmail('new@example.com')

      expect(mockUpdate).toHaveBeenCalledWith({
        allowedEmails: ['existing@example.com', 'new@example.com'],
      })
    })

    it('normalizes email to lowercase', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      await addAllowedEmail('NEW@EXAMPLE.COM')

      expect(mockSet).toHaveBeenCalledWith({ allowedEmails: ['new@example.com'] })
    })

    it('does not add duplicate email', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ allowedEmails: ['existing@example.com'] }),
      })

      await addAllowedEmail('EXISTING@example.com')

      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('removeAllowedEmail', () => {
    it('does nothing if access doc does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      await removeAllowedEmail('any@example.com')

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('removes email from list (case-insensitive)', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ allowedEmails: ['a@example.com', 'B@Example.Com', 'c@example.com'] }),
      })

      await removeAllowedEmail('b@example.com')

      expect(mockUpdate).toHaveBeenCalledWith({
        allowedEmails: ['a@example.com', 'c@example.com'],
      })
    })
  })
})
