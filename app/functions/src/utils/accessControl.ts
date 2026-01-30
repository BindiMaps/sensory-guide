import { getFirestore } from 'firebase-admin/firestore'

/**
 * Check if an email is in the super admin list.
 * Super admins bypass all access restrictions.
 */
export async function isSuperAdmin(email: string): Promise<boolean> {
  const db = getFirestore()
  const superAdminsDoc = await db.collection('config').doc('superAdmins').get()

  if (!superAdminsDoc.exists) {
    return false
  }

  const emails = superAdminsDoc.data()?.emails as string[] | undefined
  if (!emails || !Array.isArray(emails)) {
    return false
  }

  return emails.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

/**
 * Check if an email is approved for venue creation.
 * Returns true if:
 * - User is a super admin, OR
 * - User's email is in the allow-list
 */
export async function isApprovedUser(email: string): Promise<boolean> {
  // Super admins always approved
  if (await isSuperAdmin(email)) {
    return true
  }

  const db = getFirestore()
  const accessDoc = await db.collection('config').doc('access').get()

  if (!accessDoc.exists) {
    // If no access doc exists, deny by default (fail secure)
    return false
  }

  const allowedEmails = accessDoc.data()?.allowedEmails as string[] | undefined
  if (!allowedEmails || !Array.isArray(allowedEmails)) {
    return false
  }

  return allowedEmails.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

/**
 * Get the list of allowed emails (for super admin UI).
 */
export async function getAllowedEmails(): Promise<string[]> {
  const db = getFirestore()
  const accessDoc = await db.collection('config').doc('access').get()

  if (!accessDoc.exists) {
    return []
  }

  const emails = accessDoc.data()?.allowedEmails as string[] | undefined
  return emails || []
}

/**
 * Add an email to the allow-list.
 */
export async function addAllowedEmail(email: string): Promise<void> {
  const db = getFirestore()
  const accessRef = db.collection('config').doc('access')
  const accessDoc = await accessRef.get()

  const normalizedEmail = email.toLowerCase().trim()

  if (!accessDoc.exists) {
    await accessRef.set({ allowedEmails: [normalizedEmail] })
  } else {
    const current = (accessDoc.data()?.allowedEmails as string[]) || []
    if (!current.map((e) => e.toLowerCase()).includes(normalizedEmail)) {
      await accessRef.update({ allowedEmails: [...current, normalizedEmail] })
    }
  }
}

/**
 * Remove an email from the allow-list.
 */
export async function removeAllowedEmail(email: string): Promise<void> {
  const db = getFirestore()
  const accessRef = db.collection('config').doc('access')
  const accessDoc = await accessRef.get()

  if (!accessDoc.exists) {
    return
  }

  const current = (accessDoc.data()?.allowedEmails as string[]) || []
  const normalizedEmail = email.toLowerCase().trim()
  const updated = current.filter((e) => e.toLowerCase() !== normalizedEmail)

  await accessRef.update({ allowedEmails: updated })
}
