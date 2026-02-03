# Story 8.1: Sensory Profile Store with Persistence

Status: review

## Story

As a **user with sensory sensitivities**,
I want **my sensitivity preferences saved automatically**,
So that **I don't have to re-configure every visit**.

## Acceptance Criteria

1. **AC1: Persistence** - Given I toggle a sensitivity filter, when I close the browser and return later, then my filter preferences are still active

2. **AC2: Store Location** - Zustand store created at `src/stores/sensoryProfileStore.ts`

3. **AC3: State Shape** - Store includes:
   - `activeCategories: Set<string>` (categories user has toggled on)
   - `thresholds: Record<string, Threshold>` (per-category threshold settings)

4. **AC4: Threshold Type** - Threshold type is `'all' | 'medium-high' | 'high-only'`

5. **AC5: localStorage Key** - localStorage persistence via zustand persist middleware with key: `sensory-profile`

6. **AC6: Actions** - Store exposes:
   - `toggleCategory(category: string)` - add/remove from activeCategories
   - `setThreshold(category: string, threshold: Threshold)` - update threshold for category
   - `clearProfile()` - reset to default state

7. **AC7: Hook Export** - `useSensoryProfile()` hook exported for component consumption

8. **AC8: Default State** - Default state: empty activeCategories, all thresholds default to `'all'`

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Note:** This is a state-only story with NO UI. Design/accessibility checklists not applicable.

## Tasks / Subtasks

- [x] Task 1: Define TypeScript types for sensory profile (AC: 3, 4)
  - [x] 1.1: Create `Threshold` type as union `'all' | 'medium-high' | 'high-only'`
  - [x] 1.2: Create `SensoryProfileState` interface with `activeCategories`, `thresholds`, and action signatures

- [x] Task 2: Implement Zustand store with persistence (AC: 2, 5, 6, 8)
  - [x] 2.1: Create `src/stores/sensoryProfileStore.ts`
  - [x] 2.2: Configure zustand `persist` middleware with key `sensory-profile`
  - [x] 2.3: Implement `toggleCategory` action - adds category if absent, removes if present
  - [x] 2.4: Implement `setThreshold` action - updates threshold for specified category
  - [x] 2.5: Implement `clearProfile` action - resets to empty activeCategories and default thresholds
  - [x] 2.6: Set default state: `activeCategories: new Set()`, `thresholds: {}`

- [x] Task 3: Export `useSensoryProfile` hook (AC: 7)
  - [x] 3.1: Export hook as named export `useSensoryProfile`
  - [x] 3.2: Verify hook provides access to state and all actions

- [x] Task 4: Implement localStorage persistence handling (AC: 1, 5)
  - [x] 4.1: Handle `Set` serialisation (Set doesn't serialise to JSON by default - use custom storage or convert to array)
  - [x] 4.2: Test persistence survives page reload

- [x] Task 5: Write unit tests (AC: 1-8)
  - [x] 5.1: Create `src/stores/sensoryProfileStore.test.ts`
  - [x] 5.2: Test `toggleCategory` adds category when not present
  - [x] 5.3: Test `toggleCategory` removes category when present
  - [x] 5.4: Test `setThreshold` updates threshold for category
  - [x] 5.5: Test `clearProfile` resets to default state
  - [x] 5.6: Test default state values
  - [x] 5.7: Test localStorage persistence (mock or integration test)

## Dev Notes

### Architecture Requirements

- **State Management**: Zustand with one store per domain (project-context.md)
- **TypeScript**: Strict mode, no `any`, explicit types
- **File Location**: `src/stores/` for all Zustand stores
- **Naming Convention**: `useSensoryProfileStore` (internal), `useSensoryProfile` (exported hook)

### Critical Implementation Details

**Set Serialisation Issue:**
JavaScript `Set` doesn't serialise to JSON. Zustand persist middleware uses `JSON.stringify/parse`. You MUST handle this:

```typescript
// Option 1: Custom storage adapter
storage: {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    const parsed = JSON.parse(str)
    // Convert array back to Set
    parsed.state.activeCategories = new Set(parsed.state.activeCategories)
    return parsed
  },
  setItem: (name, value) => {
    // Convert Set to array before stringify
    const toStore = {
      ...value,
      state: {
        ...value.state,
        activeCategories: [...value.state.activeCategories]
      }
    }
    localStorage.setItem(name, JSON.stringify(toStore))
  },
  removeItem: (name) => localStorage.removeItem(name)
}
```

**Threshold Default Behaviour:**
When a category has no explicit threshold set, treat it as `'all'`. The `thresholds` record only needs entries for non-default values:
```typescript
getThreshold: (category) => get().thresholds[category] ?? 'all'
```

### Existing Patterns to Follow

**Reference**: `src/stores/guideStore.ts` - uses exact same zustand + persist pattern:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      // state and actions
    }),
    { name: 'sensory-guide-sections' }
  )
)
```

**Test Pattern**: `src/stores/guideStore.test.ts` - resets store in `beforeEach`:
```typescript
beforeEach(() => {
  useGuideStore.setState({ expandedSections: {} })
})
```

### SensoryCategory Type

The existing `SensoryCategory` type in `lib/schemas/guideSchema.ts` is `z.string().min(1)` - it's flexible, NOT an enum. Categories are whatever the LLM identifies (Sound, Light, Crowds, etc.). Store should work with any string category.

### Project Structure Notes

- Store location: `app/src/stores/sensoryProfileStore.ts`
- Test location: `app/src/stores/sensoryProfileStore.test.ts` (co-located)
- Import path for consumers: `import { useSensoryProfile } from '@/stores/sensoryProfileStore'`

### References

- [Source: project-context.md#Technology Stack] - Zustand for state, one store per domain
- [Source: guideStore.ts] - Existing persist middleware pattern
- [Source: guideStore.test.ts] - Test pattern for stores
- [Source: guideSchema.ts#L9-11] - SensoryCategory is flexible string type
- [Source: epics.md#Story 8-1] - Original story requirements

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial build failed due to TypeScript type mismatch with zustand persist `storage` option
- Fixed by using inline storage object instead of `StateStorage` type
- All 20 unit tests pass, 326 total tests pass (no regressions)

### Completion Notes List

- Created Zustand store with full TypeScript types (`Threshold`, `SensoryProfileState`)
- Implemented custom storage adapter to handle Set<->array serialisation for localStorage
- Added convenience selectors: `getThreshold()`, `hasActiveFilters()`, `isCategoryActive()`
- Test coverage: default state, toggleCategory, setThreshold, clearProfile, getThreshold, hasActiveFilters, isCategoryActive, localStorage persistence
- Build passes, lint passes, all tests green

### File List

- `app/src/stores/sensoryProfileStore.ts` (created)
- `app/src/stores/sensoryProfileStore.test.ts` (created)

### Change Log

- 2026-02-03: Story 8-1 implementation complete - Zustand sensory profile store with localStorage persistence
