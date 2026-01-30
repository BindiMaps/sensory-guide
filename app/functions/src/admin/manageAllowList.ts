import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { requireAuth } from '../middleware/auth'
import {
  isSuperAdmin,
  getAllowedEmails,
  addAllowedEmail,
  removeAllowedEmail,
} from '../utils/accessControl'

interface GetAllowListResponse {
  emails: string[]
}

interface AddEmailRequest {
  email: string
}

interface RemoveEmailRequest {
  email: string
}

interface ModifyAllowListResponse {
  success: boolean
  emails: string[]
}

/**
 * Get the current allow-list (super admin only).
 */
export const getAllowList = onCall(
  {
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
  },
  async (request): Promise<GetAllowListResponse> => {
    const userEmail = requireAuth(request)

    // Only super admins can view the allow-list
    if (!(await isSuperAdmin(userEmail))) {
      throw new HttpsError('permission-denied', 'Super admin access required')
    }

    const emails = await getAllowedEmails()
    return { emails }
  }
)

/**
 * Add an email to the allow-list (super admin only).
 */
export const addToAllowList = onCall<AddEmailRequest>(
  {
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
  },
  async (request): Promise<ModifyAllowListResponse> => {
    const userEmail = requireAuth(request)

    // Only super admins can modify the allow-list
    if (!(await isSuperAdmin(userEmail))) {
      throw new HttpsError('permission-denied', 'Super admin access required')
    }

    const { email } = request.data

    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'Email is required')
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new HttpsError('invalid-argument', 'Invalid email format')
    }

    await addAllowedEmail(email)
    const emails = await getAllowedEmails()

    console.log(`Allow-list: added ${email} by ${userEmail}`)

    return { success: true, emails }
  }
)

/**
 * Remove an email from the allow-list (super admin only).
 */
export const removeFromAllowList = onCall<RemoveEmailRequest>(
  {
    cors: true,
    timeoutSeconds: 10,
    memory: '256MiB',
  },
  async (request): Promise<ModifyAllowListResponse> => {
    const userEmail = requireAuth(request)

    // Only super admins can modify the allow-list
    if (!(await isSuperAdmin(userEmail))) {
      throw new HttpsError('permission-denied', 'Super admin access required')
    }

    const { email } = request.data

    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'Email is required')
    }

    await removeAllowedEmail(email)
    const emails = await getAllowedEmails()

    console.log(`Allow-list: removed ${email} by ${userEmail}`)

    return { success: true, emails }
  }
)
