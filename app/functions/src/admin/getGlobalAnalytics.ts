import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'
import { isSuperAdmin } from '../utils/accessControl'

export interface GlobalAnalyticsResponse {
  venues: {
    total: number
    published: number
    draft: number
  }
  transforms: {
    allTime: number
    thisMonth: number
  }
  published: {
    allTime: number
    thisMonth: number
  }
  activeUsers: {
    thisMonth: number
  }
  generatedAt: string
}

/**
 * Get the start of the current month (UTC).
 */
function getStartOfMonth(): Timestamp {
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  return Timestamp.fromDate(startOfMonth)
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function getGlobalAnalyticsHandler(
  request: { auth: { token: { email: string } } | null; data: void }
): Promise<GlobalAnalyticsResponse> {
  const userEmail = requireAuth(request as never)

  // Verify super admin status server-side
  const superAdmin = await isSuperAdmin(userEmail)
  if (!superAdmin) {
    throw new HttpsError('permission-denied', 'Only super admins can view global analytics')
  }

  const db = getFirestore()
  const startOfMonth = getStartOfMonth()

  // Query venues
  const venuesSnapshot = await db.collection('venues').get()
  const venueStats = {
    total: venuesSnapshot.size,
    published: 0,
    draft: 0,
  }
  venuesSnapshot.docs.forEach((doc) => {
    const status = doc.data().status
    if (status === 'published') {
      venueStats.published++
    } else {
      venueStats.draft++
    }
  })

  // Query all llmLogs
  const allLogsSnapshot = await db.collection('llmLogs').get()

  // Query this month's llmLogs
  const thisMonthLogsSnapshot = await db
    .collection('llmLogs')
    .where('createdAt', '>=', startOfMonth)
    .get()

  // Calculate transform stats
  const transformStats = {
    allTime: allLogsSnapshot.size,
    thisMonth: thisMonthLogsSnapshot.size,
  }

  // Calculate published stats (status='complete')
  const publishedAllTime = allLogsSnapshot.docs.filter(
    (doc) => doc.data().status === 'complete'
  ).length
  const publishedThisMonth = thisMonthLogsSnapshot.docs.filter(
    (doc) => doc.data().status === 'complete'
  ).length

  // Calculate active users (unique emails this month)
  const activeEmails = new Set<string>()
  thisMonthLogsSnapshot.docs.forEach((doc) => {
    const email = doc.data().userEmail
    if (email) {
      activeEmails.add(email.toLowerCase())
    }
  })

  return {
    venues: venueStats,
    transforms: transformStats,
    published: {
      allTime: publishedAllTime,
      thisMonth: publishedThisMonth,
    },
    activeUsers: {
      thisMonth: activeEmails.size,
    },
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Get global platform analytics (super admin only).
 * Returns aggregate metrics for venues, transforms, and active users.
 */
export const getGlobalAnalytics = onCall(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GlobalAnalyticsResponse> => {
    return getGlobalAnalyticsHandler(request as never)
  }
)
