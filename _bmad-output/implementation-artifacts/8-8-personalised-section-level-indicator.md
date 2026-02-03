# Story 8.8: Personalised Section Level Indicator

Status: review

## Story

As a **user with sensory sensitivities**,
I want **the section-level indicator (HIGH/MEDIUM/LOW) to reflect only the categories I care about**,
So that **I can quickly scan which sections are most relevant to my specific needs**.

## Acceptance Criteria

1. **AC1: Filtered Calculation** - Given I have categories selected, when viewing a section, then the level badge calculates from only my selected categories' details

2. **AC2: No Filters Fallback** - Given I have no categories selected, when viewing a section, then the level badge calculates from all details (current behaviour)

3. **AC3: Visual Consistency** - The badge appearance remains unchanged (colour, position, size)

4. **AC4: Empty State** - Given I have categories selected but a section has no matching details, then show LOW (or hide badge?)

## Example

Section "Main Entry" has:
- Sound: high
- Light: low
- Crowds: medium

| User Selection | Badge Shows |
|----------------|-------------|
| None | HIGH (all details) |
| Sound only | HIGH |
| Light only | LOW |
| Light + Crowds | MEDIUM |
| Sound + Light | HIGH |

## Tasks / Subtasks

- [x] Task 1: Update `getOverallLevel` utility (AC: 1, 2)
  - [x] 1.1: Add optional `activeCategories` parameter
  - [x] 1.2: Filter details to selected categories when provided
  - [x] 1.3: Fallback to all details when no categories active

- [x] Task 2: Update AreaSection component (AC: 1, 2)
  - [x] 2.1: Pass active categories to level calculation
  - [x] 2.2: Only filter when `hasActiveFilters()` is true

- [x] Task 3: Handle empty state (AC: 4)
  - [x] 3.1: Shows LOW when no matching details (safe default)

- [x] Task 4: Write tests (AC: 1-4)
  - [x] 4.1: Test filtered calculation with various category combinations
  - [x] 4.2: Test fallback when no filters active
  - [x] 4.3: Test empty state handling

## Dev Notes

### Current Implementation

`src/shared/utils/sensory.ts`:
```typescript
export function getOverallLevel(levels: SensoryLevel[]): SensoryLevel {
  if (levels.includes('high')) return 'high'
  if (levels.includes('medium')) return 'medium'
  return 'low'
}
```

### Proposed Change

```typescript
export function getOverallLevel(
  details: Array<{ category: string; level: SensoryLevel }>,
  activeCategories?: Set<string>
): SensoryLevel {
  const filtered = activeCategories?.size
    ? details.filter(d => activeCategories.has(d.category))
    : details

  const levels = filtered.map(d => d.level)
  if (levels.includes('high')) return 'high'
  if (levels.includes('medium')) return 'medium'
  return 'low'
}
```

### Files to Modify

- `app/src/shared/utils/sensory.ts`
- `app/src/shared/components/guide/AreaSection.tsx`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Updated `getOverallLevel` to accept full details array + optional activeCategories
- Filters to user's selected categories when provided, falls back to all when empty
- AreaSection now passes activeCategories when filters are active
- Returns LOW when no matching categories (safe default)
- Added comprehensive test coverage (10 tests)

### File List

- `app/src/shared/utils/sensory.ts` (modified)
- `app/src/shared/utils/sensory.test.ts` (created)
- `app/src/shared/components/guide/AreaSection.tsx` (modified)
