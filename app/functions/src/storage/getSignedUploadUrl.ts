import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import { isSuperAdmin } from '../utils/accessControl'

const SIGNED_URL_EXPIRY_MINUTES = 15
const DAILY_TRANSFORM_LIMIT = 20

interface GetSignedUploadUrlRequest {
  venueId: string
}

interface GetSignedUploadUrlResponse {
  uploadUrl: string
  destinationPath: string
  logId: string
  usageToday: number
  usageLimit: number
  isUnlimited: boolean
}

async function checkRateLimit(userEmail: string, isAdmin = false): Promise<number> {
  const db = getFirestore()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today)
  const usageDoc = await usageRef.get()

  const currentCount = usageDoc.exists ? (usageDoc.data()?.count as number) || 0 : 0

  // Superadmins bypass rate limit
  if (!isAdmin && currentCount >= DAILY_TRANSFORM_LIMIT) {
    throw new HttpsError(
      'resource-exhausted',
      `Daily limit reached. You have used ${currentCount} of ${DAILY_TRANSFORM_LIMIT} transforms today. Try again tomorrow.`,
      { usageToday: currentCount, usageLimit: DAILY_TRANSFORM_LIMIT }
    )
  }

  return currentCount
}

async function incrementUsage(userEmail: string): Promise<void> {
  const db = getFirestore()
  const today = new Date().toISOString().split('T')[0]

  const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today)

  await usageRef.set(
    {
      count: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

async function createLlmLogRecord(
  userEmail: string,
  venueId: string,
  uploadPath: string
): Promise<string> {
  const db = getFirestore()

  const logRef = await db.collection('llmLogs').add({
    userEmail,
    venueId,
    uploadPath,
    status: 'pending',
    tokensUsed: null,
    createdAt: FieldValue.serverTimestamp(),
  })

  return logRef.id
}

export const getSignedUploadUrl = onCall<GetSignedUploadUrlRequest>(
  { cors: true },
  async (request): Promise<GetSignedUploadUrlResponse> => {
    // Auth check
    const userEmail = requireAuth(request)

    // Validate input
    const { venueId } = request.data
    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }

    // Check editor access
    await requireEditorAccess(userEmail, venueId)

    // Check superadmin status
    const isAdmin = await isSuperAdmin(userEmail)

    // Check rate limit (superadmins bypass)
    const usageToday = await checkRateLimit(userEmail, isAdmin)

    // Generate unique file path
    const timestamp = Date.now()
    const destinationPath = `venues/${venueId}/uploads/${timestamp}.pdf`

    // Create LLM log record first (so we have the logId)
    const logId = await createLlmLogRecord(userEmail, venueId, destinationPath)

    // Get signed URL for upload
    const bucket = getStorage().bucket()
    const file = bucket.file(destinationPath)

    let signedUrl: string
    try {
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
        contentType: 'application/pdf',
      })
      signedUrl = url
    } catch (err) {
      const error = err as Error
      if (error.name === 'SigningError' || error.message?.includes('client_email')) {
        throw new HttpsError(
          'failed-precondition',
          'Local dev setup required: Run "gcloud auth application-default login" to enable signed URL generation. See README.md for details.'
        )
      }
      throw err
    }

    // Increment usage counter
    await incrementUsage(userEmail)

    return {
      uploadUrl: signedUrl,
      destinationPath,
      logId,
      usageToday: usageToday + 1,
      usageLimit: DAILY_TRANSFORM_LIMIT,
      isUnlimited: isAdmin,
    }
  }
)
