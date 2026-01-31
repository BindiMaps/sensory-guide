# Story 4.2: Progressive Disclosure Sections

Status: ready-for-dev

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
- [ ] All colours match design system tokens exactly
- [ ] Typography (font, size, weight) matches design system
- [ ] Component patterns (badges, toggles, cards) match reference implementation
- [ ] Spacing and layout match design system specifications
- [ ] Accessibility requirements (contrast, touch targets) verified

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

- [ ] **Task 1: Add expandAll/collapseAll to guideStore** (AC: #3)
  - [ ] Add `expandAll(venueSlug: string, areaIds: string[])` action
  - [ ] Add `collapseAll(venueSlug: string)` action
  - [ ] Add `areAllExpanded(venueSlug: string, areaIds: string[])` selector

- [ ] **Task 2: Add Expand/Collapse All button to GuideContent** (AC: #3)
  - [ ] Add button above areas section in `GuideContent.tsx`
  - [ ] Button text toggles: "Expand all" ↔ "Collapse all"
  - [ ] Pass area IDs to store actions
  - [ ] Style per v5: text button with terracotta accent on hover
  - [ ] Position: right-aligned above first section

- [ ] **Task 3: Accessibility for toggle button** (AC: #3, #4)
  - [ ] Add `aria-label` describing current action
  - [ ] Ensure keyboard accessible (already button element)
  - [ ] Respect reduced motion (button itself has no animation)

- [ ] **Task 4: Update/add tests** (AC: all)
  - [ ] Test `expandAll` sets all specified sections to expanded
  - [ ] Test `collapseAll` sets all sections to collapsed
  - [ ] Test `areAllExpanded` returns correct boolean
  - [ ] Test button toggles label based on state
  - [ ] Test button triggers correct store action

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

- 2026-01-31: Story created - 90% already implemented, only Expand All button missing
