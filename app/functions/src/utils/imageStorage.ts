/**
 * Image Storage Utilities
 *
 * Handles uploading extracted PDF images to Cloud Storage
 * and generating public URLs for the guide JSON.
 */

import { getStorage } from 'firebase-admin/storage'
import type { ExtractedImage } from './extractPdfContent'

/**
 * Uploaded image result with public URL
 */
export interface UploadedImage {
  /** Storage path: venues/{venueId}/images/{filename} */
  storagePath: string
  /** Public URL for embedding in guide JSON */
  publicUrl: string
  /** Original image dimensions */
  width: number
  height: number
}

/**
 * Generate a URL-safe filename for an image
 *
 * Format: {sectionId}-{index}.png
 * e.g., "entry-hall-0.png", "main-concourse-1.png"
 */
function generateFilename(sectionId: string, index: number): string {
  // Sanitise section ID: lowercase, replace spaces/special chars with hyphens
  const sanitised = sectionId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens

  return `${sanitised}-${index}.png`
}

/**
 * Upload a single image to Cloud Storage
 */
async function uploadImage(
  venueId: string,
  sectionId: string,
  index: number,
  imageData: Buffer,
  width: number,
  height: number
): Promise<UploadedImage> {
  const bucket = getStorage().bucket()
  const filename = generateFilename(sectionId, index)
  const storagePath = `venues/${venueId}/images/${filename}`

  const file = bucket.file(storagePath)

  await file.save(imageData, {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1 year (images are immutable)
      metadata: {
        sectionId,
        width: width.toString(),
        height: height.toString(),
      },
    },
  })

  // Make file publicly accessible
  await file.makePublic()

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

  return {
    storagePath,
    publicUrl,
    width,
    height,
  }
}

/**
 * Upload all images for a section and return their public URLs
 *
 * @param venueId - Venue ID for storage path
 * @param sectionId - Section ID (e.g., area.id from guide)
 * @param images - Extracted images to upload
 * @returns Array of public URLs in order
 */
export async function uploadSectionImages(
  venueId: string,
  sectionId: string,
  images: ExtractedImage[]
): Promise<UploadedImage[]> {
  if (images.length === 0) {
    return []
  }

  const uploadPromises = images.map((img, idx) =>
    uploadImage(venueId, sectionId, idx, img.data, img.width, img.height)
  )

  return Promise.all(uploadPromises)
}

/**
 * Delete all images for a venue (cleanup on re-upload)
 *
 * @param venueId - Venue ID
 */
export async function deleteVenueImages(venueId: string): Promise<void> {
  const bucket = getStorage().bucket()
  const prefix = `venues/${venueId}/images/`

  try {
    await bucket.deleteFiles({ prefix })
    console.log(`Deleted existing images at ${prefix}`)
  } catch (err) {
    // Ignore errors if no files exist
    console.warn(`No existing images to delete at ${prefix}:`, (err as Error).message)
  }
}

/**
 * Result of batch image upload operation
 */
export interface BatchUploadResult {
  /** Total images uploaded */
  totalUploaded: number
  /** Map of section ID to uploaded images */
  sectionImages: Map<string, UploadedImage[]>
  /** Sections that had no images */
  sectionsWithoutImages: string[]
}

/**
 * Upload images for multiple sections in batch
 *
 * @param venueId - Venue ID
 * @param sectionImageMap - Map of section ID to extracted images
 * @returns Batch upload result with URLs
 */
export async function uploadBatchImages(
  venueId: string,
  sectionImageMap: Map<string, ExtractedImage[]>
): Promise<BatchUploadResult> {
  const sectionImages = new Map<string, UploadedImage[]>()
  const sectionsWithoutImages: string[] = []
  let totalUploaded = 0

  // Process sections in parallel (but limit concurrency to avoid overwhelming storage)
  const entries = Array.from(sectionImageMap.entries())
  const batchSize = 5

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async ([sectionId, images]) => {
        if (images.length === 0) {
          sectionsWithoutImages.push(sectionId)
          return { sectionId, uploaded: [] as UploadedImage[] }
        }

        const uploaded = await uploadSectionImages(venueId, sectionId, images)
        totalUploaded += uploaded.length
        return { sectionId, uploaded }
      })
    )

    for (const { sectionId, uploaded } of batchResults) {
      sectionImages.set(sectionId, uploaded)
    }
  }

  return {
    totalUploaded,
    sectionImages,
    sectionsWithoutImages,
  }
}
