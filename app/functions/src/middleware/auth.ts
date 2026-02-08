import { HttpsError, CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore'
import { isSuperAdmin } from '../utils/accessControl'

export { isSuperAdmin }

export function requireAuth(request: CallableRequest): string {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in')
  }

  const email = request.auth.token.email
  if (!email) {
    throw new HttpsError('unauthenticated', 'No email associated with account')
  }

  return email
}

export async function requireSuperAdmin(userEmail: string): Promise<void> {
  if (!(await isSuperAdmin(userEmail))) {
    throw new HttpsError('permission-denied', 'Super admin access required')
  }
}

/**
 * Verify editor access and return the venue document snapshot.
 * Callers can reuse the returned snapshot instead of re-fetching.
 */
export async function requireEditorAccess(
  userEmail: string,
  venueId: string
): Promise<DocumentSnapshot> {
  const db = getFirestore()
  const venueDoc = await db.collection('venues').doc(venueId).get()

  if (!venueDoc.exists) {
    throw new HttpsError('not-found', `Venue not found: ${venueId}`)
  }

  // Super admins bypass editor check
  if (await isSuperAdmin(userEmail)) {
    return venueDoc
  }

  const venueData = venueDoc.data()
  const editors = venueData?.editors as string[] | undefined

  if (!editors) {
    throw new HttpsError('internal', 'Venue has no editors array')
  }

  const normalizedEditors = editors.map((e) => e.toLowerCase())
  const normalizedEmail = userEmail.toLowerCase()

  if (!normalizedEditors.includes(normalizedEmail)) {
    throw new HttpsError('permission-denied', 'Not an editor of this venue')
  }

  return venueDoc
}
