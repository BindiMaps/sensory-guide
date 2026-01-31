import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SensoryDetail } from './SensoryDetail'
import type { SensoryDetail as SensoryDetailType } from '@/lib/schemas/guideSchema'

const mockDetailWithImage: SensoryDetailType = {
  category: 'Sound',
  level: 'medium',
  description: 'Moderate background noise from HVAC.',
  imageUrl: 'https://example.com/sound-image.jpg',
}

const mockDetailWithoutImage: SensoryDetailType = {
  category: 'Light',
  level: 'high',
  description: 'Bright fluorescent lighting throughout.',
}

describe('SensoryDetail', () => {
  beforeEach(() => {
    // Mock matchMedia for ImageLightbox
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('rendering', () => {
    it('renders category as heading', () => {
      render(<SensoryDetail detail={mockDetailWithoutImage} />)
      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<SensoryDetail detail={mockDetailWithoutImage} />)
      expect(screen.getByText('Bright fluorescent lighting throughout.')).toBeInTheDocument()
    })
  })

  describe('image alt text', () => {
    it('renders image with descriptive alt text when imageUrl present', () => {
      render(<SensoryDetail detail={mockDetailWithImage} sectionTitle="Main Entry" />)
      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('alt', 'Sound detail for this area')
    })

    it('alt text includes category name', () => {
      render(<SensoryDetail detail={mockDetailWithImage} />)
      const image = screen.getByRole('img')
      expect(image.getAttribute('alt')).toContain('Sound')
    })

    it('does not render image when imageUrl is absent', () => {
      render(<SensoryDetail detail={mockDetailWithoutImage} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
