/**
 * Image-to-Section Mapping
 *
 * Maps extracted images to their corresponding guide sections based on:
 * 1. Page association (images and headings on the same page)
 * 2. Heading detection (larger font size = heading)
 * 3. Y-position ordering within a page
 */

import type { TextBlock, ExtractedImage } from './extractPdfContent'

/**
 * Detected heading in the PDF
 */
export interface DetectedHeading {
  text: string
  page: number
  y: number
  fontSize: number
  /** Normalised title for matching with Gemini output */
  normalisedText: string
}

/**
 * Mapping result: which images belong to which section
 */
export interface SectionImageMapping {
  /** Section title (as it appears in the guide JSON) */
  sectionTitle: string
  /** Normalised version for fuzzy matching */
  normalisedTitle: string
  /** Images associated with this section */
  images: ExtractedImage[]
}

/**
 * Configuration for heading detection
 */
interface HeadingDetectionConfig {
  /** Minimum font size ratio vs median to be considered a heading (default: 1.2) */
  fontSizeRatio: number
  /** Minimum text length to be a heading (default: 3) */
  minLength: number
  /** Maximum text length to be a heading (default: 100) */
  maxLength: number
}

const DEFAULT_CONFIG: HeadingDetectionConfig = {
  fontSizeRatio: 1.2,
  minLength: 3,
  maxLength: 100,
}

/**
 * Normalise text for matching
 * - Lowercase
 * - Remove extra whitespace
 * - Remove common punctuation
 */
export function normaliseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}

/**
 * Calculate median font size from text blocks
 */
function calculateMedianFontSize(textBlocks: TextBlock[]): number {
  if (textBlocks.length === 0) return 12 // Default

  const fontSizes = textBlocks.map((b) => b.fontSize).sort((a, b) => a - b)
  const mid = Math.floor(fontSizes.length / 2)

  if (fontSizes.length % 2 === 0) {
    return (fontSizes[mid - 1] + fontSizes[mid]) / 2
  }
  return fontSizes[mid]
}

/**
 * Detect headings from text blocks based on font size
 *
 * Strategy:
 * 1. Calculate median font size
 * 2. Blocks with font size > median * ratio are likely headings
 * 3. Filter by reasonable length (not too short, not too long)
 */
export function detectHeadings(
  textBlocks: TextBlock[],
  config: Partial<HeadingDetectionConfig> = {}
): DetectedHeading[] {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const medianFontSize = calculateMedianFontSize(textBlocks)
  const headingThreshold = medianFontSize * cfg.fontSizeRatio

  const headings: DetectedHeading[] = []

  for (const block of textBlocks) {
    const text = block.text.trim()

    // Skip if too short or too long
    if (text.length < cfg.minLength || text.length > cfg.maxLength) {
      continue
    }

    // Skip if font size is below threshold
    if (block.fontSize < headingThreshold) {
      continue
    }

    // Skip if looks like a sentence (ends with period, has many words)
    if (text.endsWith('.') && text.split(/\s+/).length > 10) {
      continue
    }

    headings.push({
      text,
      page: block.page,
      y: block.y,
      fontSize: block.fontSize,
      normalisedText: normaliseText(text),
    })
  }

  // Sort by page, then by y position (descending - PDF y=0 is at bottom)
  return headings.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page
    return b.y - a.y // Higher y = earlier in page (top of page)
  })
}

/**
 * Find which heading an image belongs to based on page and position
 *
 * Logic:
 * - Images are matched to headings on the same page
 * - Within a page, images are assigned to the heading that appears before them
 * - If an image is before the first heading on a page, it goes to the last heading on the previous page
 */
function findHeadingForImage(
  image: ExtractedImage,
  headings: DetectedHeading[]
): DetectedHeading | null {
  // Filter headings on the same page
  const pageHeadings = headings.filter((h) => h.page === image.page)

  if (pageHeadings.length === 0) {
    // No headings on this page - try to find the closest heading on an earlier page
    const earlierHeadings = headings.filter((h) => h.page < image.page)
    return earlierHeadings.length > 0 ? earlierHeadings[earlierHeadings.length - 1] : null
  }

  // For simplicity in the hybrid approach:
  // Assign images to headings in order (first image -> first heading, etc.)
  // This works well when PDFs have one image per section
  return pageHeadings[Math.min(image.index, pageHeadings.length - 1)]
}

