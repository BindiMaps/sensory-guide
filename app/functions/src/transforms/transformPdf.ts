import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import { checkRateLimit, incrementUsage, DAILY_TRANSFORM_LIMIT } from '../utils/rateLimiter'
import { isSuperAdmin } from '../utils/accessControl'
import { transformPdfToGuide, isRetryableError, getModelInfo } from '../utils/gemini'
import type { TransformProgressStatus } from '../schemas/guideSchema'

// pdf-parse v2 uses class-based API
import { PDFParse } from 'pdf-parse'

interface TransformPdfRequest {
  venueId: string
  uploadPath: string
  logId: string
}

interface TransformPdfResponse {
  success: boolean
  outputPath: string
  tokensUsed: number
  suggestions: string[]
  usageToday: number
  usageLimit: number
  isUnlimited: boolean
}

interface ProgressData {
  status: TransformProgressStatus
  progress: number
  updatedAt: FieldValue
  error?: string
  outputPath?: string
  retryCount?: number
}

/**
 * Update progress document in Firestore
 * Client listens to this for real-time updates
 */
async function updateProgress(
  venueId: string,
  logId: string,
  status: TransformProgressStatus,
  progress: number,
  extra?: { error?: string; outputPath?: string; retryCount?: number }
): Promise<void> {
  const db = getFirestore()
  const progressRef = db.collection('venues').doc(venueId).collection('progress').doc(logId)

  const data: ProgressData = {
    status,
    progress,
    updatedAt: FieldValue.serverTimestamp(),
    ...extra,
  }

  await progressRef.set(data, { merge: true })
}

/**
 * Update LLM log record with final status
 */
async function updateLlmLog(
  logId: string,
  status: 'processing' | 'complete' | 'failed',
  extra?: { tokensUsed?: number; outputPath?: string; error?: string }
): Promise<void> {
  const db = getFirestore()
  const logRef = db.collection('llmLogs').doc(logId)

  await logRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
    ...extra,
  })
}

/**
 * Extract text from PDF file in Cloud Storage
 */
async function extractPdfText(uploadPath: string): Promise<string> {
  const bucket = getStorage().bucket()
  const file = bucket.file(uploadPath)

  // Check if file exists
  const [exists] = await file.exists()
  if (!exists) {
    throw new HttpsError('not-found', `PDF file not found: ${uploadPath}`)
  }

  // Download file to buffer
  const [buffer] = await file.download()

  // Parse PDF using pdf-parse v2 class API
  let parser: PDFParse | null = null
  try {
    parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    return result.text
  } catch (err) {
    const error = err as Error
    throw new HttpsError(
      'invalid-argument',
      `Could not parse PDF: ${error.message}. The file may be corrupted or password-protected.`
    )
  } finally {
    if (parser) await parser.destroy()
  }
}

/**
 * Store guide JSON in Cloud Storage
 * Returns both the storage path and the timestamp for draftVersion tracking
 */
async function storeGuideJson(
  venueId: string,
  guide: object
): Promise<{ outputPath: string; timestamp: string }> {
  const bucket = getStorage().bucket()
  // Use ISO format timestamp (this becomes the version identifier)
  const timestamp = new Date().toISOString()
  const outputPath = `venues/${venueId}/versions/${timestamp}.json`

  const file = bucket.file(outputPath)
  await file.save(JSON.stringify(guide, null, 2), {
    contentType: 'application/json',
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1 year (immutable versions)
    },
  })

  return { outputPath, timestamp }
}

/**
 * Update venue status to draft after successful transform
 * Also sets draftVersion to point to the new version
 */
