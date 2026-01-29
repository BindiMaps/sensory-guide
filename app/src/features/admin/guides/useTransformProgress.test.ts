import { describe, it, expect } from 'vitest'
import { getStageLabel, getStages, isStageComplete } from './useTransformProgress'

describe('getStageLabel', () => {
  it('returns correct labels for all stages', () => {
    expect(getStageLabel('uploaded')).toBe('Processing PDF')
    expect(getStageLabel('extracting')).toBe('Extracting text')
    expect(getStageLabel('analysing')).toBe('Analysing content')
    expect(getStageLabel('generating')).toBe('Generating guide')
    expect(getStageLabel('ready')).toBe('Ready')
    expect(getStageLabel('failed')).toBe('Failed')
  })
})

describe('getStages', () => {
  it('returns stages in correct order', () => {
    const stages = getStages()
    expect(stages).toEqual(['uploaded', 'extracting', 'analysing', 'generating', 'ready'])
  })

  it('does not include failed in normal flow', () => {
    const stages = getStages()
    expect(stages).not.toContain('failed')
  })
})

describe('isStageComplete', () => {
  it('returns true for stages before current', () => {
    expect(isStageComplete('analysing', 'uploaded')).toBe(true)
    expect(isStageComplete('analysing', 'extracting')).toBe(true)
    expect(isStageComplete('ready', 'uploaded')).toBe(true)
    expect(isStageComplete('ready', 'generating')).toBe(true)
  })

  it('returns false for current or future stages', () => {
    expect(isStageComplete('analysing', 'analysing')).toBe(false)
    expect(isStageComplete('analysing', 'generating')).toBe(false)
    expect(isStageComplete('uploaded', 'extracting')).toBe(false)
  })

  it('returns true for all stages when status is ready', () => {
    expect(isStageComplete('ready', 'uploaded')).toBe(true)
    expect(isStageComplete('ready', 'extracting')).toBe(true)
    expect(isStageComplete('ready', 'analysing')).toBe(true)
    expect(isStageComplete('ready', 'generating')).toBe(true)
  })
})
