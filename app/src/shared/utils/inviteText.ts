const LOGIN_URL = 'https://sensory-guide.web.app/admin'

/**
 * Generates invite email text to copy to clipboard.
 */
export function generateInviteText(resetLink: string, isNewUser: boolean): string {
  if (isNewUser) {
    return `You've been invited to Sensory Guide!

To get started, please set up your password using the link below:
${resetLink}

This link expires in 1 hour.

Once you've set your password, you can log in here:
${LOGIN_URL}`
  }

  return `You've been added to a venue on Sensory Guide!

Use this link to update your password:
${resetLink}

This link expires in 1 hour.

Log in here:
${LOGIN_URL}`
}
