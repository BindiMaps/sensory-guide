import { getAuth } from 'firebase-admin/auth'
import { HttpsError } from 'firebase-functions/v2/https'

export interface EnsureUserResult {
  email: string
  isNewUser: boolean
  resetLink: string
}

/**
 * Ensures a Firebase Auth user exists for the given email.
 * Creates the user if they don't exist.
 * Always generates a password reset link (expires in 1 hour).
 *
 * @returns The normalised email, whether user was created, and reset link
 */
export async function ensureUserWithResetLink(email: string): Promise<EnsureUserResult> {
  const auth = getAuth()
  const normalizedEmail = email.toLowerCase().trim()
  let isNewUser = false

  try {
    await auth.getUserByEmail(normalizedEmail)
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/user-not-found'
    ) {
      await auth.createUser({ email: normalizedEmail })
      isNewUser = true
      console.log(`New Firebase Auth user created: ${normalizedEmail}`)
    } else {
      console.error('Error checking user:', error)
      throw new HttpsError('internal', 'Failed to process user account')
    }
  }

  const resetLink = await auth.generatePasswordResetLink(normalizedEmail)

  return {
    email: normalizedEmail,
    isNewUser,
    resetLink,
  }
}

/**
 * Generates a password reset link for an existing user.
 * Throws if user doesn't exist.
 *
 * @returns The reset link (expires in 1 hour)
 */
export async function generateResetLink(email: string): Promise<string> {
  const auth = getAuth()
  const normalizedEmail = email.toLowerCase().trim()

  try {
    await auth.getUserByEmail(normalizedEmail)
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/user-not-found'
    ) {
      throw new HttpsError('not-found', 'User not found in Firebase Auth')
    }
    throw new HttpsError('internal', 'Failed to verify user')
  }

  return auth.generatePasswordResetLink(normalizedEmail)
}
