import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
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

interface GetAllVenuesResponse {
  venues: VenueListItem[]
}

/**
 * Internal handler for testing - contains the actual logic.
 */
export async function getAllVenuesHandler(
  request: { auth: { token: { email: string } } | null; data: void }
): Promise<GetAllVenuesResponse> {
  const userEmail = requireAuth(request as never)

  // Verify super admin status server-side
  const superAdmin = await isSuperAdmin(userEmail)
  if (!superAdmin) {
    throw new HttpsError('permission-denied', 'Only super admins can view all venues')
  }

  const db = getFirestore()
  const venuesSnapshot = await db
    .collection('venues')
    .orderBy('updatedAt', 'desc')
    .get()

  const venues: VenueListItem[] = venuesSnapshot.docs.map((doc) => {
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

  return { venues }
}

/**
 * Get all venues in the system (super admin only).
 * Used for support access to view all venues across all users.
 */
export const getAllVenues = onCall(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GetAllVenuesResponse> => {
    return getAllVenuesHandler(request as never)
  }
)
