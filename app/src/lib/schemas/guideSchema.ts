import { z } from 'zod'

// Sensory level enum - matches design system colours
export const sensoryLevelSchema = z.enum(['low', 'medium', 'high'])
export type SensoryLevel = z.infer<typeof sensoryLevelSchema>

// Sensory categories - flexible to allow AI to identify any relevant category
// Common examples: Sound, Light, Crowds, Smell, Touch, Movement, Temperature
// But not constrained - LLM can use whatever categories make sense for the venue
export const sensoryCategorySchema = z.string().min(1, 'Category name is required')
export type SensoryCategory = z.infer<typeof sensoryCategorySchema>

// Sensory detail within an area
export const sensoryDetailSchema = z.object({
  category: sensoryCategorySchema,
  level: sensoryLevelSchema,
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().url().optional(),
})
export type SensoryDetail = z.infer<typeof sensoryDetailSchema>

// Area/zone in the venue journey
export const areaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Area name is required'),
  order: z.number().int().min(0),
  // LLM-generated preview summary (1-2 sentences, optimised for collapsed view)
  summary: z.string().optional(),
  badges: z.array(sensoryCategorySchema).default([]),
  details: z.array(sensoryDetailSchema).default([]),
  // Section-level images extracted from PDF (public URLs)
  images: z.array(z.string().url()).default([]),
  // Embed URLs for maps, videos, etc. (persisted separately in Firestore, merged at runtime)
  embedUrls: z.array(z.string().url()).default([]),
})
export type Area = z.infer<typeof areaSchema>

// Facility information
export const facilitySchema = z.object({
  description: z.string().min(1),
  mapUrl: z.string().url().optional(),
})
export type Facility = z.infer<typeof facilitySchema>

// Quiet zone (no mapUrl typically)
export const quietZoneSchema = z.object({
  description: z.string().min(1),
})
export type QuietZone = z.infer<typeof quietZoneSchema>

// Facilities section
export const facilitiesSchema = z.object({
  exits: z.array(facilitySchema).default([]),
  bathrooms: z.array(facilitySchema).default([]),
  quietZones: z.array(quietZoneSchema).default([]),
})
export type Facilities = z.infer<typeof facilitiesSchema>

// Venue overview
export const venueOverviewSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().min(1, 'Address is required'),
  contact: z.string().optional(),
  summary: z.string().min(1, 'Summary is required'),
  // Global venue map URL (BindiWeb embed) — set by admin, merged at publish
  mapUrl: z.string().url().optional(),
  // Optional - only if source document has an explicit update date
  // LLM may return null, so we coerce null to undefined
  lastUpdated: z.string().nullish().transform((v) => v ?? undefined),
})
export type VenueOverview = z.infer<typeof venueOverviewSchema>

// Complete Guide schema - the main output from LLM transformation
export const guideSchema = z.object({
  schemaVersion: z.string().default('1.0'),
  venue: venueOverviewSchema,
  categories: z.array(sensoryCategorySchema).default([]),
  areas: z.array(areaSchema).min(1, 'At least one area is required'),
  facilities: facilitiesSchema.default({
    exits: [],
    bathrooms: [],
    quietZones: [],
  }),
  suggestions: z.array(z.string()).default([]),
  // LLMs return various date formats - be lenient on client
  generatedAt: z.string().min(1, 'Generated date is required'),
})
export type Guide = z.infer<typeof guideSchema>

// Progress status for transformation
export const transformProgressStatusSchema = z.enum([
  'uploaded',
  'extracting',
  'analysing',
  'generating',
  'ready',
  'failed',
])
export type TransformProgressStatus = z.infer<typeof transformProgressStatusSchema>

// Progress document structure
export const transformProgressSchema = z.object({
  status: transformProgressStatusSchema,
  progress: z.number().min(0).max(100),
  startedAt: z.date(),
  updatedAt: z.date(),
  error: z.string().optional(),
  outputPath: z.string().optional(),
  retryCount: z.number().int().min(0).default(0),
})
export type TransformProgress = z.infer<typeof transformProgressSchema>

// Helper to validate guide JSON from LLM
export function validateGuide(data: unknown): { valid: true; data: Guide } | { valid: false; errors: string[] } {
  const result = guideSchema.safeParse(data)

  if (result.success) {
    return { valid: true, data: result.data }
  }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  )
  return { valid: false, errors }
}

// Generate JSON schema string for LLM prompt
export function getGuideJsonSchemaString(): string {
  return `{
  "schemaVersion": "1.0",
  "venue": {
    "name": "string (venue name)",
    "address": "string (full address)",
    "contact": "string (optional - phone or email)",
    "summary": "string (1-2 sentence overview)",
    "lastUpdated": "string (optional - ISO date if document has explicit update date)"
  },
  "categories": ["string (sensory categories present in this venue - use whatever makes sense, e.g., Sound, Light, Crowds, Smell, Touch, Movement, Temperature, Vibration, Air Quality, etc.)"],
  "areas": [
    {
      "id": "string (unique identifier, e.g., 'entry', 'main-hall')",
      "name": "string (human-readable area name)",
      "order": number (0-based, journey order),
      "summary": "string (one short sentence, max 15 words, key sensory highlight, e.g., 'Echoing announcements and bright skylights around midday.')",
      "badges": ["string (categories with warnings in this area)"],
      "details": [
        {
          "category": "string (sensory category, e.g., Sound, Light, Crowds)",
          "level": "low" | "medium" | "high",
          "description": "string (specific sensory information)"
        }
      ]
    }
  ],
  "facilities": {
    "exits": [{ "description": "string", "mapUrl": "string (optional URL)" }],
    "bathrooms": [{ "description": "string", "mapUrl": "string (optional URL)" }],
    "quietZones": [{ "description": "string" }]
  },
  "suggestions": ["string (content improvement suggestion)", ...],
  "generatedAt": "string (ISO date, e.g., 2026-01-29T10:30:00Z)"
}`
}
