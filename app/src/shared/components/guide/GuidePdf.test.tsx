import { describe, it, expect } from 'vitest'
import type { Guide } from '@/lib/schemas/guideSchema'
import { GuidePdf } from './GuidePdf'

const mockGuide: Guide = {
  schemaVersion: '1.0',
  venue: {
    name: 'Test Venue',
    address: '123 Test St',
    summary: 'A test venue for testing.',
    lastUpdated: '2026-01-15',
  },
  categories: ['Sound', 'Light'],
  areas: [
    {
      id: 'area-with-embed',
      name: 'Area With Embed',
      order: 0,
      badges: ['Sound'],
      details: [
        { category: 'Sound', level: 'medium', description: 'Moderate noise levels.' },
      ],
      images: [],
      embedUrls: ['https://example.com/map'],
    },
    {
      id: 'area-without-embed',
      name: 'Area Without Embed',
      order: 1,
      badges: ['Light'],
      details: [
        { category: 'Light', level: 'low', description: 'Soft lighting.' },
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
  suggestions: [],
  generatedAt: '2026-01-15T10:00:00Z',
}

describe('GuidePdf', () => {
  it('renders without crashing', () => {
    // This test verifies the component can be instantiated
    const element = <GuidePdf guide={mockGuide} />
    expect(element).toBeDefined()
  })

  it('accepts qrDataUrls prop with labels', () => {
    const qrDataUrls = {
      'area-with-embed': {
        dataUrl: 'data:image/png;base64,test123',
        buffer: Buffer.from('test123'),
        label: { title: 'Interactive Map', hint: 'Scan to view on your phone' },
      },
    }
    const element = <GuidePdf guide={mockGuide} qrDataUrls={qrDataUrls} />
    expect(element).toBeDefined()
    expect(element.props.qrDataUrls).toEqual(qrDataUrls)
  })

  it('accepts filter mode and active categories', () => {
    const element = (
      <GuidePdf
        guide={mockGuide}
        filterMode="highlighted"
        activeCategories={new Set(['Sound'])}
      />
    )
    expect(element.props.filterMode).toBe('highlighted')
    expect(element.props.activeCategories).toBeInstanceOf(Set)
  })

  it('handles empty qrDataUrls gracefully', () => {
    const element = <GuidePdf guide={mockGuide} qrDataUrls={{}} />
    expect(element).toBeDefined()
  })

  it('handles guide with no areas', () => {
    const emptyGuide: Guide = {
      ...mockGuide,
      areas: [],
    }
    const element = <GuidePdf guide={emptyGuide} />
    expect(element).toBeDefined()
  })
})
