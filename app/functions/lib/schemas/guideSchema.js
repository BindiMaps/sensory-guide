"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformProgressSchema = exports.transformProgressStatusSchema = exports.guideSchema = exports.venueOverviewSchema = exports.facilitiesSchema = exports.quietZoneSchema = exports.facilitySchema = exports.areaSchema = exports.sensoryDetailSchema = exports.sensoryCategorySchema = exports.sensoryLevelSchema = void 0;
exports.validateGuide = validateGuide;
exports.getGuideJsonSchemaString = getGuideJsonSchemaString;
const zod_1 = require("zod");
// Sensory level enum - matches design system colours
exports.sensoryLevelSchema = zod_1.z.enum(['low', 'medium', 'high']);
// Sensory categories - flexible to allow AI to identify any relevant category
// Common examples: Sound, Light, Crowds, Smell, Touch, Movement, Temperature
// But not constrained - LLM can use whatever categories make sense for the venue
exports.sensoryCategorySchema = zod_1.z.string().min(1, 'Category name is required');
// Sensory detail within an area
exports.sensoryDetailSchema = zod_1.z.object({
    category: exports.sensoryCategorySchema,
    level: exports.sensoryLevelSchema,
    description: zod_1.z.string().min(1, 'Description is required'),
    imageUrl: zod_1.z.string().url().optional(),
});
// Area/zone in the venue journey
exports.areaSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1, 'Area name is required'),
    order: zod_1.z.number().int().min(0),
    // LLM-generated preview summary (1-2 sentences, optimised for collapsed view)
    summary: zod_1.z.string().optional(),
    badges: zod_1.z.array(exports.sensoryCategorySchema).default([]),
    details: zod_1.z.array(exports.sensoryDetailSchema).default([]),
});
// Facility information
exports.facilitySchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    mapUrl: zod_1.z.string().url().optional(),
});
// Quiet zone (no mapUrl typically)
exports.quietZoneSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
});
// Facilities section
exports.facilitiesSchema = zod_1.z.object({
    exits: zod_1.z.array(exports.facilitySchema).default([]),
    bathrooms: zod_1.z.array(exports.facilitySchema).default([]),
    quietZones: zod_1.z.array(exports.quietZoneSchema).default([]),
});
// Venue overview
exports.venueOverviewSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Venue name is required'),
    address: zod_1.z.string().min(1, 'Address is required'),
    contact: zod_1.z.string().optional(),
    summary: zod_1.z.string().min(1, 'Summary is required'),
    // LLMs return various date formats - be lenient on client
    lastUpdated: zod_1.z.string().min(1, 'Last updated date is required'),
});
// Complete Guide schema - the main output from LLM transformation
exports.guideSchema = zod_1.z.object({
    schemaVersion: zod_1.z.string().default('1.0'),
    venue: exports.venueOverviewSchema,
    categories: zod_1.z.array(exports.sensoryCategorySchema).default([]),
    areas: zod_1.z.array(exports.areaSchema).min(1, 'At least one area is required'),
    facilities: exports.facilitiesSchema.default({
        exits: [],
        bathrooms: [],
        quietZones: [],
    }),
    suggestions: zod_1.z.array(zod_1.z.string()).default([]),
    // LLMs return various date formats - be lenient on client
    generatedAt: zod_1.z.string().min(1, 'Generated date is required'),
});
// Progress status for transformation
exports.transformProgressStatusSchema = zod_1.z.enum([
    'uploaded',
    'extracting',
    'analysing',
    'generating',
    'ready',
    'failed',
]);
// Progress document structure
exports.transformProgressSchema = zod_1.z.object({
    status: exports.transformProgressStatusSchema,
    progress: zod_1.z.number().min(0).max(100),
    startedAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    error: zod_1.z.string().optional(),
    outputPath: zod_1.z.string().optional(),
    retryCount: zod_1.z.number().int().min(0).default(0),
});
// Helper to validate guide JSON from LLM
function validateGuide(data) {
    const result = exports.guideSchema.safeParse(data);
    if (result.success) {
        return { valid: true, data: result.data };
    }
    const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    return { valid: false, errors };
}
// Generate JSON schema string for LLM prompt
function getGuideJsonSchemaString() {
    return `{
  "schemaVersion": "1.0",
  "venue": {
    "name": "string (venue name)",
    "address": "string (full address)",
    "contact": "string (optional - phone or email)",
    "summary": "string (1-2 sentence overview)",
    "lastUpdated": "string (ISO date, e.g., 2026-01-29)"
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
}`;
}
//# sourceMappingURL=guideSchema.js.map