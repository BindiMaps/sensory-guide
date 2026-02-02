import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'
import { isSuperAdmin } from '../utils/accessControl'

type TimeRange = '1w' | '2w' | '4w' | 'all'

interface GetVenueFeedbackRequest {
  venueId: string
  timeRange: TimeRange
}

interface FeedbackComment {
  text: string
  feedback: 'up' | 'down'
  createdAt: string
}

interface GetVenueFeedbackResponse {
  thumbsUp: number
  thumbsDown: number
  comments: FeedbackComment[]
  dateRange: {
    start: string | null
    end: string
  }
}

function getStartDate(timeRange: TimeRange): Date | null {
  if (timeRange === 'all') return null

  const now = new Date()
  const weeksBack = timeRange === '1w' ? 1 : timeRange === '2w' ? 2 : 4

  const start = new Date(now)
  start.setDate(start.getDate() - weeksBack * 7)
  start.setHours(0, 0, 0, 0)

  return start
}

export const getVenueFeedback = onCall(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GetVenueFeedbackResponse> => {
    const userEmail = requireAuth(request as never)

    const { venueId, timeRange } = request.data as GetVenueFeedbackRequest

    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }

    if (!['1w', '2w', '4w', 'all'].includes(timeRange)) {
      throw new HttpsError('invalid-argument', 'Invalid timeRange')
    }

    const db = getFirestore()

    // Get venue to check access
    const venueDoc = await db.collection('venues').doc(venueId).get()

    if (!venueDoc.exists) {
      throw new HttpsError('not-found', 'Venue not found')
    }

    const venueData = venueDoc.data()!
    const editors = (venueData.editors || []).map((e: string) => e.toLowerCase())
    const isEditor = editors.includes(userEmail.toLowerCase())
    const superAdmin = await isSuperAdmin(userEmail)

    if (!isEditor && !superAdmin) {
      throw new HttpsError('permission-denied', 'Not authorised to view this venue\'s feedback')
    }

    // Build query
    const startDate = getStartDate(timeRange)
    let query = db
      .collection('venues')
      .doc(venueId)
      .collection('feedback')
      .orderBy('createdAt', 'desc')

    if (startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(startDate))
    }

    const snapshot = await query.get()

    let thumbsUp = 0
    let thumbsDown = 0
    const comments: FeedbackComment[] = []

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const feedback = data.feedback as 'up' | 'down'

      if (feedback === 'up') thumbsUp++
      else if (feedback === 'down') thumbsDown++

      if (data.comment) {
        comments.push({
          text: data.comment,
          feedback,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        })
      }
    })

    return {
      thumbsUp,
      thumbsDown,
      comments,
      dateRange: {
        start: startDate?.toISOString() || null,
        end: new Date().toISOString(),
      },
    }
  }
)
