// Allowed domains for embedding content
const ALLOWED_EMBED_DOMAINS = [
  'bindiweb.com',
  'youtube.com',
  'youtube-nocookie.com',
  'www.youtube.com',
  'vimeo.com',
  'player.vimeo.com',
  'google.com',
  'maps.google.com',
  'www.google.com',
  'tinyurl.com',
]

export function isEmbeddableUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true } // Empty is allowed (means "remove embed")
  }

  try {
    const parsed = new URL(url)

    // Must be https
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' }
    }

    // Check domain allowlist
    const isAllowed = ALLOWED_EMBED_DOMAINS.some(
      (domain) =>
        parsed.hostname === domain ||
        parsed.hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      return { valid: false, error: 'Domain not supported for embedding' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}
