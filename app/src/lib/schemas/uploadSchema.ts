import { z } from 'zod'

export const uploadStatusSchema = z.enum(['pending', 'processing', 'complete', 'failed'])

export type UploadStatus = z.infer<typeof uploadStatusSchema>

export const llmLogSchema = z.object({
  userEmail: z.string().email(),
  venueId: z.string(),
  uploadPath: z.string(),
  status: uploadStatusSchema,
  tokensUsed: z.number().nullable(),
  createdAt: z.date(),
})

export type LlmLog = z.infer<typeof llmLogSchema>

export const signedUploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  destinationPath: z.string(),
  logId: z.string(),
  usageToday: z.number(),
  usageLimit: z.number(),
})

export type SignedUploadUrlResponse = z.infer<typeof signedUploadUrlResponseSchema>

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_FILE_TYPES = ['application/pdf']

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are accepted' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}
