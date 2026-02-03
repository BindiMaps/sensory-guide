import QRCode from 'qrcode'
import { Buffer } from 'buffer'

export interface EmbedLabel {
  title: string
  hint: string
}

export interface QRCodeData {
  dataUrl: string
  /** Buffer for react-pdf Image component (more reliable than data URL) */
  buffer: Buffer
  label: EmbedLabel
}

/**
 * Determine appropriate label based on embed URL
 */
export function getEmbedLabel(url: string): EmbedLabel {
  const lower = url.toLowerCase()

  if (lower.includes('bindiweb') || lower.includes('maps.google') || lower.includes('google.com/maps')) {
    return { title: 'Interactive Map', hint: 'Scan to view on your phone' }
  }

  if (lower.includes('youtube') || lower.includes('vimeo')) {
    return { title: 'Video', hint: 'Scan to watch on your phone' }
  }

  return { title: 'View Online', hint: 'Scan for more info' }
}

const QR_OPTIONS = {
  width: 80,
  margin: 1,
  errorCorrectionLevel: 'M' as const,
  color: {
    dark: '#1A1A1A',
    light: '#FFFFFF',
  },
}

/**
 * Generate a QR code as a data URL (base64 PNG)
 * Compatible with @react-pdf/renderer's Image component
 *
 * @param url - The URL to encode in the QR code
 * @returns Promise resolving to a data URL string
 */
export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, QR_OPTIONS)
}

/**
 * Convert a base64 data URL to a Buffer
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(',')[1]
  return Buffer.from(base64, 'base64')
}

/**
 * Generate a QR code as both data URL and Buffer
 * Buffer format is more reliable for react-pdf
 *
 * @param url - The URL to encode in the QR code
 * @returns Promise resolving to { dataUrl, buffer }
 */
export async function generateQRCode(url: string): Promise<{ dataUrl: string; buffer: Buffer }> {
  const dataUrl = await QRCode.toDataURL(url, QR_OPTIONS)
  const buffer = dataUrlToBuffer(dataUrl)
  return { dataUrl, buffer }
}

/**
 * Generate QR codes for all areas that have embed URLs
 * Returns a map of areaId -> QR data + label
 *
 * @param areas - Array of areas with potential embedUrls
 * @returns Promise resolving to Record<areaId, QRCodeData>
 */
export async function generateQRCodesForAreas(
  areas: Array<{ id: string; embedUrls?: string[] }>
): Promise<Record<string, QRCodeData>> {
  const qrPromises: Promise<[string, QRCodeData] | null>[] = areas.map(async (area) => {
    const embedUrl = area.embedUrls?.[0]
    if (!embedUrl) return null

    try {
      const { dataUrl, buffer } = await generateQRCode(embedUrl)
      const label = getEmbedLabel(embedUrl)
      return [area.id, { dataUrl, buffer, label }] as [string, QRCodeData]
    } catch {
      // If QR generation fails, skip this area
      console.warn(`Failed to generate QR for area ${area.id}`)
      return null
    }
  })

  const results = await Promise.all(qrPromises)
  return Object.fromEntries(results.filter((r): r is [string, QRCodeData] => r !== null))
}
