import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { requireAuth, requireEditorAccess } from '../middleware/auth'

interface ListVersionsRequest {
  venueId: string
}

interface VersionInfo {
  timestamp: string
  previewUrl: string
  size: number
  created: string
  publishedBy?: string
}

interface ListVersionsResponse {
  versions: VersionInfo[]
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function listVersionsHandler(
  request: { auth: { token: { email: string } } | null; data: ListVersionsRequest }
): Promise<ListVersionsResponse> {
  // 1. Auth check
  const userEmail = requireAuth(request as never)

  // 2. Validate input
  const { venueId } = request.data
  if (!venueId || typeof venueId !== 'string') {
    throw new HttpsError('invalid-argument', 'venueId is required')
  }

  // 3. Check editor access
  await requireEditorAccess(userEmail, venueId)

  // 4. List files from Cloud Storage
  const storage = getStorage()
  const bucket = storage.bucket()
  const prefix = `venues/${venueId}/versions/`

  const [files] = await bucket.getFiles({ prefix })

  // 5. Filter to .json files only and extract metadata
  const jsonFiles = files.filter((file) => file.name.endsWith('.json'))

  const versions: VersionInfo[] = await Promise.all(
    jsonFiles.map(async (file) => {
      // Extract timestamp from filename: venues/{venueId}/versions/{timestamp}.json
      const filename = file.name.split('/').pop() ?? ''
      const timestamp = filename.replace('.json', '')

      // Get signed URL for preview (valid for 1 hour)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      })

      // Get custom metadata (publishedBy is set when version is published)
      const customMetadata = file.metadata.metadata as Record<string, string> | undefined

      return {
        timestamp,
        previewUrl: signedUrl,
        size: parseInt(file.metadata.size as string, 10) || 0,
        created: file.metadata.timeCreated as string,
        publishedBy: customMetadata?.publishedBy,
      }
    })
  )

  // 6. Sort by timestamp descending (newest first)
  versions.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return { versions }
}

/**
 * List all versions for a venue.
 *
 * Returns array of versions with:
 * - timestamp: Version identifier (ISO timestamp)
 * - previewUrl: Signed URL for preview (valid 1hr)
 * - size: File size in bytes
 * - created: Creation timestamp
 */
export const listVersions = onCall<ListVersionsRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<ListVersionsResponse> => {
    // Cast to handler type - auth validation happens in requireAuth
    return listVersionsHandler(request as never)
  }
)
