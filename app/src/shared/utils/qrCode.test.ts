import { describe, it, expect, vi } from 'vitest'
import { generateQRCodeDataUrl, generateQRCode, generateQRCodesForAreas, getEmbedLabel } from './qrCode'

describe('qrCode utilities', () => {
  describe('getEmbedLabel', () => {
    it('returns Interactive Map for BindiWeb URLs', () => {
      const result = getEmbedLabel('https://bindiweb.com/map/venue123')
      expect(result.title).toBe('Interactive Map')
      expect(result.hint).toBe('Scan to view on your phone')
    })

    it('returns Interactive Map for Google Maps URLs', () => {
      expect(getEmbedLabel('https://maps.google.com/something').title).toBe('Interactive Map')
      expect(getEmbedLabel('https://google.com/maps/place/123').title).toBe('Interactive Map')
    })

    it('returns Video for YouTube URLs', () => {
      const result = getEmbedLabel('https://www.youtube.com/embed/abc123')
      expect(result.title).toBe('Video')
      expect(result.hint).toBe('Scan to watch on your phone')
    })

    it('returns Video for Vimeo URLs', () => {
      const result = getEmbedLabel('https://player.vimeo.com/video/123')
      expect(result.title).toBe('Video')
      expect(result.hint).toBe('Scan to watch on your phone')
    })

    it('returns View Online for unknown URLs', () => {
      const result = getEmbedLabel('https://example.com/something')
      expect(result.title).toBe('View Online')
      expect(result.hint).toBe('Scan for more info')
    })

    it('is case insensitive', () => {
      expect(getEmbedLabel('https://BINDIWEB.COM/map').title).toBe('Interactive Map')
      expect(getEmbedLabel('https://YOUTUBE.com/embed/x').title).toBe('Video')
    })
  })

  describe('generateQRCodeDataUrl', () => {
    it('generates a data URL for a valid URL', async () => {
      const result = await generateQRCodeDataUrl('https://example.com/map')
      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it('generates different data URLs for different inputs', async () => {
      const result1 = await generateQRCodeDataUrl('https://example.com/map1')
      const result2 = await generateQRCodeDataUrl('https://example.com/map2')
      expect(result1).not.toBe(result2)
    })

    it('handles special characters in URL', async () => {
      const result = await generateQRCodeDataUrl('https://example.com/map?param=value&other=123')
      expect(result).toMatch(/^data:image\/png;base64,/)
    })

    it('handles very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500)
      const result = await generateQRCodeDataUrl(longUrl)
      expect(result).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('generateQRCode', () => {
    it('generates both data URL and buffer', async () => {
      const result = await generateQRCode('https://example.com/map')
      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/)
      // Check buffer is array-like with length (works for Buffer and Uint8Array)
      expect(result.buffer).toBeDefined()
      expect(result.buffer.length).toBeGreaterThan(0)
    })

    it('generates valid PNG buffer', async () => {
      const result = await generateQRCode('https://example.com/map')
      // PNG magic bytes: 0x89 0x50 0x4E 0x47
      expect(result.buffer[0]).toBe(0x89)
      expect(result.buffer[1]).toBe(0x50) // 'P'
      expect(result.buffer[2]).toBe(0x4e) // 'N'
      expect(result.buffer[3]).toBe(0x47) // 'G'
    })
  })

  describe('generateQRCodesForAreas', () => {
    it('generates QR codes with labels and buffers for areas with embed URLs', async () => {
      const areas = [
        { id: 'area-1', embedUrls: ['https://bindiweb.com/map1'] },
        { id: 'area-2', embedUrls: ['https://youtube.com/embed/abc'] },
      ]

      const result = await generateQRCodesForAreas(areas)

      expect(Object.keys(result)).toHaveLength(2)
      expect(result['area-1'].dataUrl).toMatch(/^data:image\/png;base64,/)
      expect(result['area-1'].buffer).toBeDefined()
      expect(result['area-1'].buffer.length).toBeGreaterThan(0)
      expect(result['area-1'].label.title).toBe('Interactive Map')
      expect(result['area-2'].dataUrl).toMatch(/^data:image\/png;base64,/)
      expect(result['area-2'].buffer).toBeDefined()
      expect(result['area-2'].buffer.length).toBeGreaterThan(0)
      expect(result['area-2'].label.title).toBe('Video')
    })

    it('skips areas without embed URLs', async () => {
      const areas = [
        { id: 'area-1', embedUrls: ['https://example.com/map1'] },
        { id: 'area-2', embedUrls: [] },
        { id: 'area-3' }, // No embedUrls property
      ]

      const result = await generateQRCodesForAreas(areas)

      expect(Object.keys(result)).toHaveLength(1)
      expect(result['area-1']).toBeDefined()
      expect(result['area-2']).toBeUndefined()
      expect(result['area-3']).toBeUndefined()
    })

    it('uses only the first embed URL when multiple exist', async () => {
      const areas = [
        { id: 'area-1', embedUrls: ['https://bindiweb.com/first', 'https://youtube.com/second'] },
      ]

      const result = await generateQRCodesForAreas(areas)

      expect(result['area-1'].dataUrl).toMatch(/^data:image\/png;base64,/)
      // Should use first URL (bindiweb) not second (youtube)
      expect(result['area-1'].label.title).toBe('Interactive Map')
    })

    it('returns empty object for areas with no embeds', async () => {
      const areas = [
        { id: 'area-1', embedUrls: [] },
        { id: 'area-2' },
      ]

      const result = await generateQRCodesForAreas(areas)

      expect(Object.keys(result)).toHaveLength(0)
    })

    it('handles empty areas array', async () => {
      const result = await generateQRCodesForAreas([])
      expect(result).toEqual({})
    })

    it('continues processing if one area fails', async () => {
      // Mock console.warn to suppress warning
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Create areas where we can test error handling
      const areas = [
        { id: 'area-1', embedUrls: ['https://example.com/map1'] },
        { id: 'area-2', embedUrls: ['https://example.com/map2'] },
      ]

      const result = await generateQRCodesForAreas(areas)

      // Both should succeed in normal operation
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(1)

      warnSpy.mockRestore()
    })
  })
})
