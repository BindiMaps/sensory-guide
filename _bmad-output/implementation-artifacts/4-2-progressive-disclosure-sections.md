# Story 4.2: Progressive Disclosure Sections

Status: done

---

## Story

As an **end user**,
I want **to expand only the venue areas relevant to my journey**,
So that **I'm not overwhelmed with information**.

---

## Acceptance Criteria

1. **Given** I am viewing a guide, **When** the page loads, **Then** all venue area sections are collapsed by default **And** I can see section headings representing each area of the venue **And** each section shows category badges indicating what sensory types are flagged in that area

2. **Given** I want to read about a specific area, **When** I click on an area section heading, **Then** the section expands to show sensory details for that area **And** clicking again collapses it

3. **Given** I want to see everything, **When** I click "Expand all", **Then** all area sections expand simultaneously **And** the button changes to "Collapse all"

4. **Given** I have reduced-motion enabled in my OS, **When** sections expand/collapse, **Then** transitions are instant (no animation)

5. **And** expanded/collapsed state is visually clear (chevron icon or similar)

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [x] All colours match design system tokens exactly
- [x] Typography (font, size, weight) matches design system
- [x] Component patterns (badges, toggles, cards) match reference implementation
- [x] Spacing and layout match design system specifications
- [x] Accessibility requirements (contrast, touch targets) verified

---

## Implementation Analysis

### Already Implemented (from Stories 3.3, 3.4, 4.1)

| Requirement | Status | Location |
|-------------|--------|----------|
| Sections collapsed by default | ✅ DONE | `AreaSection.tsx` - `useState(false)` |
| Section headings per area | ✅ DONE | `AreaSection.tsx` - `<h3>{area.name}</h3>` |
| Category badges per section | ✅ DONE | `AreaSection.tsx` - `CategoryBadge` components |
| Click to expand/collapse | ✅ DONE | `AreaSection.tsx` - `toggleExpanded()` |
| Click again collapses | ✅ DONE | `AreaSection.tsx` - toggle logic |
| Reduced motion support | ✅ DONE | `AreaSection.tsx` - `prefersReducedMotion` check |
| Chevron indicator | ✅ DONE | `AreaSection.tsx` - SVG chevron with rotation |
| State persistence | ✅ DONE | `guideStore.ts` - Zustand with localStorage |
| Preview summaries | ✅ DONE | `AreaSection.tsx` - `getPreviewText()` (bonus from 4.14) |

### Gap to Address

| Gap | Location | Implementation |
|-----|----------|----------------|
| "Expand all" / "Collapse all" button | `GuideContent.tsx` | Add toggle button above sections |
| `expandAll` / `collapseAll` store actions | `guideStore.ts` | Add bulk actions to Zustand store |

---

## Tasks / Subtasks

