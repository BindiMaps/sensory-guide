import { describe, it, expect } from 'vitest'
import {
  normaliseText,
  detectHeadings,
  mapImagesToSections,
  mapImagesByPageOrder,
  type DetectedHeading,
} from './imageMapping'
import type { TextBlock, ExtractedImage } from './extractPdfContent'

describe('normaliseText', () => {
  it('should lowercase and trim', () => {
    expect(normaliseText('  Entry Hall  ')).toBe('entry hall')
  })

  it('should remove punctuation', () => {
    expect(normaliseText('Entry Hall:')).toBe('entry hall')
    expect(normaliseText("Main Concourse (Level 1)")).toBe('main concourse level 1')
  })

  it('should collapse whitespace', () => {
    expect(normaliseText('Entry   Hall')).toBe('entry hall')
  })
})

describe('detectHeadings', () => {
  it('should detect larger font sizes as headings', () => {
    const textBlocks: TextBlock[] = [
      { text: 'Entry Hall', page: 1, y: 700, fontSize: 18, fontName: 'Arial-Bold' },
      { text: 'This is regular body text about the entry.', page: 1, y: 650, fontSize: 12, fontName: 'Arial' },
      { text: 'Main Concourse', page: 1, y: 500, fontSize: 18, fontName: 'Arial-Bold' },
      { text: 'More body text here.', page: 1, y: 450, fontSize: 12, fontName: 'Arial' },
    ]

    const headings = detectHeadings(textBlocks)

    expect(headings).toHaveLength(2)
    expect(headings[0].text).toBe('Entry Hall')
    expect(headings[1].text).toBe('Main Concourse')
  })

  it('should filter out very short text', () => {
    const textBlocks: TextBlock[] = [
      { text: 'A', page: 1, y: 700, fontSize: 18, fontName: 'Arial' }, // Too short
      { text: 'Entry Hall', page: 1, y: 650, fontSize: 18, fontName: 'Arial' },
      // Multiple body text lines to get median down (median of [12,12,12,18,18] = 12)
      { text: 'Body text here.', page: 1, y: 600, fontSize: 12, fontName: 'Arial' },
      { text: 'More body text.', page: 1, y: 550, fontSize: 12, fontName: 'Arial' },
      { text: 'Even more text.', page: 1, y: 500, fontSize: 12, fontName: 'Arial' },
    ]

    const headings = detectHeadings(textBlocks, { minLength: 3 })

    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Entry Hall')
  })

  it('should filter out very long text', () => {
    const textBlocks: TextBlock[] = [
      { text: 'Entry Hall', page: 1, y: 700, fontSize: 18, fontName: 'Arial' },
      { text: 'This is a very long piece of text that is definitely not a heading because headings are typically short and descriptive.', page: 1, y: 650, fontSize: 18, fontName: 'Arial' },
      // Multiple body text lines to get median down
      { text: 'Body text here.', page: 1, y: 600, fontSize: 12, fontName: 'Arial' },
      { text: 'More body text.', page: 1, y: 550, fontSize: 12, fontName: 'Arial' },
      { text: 'Even more text.', page: 1, y: 500, fontSize: 12, fontName: 'Arial' },
    ]

    const headings = detectHeadings(textBlocks, { maxLength: 50 })

    expect(headings).toHaveLength(1)
    expect(headings[0].text).toBe('Entry Hall')
  })

  it('should sort by page then y position (descending)', () => {
    const textBlocks: TextBlock[] = [
      { text: 'Third Heading', page: 2, y: 600, fontSize: 16, fontName: 'Arial' },
      { text: 'First Heading', page: 1, y: 700, fontSize: 16, fontName: 'Arial' },
      { text: 'Second Heading', page: 1, y: 500, fontSize: 16, fontName: 'Arial' },
    ]

    const headings = detectHeadings(textBlocks, { fontSizeRatio: 1.0 })

    expect(headings[0].text).toBe('First Heading') // Page 1, highest y
    expect(headings[1].text).toBe('Second Heading') // Page 1, lower y
    expect(headings[2].text).toBe('Third Heading') // Page 2
  })

  it('should return empty array when no text blocks', () => {
    const headings = detectHeadings([])
    expect(headings).toHaveLength(0)
  })
})

