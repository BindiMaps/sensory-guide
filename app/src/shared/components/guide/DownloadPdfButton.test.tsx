import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GuidePdfActions } from './DownloadPdfButton'
import type { Guide } from '@/lib/schemas/guideSchema'

const mockGuide: Guide = {
  schemaVersion: '1.0',
  venue: {
    name: 'Test Venue',
    address: '123 Test St',
    contact: '1234567890',
    summary: 'A test venue',
    lastUpdated: '2024-01-01',
  },
  areas: [
    {
      id: 'area-1',
      name: 'Test Area',
      order: 1,
      badges: ['Sound'],
      details: [
        {
          category: 'Sound',
          level: 'medium',
          description: 'Test description',
        },
      ],
      images: [],
      embedUrls: [],
    },
  ],
  facilities: {
    exits: [],
    bathrooms: [],
    quietZones: [],
  },
  categories: ['Sound'],
  suggestions: [],
  generatedAt: '2024-01-01T00:00:00Z',
}

describe('GuidePdfActions', () => {
  it('renders print button', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const button = screen.getByRole('button', { name: /print/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Print')
  })

  it('renders save/download button', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const button = screen.getByRole('button', { name: /download/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Save')
  })

  it('both buttons have minimum 44px touch target height', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const printButton = screen.getByRole('button', { name: /print/i })
    const saveButton = screen.getByRole('button', { name: /download/i })

    expect(printButton).toHaveClass('min-h-[44px]')
    expect(saveButton).toHaveClass('min-h-[44px]')
  })

  it('buttons have focus-visible ring for keyboard navigation', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const printButton = screen.getByRole('button', { name: /print/i })
    expect(printButton).toHaveClass('focus-visible:ring-2')
    expect(printButton).toHaveClass('focus-visible:ring-[#B8510D]')
  })

  it('buttons contain icons', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const printButton = screen.getByRole('button', { name: /print/i })
    const saveButton = screen.getByRole('button', { name: /download/i })

    expect(printButton.querySelector('svg')).toBeInTheDocument()
    expect(saveButton.querySelector('svg')).toBeInTheDocument()
  })

  it('buttons are not disabled by default', () => {
    render(<GuidePdfActions guide={mockGuide} />)

    const printButton = screen.getByRole('button', { name: /print/i })
    const saveButton = screen.getByRole('button', { name: /download/i })

    expect(printButton).not.toBeDisabled()
    expect(saveButton).not.toBeDisabled()
  })
})
