import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'
import { isSuperAdmin } from '../utils/accessControl'

export interface VenueListItem {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdAt: string
  updatedAt: string
}

const PAGE_SIZE = 100

interface GetAllVenuesRequest {
  pageToken?: string
}

interface GetAllVenuesResponse {
  venues: VenueListItem[]
  nextPageToken?: string
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function getAllVenuesHandler(
  request: { auth: { token: { email: string } } | null; data: GetAllVenuesRequest | void }
): Promise<GetAllVenuesResponse> {
  const userEmail = requireAuth(request as never)

  // Verify super admin status server-side
  const superAdmin = await isSuperAdmin(userEmail)
  if (!superAdmin) {
    throw new HttpsError('permission-denied', 'Only super admins can view all venues')
  }

  const db = getFirestore()
  let venuesQuery = db
    .collection('venues')
    .orderBy('updatedAt', 'desc')
    .limit(PAGE_SIZE + 1)

  // Cursor-based pagination: startAfter the provided timestamp
  const pageToken = (request.data as GetAllVenuesRequest | undefined)?.pageToken
  if (pageToken) {
    const cursorDate = new Date(pageToken)
    if (isNaN(cursorDate.getTime())) {
      throw new HttpsError('invalid-argument', 'Invalid pageToken')
    }
    venuesQuery = venuesQuery.startAfter(Timestamp.fromDate(cursorDate))
  }

  const venuesSnapshot = await venuesQuery.get()
  const docs = venuesSnapshot.docs
  const hasMore = docs.length > PAGE_SIZE
  const pageDocs = hasMore ? docs.slice(0, PAGE_SIZE) : docs

  const venues: VenueListItem[] = pageDocs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name || '',
      slug: data.slug || '',
      status: data.status || 'draft',
      editors: data.editors || [],
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
    }
  })

  const response: GetAllVenuesResponse = { venues }
  if (hasMore) {
    // Use the last doc's updatedAt as the cursor for the next page
    const lastDoc = pageDocs[pageDocs.length - 1]
    response.nextPageToken = lastDoc.data().updatedAt?.toDate()?.toISOString()
  }

  return response
}

/**
 * Get all venues in the system (super admin only).
 * Used for support access to view all venues across all users.
 */
export const getAllVenues = onCall<GetAllVenuesRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GetAllVenuesResponse> => {
    return getAllVenuesHandler(request as never)
  }
)
