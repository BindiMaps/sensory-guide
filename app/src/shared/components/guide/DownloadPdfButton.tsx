import { useState, useCallback } from 'react'
import { Buffer } from 'buffer'
import type { Guide } from '@/lib/schemas/guideSchema'

// Polyfill Buffer for @react-pdf/renderer in browser
if (typeof (globalThis as unknown as { Buffer?: typeof Buffer }).Buffer === 'undefined') {
  ;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer
}

interface GuidePdfActionsProps {
  guide: Guide
}

const buttonClass =
  'inline-flex items-center gap-2 px-4 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

/**
 * Print and Download PDF buttons for public guide pages - Design System v5
 * Lazy-loads @react-pdf/renderer only when user clicks.
 */
export function GuidePdfActions({ guide }: GuidePdfActionsProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const generatePdf = useCallback(async () => {
    const [{ pdf }, { GuidePdf }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./GuidePdf'),
    ])
    return pdf(<GuidePdf guide={guide} />).toBlob()
  }, [guide])

  const handlePrint = useCallback(async () => {
    setIsPrinting(true)
    try {
      const blob = await generatePdf()
      const url = URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)

      iframe.onload = () => {
        iframe.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
          URL.revokeObjectURL(url)
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsPrinting(false)
    }
  }, [generatePdf])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      const blob = await generatePdf()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${guide.venue.name.replace(/[^a-zA-Z0-9]/g, '-')}-sensory-guide.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [generatePdf, guide.venue.name])

  const isDisabled = isPrinting || isDownloading

  return (
    <div className="flex gap-2">
      {/* Print button */}
      <button
        type="button"
        onClick={handlePrint}
        disabled={isDisabled}
        className={buttonClass}
        aria-label={isPrinting ? 'Generating PDF...' : 'Print guide'}
      >
        {isPrinting ? (
          <Spinner />
        ) : (
          <PrinterIcon />
        )}
        {isPrinting ? 'Generating...' : 'Print'}
      </button>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        className={buttonClass}
        aria-label={isDownloading ? 'Generating PDF...' : 'Download PDF'}
      >
        {isDownloading ? (
          <Spinner />
        ) : (
          <DownloadIcon />
        )}
        {isDownloading ? 'Generating...' : 'Save'}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  )
}

function PrinterIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
      />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  )
}

// Legacy export for backwards compatibility
export const DownloadPdfButton = GuidePdfActions