describe('mapImagesToSections', () => {
  const createImage = (page: number, index: number): ExtractedImage => ({
    data: Buffer.from('fake'),
    page,
    index,
    width: 100,
    height: 100,
    name: `img-${page}-${index}`,
  })

  const createHeading = (text: string, page: number, y: number): DetectedHeading => ({
    text,
    page,
    y,
    fontSize: 16,
    normalisedText: normaliseText(text),
  })

  it('should map images to sections with exact match', () => {
    const images = [createImage(1, 0)]
    const headings = [createHeading('Entry Hall', 1, 700)]
    const sectionTitles = ['Entry Hall']

    const mappings = mapImagesToSections(images, headings, sectionTitles)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].sectionTitle).toBe('Entry Hall')
    expect(mappings[0].images).toHaveLength(1)
  })

  it('should map images to sections with fuzzy match', () => {
    const images = [createImage(1, 0)]
    const headings = [createHeading('Entry Hall Area', 1, 700)]
    const sectionTitles = ['Entry Hall']

    const mappings = mapImagesToSections(images, headings, sectionTitles)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].sectionTitle).toBe('Entry Hall')
    expect(mappings[0].images).toHaveLength(1)
  })

  it('should handle multiple images per section', () => {
    const images = [createImage(1, 0), createImage(1, 1)]
    const headings = [createHeading('Entry Hall', 1, 700)]
    const sectionTitles = ['Entry Hall']

    const mappings = mapImagesToSections(images, headings, sectionTitles)

    expect(mappings[0].images).toHaveLength(2)
  })

  it('should handle images before first heading (previous page heading)', () => {
    const images = [createImage(2, 0)]
    const headings = [createHeading('Entry Hall', 1, 700)]
    const sectionTitles = ['Entry Hall']

    const mappings = mapImagesToSections(images, headings, sectionTitles)

    // Image on page 2 should be mapped to heading on page 1
    expect(mappings[0].images).toHaveLength(1)
  })

  it('should return empty images for sections without matches', () => {
    const images: ExtractedImage[] = []
    const headings: DetectedHeading[] = []
    const sectionTitles = ['Entry Hall', 'Main Concourse']

    const mappings = mapImagesToSections(images, headings, sectionTitles)

    expect(mappings).toHaveLength(2)
    expect(mappings[0].images).toHaveLength(0)
    expect(mappings[1].images).toHaveLength(0)
  })
})

describe('mapImagesByPageOrder', () => {
  const createImage = (page: number, index: number): ExtractedImage => ({
    data: Buffer.from('fake'),
    page,
    index,
    width: 100,
    height: 100,
    name: `img-${page}-${index}`,
  })

  it('should distribute images to sections in order', () => {
    const images = [createImage(1, 0), createImage(2, 0), createImage(3, 0)]
    const sectionTitles = ['Section A', 'Section B', 'Section C']

    const mappings = mapImagesByPageOrder(images, sectionTitles)

    expect(mappings[0].sectionTitle).toBe('Section A')
    expect(mappings[0].images).toHaveLength(1)
    expect(mappings[1].sectionTitle).toBe('Section B')
    expect(mappings[1].images).toHaveLength(1)
    expect(mappings[2].sectionTitle).toBe('Section C')
    expect(mappings[2].images).toHaveLength(1)
  })

  it('should add extra images to last section', () => {
    const images = [createImage(1, 0), createImage(2, 0), createImage(3, 0), createImage(4, 0)]
    const sectionTitles = ['Section A', 'Section B']

    const mappings = mapImagesByPageOrder(images, sectionTitles)

    expect(mappings[0].images).toHaveLength(1)
    expect(mappings[1].images).toHaveLength(3) // Last section gets extras
  })

  it('should handle no images', () => {
    const images: ExtractedImage[] = []
    const sectionTitles = ['Section A']

    const mappings = mapImagesByPageOrder(images, sectionTitles)

    expect(mappings[0].images).toHaveLength(0)
  })

  it('should handle no sections', () => {
    const images = [createImage(1, 0)]
    const sectionTitles: string[] = []

    const mappings = mapImagesByPageOrder(images, sectionTitles)

    expect(mappings).toHaveLength(0)
  })
})
