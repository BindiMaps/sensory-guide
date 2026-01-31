import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'

interface DeleteVersionRequest {
  venueId: string
  timestamp: string
}

interface DeleteVersionResponse {
  success: boolean
  deletedVersion: string
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function deleteVersionHandler(
  request: { auth: { token: { email: string } } | null; data: DeleteVersionRequest }
): Promise<DeleteVersionResponse> {
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

  // 4. Check if this is the live version (cannot delete)
  const db = getFirestore()
  const venueRef = db.collection('venues').doc(venueId)
  const venueSnap = await venueRef.get()

  if (!venueSnap.exists) {
    throw new HttpsError('not-found', 'Venue not found')
  }

  const venueData = venueSnap.data()
  const liveVersion = venueData?.liveVersion as string | undefined

  if (liveVersion === timestamp) {
    throw new HttpsError(
      'failed-precondition',
      'Cannot delete the live version. Make another version live first.'
    )
  }

  // 5. Verify version exists and delete from Storage
  const storage = getStorage()
  const bucket = storage.bucket()
  const versionPath = `venues/${venueId}/versions/${timestamp}.json`
  const versionFile = bucket.file(versionPath)
  const [exists] = await versionFile.exists()

  if (!exists) {
    throw new HttpsError('not-found', `Version ${timestamp} not found`)
  }

  try {
    await versionFile.delete()

    console.log(
      `Version deleted: venue=${venueId}, version=${timestamp}, user=${userEmail}`
    )

    return {
      success: true,
      deletedVersion: timestamp,
    }
  } catch (err) {
    const error = err as Error
    console.error(`Delete version failed: venue=${venueId}, version=${timestamp}, error=${error.message}`)

    if (error.message.includes('permission')) {
      throw new HttpsError(
        'permission-denied',
        'Could not delete version. Please contact support.'
      )
    }

    throw new HttpsError('internal', `Failed to delete version: ${error.message}`)
  }
}

/**
 * Delete a version from a venue's version history.
 *
 * Cannot delete the currently live version - must make another version live first.
 */
export const deleteVersion = onCall<DeleteVersionRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<DeleteVersionResponse> => {
    return deleteVersionHandler(request as never)
  }
)
