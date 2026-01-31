import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FacilitiesSection } from './FacilitiesSection'
import type { Guide } from '@/lib/schemas/guideSchema'

const emptyFacilities: Guide['facilities'] = {
  exits: [],
  bathrooms: [],
  quietZones: [],
}

const facilitiesWithMapLinks: Guide['facilities'] = {
  exits: [
    { description: 'Main exit via lobby', mapUrl: 'https://maps.example.com/exit1' },
    { description: 'Side exit near cafe' },
  ],
  bathrooms: [
    { description: 'Ground floor near lifts', mapUrl: 'https://maps.example.com/bathroom' },
  ],
  quietZones: [
    { description: 'Library reading room' },
  ],
}

const facilitiesWithoutMapLinks: Guide['facilities'] = {
  exits: [{ description: 'Emergency exit' }],
  bathrooms: [{ description: 'Level 2' }],
  quietZones: [],
}

describe('FacilitiesSection', () => {
  describe('rendering', () => {
    it('returns null when no facilities', () => {
      const { container } = render(<FacilitiesSection facilities={emptyFacilities} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders "Key Facilities" heading', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      expect(screen.getByRole('heading', { level: 2, name: 'Key Facilities' })).toBeInTheDocument()
    })

    it('renders exits section with items', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      expect(screen.getByRole('heading', { level: 3, name: 'Exits' })).toBeInTheDocument()
      expect(screen.getByText('Main exit via lobby')).toBeInTheDocument()
      expect(screen.getByText('Side exit near cafe')).toBeInTheDocument()
    })

    it('renders bathrooms section with items', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      expect(screen.getByRole('heading', { level: 3, name: 'Bathrooms' })).toBeInTheDocument()
      expect(screen.getByText('Ground floor near lifts')).toBeInTheDocument()
    })

    it('renders quiet zones section with items', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      expect(screen.getByRole('heading', { level: 3, name: 'Quiet Zones' })).toBeInTheDocument()
      expect(screen.getByText('Library reading room')).toBeInTheDocument()
    })
  })

  describe('external link indicators', () => {
    it('renders map links with target="_blank"', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      const mapLinks = screen.getAllByRole('link', { name: /View map/i })
      expect(mapLinks).toHaveLength(2) // exit + bathroom
      mapLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
      })
    })

    it('renders map links with rel="noopener noreferrer"', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      const mapLinks = screen.getAllByRole('link', { name: /View map/i })
      mapLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('renders external link icon (↗) in map links', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      const mapLinks = screen.getAllByRole('link', { name: /View map/i })
      mapLinks.forEach((link) => {
        expect(link.textContent).toContain('↗')
      })
    })

    it('renders sr-only text for screen readers', () => {
      render(<FacilitiesSection facilities={facilitiesWithMapLinks} />)
      const srOnlyTexts = screen.getAllByText('(opens in new tab)')
      expect(srOnlyTexts.length).toBeGreaterThanOrEqual(2)
      srOnlyTexts.forEach((el) => {
        expect(el).toHaveClass('sr-only')
      })
    })

    it('does not render map link when mapUrl is absent', () => {
      render(<FacilitiesSection facilities={facilitiesWithoutMapLinks} />)
      expect(screen.queryByRole('link', { name: /View map/i })).not.toBeInTheDocument()
    })
  })
})
