import { describe, it, expect } from 'vitest'
import {
  guideSchema,
  validateGuide,
  sensoryLevelSchema,
  sensoryCategorySchema,
  areaSchema,
  transformProgressStatusSchema,
  getGuideJsonSchemaString,
} from './guideSchema'

describe('guideSchema', () => {
  const validGuide = {
    schemaVersion: '1.0',
    venue: {
      name: 'Adelaide Railway Station',
      address: '101 North Terrace, Adelaide SA 5000',
      contact: '08 8218 2222',
      summary: 'A major transport hub in central Adelaide.',
      lastUpdated: '2026-01-29T00:00:00.000Z',
    },
    categories: ['Sound', 'Light', 'Crowds'],
    areas: [
      {
        id: 'entry',
        name: 'Main Entrance',
        order: 0,
        badges: ['Sound', 'Crowds'],
        details: [
          {
            category: 'Sound',
            level: 'high',
            description: 'Announcements and train noises can be loud.',
          },
          {
            category: 'Crowds',
            level: 'medium',
            description: 'Busy during peak hours.',
          },
        ],
      },
    ],
    facilities: {
      exits: [{ description: 'Main exit on North Terrace' }],
      bathrooms: [{ description: 'Near platform 1' }],
      quietZones: [{ description: 'Seating area on platform 5' }],
    },
    suggestions: ['Add more detail about lighting conditions'],
    generatedAt: '2026-01-29T10:30:00.000Z',
  }

  describe('valid guide parsing', () => {
    it('parses a valid guide successfully', () => {
      const result = guideSchema.safeParse(validGuide)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.venue.name).toBe('Adelaide Railway Station')
        expect(result.data.areas).toHaveLength(1)
      }
    })

    it('sets default values for optional fields', () => {
      const minimalGuide = {
        venue: {
          name: 'Test Venue',
          address: '123 Test St',
          summary: 'A test venue.',
          lastUpdated: '2026-01-29T00:00:00.000Z',
        },
        areas: [
          {
            id: 'main',
            name: 'Main Area',
            order: 0,
          },
        ],
        generatedAt: '2026-01-29T10:30:00.000Z',
      }

      const result = guideSchema.safeParse(minimalGuide)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.schemaVersion).toBe('1.0')
        expect(result.data.categories).toEqual([])
        expect(result.data.suggestions).toEqual([])
        expect(result.data.facilities.exits).toEqual([])
      }
    })
  })

  describe('invalid guide parsing', () => {
    it('rejects guide without venue name', () => {
      const invalid = {
        ...validGuide,
        venue: { ...validGuide.venue, name: '' },
      }
      const result = guideSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects guide without areas', () => {
      const invalid = { ...validGuide, areas: [] }
      const result = guideSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects invalid sensory level', () => {
      const invalid = {
        ...validGuide,
        areas: [
          {
            ...validGuide.areas[0],
            details: [{ category: 'Sound', level: 'extreme', description: 'test' }],
          },
        ],
      }
      const result = guideSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects empty category', () => {
      const invalid = {
        ...validGuide,
        areas: [
          {
            ...validGuide.areas[0],
            details: [{ category: '', level: 'low', description: 'test' }],
          },
        ],
      }
      const result = guideSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects empty generatedAt', () => {
      const invalid = {
        ...validGuide,
        generatedAt: '',
      }
      const result = guideSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('accepts various date formats from LLM', () => {
      // LLMs return various formats, we should be lenient
      const withDateOnly = { ...validGuide, generatedAt: '2026-01-29' }
      const withTextDate = { ...validGuide, generatedAt: 'January 29, 2026' }

      expect(guideSchema.safeParse(withDateOnly).success).toBe(true)
      expect(guideSchema.safeParse(withTextDate).success).toBe(true)
    })
  })

  describe('validateGuide helper', () => {
    it('returns valid: true for valid guide', () => {
      const result = validateGuide(validGuide)
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.venue.name).toBe('Adelaide Railway Station')
      }
    })

    it('returns valid: false with errors for invalid guide', () => {
      const result = validateGuide({ invalid: 'data' })
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })
  })
})

describe('sensoryLevelSchema', () => {
  it('accepts valid levels', () => {
    expect(sensoryLevelSchema.safeParse('low').success).toBe(true)
    expect(sensoryLevelSchema.safeParse('medium').success).toBe(true)
    expect(sensoryLevelSchema.safeParse('high').success).toBe(true)
  })

  it('rejects invalid levels', () => {
    expect(sensoryLevelSchema.safeParse('extreme').success).toBe(false)
    expect(sensoryLevelSchema.safeParse('').success).toBe(false)
  })
})

describe('sensoryCategorySchema', () => {
  it('accepts any non-empty string category', () => {
    // Common categories
    const categories = ['Sound', 'Light', 'Crowds', 'Smell', 'Touch', 'Movement', 'Temperature']
    categories.forEach((cat) => {
      expect(sensoryCategorySchema.safeParse(cat).success).toBe(true)
    })
    // AI can use any category that makes sense
    expect(sensoryCategorySchema.safeParse('Noise').success).toBe(true)
    expect(sensoryCategorySchema.safeParse('Vibration').success).toBe(true)
    expect(sensoryCategorySchema.safeParse('Air Quality').success).toBe(true)
  })

  it('rejects empty category', () => {
    expect(sensoryCategorySchema.safeParse('').success).toBe(false)
  })
})

describe('areaSchema', () => {
  it('parses valid area', () => {
    const area = {
      id: 'entry',
      name: 'Entry Hall',
      order: 0,
      badges: ['Sound'],
      details: [],
    }
    const result = areaSchema.safeParse(area)
    expect(result.success).toBe(true)
  })

  it('requires id and name', () => {
    const noId = { name: 'Entry', order: 0 }
    const noName = { id: 'entry', order: 0 }

    expect(areaSchema.safeParse(noId).success).toBe(false)
    expect(areaSchema.safeParse(noName).success).toBe(false)
  })
})

describe('transformProgressStatusSchema', () => {
  it('accepts all valid statuses', () => {
    const statuses = ['uploaded', 'extracting', 'analysing', 'generating', 'ready', 'failed']
    statuses.forEach((status) => {
      expect(transformProgressStatusSchema.safeParse(status).success).toBe(true)
    })
  })

  it('rejects invalid status', () => {
    expect(transformProgressStatusSchema.safeParse('processing').success).toBe(false)
    expect(transformProgressStatusSchema.safeParse('').success).toBe(false)
  })
})

describe('getGuideJsonSchemaString', () => {
  it('returns a non-empty string', () => {
    const schema = getGuideJsonSchemaString()
    expect(typeof schema).toBe('string')
    expect(schema.length).toBeGreaterThan(100)
  })

  it('includes key schema fields', () => {
    const schema = getGuideJsonSchemaString()
    expect(schema).toContain('schemaVersion')
    expect(schema).toContain('venue')
    expect(schema).toContain('areas')
    expect(schema).toContain('facilities')
    expect(schema).toContain('suggestions')
  })
})
