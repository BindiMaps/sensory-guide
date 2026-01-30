import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PublishDialog } from './PublishDialog'

describe('PublishDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    isPublishing: false,
    isAlreadyPublished: false,
    slug: 'test-venue',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with title "Publish Guide" for first-time publish', () => {
      render(<PublishDialog {...defaultProps} />)
      expect(screen.getByText('Publish Guide')).toBeInTheDocument()
    })

    it('renders with title "Update Live Guide" when already published', () => {
      render(<PublishDialog {...defaultProps} isAlreadyPublished={true} />)
      expect(screen.getByText('Update Live Guide')).toBeInTheDocument()
    })

    it('displays the venue slug in the description', () => {
      render(<PublishDialog {...defaultProps} slug="my-cool-venue" />)
      expect(screen.getByText('/venue/my-cool-venue')).toBeInTheDocument()
    })

    it('shows "Publish" button text for first-time publish', () => {
      render(<PublishDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    })

    it('shows "Update Guide" button text when already published', () => {
      render(<PublishDialog {...defaultProps} isAlreadyPublished={true} />)
      expect(screen.getByRole('button', { name: 'Update Guide' })).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      render(<PublishDialog {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows "Publishing..." with spinner when isPublishing is true', () => {
      render(<PublishDialog {...defaultProps} isPublishing={true} />)
      expect(screen.getByText('Publishing...')).toBeInTheDocument()
    })

    it('disables Cancel button while publishing', () => {
      render(<PublishDialog {...defaultProps} isPublishing={true} />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    })

    it('disables Publish button while publishing', () => {
      render(<PublishDialog {...defaultProps} isPublishing={true} />)
      expect(screen.getByRole('button', { name: /publishing/i })).toBeDisabled()
    })
  })

  describe('interactions', () => {
    it('calls onConfirm when Publish button is clicked', () => {
      render(<PublishDialog {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onOpenChange(false) when Cancel button is clicked', () => {
      render(<PublishDialog {...defaultProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not call onOpenChange when Cancel is clicked while publishing', () => {
      render(<PublishDialog {...defaultProps} isPublishing={true} />)
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(defaultProps.onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has accessible dialog role', () => {
      render(<PublishDialog {...defaultProps} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-describedby linking to description (Radix auto-generated)', () => {
      render(<PublishDialog {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      // Radix generates its own aria-describedby linking to DialogDescription
      expect(dialog).toHaveAttribute('aria-describedby')
    })

    it('contains DialogDescription element', () => {
      render(<PublishDialog {...defaultProps} />)
      // Verify the description text is rendered (Radix handles the id internally)
      expect(screen.getByText(/publicly visible/i)).toBeInTheDocument()
    })
  })

  describe('closed state', () => {
    it('does not render content when open is false', () => {
      render(<PublishDialog {...defaultProps} open={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
