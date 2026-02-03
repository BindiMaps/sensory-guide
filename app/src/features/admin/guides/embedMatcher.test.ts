import { describe, it, expect } from 'vitest'
import {
  calculateSimilarity,
  matchEmbeddingsToAreas,
  toSimpleFormat,
  type EmbeddingsWithMeta,
} from './embedMatcher'
import type { Area } from '@/lib/schemas/guideSchema'

describe('calculateSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(calculateSimilarity('Entry Hall', 'Entry Hall')).toBe(1)
  })

  it('returns 1 for case-insensitive match', () => {
    expect(calculateSimilarity('entry hall', 'ENTRY HALL')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(calculateSimilarity('Entry Hall', 'Main Concourse')).toBe(0)
  })

  it('returns partial match for overlapping words', () => {
    const similarity = calculateSimilarity('Entry Hall', 'Entry Foyer')
    expect(similarity).toBeGreaterThan(0)
    expect(similarity).toBeLessThan(1)
    // 1 word overlap (entry) / 3 unique words (entry, hall, foyer) = 0.333
    expect(similarity).toBeCloseTo(1 / 3, 2)
  })

  it('handles punctuation correctly', () => {
    expect(calculateSimilarity('Entry Hall!', 'Entry Hall?')).toBe(1)
  })

  it('handles empty strings', () => {
    expect(calculateSimilarity('', 'Entry Hall')).toBe(0)
    expect(calculateSimilarity('Entry Hall', '')).toBe(0)
    expect(calculateSimilarity('', '')).toBe(0)
  })
})

describe('matchEmbeddingsToAreas', () => {
  const makeArea = (id: string, name: string): Area => ({
    id,
    name,
    order: 0,
    badges: [],
    details: [],
    images: [],
    embedUrls: [],
  })

  it('matches by exact ID', () => {
    const embeddings: EmbeddingsWithMeta = {
      'entry-hall': { urls: ['https://example.com/map1'], title: 'Entry Hall' },
    }
    const areas = [makeArea('entry-hall', 'Entry Hall')]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    expect(result.matched).toEqual({
      'entry-hall': { urls: ['https://example.com/map1'], title: 'Entry Hall' },
    })
    expect(result.orphaned).toHaveLength(0)
  })

  it('matches by title similarity when ID changes', () => {
    // Simulates: PDF re-upload changed "Main Entry Hall" → different ID,
    // but we stored embed under old ID with title "Main Entry Hall"
    const embeddings: EmbeddingsWithMeta = {
      'old-id': { urls: ['https://example.com/map1'], title: 'Main Entry Hall' },
    }
    // New area has same name but different ID (LLM regenerated it)
    const areas = [makeArea('main-entry-hall', 'Main Entry Hall')]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    // Should match because titles are identical (100% similarity)
    expect(result.matched['main-entry-hall']).toBeDefined()
    expect(result.matched['main-entry-hall'].urls).toEqual(['https://example.com/map1'])
    expect(result.orphaned).toHaveLength(0)
  })

  it('creates orphan when no match found', () => {
    const embeddings: EmbeddingsWithMeta = {
      'old-section': { urls: ['https://example.com/map1'], title: 'Old Section Name' },
    }
    const areas = [makeArea('completely-different', 'Completely Different')]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    expect(Object.keys(result.matched)).toHaveLength(0)
    expect(result.orphaned).toHaveLength(1)
    expect(result.orphaned[0]).toMatchObject({
      originalId: 'old-section',
      title: 'Old Section Name',
      urls: ['https://example.com/map1'],
    })
  })

  it('provides suggestion for partial matches', () => {
    const embeddings: EmbeddingsWithMeta = {
      'main-hall': { urls: ['https://example.com/map1'], title: 'Main Hall' },
    }
    // "Main Hall" vs "Main Entrance" - shares "Main" but not enough for auto-match
    const areas = [makeArea('main-entrance', 'Main Entrance')]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    // Should be orphaned but with a suggestion
    expect(result.orphaned).toHaveLength(1)
    expect(result.orphaned[0].suggestedAreaId).toBe('main-entrance')
    expect(result.orphaned[0].suggestedAreaName).toBe('Main Entrance')
    expect(result.orphaned[0].similarity).toBeGreaterThan(0)
  })

  it('prefers exact ID match over title similarity', () => {
    const embeddings: EmbeddingsWithMeta = {
      'entry': { urls: ['https://example.com/map1'], title: 'Main Entrance' },
    }
    // Area has same ID but different name
    const areas = [
      makeArea('entry', 'Entry Hall'),
      makeArea('main-entrance', 'Main Entrance'), // Better title match
    ]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    // Should match by ID, not by title
    expect(result.matched['entry']).toBeDefined()
    expect(result.orphaned).toHaveLength(0)
  })

  it('handles multiple embeddings correctly', () => {
    const embeddings: EmbeddingsWithMeta = {
      'hall-a': { urls: ['https://example.com/map1'], title: 'Hall A' },
      'hall-b': { urls: ['https://example.com/map2'], title: 'Hall B' },
      'removed': { urls: ['https://example.com/map3'], title: 'Removed Section' },
    }
    const areas = [
      makeArea('hall-a', 'Hall A'), // Exact match
      makeArea('hall-b-renamed', 'Hall B'), // ID changed but name same
    ]
    const result = matchEmbeddingsToAreas(embeddings, areas)

    expect(result.matched['hall-a']).toBeDefined()
    expect(result.matched['hall-b-renamed']).toBeDefined()
    expect(result.orphaned).toHaveLength(1)
    expect(result.orphaned[0].originalId).toBe('removed')
  })
})

describe('toSimpleFormat', () => {
  it('converts new format to legacy format', () => {
    const withMeta: EmbeddingsWithMeta = {
      'entry-hall': { urls: ['https://example.com/map1'], title: 'Entry Hall' },
      'main': { urls: ['https://example.com/map2', 'https://example.com/map3'], title: 'Main' },
    }
    const result = toSimpleFormat(withMeta)
    expect(result).toEqual({
      'entry-hall': ['https://example.com/map1'],
      'main': ['https://example.com/map2', 'https://example.com/map3'],
    })
  })
})
