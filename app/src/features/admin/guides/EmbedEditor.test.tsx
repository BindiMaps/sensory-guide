import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmbedEditor } from './EmbedEditor'
import { isEmbeddableUrl } from './embedUrlValidation'
import type { Area } from '@/lib/schemas/guideSchema'

describe('isEmbeddableUrl', () => {
  it('accepts empty string', () => {
    expect(isEmbeddableUrl('')).toEqual({ valid: true })
    expect(isEmbeddableUrl('   ')).toEqual({ valid: true })
  })

  it('accepts valid BindiWeb URLs', () => {
    expect(isEmbeddableUrl('https://bindiweb.com/map/venue123')).toEqual({ valid: true })
    expect(isEmbeddableUrl('https://app.bindiweb.com/map/xyz')).toEqual({ valid: true })
  })

  it('accepts valid YouTube URLs', () => {
    expect(isEmbeddableUrl('https://www.youtube.com/embed/abc123')).toEqual({ valid: true })
    expect(isEmbeddableUrl('https://youtube.com/watch?v=xyz')).toEqual({ valid: true })
    expect(isEmbeddableUrl('https://youtube-nocookie.com/embed/abc')).toEqual({ valid: true })
  })

  it('accepts valid Vimeo URLs', () => {
    expect(isEmbeddableUrl('https://vimeo.com/123456')).toEqual({ valid: true })
    expect(isEmbeddableUrl('https://player.vimeo.com/video/123456')).toEqual({ valid: true })
  })

  it('accepts valid Google Maps URLs', () => {
    expect(isEmbeddableUrl('https://www.google.com/maps/embed?pb=...')).toEqual({ valid: true })
    expect(isEmbeddableUrl('https://maps.google.com/...')).toEqual({ valid: true })
  })

  it('rejects non-HTTPS URLs', () => {
    const result = isEmbeddableUrl('http://youtube.com/embed/abc')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('HTTPS')
  })

  it('rejects unknown domains', () => {
    const result = isEmbeddableUrl('https://random-site.com/page')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('not supported')
  })

  it('rejects invalid URL format', () => {
    const result = isEmbeddableUrl('not-a-url')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid')
  })
})

describe('EmbedEditor', () => {
  const mockAreas: Area[] = [
    { id: 'entry-hall', name: 'Entry Hall', order: 0, badges: [], details: [], images: [], embedUrls: [] },
    { id: 'main-concourse', name: 'Main Concourse', order: 1, badges: [], details: [], images: [], embedUrls: [] },
    { id: 'platforms', name: 'Platforms', order: 2, badges: [], details: [], images: [], embedUrls: [] },
  ]

  const mockEmbeddings = {
    'entry-hall': ['https://bindiweb.com/map/venue123'],
  }

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    areas: mockAreas,
    embeddings: mockEmbeddings,
    orphaned: [],
    onSave: vi.fn(),
    onResolveOrphan: vi.fn(),
    isSaving: false,
  }

  it('renders input fields for each area', () => {
    render(<EmbedEditor {...defaultProps} />)

    expect(screen.getByText('Entry Hall')).toBeInTheDocument()
    expect(screen.getByText('Main Concourse')).toBeInTheDocument()
    expect(screen.getByText('Platforms')).toBeInTheDocument()
  })

  it('shows existing embeddings in input fields', () => {
    render(<EmbedEditor {...defaultProps} />)

    const entryInput = screen.getByLabelText('Entry Hall embed URL 1')
    expect(entryInput).toHaveValue('https://bindiweb.com/map/venue123')
  })

  it('validates URLs on blur', async () => {
    const user = userEvent.setup()
    render(<EmbedEditor {...defaultProps} />)

    const concourseInput = screen.getByLabelText('Main Concourse embed URL 1')
    await user.type(concourseInput, 'not-a-valid-url')
    await user.tab() // blur

    await waitFor(() => {
      expect(screen.getByText(/invalid url/i)).toBeInTheDocument()
    })
  })

  it('accepts valid embeddable URLs', async () => {
    const user = userEvent.setup()
    render(<EmbedEditor {...defaultProps} />)

    const concourseInput = screen.getByLabelText('Main Concourse embed URL 1')
    await user.type(concourseInput, 'https://www.youtube.com/embed/abc123')
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText(/invalid url/i)).not.toBeInTheDocument()
    })
  })

  it('shows error for non-embeddable domains', async () => {
    const user = userEvent.setup()
    render(<EmbedEditor {...defaultProps} />)

    const concourseInput = screen.getByLabelText('Main Concourse embed URL 1')
    await user.type(concourseInput, 'https://random-site.com/page')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/domain not supported/i)).toBeInTheDocument()
    })
  })

  it('calls onSave with updated embeddings', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<EmbedEditor {...defaultProps} onSave={onSave} />)

    const concourseInput = screen.getByLabelText('Main Concourse embed URL 1')
    await user.type(concourseInput, 'https://www.youtube.com/embed/xyz789')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith({
      'entry-hall': ['https://bindiweb.com/map/venue123'],
      'main-concourse': ['https://www.youtube.com/embed/xyz789'],
    })
  })

  it('removes empty URLs from saved embeddings', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<EmbedEditor {...defaultProps} onSave={onSave} />)

    // Clear the existing entry-hall URL
    const entryInput = screen.getByLabelText('Entry Hall embed URL 1')
    await user.clear(entryInput)

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith({})
  })

  it('disables save button while saving', () => {
    render(<EmbedEditor {...defaultProps} isSaving={true} />)

    const saveButton = screen.getByRole('button', { name: /saving/i })
    expect(saveButton).toBeDisabled()
  })

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<EmbedEditor {...defaultProps} onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('prevents save when validation errors exist', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<EmbedEditor {...defaultProps} onSave={onSave} />)

    const concourseInput = screen.getByLabelText('Main Concourse embed URL 1')
    await user.type(concourseInput, 'not-valid')
    await user.tab()

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(onSave).not.toHaveBeenCalled()
  })
})