- [x] **Task 1: Add expandAll/collapseAll to guideStore** (AC: #3)
  - [x] Add `expandAll(venueSlug: string, areaIds: string[])` action
  - [x] Add `collapseAll(venueSlug: string)` action
  - [x] Add `areAllExpanded(venueSlug: string, areaIds: string[])` selector

- [x] **Task 2: Add Expand/Collapse All button to GuideContent** (AC: #3)
  - [x] Add button above areas section in `GuideContent.tsx`
  - [x] Button text toggles: "Expand all" ↔ "Collapse all"
  - [x] Pass area IDs to store actions
  - [x] Style per v5: text button with terracotta accent on hover
  - [x] Position: right-aligned above first section

- [x] **Task 3: Accessibility for toggle button** (AC: #3, #4)
  - [x] Add `aria-label` describing current action
  - [x] Ensure keyboard accessible (already button element)
  - [x] Respect reduced motion (button itself has no animation)

- [x] **Task 4: Update/add tests** (AC: all)
  - [x] Test `expandAll` sets all specified sections to expanded
  - [x] Test `collapseAll` sets all sections to collapsed
  - [x] Test `areAllExpanded` returns correct boolean
  - [x] Test button toggles label based on state
  - [x] Test button triggers correct store action

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Zustand Store Pattern:**
- Store is at `app/src/stores/guideStore.ts`
- Uses `persist` middleware with localStorage
- Key format: `${venueSlug}:${areaId}`

**Component Structure:**
```
app/src/shared/components/guide/
├── GuideContent.tsx     # ← MODIFY: Add expand/collapse all button
├── AreaSection.tsx      # Already has individual toggle
├── CategoryBadge.tsx
├── ...
```

**Design System v5 Button Styling:**
```css
/* Text button style */
text-sm text-[#595959] hover:text-[#B8510D] hover:underline
```

### Implementation Example

**guideStore.ts additions:**
```ts
interface GuideState {
  // ... existing
  expandAll: (venueSlug: string, areaIds: string[]) => void
  collapseAll: (venueSlug: string) => void
  areAllExpanded: (venueSlug: string, areaIds: string[]) => boolean
}

expandAll: (venueSlug, areaIds) => {
  set((state) => {
    const updates: Record<string, boolean> = {}
    areaIds.forEach(id => {
      updates[`${venueSlug}:${id}`] = true
    })
    return {
      expandedSections: { ...state.expandedSections, ...updates }
    }
  })
},

collapseAll: (venueSlug) => {
  set((state) => {
    const filtered = Object.fromEntries(
      Object.entries(state.expandedSections)
        .filter(([key]) => !key.startsWith(`${venueSlug}:`))
    )
    return { expandedSections: filtered }
  })
},

areAllExpanded: (venueSlug, areaIds) => {
  const state = get()
  return areaIds.every(id => state.expandedSections[`${venueSlug}:${id}`])
}
```

**GuideContent.tsx button:**
```tsx
const areaIds = sortedAreas.map(a => a.id)
const allExpanded = venueSlug
  ? store.areAllExpanded(venueSlug, areaIds)
  : false // Local state would need separate tracking

<div className="flex justify-end mb-4">
  <button
    type="button"
    onClick={() => {
      if (allExpanded) {
        store.collapseAll(venueSlug!)
      } else {
        store.expandAll(venueSlug!, areaIds)
      }
    }}
    className="text-sm text-[#595959] hover:text-[#B8510D] hover:underline"
    aria-label={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
  >
    {allExpanded ? 'Collapse all' : 'Expand all'}
  </button>
</div>
```

### Testing Notes

- guideStore tests: `app/src/stores/guideStore.test.ts` (may need to create)
- GuideContent tests: `app/src/shared/components/guide/GuideContent.test.tsx` (exists from 4-1)

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.2] - Original AC
- [Source: _bmad-output/planning-artifacts/design-system-v5.md] - Design tokens
- [Source: app/src/stores/guideStore.ts] - Existing store to extend
- [Source: app/src/shared/components/guide/GuideContent.tsx] - Component to modify
- [Source: app/src/shared/components/guide/AreaSection.tsx] - Already complete

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Added `expandAll`, `collapseAll`, and `areAllExpanded` actions to guideStore
- Added "Expand all" / "Collapse all" toggle button to GuideContent
- Button only appears when venueSlug provided AND multiple areas exist
- Button styled per v5 design: text-sm, muted text with terracotta hover
- Full accessibility: aria-label, keyboard accessible, focus ring
- Added 13 unit tests for guideStore actions
- Added 6 integration tests for expand/collapse button in GuideContent
- All 202 tests pass, lint clean, build successful

### File List

**Modified:**
- `app/src/stores/guideStore.ts` - Added expandAll, collapseAll, areAllExpanded actions
- `app/src/shared/components/guide/GuideContent.tsx` - Added expand/collapse all button

**Created:**
- `app/src/stores/guideStore.test.ts` - 13 unit tests for store actions

**Updated Tests:**
- `app/src/shared/components/guide/GuideContent.test.tsx` - Added 6 tests for expand/collapse all

---

## Change Log

- 2026-01-31: Story created - 90% already implemented, only Expand All button missing
- 2026-01-31: Implementation complete - expand/collapse all button added with full test coverage
- 2026-01-31: Manual testing passed - story done
