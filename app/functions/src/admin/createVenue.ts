import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'
import { isApprovedUser } from '../utils/accessControl'

interface CreateVenueRequest {
  name: string
  slug: string
}

interface CreateVenueResponse {
  success: boolean
  venueId: string
  slug: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Create a new venue with allow-list protection.
 *
 * Only users on the allow-list (or super admins) can create venues.
 * This protects LLM API budget from abuse.
 */
export const createVenue = onCall<CreateVenueRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<CreateVenueResponse> => {
    // 1. Auth check
    const userEmail = requireAuth(request)

    // 2. Allow-list check (AC5: server-side protection)
    const approved = await isApprovedUser(userEmail)
    if (!approved) {
      throw new HttpsError(
        'permission-denied',
        'Account not yet approved for venue creation'
      )
    }

    // 3. Validate input
    const { name, slug: requestedSlug } = request.data

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'Venue name is required')
    }

    const trimmedName = name.trim()
    if (trimmedName.length > 100) {
      throw new HttpsError('invalid-argument', 'Venue name is too long (max 100 characters)')
    }

    // Slugify and validate
    const slug = slugify(requestedSlug || trimmedName)
    if (!slug || slug.length === 0) {
      throw new HttpsError('invalid-argument', 'Could not generate a valid URL slug')
    }

    if (slug.length > 100) {
      throw new HttpsError('invalid-argument', 'URL slug is too long')
    }

    // 4. Check slug uniqueness
    const db = getFirestore()
    const existingQuery = await db
      .collection('venues')
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (!existingQuery.empty) {
      throw new HttpsError('already-exists', 'This URL slug is already taken')
    }

    // 5. Create the venue
    const venueData = {
      name: trimmedName,
      slug,
      status: 'draft',
      editors: [userEmail],
      createdBy: userEmail,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const docRef = await db.collection('venues').add(venueData)

    console.log(`Venue created: id=${docRef.id}, slug=${slug}, user=${userEmail}`)

    return {
      success: true,
      venueId: docRef.id,
      slug,
    }
  }
)
