import { describe, it, expect } from 'vitest'
import { validatePdfFile, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from './uploadSchema'

describe('validatePdfFile', () => {
  it('accepts valid PDF files', () => {
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })
    const result = validatePdfFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects non-PDF files', () => {
    const file = new File(['image content'], 'test.png', { type: 'image/png' })
    const result = validatePdfFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Only PDF files are accepted')
  })

  it('rejects Word documents', () => {
    const file = new File(['doc content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const result = validatePdfFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Only PDF files are accepted')
  })

  it('rejects files that are too large', () => {
    // Create a file larger than MAX_FILE_SIZE
    const largeContent = new Uint8Array(MAX_FILE_SIZE + 1)
    const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
    const result = validatePdfFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('File too large')
  })

  it('accepts files at exactly MAX_FILE_SIZE', () => {
    const content = new Uint8Array(MAX_FILE_SIZE)
    const file = new File([content], 'exact.pdf', { type: 'application/pdf' })
    const result = validatePdfFile(file)
    expect(result.valid).toBe(true)
  })
})

describe('constants', () => {
  it('has correct MAX_FILE_SIZE (10MB)', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('only accepts PDF MIME type', () => {
    expect(ACCEPTED_FILE_TYPES).toEqual(['application/pdf'])
  })
})
