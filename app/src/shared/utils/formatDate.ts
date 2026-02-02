/**
 * Format ISO date string for display (Australian English)
 * Returns "Month Year" format (e.g., "January 2024")
 */
export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
    })
  } catch {
    return isoString
  }
}
