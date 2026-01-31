/**
 * PDF Image Pipeline
 *
 * Orchestrates the complete image extraction flow:
 * 1. Extract images and text positions from PDF
 * 2. Detect headings and map images to sections
 * 3. Upload images to Cloud Storage
 * 4. Attach image URLs to guide JSON
 */

import type { Guide, Area } from '../schemas/guideSchema'
import { extractPdfContent, type PdfContent } from './extractPdfContent'
import {
  detectHeadings,
  mapImagesToSections,
  mapImagesByPageText,
  type SectionImageMapping,
} from './imageMapping'
import { uploadBatchImages, deleteVenueImages, type UploadedImage } from './imageStorage'

/**
 * Result of the image pipeline
 */
export interface ImagePipelineResult {
  /** Number of images extracted from PDF */
  imagesExtracted: number
  /** Number of images successfully uploaded */
  imagesUploaded: number
  /** Number of sections that received images */
  sectionsWithImages: number
  /** Warnings/issues encountered */
  warnings: string[]
}

/**
 * Attach image URLs to guide areas
 *
 * Modifies the guide in place, adding `images` arrays to matching areas.
 */
function attachImagesToGuide(
  guide: Guide,
  sectionImages: Map<string, UploadedImage[]>
): void {
  for (const area of guide.areas) {
    const uploaded = sectionImages.get(area.id) || sectionImages.get(area.name)

    if (uploaded && uploaded.length > 0) {
      // Add images array to area (TypeScript allows this since schema has images field)
      ;(area as Area & { images: string[] }).images = uploaded.map((img) => img.publicUrl)
    }
  }
}

/**
 * Process PDF for images and attach to guide
 *
 * This is the main entry point called from transformPdf after Gemini processing.
 *
 * @param pdfBuffer - The original PDF file buffer
 * @param guide - The guide JSON from Gemini (will be modified in place)
 * @param venueId - Venue ID for storage path
 * @returns Pipeline result with stats
 */
export async function processPdfImages(
  pdfBuffer: Buffer,
  guide: Guide,
  venueId: string
): Promise<ImagePipelineResult> {
  const result: ImagePipelineResult = {
    imagesExtracted: 0,
    imagesUploaded: 0,
    sectionsWithImages: 0,
    warnings: [],
  }

  // Step 1: Extract content from PDF
  let pdfContent: PdfContent
  try {
    pdfContent = await extractPdfContent(pdfBuffer)
    result.imagesExtracted = pdfContent.images.length
  } catch (err) {
    result.warnings.push(`PDF content extraction failed: ${(err as Error).message}`)
    return result // Graceful degradation - guide works without images
  }

  // No images? Early return
  if (pdfContent.images.length === 0) {
    result.warnings.push('No images found in PDF')
    return result
  }

  // Step 2: Map images to sections using page-text analysis
  const sectionTitles = guide.areas.map((a) => a.name)
  let mappings: SectionImageMapping[]

  try {
    // Primary approach: use page text to determine which section each page belongs to
    // This correctly handles: multiple images per section, sections without images,
    // and sections spanning multiple pages
    if (pdfContent.pageTexts.size > 0) {
      mappings = mapImagesByPageText(pdfContent.images, pdfContent.pageTexts, sectionTitles)
    } else if (pdfContent.textBlocks.length > 0) {
      // Fallback: use text blocks with font-size based heading detection
      const headings = detectHeadings(pdfContent.textBlocks)
      if (headings.length > 0) {
        mappings = mapImagesToSections(pdfContent.images, headings, sectionTitles)
      } else {
        result.warnings.push('No page text or headings available for mapping')
        mappings = sectionTitles.map((title) => ({
          sectionTitle: title,
          normalisedTitle: title.toLowerCase(),
          images: [],
        }))
      }
    } else {
      result.warnings.push('No text available for image-to-section mapping')
      mappings = sectionTitles.map((title) => ({
        sectionTitle: title,
        normalisedTitle: title.toLowerCase(),
        images: [],
      }))
    }
  } catch (err) {
    result.warnings.push(`Image mapping failed: ${(err as Error).message}`)
    mappings = sectionTitles.map((title) => ({
      sectionTitle: title,
      normalisedTitle: title.toLowerCase(),
      images: [],
    }))
  }

  // Step 3: Build section ID -> images map for upload
  // Use area.id for storage paths (URL-safe)
  const sectionImageMap = new Map<string, typeof pdfContent.images>()

  for (const mapping of mappings) {
    // Find the area that matches this section
    const area = guide.areas.find(
      (a) => a.name === mapping.sectionTitle || a.id === mapping.normalisedTitle
    )

    if (area && mapping.images.length > 0) {
      sectionImageMap.set(area.id, mapping.images)
    }
  }

  // Step 4: Delete existing images and upload new ones
  try {
    await deleteVenueImages(venueId)

    const uploadResult = await uploadBatchImages(venueId, sectionImageMap)
    result.imagesUploaded = uploadResult.totalUploaded
    result.sectionsWithImages = uploadResult.sectionImages.size - uploadResult.sectionsWithoutImages.length

    // Step 5: Attach URLs to guide
    attachImagesToGuide(guide, uploadResult.sectionImages)
  } catch (err) {
    result.warnings.push(`Image upload failed: ${(err as Error).message}`)
    // Guide still works, just without images
  }

  return result
}

/**
 * Check if a PDF buffer likely contains images
 *
 * Quick heuristic check without full parsing.
 * Looks for common image stream markers in PDF.
 */
export function pdfLikelyHasImages(pdfBuffer: Buffer): boolean {
  const str = pdfBuffer.toString('latin1', 0, Math.min(pdfBuffer.length, 100000))

  // Check for common image-related PDF operators/streams
  const imageMarkers = [
    '/Image',
    '/XObject',
    '/DCTDecode', // JPEG
    '/FlateDecode', // PNG-like
    '/JPXDecode', // JPEG2000
  ]

  return imageMarkers.some((marker) => str.includes(marker))
}
