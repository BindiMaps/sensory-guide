import { HttpsError, CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { isSuperAdmin as isSuperAdminFromConfig } from '../utils/accessControl'

// Legacy sync check (for backwards compatibility in requireEditorAccess)
// This is a fallback - prefer the async isSuperAdmin from accessControl
const SUPER_ADMIN_EMAILS_FALLBACK = ['keith@bindimaps.com']

export function isSuperAdminSync(email: string | undefined): boolean {
  return email !== undefined && SUPER_ADMIN_EMAILS_FALLBACK.includes(email)
}

// Re-export async version for convenience
export { isSuperAdminFromConfig as isSuperAdmin }

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

export async function requireEditorAccess(
  userEmail: string,
  venueId: string
): Promise<void> {
  const db = getFirestore()
  const venueDoc = await db.collection('venues').doc(venueId).get()

  if (!venueDoc.exists) {
    throw new HttpsError('not-found', `Venue not found: ${venueId}`)
  }

  const venueData = venueDoc.data()
  const editors = venueData?.editors as string[] | undefined

  if (!editors) {
    throw new HttpsError('internal', 'Venue has no editors array')
  }

  const normalizedEditors = editors.map((e) => e.toLowerCase())
  const normalizedEmail = userEmail.toLowerCase()

  if (!normalizedEditors.includes(normalizedEmail) && !isSuperAdminSync(userEmail)) {
    throw new HttpsError('permission-denied', 'Not an editor of this venue')
  }
}
