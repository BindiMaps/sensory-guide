import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { requireAuth, requireEditorAccess } from '../middleware/auth'

interface AreaImageUpdate {
  id: string
  images: string[]
}

interface UpdateGuideImagesRequest {
  venueId: string
  outputPath: string
  updates: AreaImageUpdate[]
}

interface UpdateGuideImagesResponse {
  success: boolean
}

/**
 * Update image assignments in a guide JSON.
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Fetch current guide JSON from outputPath
 * 3. Validate all image URLs are from the original set
 * 4. Update areas with new image assignments
 * 5. Save modified JSON back to same path
 */
export const updateGuideImages = onCall<UpdateGuideImagesRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<UpdateGuideImagesResponse> => {
    // 1. Auth check
    const userEmail = requireAuth(request)

    // Validate input
    const { venueId, outputPath, updates } = request.data
    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }
    if (!outputPath || typeof outputPath !== 'string') {
      throw new HttpsError('invalid-argument', 'outputPath is required')
    }
    if (!updates || !Array.isArray(updates)) {
      throw new HttpsError('invalid-argument', 'updates array is required')
    }

    // 2. Check editor access
    await requireEditorAccess(userEmail, venueId)

    // 3. Fetch current guide from Storage
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(outputPath)
    const [exists] = await file.exists()

    if (!exists) {
      throw new HttpsError('not-found', 'Guide file not found')
    }

    const [content] = await file.download()
    let guide: Record<string, unknown>

    try {
      guide = JSON.parse(content.toString('utf-8'))
    } catch {
      throw new HttpsError('internal', 'Failed to parse guide JSON')
    }

    // 4. Collect all original image URLs from the guide
    const areas = guide.areas as Array<{ id: string; images?: string[] }> | undefined
    if (!areas || !Array.isArray(areas)) {
      throw new HttpsError('internal', 'Invalid guide structure: no areas array')
    }

    const originalImageUrls = new Set<string>()
    for (const area of areas) {
      if (area.images && Array.isArray(area.images)) {
        for (const url of area.images) {
          originalImageUrls.add(url)
        }
      }
    }

    // 5. Validate all URLs in updates are from the original set
    for (const update of updates) {
      if (!update.id || typeof update.id !== 'string') {
        throw new HttpsError('invalid-argument', 'Each update must have an id')
      }
      if (!Array.isArray(update.images)) {
        throw new HttpsError('invalid-argument', 'Each update must have images array')
      }
      for (const url of update.images) {
        if (!originalImageUrls.has(url)) {
          throw new HttpsError(
            'invalid-argument',
            `Image URL not from original guide: ${url.substring(0, 50)}...`
          )
        }
      }
    }

    // 6. Create updates map for quick lookup
    const updatesMap = new Map<string, string[]>()
    for (const update of updates) {
      updatesMap.set(update.id, update.images)
    }

    // 7. Update areas with new image assignments
    const updatedAreas = areas.map((area) => {
      if (updatesMap.has(area.id)) {
        return { ...area, images: updatesMap.get(area.id)! }
      }
      return area
    })

    guide.areas = updatedAreas

    // 8. Save back to Storage
    try {
      await file.save(JSON.stringify(guide, null, 2), {
        contentType: 'application/json',
        metadata: {
          metadata: {
            imagesEditedBy: userEmail,
            imagesEditedAt: new Date().toISOString(),
          },
        },
      })

      console.log(
        `Guide images updated: venue=${venueId}, path=${outputPath}, user=${userEmail}`
      )

      return { success: true }
    } catch (err) {
      const error = err as Error
      console.error(`Image update failed: venue=${venueId}, error=${error.message}`)
      throw new HttpsError('internal', `Failed to save guide: ${error.message}`)
    }
  }
)