/**
 * Map images to sections
 *
 * @param images - Extracted images from PDF
 * @param headings - Detected headings from PDF
 * @param sectionTitles - Section titles from Gemini output (guide.areas[].name)
 * @returns Mapping of section titles to their images
 */
export function mapImagesToSections(
  images: ExtractedImage[],
  headings: DetectedHeading[],
  sectionTitles: string[]
): SectionImageMapping[] {
  // Create normalised lookup for section titles
  const sectionLookup = new Map<string, SectionImageMapping>()

  for (const title of sectionTitles) {
    const normalised = normaliseText(title)
    sectionLookup.set(normalised, {
      sectionTitle: title,
      normalisedTitle: normalised,
      images: [],
    })
  }

  // Map each image to a heading, then match heading to section
  for (const image of images) {
    const heading = findHeadingForImage(image, headings)

    if (!heading) {
      console.warn(`No heading found for image on page ${image.page}, index ${image.index}`)
      continue
    }

    // Try to match heading to a section title
    const normalisedHeading = heading.normalisedText

    // Exact match first
    if (sectionLookup.has(normalisedHeading)) {
      sectionLookup.get(normalisedHeading)!.images.push(image)
      continue
    }

    // Fuzzy match: check if section title contains the heading or vice versa
    let matched = false
    for (const [normalised, mapping] of sectionLookup) {
      if (normalised.includes(normalisedHeading) || normalisedHeading.includes(normalised)) {
        mapping.images.push(image)
        matched = true
        break
      }
    }

    if (!matched) {
      console.warn(
        `Could not match heading "${heading.text}" to any section. Available: ${sectionTitles.join(', ')}`
      )
    }
  }

  return Array.from(sectionLookup.values())
}

/**
 * Find section titles that appear as HEADINGS in page text
 *
 * Strategy: Scan lines looking for standalone section headings.
 * A line is considered a heading if:
 * 1. It matches a known section title (exact or close match)
 * 2. It's NOT a bullet point or list item
 * 3. For non-exact matches: it's short and doesn't look like body text
 *
 * @param pageText - Raw text from the page
 * @param sectionTitles - Known section titles to look for
 * @returns Array of { title, lineIndex } for each section found, in order of appearance
 */
function findSectionTitlesInPage(
  pageText: string,
  sectionTitles: string[]
): { title: string; lineIndex: number }[] {
  const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean)
  const results: { title: string; lineIndex: number }[] = []
  const foundTitles = new Set<string>() // Avoid duplicates

  // Pre-normalize section titles for quick lookup
  const normalizedTitles = new Map<string, string>()
  for (const title of sectionTitles) {
    normalizedTitles.set(normaliseText(title), title)
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip bullet points and list items
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('o ')) continue
    if (line.startsWith('*') || line.startsWith('–')) continue
    if (/^\d+\./.test(line)) continue

    // Clean the line for matching (remove trailing colon)
    const cleanedLine = line.replace(/:$/, '').trim()
    if (cleanedLine.length < 3) continue

    const normalizedLine = normaliseText(cleanedLine)

    // First check for EXACT match (bypass other filters for known titles)
    if (normalizedTitles.has(normalizedLine)) {
      const match = normalizedTitles.get(normalizedLine)!
      if (!foundTitles.has(match)) {
        results.push({ title: match, lineIndex: i })
        foundTitles.add(match)
      }
      continue
    }

    // For non-exact matches, apply stricter filters
    if (line.length > 40) continue // Too long for a heading
    if (line.endsWith('.') || line.endsWith(',') || line.endsWith(';')) continue

    // Skip lines that look like body text
    if (/\b(the|was|were|is|are|that|which|with|this|and|but|for|have|has)\b/i.test(line)) {
      continue
    }

    // Try close match
    const match = findExactOrCloseMatch(cleanedLine, sectionTitles)
    if (match && !foundTitles.has(match)) {
      results.push({ title: match, lineIndex: i })
      foundTitles.add(match)
    }
  }

  return results
}

/**
 * Find exact or very close match between a line and section titles
 * Requires high similarity to avoid false positives
 */
