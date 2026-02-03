import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import type { Guide } from '../schemas/guideSchema'

interface PublishGuideRequest {
  venueId: string
  outputPath: string
}

interface PublishGuideResponse {
  success: boolean
  publicUrl: string
  liveVersion: string
  slug: string
}

/**
 * Publish a guide to make it publicly accessible.
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Verify outputPath exists in Cloud Storage
 * 3. Extract timestamp from outputPath
 * 4. Make file publicly readable
 * 5. Update Firestore venue doc with liveVersion and status
 * 6. Return public URL and metadata
 */
export const publishGuide = onCall<PublishGuideRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<PublishGuideResponse> => {
    // 1. Auth check
    const userEmail = requireAuth(request)

    // Validate input
    const { venueId, outputPath } = request.data
    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }
    if (!outputPath || typeof outputPath !== 'string') {
      throw new HttpsError('invalid-argument', 'outputPath is required')
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

    if (!slug) {
      throw new HttpsError('internal', 'Venue has no slug configured')
    }

    // 4. Verify outputPath exists in Storage
    const storage = getStorage()
    const bucket = storage.bucket()
    const file = bucket.file(outputPath)
    const [exists] = await file.exists()

    if (!exists) {
      throw new HttpsError(
        'not-found',
        'Guide file not found. Please re-upload the PDF and try again.'
      )
    }

    // 5. Extract timestamp from outputPath
    // Format: venues/{venueId}/versions/{timestamp}.json
    const pathParts = outputPath.split('/')
    const filename = pathParts[pathParts.length - 1]
    const liveVersion = filename?.replace('.json', '')

    if (!liveVersion) {
      throw new HttpsError('internal', 'Could not extract version from output path')
    }

    try {
      // 6. Load guide JSON and merge embeddings
      const [guideContent] = await file.download()
      let guide: Guide = JSON.parse(guideContent.toString('utf-8'))

      // Fetch embeddings from Firestore
      const embeddingsRef = db.collection('venues').doc(venueId).collection('embeddings').doc('urls')
      const embeddingsSnap = await embeddingsRef.get()

      if (embeddingsSnap.exists) {
        // Embeddings format: { "section-id": { urls: string[], title: string } }
        const rawEmbeddings = embeddingsSnap.data() as Record<string, { urls: string[]; title: string }>
        const guideAreaIds = new Set(guide.areas.map((a) => a.id))

        // Check for orphaned embeddings (section IDs that no longer exist in guide)
        const orphanedEmbeddings = Object.keys(rawEmbeddings).filter((id) => !guideAreaIds.has(id))
        if (orphanedEmbeddings.length > 0) {
          console.warn(
            `Orphaned embeddings detected at publish: venue=${venueId}, orphaned_ids=${orphanedEmbeddings.join(', ')}`
          )
        }

        // Merge embeddings into guide areas
        guide = {
          ...guide,
          areas: guide.areas.map((area) => ({
            ...area,
            embedUrls: rawEmbeddings[area.id]?.urls || area.embedUrls || [],
          })),
        }
      }

      // 7. Set publishedBy metadata on the version file
      await file.setMetadata({
        metadata: {
          publishedBy: userEmail,
        },
      })

      // 8. Copy to public slug-based path (this is what public page fetches)
      // Write the merged guide (with embeddings baked in) to public path
      const publicPath = `public/guides/${slug}.json`
      const publicFile = bucket.file(publicPath)
      await publicFile.save(JSON.stringify(guide), {
        contentType: 'application/json',
        metadata: {
          publishedBy: userEmail,
        },
      })
      await publicFile.setMetadata({
        cacheControl: 'public, max-age=0, must-revalidate',
      })
      await publicFile.makePublic()

      // 9. Also make versioned file public (for admin version history)
      await file.makePublic()

      // 10. Update Firestore venue doc
      await venueRef.update({
        liveVersion,
        status: 'published',
        extractedVenueName: guide.venue.name,
        updatedAt: FieldValue.serverTimestamp(),
      })

      // 9. Construct public URL (slug-based, not versioned)
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${publicPath}`

      console.log(
        `Guide published: venue=${venueId}, version=${liveVersion}, user=${userEmail}`
      )

      return {
        success: true,
        publicUrl,
        liveVersion,
        slug,
      }
    } catch (err) {
      const error = err as Error
      console.error(`Publish failed: venue=${venueId}, error=${error.message}`)

      // Check for specific Storage errors
      if (error.message.includes('permission')) {
        throw new HttpsError(
          'permission-denied',
          'Could not make guide public. Please contact support.'
        )
      }

      throw new HttpsError('internal', `Failed to publish guide: ${error.message}`)
    }
  }
)
