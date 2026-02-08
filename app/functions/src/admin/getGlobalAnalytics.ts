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
  const venuesCol = db.collection('venues')
  const logsCol = db.collection('llmLogs')

  // Use aggregation queries to avoid fetching full documents
  const [
    totalVenuesSnap,
    publishedVenuesSnap,
    allLogsSnap,
    allCompleteLogsSnap,
    monthLogsSnap,
    monthCompleteLogsSnap,
  ] = await Promise.all([
    venuesCol.count().get(),
    venuesCol.where('status', '==', 'published').count().get(),
    logsCol.count().get(),
    logsCol.where('status', '==', 'complete').count().get(),
    logsCol.where('createdAt', '>=', startOfMonth).count().get(),
    logsCol
      .where('createdAt', '>=', startOfMonth)
      .where('status', '==', 'complete')
      .count()
      .get(),
  ])

  const totalVenues = totalVenuesSnap.data().count
  const publishedVenues = publishedVenuesSnap.data().count

  // Active users still needs doc iteration for unique email counting,
  // but we use select() to only fetch the userEmail field
  const thisMonthLogsSnapshot = await logsCol
    .where('createdAt', '>=', startOfMonth)
    .select('userEmail')
    .get()

  const activeEmails = new Set<string>()
  thisMonthLogsSnapshot.docs.forEach((doc) => {
    const email = doc.data().userEmail
    if (email) {
      activeEmails.add(email.toLowerCase())
    }
  })

  return {
    venues: {
      total: totalVenues,
      published: publishedVenues,
      draft: totalVenues - publishedVenues,
    },
    transforms: {
      allTime: allLogsSnap.data().count,
      thisMonth: monthLogsSnap.data().count,
    },
    published: {
      allTime: allCompleteLogsSnap.data().count,
      thisMonth: monthCompleteLogsSnap.data().count,
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