async function updateVenueStatus(venueId: string, draftVersion: string): Promise<void> {
  const db = getFirestore()
  await db.collection('venues').doc(venueId).update({
    status: 'draft',
    draftVersion,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

/**
 * Main PDF transformation function
 *
 * Flow:
 * 1. Validate auth + editor access
 * 2. Check rate limit
 * 3. Extract text from PDF
 * 4. Transform via Gemini
 * 5. Validate output
 * 6. Store in Cloud Storage
 * 7. Update venue status
 * 8. Increment usage counter
 */
export const transformPdf = onCall<TransformPdfRequest>(
  {
    cors: true,
    timeoutSeconds: 540, // 9 minutes max for LLM processing
    memory: '512MiB',
    secrets: ['GOOGLE_AI_API_KEY'],
  },
  async (request): Promise<TransformPdfResponse> => {
    // 1. Auth check
    const userEmail = requireAuth(request)

    // Validate input
    const { venueId, uploadPath, logId } = request.data
    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }
    if (!uploadPath || typeof uploadPath !== 'string') {
      throw new HttpsError('invalid-argument', 'uploadPath is required')
    }
    if (!logId || typeof logId !== 'string') {
      throw new HttpsError('invalid-argument', 'logId is required')
    }

    // 2. Check editor access
    await requireEditorAccess(userEmail, venueId)

    // 3. Check superadmin status
    const isAdmin = await isSuperAdmin(userEmail)

    // 4. Check rate limit (superadmins bypass)
    const usageToday = await checkRateLimit(userEmail, isAdmin)

    // Mark LLM log as processing
    await updateLlmLog(logId, 'processing')

    // Initialize progress tracking
    await updateProgress(venueId, logId, 'uploaded', 0)

    try {
      // 4. Extract text from PDF
      await updateProgress(venueId, logId, 'extracting', 20)
      const pdfText = await extractPdfText(uploadPath)

      if (!pdfText || pdfText.trim().length < 50) {
        throw new HttpsError(
          'invalid-argument',
          'Could not extract text from PDF. The document may be scanned images without OCR.'
        )
      }

      // 5. Get venue name for context
      const db = getFirestore()
      const venueDoc = await db.collection('venues').doc(venueId).get()
      const venueName = venueDoc.data()?.name || 'Unknown Venue'

      // 6. Transform via Gemini
      await updateProgress(venueId, logId, 'analysing', 40)

      let result: { guide: object; tokensUsed: number }
      let retryCount = 0

      try {
        result = await transformPdfToGuide(pdfText, venueName)
      } catch (err) {
        // Track retry attempts for UI feedback
        if (isRetryableError(err)) {
          retryCount++
          await updateProgress(venueId, logId, 'analysing', 45, { retryCount })
        }
        throw err
      }

      await updateProgress(venueId, logId, 'generating', 70)

      // 7. Store guide JSON
      const { outputPath, timestamp } = await storeGuideJson(venueId, result.guide)

      // 8. Update venue status to draft with draftVersion pointer
      await updateVenueStatus(venueId, timestamp)

      // 9. Mark complete
      await updateProgress(venueId, logId, 'ready', 100, { outputPath })
      await updateLlmLog(logId, 'complete', {
        tokensUsed: result.tokensUsed,
        outputPath,
      })

      // 10. Increment usage counter (only on success)
      await incrementUsage(userEmail)

      // Log for monitoring
      const modelInfo = getModelInfo()
      console.log(
        `Transform complete: venue=${venueId}, user=${userEmail}, ` +
          `tokens=${result.tokensUsed}, model=${modelInfo.name}`
      )

      // Extract suggestions from guide
      const suggestions = (result.guide as { suggestions?: string[] }).suggestions || []

      return {
        success: true,
        outputPath,
        tokensUsed: result.tokensUsed,
        suggestions,
        usageToday: usageToday + 1,
        usageLimit: DAILY_TRANSFORM_LIMIT,
        isUnlimited: isAdmin,
      }
    } catch (err) {
      const error = err as Error

      // Update progress with failure
      await updateProgress(venueId, logId, 'failed', 0, {
        error: error.message,
      })
      await updateLlmLog(logId, 'failed', {
        error: error.message,
      })

      // Re-throw HttpsError as-is, wrap others
      if (err instanceof HttpsError) {
        throw err
      }

      console.error(`Transform failed: venue=${venueId}, error=${error.message}`)
      throw new HttpsError('internal', `Transform failed: ${error.message}`)
    }
  }
)