function findExactOrCloseMatch(line: string, sectionTitles: string[]): string | null {
  const normLine = normaliseText(line)

  // 1. Exact match (after normalisation)
  for (const title of sectionTitles) {
    if (normaliseText(title) === normLine) {
      return title
    }
  }

  // 2. Line equals section title (case-insensitive, ignoring trailing colon)
  for (const title of sectionTitles) {
    const normTitle = normaliseText(title)
    // Line must be very close to title length (within 20%)
    const lengthRatio = normLine.length / normTitle.length
    if (lengthRatio < 0.8 || lengthRatio > 1.2) continue

    // Check if one contains the other AND they're similar length
    if (normLine.includes(normTitle) || normTitle.includes(normLine)) {
      return title
    }
  }

  return null
}

/**
 * Page-based image mapping using text analysis and position heuristics
 *
 * Strategy:
 * 1. Track which section is "active" for image assignment
 * 2. Sections that start at line 0 (top of page) own that page's images
 * 3. For continuation pages (start with bullet points):
 *    - If first heading is in FIRST HALF of page: images belong to PREVIOUS section (continuation)
 *    - If first heading is in SECOND HALF of page: images belong to THAT heading
 * 4. Track "active section at end of page" separately for continuation logic
 *
 * This handles:
 * - Images in continuation areas (before mid-page headings)
 * - Images after late-appearing headings
 * - Sections without images
 *
 * @param images - Extracted images with page numbers
 * @param pageTexts - Text content per page
 * @param sectionTitles - Section titles from Gemini output (guide.areas[].name)
 * @returns Mapping of section titles to their images
 */
