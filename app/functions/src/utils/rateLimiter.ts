import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'

export const DAILY_TRANSFORM_LIMIT = 20

/**
 * Check if user has reached their daily transform limit
 * @returns Current usage count
 * @throws HttpsError if limit exceeded (unless superadmin)
 */
export async function checkRateLimit(userEmail: string, isSuperAdmin = false): Promise<number> {
  const db = getFirestore()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today)
  const usageDoc = await usageRef.get()

  const currentCount = usageDoc.exists ? (usageDoc.data()?.count as number) || 0 : 0

  // Superadmins bypass rate limit
  if (!isSuperAdmin && currentCount >= DAILY_TRANSFORM_LIMIT) {
    throw new HttpsError(
      'resource-exhausted',
      `Daily limit reached. You have used ${currentCount} of ${DAILY_TRANSFORM_LIMIT} transforms today. Try again tomorrow.`,
      { usageToday: currentCount, usageLimit: DAILY_TRANSFORM_LIMIT }
    )
  }

  return currentCount
}

/**
 * Get current usage without throwing
 */
export async function getCurrentUsage(userEmail: string, isSuperAdmin = false): Promise<{
  usageToday: number
  usageLimit: number
  remaining: number
  isUnlimited: boolean
}> {
  const db = getFirestore()
  const today = new Date().toISOString().split('T')[0]

  const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today)
  const usageDoc = await usageRef.get()

  const usageToday = usageDoc.exists ? (usageDoc.data()?.count as number) || 0 : 0

  return {
    usageToday,
    usageLimit: DAILY_TRANSFORM_LIMIT,
    remaining: isSuperAdmin ? Infinity : Math.max(0, DAILY_TRANSFORM_LIMIT - usageToday),
    isUnlimited: isSuperAdmin,
  }
}

/**
 * Increment the user's daily usage counter
 * Call this AFTER successful transform only
 */
export async function incrementUsage(userEmail: string): Promise<void> {
  const db = getFirestore()
  const today = new Date().toISOString().split('T')[0]

  const usageRef = db.collection('usage').doc(userEmail).collection('daily').doc(today)

  await usageRef.set(
    {
      count: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}
