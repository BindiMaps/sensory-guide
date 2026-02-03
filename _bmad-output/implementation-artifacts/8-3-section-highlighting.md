# Story 8.3: Section Highlighting Based on Profile

Status: review

## Story

As a **user with active filters**,
I want **matching content visually emphasised**,
So that **I can quickly scan for relevant warnings**.

## Acceptance Criteria

1. **AC1: Collapsed Badge Filtering** - Given I have "Sound" filter active, when I view collapsed sections, then only Sound badges are visible on collapsed headers (other badges hidden)

2. **AC2: Expanded Content Highlighting** - Given I expand a section with Sound warnings, when I view the content, then Sound-related badges/content have highlight treatment (e.g., `ring-2 ring-amber-400`) and non-matching content remains visible but visually secondary

3. **AC3: Default Behaviour** - Given I have no filters active, when I view sections, then all badges display normally with no highlighting (default behaviour)

4. **AC4: Store Integration** - `AreaSection` reads from `useSensoryProfile()` hook

5. **AC5: Styling Pattern** - Uses `data-highlighted` attribute or conditional classes for Tailwind styling

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Notes:**
- Highlight colour must be colour-blind safe
- Using amber ring: `ring-2 ring-amber-400` (warm, visible, matches terracotta accent)
- Non-matching content uses reduced opacity, not hidden

## Tasks / Subtasks

- [x] Task 1: Integrate store into AreaSection (AC: 4)
  - [x] 1.1: Import `useSensoryProfile` hook
  - [x] 1.2: Get `activeCategories` and `hasActiveFilters()` from store

- [x] Task 2: Filter collapsed badges (AC: 1, 3)
  - [x] 2.1: When filters active, only show badges that match active categories
  - [x] 2.2: When no filters, show all badges (existing behaviour)

- [x] Task 3: Highlight matching content when expanded (AC: 2, 5)
  - [x] 3.1: Add highlight ring to matching SensoryDetail items
  - [x] 3.2: Reduce visual prominence of non-matching items (opacity or muted)
  - [x] 3.3: Only apply when filters are active

- [x] Task 4: Update SensoryDetail for highlighting (AC: 2)
  - [x] 4.1: Accept optional `highlighted` prop
  - [x] 4.2: Apply ring styling when highlighted

- [x] Task 5: Write/update tests (AC: 1-5)
  - [x] 5.1: Test badge filtering when filters active
  - [x] 5.2: Test all badges shown when no filters
  - [x] 5.3: Test highlight styling applied to matching content

## Dev Notes

### Implementation Strategy

1. AreaSection reads from sensory profile store
2. When `hasActiveFilters()` is true:
   - Filter `area.badges` to only include active categories
   - Pass `highlighted` prop to SensoryDetail based on category match
3. Use Tailwind's `ring` utilities for highlight (colour-blind accessible)

### Colour-Blind Safe Highlight

Using `ring-2 ring-amber-400` with optional `bg-amber-50`:
- Amber provides visual distinction without relying on red/green
- Ring is structural, not colour-dependent
- Consistent with terracotta accent theme

### Files to Modify

- `app/src/shared/components/guide/AreaSection.tsx` - main highlighting logic
- `app/src/shared/components/guide/SensoryDetail.tsx` - accept highlighted prop

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- AreaSection now filters badges when profile filters active
- SensoryDetail accepts highlighted prop for ring highlight
- Non-matching details shown with reduced opacity
- Tests verify badge filtering and highlight behaviour

### File List

- `app/src/shared/components/guide/AreaSection.tsx` (modified)
- `app/src/shared/components/guide/SensoryDetail.tsx` (modified)
- `app/src/shared/components/guide/AreaSection.test.tsx` (modified)
