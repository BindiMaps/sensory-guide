import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { requireAuth, requireSuperAdmin } from '../middleware/auth'
import { ensureUserWithResetLink } from '../utils/userAuth'

interface GenerateUserResetLinkRequest {
  email: string
}

interface GenerateUserResetLinkResponse {
  success: boolean
  email: string
  isNewUser: boolean
  resetLink: string
}

/**
 * Generate a password reset link for any user.
 * Creates the Firebase Auth user if they don't exist.
 * Super admin only.
 * Link expires in 1 hour.
 */
export const generateUserResetLink = onCall<GenerateUserResetLinkRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GenerateUserResetLinkResponse> => {
    const callerEmail = requireAuth(request)

    const { email } = request.data

    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'email is required')
    }

    // Super admin only
    await requireSuperAdmin(callerEmail)

    const result = await ensureUserWithResetLink(email)

    console.log(`Reset link generated for ${result.email} by super admin ${callerEmail}`)

    return {
      success: true,
      ...result,
    }
  }
)
