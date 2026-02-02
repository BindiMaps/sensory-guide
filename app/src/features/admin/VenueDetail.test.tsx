import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VenueDetail } from './VenueDetail'

// Mock the hooks and Firebase
vi.mock('@/shared/hooks/useVenue', () => ({
  useVenue: vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  functions: {},
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: 'test-venue-id' }),
    useNavigate: () => vi.fn(),
  }
})

import { useVenue } from '@/shared/hooks/useVenue'
import { useAuthStore } from '@/stores/authStore'

const mockUseVenue = vi.mocked(useVenue)
const mockUseAuthStore = vi.mocked(useAuthStore)

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('VenueDetail - Editor Removal Safeguards', () => {
  const mockRemoveEditor = vi.fn()
  const mockAddEditor = vi.fn()
  const mockDeleteVenue = vi.fn()
  const mockUpdateName = vi.fn()

  const baseVenue = {
    id: 'test-venue-id',
    name: 'Test Venue',
    slug: 'test-venue',
    status: 'draft' as const,
    createdBy: 'owner@example.com',
    editors: ['owner@example.com', 'editor1@example.com', 'editor2@example.com'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseVenue.mockReturnValue({
      venue: baseVenue,
      loading: false,
      error: null,
      addEditor: mockAddEditor,
      removeEditor: mockRemoveEditor,
      deleteVenue: mockDeleteVenue,
      updateName: mockUpdateName,
    })
  })

  describe('Owner protection (AC #1)', () => {
    it('non-owner cannot see remove button on owner row', () => {
      // Current user is NOT the owner
      mockUseAuthStore.mockReturnValue({
        user: { email: 'editor1@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find the owner's row
      const ownerRow = screen.getByText('owner@example.com').closest('li')
      expect(ownerRow).toBeInTheDocument()

      // Check that owner row does NOT have a remove button
      const removeButtonInOwnerRow = ownerRow?.querySelector('button[title="Remove editor"]')
      expect(removeButtonInOwnerRow).not.toBeInTheDocument()
    })

    it('owner CAN see remove button on their own row (for self-removal)', () => {
      // Current user IS the owner
      mockUseAuthStore.mockReturnValue({
        user: { email: 'owner@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find the owner's row
      const ownerRow = screen.getByText('owner@example.com').closest('li')
      expect(ownerRow).toBeInTheDocument()

      // Owner should be able to remove themselves
      const removeButtonInOwnerRow = ownerRow?.querySelector('button[title="Remove editor"]')
      expect(removeButtonInOwnerRow).toBeInTheDocument()
    })

    it('non-owner CAN see remove button on other non-owner editors', () => {
      // Current user is NOT the owner
      mockUseAuthStore.mockReturnValue({
        user: { email: 'editor1@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find editor2's row (not owner, not self)
      const editor2Row = screen.getByText('editor2@example.com').closest('li')
      expect(editor2Row).toBeInTheDocument()

      // Should have remove button
      const removeButton = editor2Row?.querySelector('button[title="Remove editor"]')
      expect(removeButton).toBeInTheDocument()
    })
  })

  describe('Confirmation dialog for removing others (AC #2)', () => {
    it('shows confirmation dialog when clicking remove on another editor', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'owner@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find editor1's row and click remove
      const editor1Row = screen.getByText('editor1@example.com').closest('li')
      const removeButton = editor1Row?.querySelector('button[title="Remove editor"]')
      expect(removeButton).toBeInTheDocument()

      fireEvent.click(removeButton!)

      // Dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      expect(screen.getByText('Remove Editor')).toBeInTheDocument()
      // Check the dialog contains the email (in the description)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveTextContent('editor1@example.com')
    })

    it('calls removeEditor when confirming dialog', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'owner@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find editor1's row and click remove
      const editor1Row = screen.getByText('editor1@example.com').closest('li')
      const removeButton = editor1Row?.querySelector('button[title="Remove editor"]')
      fireEvent.click(removeButton!)

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click confirm
      const confirmButton = screen.getByRole('button', { name: 'Remove' })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockRemoveEditor).toHaveBeenCalledWith('editor1@example.com')
      })
    })

    it('closes dialog when clicking cancel', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'owner@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Open dialog
      const editor1Row = screen.getByText('editor1@example.com').closest('li')
      const removeButton = editor1Row?.querySelector('button[title="Remove editor"]')
      fireEvent.click(removeButton!)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      // removeEditor should NOT be called
      expect(mockRemoveEditor).not.toHaveBeenCalled()
    })
  })

  describe('Self-removal uses existing flow (AC #3)', () => {
    it('self-removal shows inline warning, not dialog', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'editor1@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Find self row and click remove
      const selfRow = screen.getByText('editor1@example.com').closest('li')
      const removeButton = selfRow?.querySelector('button[title="Remove editor"]')
      fireEvent.click(removeButton!)

      // Should show inline warning, NOT dialog
      await waitFor(() => {
        expect(screen.getByText(/remove yourself from this venue/i)).toBeInTheDocument()
      })

      // Dialog should NOT appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('self-removal inline warning has cancel and confirm buttons', async () => {
      mockUseAuthStore.mockReturnValue({
        user: { email: 'editor1@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // Click remove on self
      const selfRow = screen.getByText('editor1@example.com').closest('li')
      const removeButton = selfRow?.querySelector('button[title="Remove editor"]')
      fireEvent.click(removeButton!)

      await waitFor(() => {
        expect(screen.getByText(/remove yourself/i)).toBeInTheDocument()
      })

      // Should have Cancel and Remove myself buttons
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Remove myself' })).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('last editor cannot remove anyone (no remove buttons shown)', () => {
      mockUseVenue.mockReturnValue({
        venue: {
          ...baseVenue,
          editors: ['owner@example.com'], // Only one editor
        },
        loading: false,
        error: null,
        addEditor: mockAddEditor,
        removeEditor: mockRemoveEditor,
        deleteVenue: mockDeleteVenue,
        updateName: mockUpdateName,
      })

      mockUseAuthStore.mockReturnValue({
        user: { email: 'owner@example.com' },
      })

      renderWithProviders(<VenueDetail />)

      // No remove buttons should exist
      const removeButtons = screen.queryAllByTitle('Remove editor')
      expect(removeButtons).toHaveLength(0)
    })
  })
})
