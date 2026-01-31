import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import type { Guide } from '../schemas/guideSchema'

interface RepublishEmbeddingsRequest {
  venueId: string
}

interface RepublishEmbeddingsResponse {
  success: boolean
}

/**
 * Republish embeddings for an already-published guide.
 * This allows editing embed URLs without re-uploading the PDF.
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Get venue slug from Firestore
 * 3. Read current public JSON from public/guides/{slug}.json
 * 4. Fetch embeddings from /venues/{venueId}/embeddings/urls
 * 5. Merge embeddings into areas[].embedUrl
 * 6. Write back to public path
 */
export const republishEmbeddings = onCall<RepublishEmbeddingsRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<RepublishEmbeddingsResponse> => {
    // 1. Auth check
    const userEmail = requireAuth(request)

    // Validate input
    const { venueId } = request.data
    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }

    // 2. Check editor access
    await requireEditorAccess(userEmail, venueId)

    // 3. Get venue data for slug
    const db = getFirestore()
    const venueRef = db.collection('venues').doc(venueId)
    const venueSnap = await venueRef.get()

    if (!venueSnap.exists) {
      throw new HttpsError('not-found', 'Venue not found')
    }

    const venueData = venueSnap.data()
    const slug = venueData?.slug as string | undefined
    const status = venueData?.status as string | undefined

    if (!slug) {
      throw new HttpsError('internal', 'Venue has no slug configured')
    }

    if (status !== 'published') {
      throw new HttpsError('failed-precondition', 'Guide must be published before republishing embeddings')
    }

    // 4. Read current public JSON
    const storage = getStorage()
    const bucket = storage.bucket()
    const publicPath = `public/guides/${slug}.json`
    const publicFile = bucket.file(publicPath)

    const [exists] = await publicFile.exists()
    if (!exists) {
      throw new HttpsError('not-found', 'Published guide not found. Please publish the guide first.')
    }

    try {
      const [guideContent] = await publicFile.download()
      let guide: Guide = JSON.parse(guideContent.toString('utf-8'))

      // 5. Fetch embeddings from Firestore
      const embeddingsRef = db.collection('venues').doc(venueId).collection('embeddings').doc('urls')
      const embeddingsSnap = await embeddingsRef.get()

      if (embeddingsSnap.exists) {
        const embeddings = embeddingsSnap.data() as Record<string, string>
        const guideAreaIds = new Set(guide.areas.map((a) => a.id))

        // Check for orphaned embeddings
        const orphanedEmbeddings = Object.keys(embeddings).filter((id) => !guideAreaIds.has(id))
        if (orphanedEmbeddings.length > 0) {
          console.warn(
            `Orphaned embeddings detected at republish: venue=${venueId}, orphaned_ids=${orphanedEmbeddings.join(', ')}`
          )
        }

        // Merge embeddings into guide areas
        guide = {
          ...guide,
          areas: guide.areas.map((area) => ({
            ...area,
            embedUrl: embeddings[area.id] || area.embedUrl,
          })),
        }
      }

      // 6. Write back to public path
      await publicFile.save(JSON.stringify(guide), {
        contentType: 'application/json',
        metadata: {
          republishedBy: userEmail,
        },
      })
      await publicFile.setMetadata({
        cacheControl: 'public, max-age=0, must-revalidate',
      })
      await publicFile.makePublic()

      // Update venue timestamp
      await venueRef.update({
        updatedAt: FieldValue.serverTimestamp(),
      })

      console.log(`Embeddings republished: venue=${venueId}, user=${userEmail}`)

      return { success: true }
    } catch (err) {
      const error = err as Error
      console.error(`Republish embeddings failed: venue=${venueId}, error=${error.message}`)

      if (error.message.includes('permission')) {
        throw new HttpsError('permission-denied', 'Could not update guide. Please contact support.')
      }

      throw new HttpsError('internal', `Failed to republish embeddings: ${error.message}`)
    }
  }
)
