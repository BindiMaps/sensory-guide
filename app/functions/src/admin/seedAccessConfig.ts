import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { requireAuth } from '../middleware/auth'

interface SeedAccessConfigResponse {
  success: boolean
  message: string
}

/**
 * One-time setup function to create the access config documents.
 * Only works if the documents don't already exist (prevents accidental overwrite).
 *
 * Creates:
 * - /config/superAdmins with initial super admin email
 * - /config/access with initial allowed emails
 */
export const seedAccessConfig = onCall(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<SeedAccessConfigResponse> => {
    const userEmail = requireAuth(request)
    const db = getFirestore()

    // Check if superAdmins doc exists
    const superAdminsRef = db.collection('config').doc('superAdmins')
    const superAdminsDoc = await superAdminsRef.get()

    if (superAdminsDoc.exists) {
      throw new HttpsError(
        'already-exists',
        'Config documents already exist. Use the Super Admin UI to manage the allow-list.'
      )
    }

    // Create superAdmins doc with the calling user as first super admin
    await superAdminsRef.set({
      emails: [userEmail, 'keith@bindimaps.com'],
    })

    // Create access doc with the calling user on the allow-list
    const accessRef = db.collection('config').doc('access')
    await accessRef.set({
      allowedEmails: [userEmail],
    })

    console.log(`Access config seeded by ${userEmail}`)

    return {
      success: true,
      message: `Config created. ${userEmail} is now a super admin and on the allow-list.`,
    }
  }
)
