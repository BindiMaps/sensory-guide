import { onCall } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'
import { isApprovedUser, isSuperAdmin } from '../utils/accessControl'

interface CheckApprovalResponse {
  approved: boolean
  isSuperAdmin: boolean
  needsSetup: boolean
}

/**
 * Check if the current user is approved for venue creation.
 * Used by the client to show/hide the "Create Venue" button.
 *
 * Note: This is for UX only - actual protection is in createVenue function.
 */
export const checkApproval = onCall(
  {
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
  },
  async (request): Promise<CheckApprovalResponse> => {
    const userEmail = requireAuth(request)

    // Check if config exists
    const db = getFirestore()
    const superAdminsDoc = await db.collection('config').doc('superAdmins').get()
    const needsSetup = !superAdminsDoc.exists

    const superAdmin = await isSuperAdmin(userEmail)
    const approved = await isApprovedUser(userEmail)

    return {
      approved,
      isSuperAdmin: superAdmin,
      needsSetup,
    }
  }
)
