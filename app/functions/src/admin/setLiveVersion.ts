import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'

interface SetLiveVersionRequest {
  venueId: string
  timestamp: string
}

interface SetLiveVersionResponse {
  success: boolean
  publicUrl: string
  liveVersion: string
  slug: string
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function setLiveVersionHandler(
  request: { auth: { token: { email: string } } | null; data: SetLiveVersionRequest }
): Promise<SetLiveVersionResponse> {
  // 1. Auth check
  const userEmail = requireAuth(request as never)

  // 2. Validate input
  const { venueId, timestamp } = request.data
  if (!venueId || typeof venueId !== 'string') {
    throw new HttpsError('invalid-argument', 'venueId is required')
  }
  if (!timestamp || typeof timestamp !== 'string') {
    throw new HttpsError('invalid-argument', 'timestamp is required')
  }

  // 3. Check editor access
  await requireEditorAccess(userEmail, venueId)

  // 4. Get venue data for slug
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

  // 5. Verify version exists in Storage
  const storage = getStorage()
  const bucket = storage.bucket()
  const versionPath = `venues/${venueId}/versions/${timestamp}.json`
  const versionFile = bucket.file(versionPath)
  const [exists] = await versionFile.exists()

  if (!exists) {
    throw new HttpsError('not-found', `Version ${timestamp} not found`)
  }

  try {
    // 6. Copy to public slug-based path
    const publicPath = `public/guides/${slug}.json`
    const publicFile = bucket.file(publicPath)
    await versionFile.copy(publicFile)
    await publicFile.setMetadata({
      cacheControl: 'public, max-age=0, must-revalidate',
    })
    await publicFile.makePublic()

    // 7. Also keep the versioned file public (for admin version history preview)
    await versionFile.makePublic()

    // 8. Update Firestore venue doc with liveVersion pointer
    await venueRef.update({
      liveVersion: timestamp,
      status: 'published',
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 9. Construct public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${publicPath}`

    console.log(
      `Version made live: venue=${venueId}, version=${timestamp}, user=${userEmail}`
    )

    return {
      success: true,
      publicUrl,
      liveVersion: timestamp,
      slug,
    }
  } catch (err) {
    const error = err as Error
    console.error(`setLiveVersion failed: venue=${venueId}, version=${timestamp}, error=${error.message}`)

    if (error.message.includes('permission')) {
      throw new HttpsError(
        'permission-denied',
        'Could not update live version. Please contact support.'
      )
    }

    throw new HttpsError('internal', `Failed to set live version: ${error.message}`)
  }
}

/**
 * Set a specific version as the live version for a venue.
 *
 * This is the "rollback" mechanism - it copies the specified version
 * to the public path and updates the Firestore liveVersion pointer.
 */
export const setLiveVersion = onCall<SetLiveVersionRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<SetLiveVersionResponse> => {
    // Cast to handler type - auth validation happens in requireAuth
    return setLiveVersionHandler(request as never)
  }
)