export function mapImagesByPageText(
  images: ExtractedImage[],
  pageTexts: Map<number, string>,
  sectionTitles: string[]
): SectionImageMapping[] {
  // Initialize mappings for all sections
  const mappings = new Map<string, SectionImageMapping>()
  for (const title of sectionTitles) {
    mappings.set(title, {
      sectionTitle: title,
      normalisedTitle: normaliseText(title),
      images: [],
    })
  }

  if (images.length === 0 || sectionTitles.length === 0) {
    return Array.from(mappings.values())
  }

  // Build page → section mapping with position-aware heuristics
  const pageToSection = new Map<number, string>()

  // Track the section that would continue to the next page
  // This is the LAST heading seen that started a section
  let continuationSection: string | null = null

  const sortedPages = Array.from(pageTexts.keys()).sort((a, b) => a - b)

  for (const pageNum of sortedPages) {
    const pageText = pageTexts.get(pageNum) || ''
    const lines = pageText.split('\n').map((l) => l.trim()).filter(Boolean)
    const totalLines = lines.length

    // Find all section headings on this page
    const sectionsOnPage = findSectionTitlesInPage(pageText, sectionTitles)

    // Check if page starts with a heading (line 0 or 1)
    const startsWithHeading = sectionsOnPage.length > 0 && sectionsOnPage[0].lineIndex <= 1

    let imageSectionForThisPage: string | null = null

    if (startsWithHeading) {
      // Page starts with a heading - this section owns the images
      // BUT if page has multiple sections and multiple images, we'll handle distribution later
      imageSectionForThisPage = sectionsOnPage[0].title
      console.log(`  Page ${pageNum}: Starts with heading "${imageSectionForThisPage}"`)
    } else if (sectionsOnPage.length > 0) {
      // Page starts with continuation, but has heading(s) mid-page
      const firstHeading = sectionsOnPage[0]
      const lastHeading = sectionsOnPage[sectionsOnPage.length - 1]
      const firstHeadingPosition = totalLines > 0 ? firstHeading.lineIndex / totalLines : 0
      const lastHeadingPosition = totalLines > 0 ? lastHeading.lineIndex / totalLines : 0

      if (lastHeadingPosition >= 0.75) {
        // Last heading is very late - image likely in continuation before it
        imageSectionForThisPage = continuationSection
        console.log(`  Page ${pageNum}: Very late heading "${lastHeading.title}" at ${Math.round(lastHeadingPosition * 100)}% → images to continuation "${continuationSection}"`)
      } else if (sectionsOnPage.length === 1 && firstHeadingPosition < 0.35) {
        // Only ONE heading and it's very early - image likely in continuation before it
        imageSectionForThisPage = continuationSection
        console.log(`  Page ${pageNum}: Single early heading "${firstHeading.title}" at ${Math.round(firstHeadingPosition * 100)}% → images to continuation "${continuationSection}"`)
      } else if (sectionsOnPage.length > 1) {
        // Multiple headings - use FIRST mid-page heading (image typically follows first new section)
        imageSectionForThisPage = firstHeading.title
        console.log(`  Page ${pageNum}: Multiple headings, using first "${firstHeading.title}" at ${Math.round(firstHeadingPosition * 100)}%`)
      } else {
        // Single mid-page heading (35-75%) - image likely after it
        imageSectionForThisPage = firstHeading.title
        console.log(`  Page ${pageNum}: Mid-page heading "${firstHeading.title}" at ${Math.round(firstHeadingPosition * 100)}% → images to this section`)
      }
    } else {
      // No headings on this page - pure continuation
      imageSectionForThisPage = continuationSection
      console.log(`  Page ${pageNum}: Pure continuation of "${continuationSection}"`)
    }

    // Map this page to its image section
    if (imageSectionForThisPage) {
      pageToSection.set(pageNum, imageSectionForThisPage)
    }

    // Update continuation section for next page
    // Use the LAST heading on this page (represents where content continues to)
    if (sectionsOnPage.length > 0) {
      continuationSection = sectionsOnPage[sectionsOnPage.length - 1].title
    } else if (imageSectionForThisPage) {
      // No new headings, continuation stays the same
      continuationSection = imageSectionForThisPage
    }
  }

  // Debug: log the final page-to-section mapping
  console.log('\nFinal page to section mapping:')
  pageToSection.forEach((section, page) => {
    console.log(`  Page ${page} → "${section}"`)
  })

  // Build a map of page -> all sections on that page (for multi-section pages)
  const pageSections = new Map<number, string[]>()
  for (const pageNum of sortedPages) {
    const pageText = pageTexts.get(pageNum) || ''
    const sectionsOnPage = findSectionTitlesInPage(pageText, sectionTitles)
    if (sectionsOnPage.length > 0) {
      pageSections.set(pageNum, sectionsOnPage.map(s => s.title))
    }
  }

  // Assign images to sections
  // For pages with multiple sections AND multiple images, distribute them
  for (const image of images) {
    const pageNum = image.page
    const sectionsOnThisPage = pageSections.get(pageNum) || []
    const imagesOnThisPage = images.filter(i => i.page === pageNum)

    if (sectionsOnThisPage.length > 1 && imagesOnThisPage.length > 1) {
      // Multiple sections and multiple images on this page
      // Distribute: image index 0 → section 0, image index 1 → section 1, etc.
      const imageIndexOnPage = imagesOnThisPage.findIndex(i => i.index === image.index)
      const sectionIndex = Math.min(imageIndexOnPage, sectionsOnThisPage.length - 1)
      const section = sectionsOnThisPage[sectionIndex]

      if (mappings.has(section)) {
        mappings.get(section)!.images.push(image)
      } else {
        console.warn(`Section "${section}" not found in mappings`)
      }
    } else {
      // Single section or single image - use the page mapping
      const section = pageToSection.get(pageNum)
      if (section && mappings.has(section)) {
        mappings.get(section)!.images.push(image)
      } else {
        console.warn(`No section found for image on page ${pageNum}`)
      }
    }
  }

  return Array.from(mappings.values())
}

/**
 * Simple page-based mapping fallback (DEPRECATED - use mapImagesByPageText)
 *
 * This naive approach distributes images 1:1 to sections, which is incorrect
 * when sections have different numbers of images or no images at all.
 *
 * @deprecated Use mapImagesByPageText instead
 */
export function mapImagesByPageOrder(
  images: ExtractedImage[],
  sectionTitles: string[]
): SectionImageMapping[] {
  const mappings: SectionImageMapping[] = sectionTitles.map((title) => ({
    sectionTitle: title,
    normalisedTitle: normaliseText(title),
    images: [],
  }))

  if (mappings.length === 0 || images.length === 0) {
    return mappings
  }

  // Sort images by page, then by index
  const sortedImages = [...images].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page
    return a.index - b.index
  })

  // Distribute images across sections proportionally
  // Simple approach: assign images in order to sections in order
  let sectionIndex = 0
  for (const image of sortedImages) {
    if (sectionIndex < mappings.length) {
      mappings[sectionIndex].images.push(image)
      // Move to next section after adding an image
      // (assumes roughly 1 image per section)
      sectionIndex++
    } else {
      // More images than sections - add to last section
      mappings[mappings.length - 1].images.push(image)
    }
  }

  return mappings
}
