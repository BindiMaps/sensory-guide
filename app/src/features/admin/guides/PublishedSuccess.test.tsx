import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublishedSuccess } from './PublishedSuccess'
import type { Area } from '@/lib/schemas/guideSchema'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(),
}
Object.assign(navigator, { clipboard: mockClipboard })

// Mock hooks
vi.mock('./useEmbeddings', () => ({
  useEmbeddings: () => ({
    embeddings: {},
    orphaned: [],
    saveEmbeddings: vi.fn(),
    resolveOrphan: vi.fn(),
    refetch: vi.fn(),
  }),
}))

vi.mock('./useRepublishEmbeddings', () => ({
  useRepublishEmbeddings: () => ({
    republish: vi.fn(),
    isRepublishing: false,
    error: null,
  }),
}))

describe('PublishedSuccess', () => {
  const mockAreas: Area[] = [
    { id: 'entry', name: 'Entry', order: 0, badges: [], details: [], images: [], embedUrls: [] },
  ]

  const defaultProps = {
    slug: 'test-venue',
    publicUrl: 'https://storage.googleapis.com/bucket/guide.json',
    onUploadNew: vi.fn(),
    venueId: 'venue-123',
    areas: mockAreas,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockClipboard.writeText.mockResolvedValue(undefined)
  })

  describe('rendering', () => {
    it('renders success message', () => {
      render(<PublishedSuccess {...defaultProps} />)
      expect(screen.getByText('Guide published!')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<PublishedSuccess {...defaultProps} />)
      expect(
        screen.getByText('Your Sensory Guide is now publicly accessible.')
      ).toBeInTheDocument()
    })

    it('displays the shareable URL with correct slug', () => {
      render(<PublishedSuccess {...defaultProps} slug="my-venue-slug" />)
      // URL appears in multiple places (display box + debug info), verify at least one exists
      const urlElements = screen.getAllByText(/\/venue\/my-venue-slug/)
      expect(urlElements.length).toBeGreaterThan(0)
    })

    it('renders Copy button', () => {
      render(<PublishedSuccess {...defaultProps} />)
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('renders View Live Guide link', () => {
      render(<PublishedSuccess {...defaultProps} />)
      expect(screen.getByRole('link', { name: /view live guide/i })).toBeInTheDocument()
    })

    it('renders Upload New Version button', () => {
      render(<PublishedSuccess {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: /upload new version/i })
      ).toBeInTheDocument()
    })
  })

  describe('copy functionality', () => {
    it('copies URL to clipboard when Copy button is clicked', async () => {
      render(<PublishedSuccess {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('/venue/test-venue')
        )
      })
    })

    it('shows "Copied!" text after successful copy', async () => {
      render(<PublishedSuccess {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })

    it('shows status message for screen readers after copy', async () => {
      render(<PublishedSuccess {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /copy/i }))

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('URL copied to clipboard')
      })
    })
  })

  describe('link behaviour', () => {
    it('View Live Guide link opens in new tab', () => {
      render(<PublishedSuccess {...defaultProps} />)
      const link = screen.getByRole('link', { name: /view live guide/i })
      expect(link).toHaveAttribute('target', '_blank')
    })

    it('View Live Guide link has security attributes', () => {
      render(<PublishedSuccess {...defaultProps} />)
      const link = screen.getByRole('link', { name: /view live guide/i })
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('View Live Guide link has correct href', () => {
      render(<PublishedSuccess {...defaultProps} slug="my-venue" />)
      const link = screen.getByRole('link', { name: /view live guide/i })
      expect(link).toHaveAttribute('href', expect.stringContaining('/venue/my-venue'))
    })
  })

  describe('interactions', () => {
    it('calls onUploadNew when Upload New Version is clicked', () => {
      render(<PublishedSuccess {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /upload new version/i }))

      expect(defaultProps.onUploadNew).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('Copy button has accessible label', () => {
      render(<PublishedSuccess {...defaultProps} />)
      const button = screen.getByRole('button', { name: /copy/i })
      expect(button).toHaveAttribute('aria-label')
    })

    it('icons are hidden from screen readers', () => {
      render(<PublishedSuccess {...defaultProps} />)
      const icons = document.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })
})
