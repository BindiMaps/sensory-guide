/**
 * PDF Content Extraction
 *
 * Uses pdf-parse v2 for both text and image extraction.
 * Images are grouped by page number for section mapping.
 */

import { applyPdfjsPolyfills } from './pdfjsPolyfills'

// Lazy-loaded to avoid crashing non-PDF functions at startup
// (pdf-parse v2 bundles pdfjs-dist which requires browser globals like DOMMatrix)
function getPDFParse(): typeof import('pdf-parse').PDFParse {
  applyPdfjsPolyfills()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('pdf-parse').PDFParse
}

/**
 * Text block - simplified (no position data, just page-level)
 */
export interface TextBlock {
  text: string
  page: number
  y: number
  fontSize: number
  fontName: string
}

/**
 * Extracted image with page association
 */
export interface ExtractedImage {
  data: Buffer
  page: number
  index: number // Order within page (0-based)
  width: number
  height: number
  name: string
}

/**
 * Complete PDF content extraction result
 */
export interface PdfContent {
  textBlocks: TextBlock[]
  images: ExtractedImage[]
  pageCount: number
  /** Raw text per page for fallback */
  pageTexts: Map<number, string>
}

/**
 * Extract images using pdf-parse v2
 */
async function extractImages(pdfBuffer: Buffer): Promise<{ images: ExtractedImage[]; pageCount: number }> {
  const images: ExtractedImage[] = []

  const parser = new (getPDFParse())({ data: pdfBuffer })

  try {
    const imageResult = await parser.getImage({
      imageThreshold: 50, // Skip tiny images (likely icons/decorations)
      imageBuffer: true,
      imageDataUrl: false, // We don't need base64 for storage upload
    })

    for (const pageImages of imageResult.pages) {
      for (let i = 0; i < pageImages.images.length; i++) {
        const img = pageImages.images[i]
        images.push({
          data: Buffer.from(img.data),
          page: pageImages.pageNumber,
          index: i,
          width: img.width,
          height: img.height,
          name: img.name,
        })
      }
    }

    return { images, pageCount: imageResult.total }
  } finally {
    await parser.destroy()
  }
}

/**
 * Extract text per page using pdf-parse v2
 */
async function extractTextPerPage(pdfBuffer: Buffer): Promise<Map<number, string>> {
  const parser = new (getPDFParse())({ data: pdfBuffer })
  const pageTexts = new Map<number, string>()

  try {
    const result = await parser.getText()

    for (const page of result.pages) {
      pageTexts.set(page.num, page.text)
    }

    return pageTexts
  } finally {
    await parser.destroy()
  }
}

/**
 * Extract both text and images from a PDF buffer
 *
 * Note: This simplified version doesn't provide text positions.
 * Image-to-section mapping uses page order heuristics instead.
 *
 * @param pdfBuffer - The PDF file as a Buffer
 * @returns Images grouped by page and text per page
 * @throws Error if PDF cannot be parsed
 */
export async function extractPdfContent(pdfBuffer: Buffer): Promise<PdfContent> {
  // Run both extractions
  const [imageResult, pageTexts] = await Promise.all([
    extractImages(pdfBuffer).catch((err) => {
      // Images are optional - PDF might not have any
      console.warn('Image extraction failed or no images found:', err.message)
      return { images: [] as ExtractedImage[], pageCount: 0 }
    }),
    extractTextPerPage(pdfBuffer).catch((err) => {
      console.error('Text extraction failed:', err)
      throw new Error(`Failed to extract text from PDF: ${err.message}`)
    }),
  ])

  // We don't have real text positions, so textBlocks is empty
  // The image mapping will use page-order heuristics
  return {
    textBlocks: [],
    images: imageResult.images,
    pageCount: imageResult.pageCount || pageTexts.size,
    pageTexts,
  }
}

/**
 * Extract just text (for backward compatibility with Gemini pipeline)
 */
export async function extractPdfTextOnly(pdfBuffer: Buffer): Promise<string> {
  const parser = new (getPDFParse())({ data: pdfBuffer })

  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}
