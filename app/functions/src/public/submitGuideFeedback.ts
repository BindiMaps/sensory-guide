import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const ALLOWED_ORIGINS = [
  'https://sensory-guide.web.app',
  'https://sensory-guide.firebaseapp.com',
]

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/.*\.bindimaps\.com$/,
]

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
}

function sanitiseComment(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    .slice(0, 100)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"']/g, (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] || c
    )
    .trim()
}

interface FeedbackRequest {
  venueSlug: string
  feedback: 'up' | 'down'
  comment?: string
}

function isValidFeedbackRequest(body: unknown): body is FeedbackRequest {
  if (!body || typeof body !== 'object') return false
  const req = body as Record<string, unknown>
  if (typeof req.venueSlug !== 'string' || !req.venueSlug) return false
  if (req.feedback !== 'up' && req.feedback !== 'down') return false
  if (req.comment !== undefined && typeof req.comment !== 'string') return false
  return true
}

export const submitGuideFeedback = onRequest(
  {
    cors: false, // We handle CORS manually for origin validation
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request, response) => {
    const origin = request.headers.origin as string | undefined

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(origin)) {
        response.status(403).send('Forbidden')
        return
      }
      response.set('Access-Control-Allow-Origin', origin!)
      response.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.set('Access-Control-Allow-Headers', 'Content-Type')
      response.set('Access-Control-Max-Age', '3600')
      response.status(204).send('')
      return
    }

    // Only allow POST
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed')
      return
    }

    // Validate origin
    if (!isAllowedOrigin(origin)) {
      response.status(403).send('Forbidden')
      return
    }

    // Set CORS headers for response
    response.set('Access-Control-Allow-Origin', origin!)

    // Validate request body
    const body = request.body
    if (!isValidFeedbackRequest(body)) {
      response.status(400).json({ error: 'Invalid request body' })
      return
    }

    const { venueSlug, feedback, comment } = body
    const sanitisedComment = comment ? sanitiseComment(comment) : null

    try {
      const db = getFirestore()

      // Verify venue exists
      const venueQuery = await db
        .collection('venues')
        .where('slug', '==', venueSlug)
        .limit(1)
        .get()

      if (venueQuery.empty) {
        response.status(404).json({ error: 'Venue not found' })
        return
      }

      const venueDoc = venueQuery.docs[0]

      // Write feedback to subcollection
      await db.collection('venues').doc(venueDoc.id).collection('feedback').add({
        feedback,
        comment: sanitisedComment,
        createdAt: FieldValue.serverTimestamp(),
      })

      response.status(200).json({ success: true })
    } catch {
      response.status(500).json({ error: 'Internal server error' })
    }
  }
)
