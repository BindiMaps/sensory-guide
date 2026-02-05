import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import { ensureUserWithResetLink } from '../utils/userAuth'

interface InviteEditorRequest {
  email: string
  venueId: string
}

interface InviteEditorResponse {
  success: boolean
  email: string
  isNewUser: boolean
  resetLink: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EDITORS = 5

/**
 * Invite a user as an editor for a venue.
 *
 * - Creates Firebase Auth account if user doesn't exist
 * - Always returns a password reset link (expires in 1 hour)
 * - Adds email to venue's editors array
 *
 * Caller must be an editor of the venue (or super admin).
 */
export const inviteEditor = onCall<InviteEditorRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<InviteEditorResponse> => {
    // 1. Auth check
    const callerEmail = requireAuth(request)

    // 2. Validate input
    const { email, venueId } = request.data

    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }

    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'email is required')
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      throw new HttpsError('invalid-argument', 'Invalid email format')
    }

    // 3. Verify caller has editor access
    await requireEditorAccess(callerEmail, venueId)

    // 4. Get venue and validate constraints
    const db = getFirestore()
    const venueRef = db.collection('venues').doc(venueId)
    const venueDoc = await venueRef.get()

    if (!venueDoc.exists) {
      throw new HttpsError('not-found', 'Venue not found')
    }

    const venueData = venueDoc.data()!
    const editors = (venueData.editors as string[]) || []

    // Check if already an editor
    if (editors.map((e) => e.toLowerCase()).includes(normalizedEmail)) {
      throw new HttpsError('already-exists', 'This person is already an editor')
    }

    // Check max editors
    if (editors.length >= MAX_EDITORS) {
      throw new HttpsError('failed-precondition', `Maximum ${MAX_EDITORS} editors per venue`)
    }

    // 5. Ensure Firebase Auth user exists, get reset link
    const { isNewUser, resetLink } = await ensureUserWithResetLink(normalizedEmail)

    // 6. Add to editors array
    await venueRef.update({
      editors: FieldValue.arrayUnion(normalizedEmail),
      updatedAt: FieldValue.serverTimestamp(),
    })

    console.log(
      `Editor invited: venue=${venueId}, email=${normalizedEmail}, isNew=${isNewUser}, by=${callerEmail}`
    )

    return {
      success: true,
      email: normalizedEmail,
      isNewUser,
      resetLink,
    }
  }
)
