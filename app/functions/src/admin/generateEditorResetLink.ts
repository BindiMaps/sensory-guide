import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { requireAuth, requireEditorAccess } from '../middleware/auth'
import { generateResetLink } from '../utils/userAuth'

interface GenerateResetLinkRequest {
  email: string
  venueId: string
}

interface GenerateResetLinkResponse {
  success: boolean
  email: string
  resetLink: string
}

/**
 * Generate a password reset link for an editor.
 * Caller must be an editor of the venue (or super admin).
 * Link expires in 1 hour.
 */
export const generateEditorResetLink = onCall<GenerateResetLinkRequest>(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<GenerateResetLinkResponse> => {
    const callerEmail = requireAuth(request)

    const { email, venueId } = request.data

    if (!venueId || typeof venueId !== 'string') {
      throw new HttpsError('invalid-argument', 'venueId is required')
    }

    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'email is required')
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify caller has editor access (super admins bypass)
    await requireEditorAccess(callerEmail, venueId)

    const resetLink = await generateResetLink(normalizedEmail)

    console.log(`Reset link generated for ${normalizedEmail} by ${callerEmail}`)

    return {
      success: true,
      email: normalizedEmail,
      resetLink,
    }
  }
)
