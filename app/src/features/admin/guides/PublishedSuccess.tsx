import { useState } from 'react'
import { CheckCircle, Copy, ExternalLink, Upload } from 'lucide-react'

interface PublishedSuccessProps {
  slug: string
  publicUrl: string
  onUploadNew: () => void
}

/**
 * Success state shown after a guide is published.
 *
 * Features:
 * - Checkmark and success message
 * - Shareable URL with copy button
 * - View Live Guide button (opens in new tab)
 * - Upload New Version button to start new transform
 */
export function PublishedSuccess({
  slug,
  publicUrl,
  onUploadNew,
}: PublishedSuccessProps) {
  const [copied, setCopied] = useState(false)

  // Use window location to construct the public guide URL
  const guideUrl = `${window.location.origin}/venue/${slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guideUrl)
      setCopied(true)

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = guideUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-medium text-green-800">Guide published!</h3>
          <p className="text-sm text-green-700 mt-0.5">
            Your Sensory Guide is now publicly accessible.
          </p>
        </div>
      </div>

      {/* Shareable URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Shareable URL
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-md px-3 py-2 font-mono text-sm text-gray-800 truncate">
            {guideUrl}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={copied ? 'URL copied to clipboard' : 'Copy URL to clipboard'}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {copied && (
          <p className="text-sm text-green-600" role="status" aria-live="polite">
            URL copied to clipboard
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={guideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#B8510D] px-4 py-2 text-sm font-medium text-white hover:bg-[#9A4410] focus:outline-none focus:ring-2 focus:ring-[#B8510D] focus:ring-offset-2"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View Live Guide
        </a>
        <button
          type="button"
          onClick={onUploadNew}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload New Version
        </button>
      </div>

      {/* Debug info for development */}
      {import.meta.env.DEV && (
        <details className="text-xs text-gray-500 mt-4">
          <summary className="cursor-pointer">Debug info</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ slug, publicUrl, guideUrl }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
