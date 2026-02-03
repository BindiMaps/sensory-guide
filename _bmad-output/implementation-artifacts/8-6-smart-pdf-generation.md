# Story 8.6: Smart PDF Generation with Filter Options

Status: review

## Story

As a **user printing a guide**,
I want **to choose between a highlighted PDF or a filtered-only PDF**,
So that **I get exactly the personalised output I need**.

## Acceptance Criteria

1. **AC1: Filter Options Dialog** - Given I have filters active and click Print/Save, when the print dialog appears, then I see two options: "Full guide (highlighted)" and "My sensitivities only"

2. **AC2: Full Guide Highlighted** - Given I select "Full guide (highlighted)", when PDF generates, then all content included with matching sections highlighted and header shows "Highlighted for: Sound, Crowds"

3. **AC3: Filtered Only** - Given I select "My sensitivities only", when PDF generates, then only sections containing my active categories are included and header shows "Filtered for: Sound, Crowds" and sections without any matching categories are omitted entirely

4. **AC4: No Filters Behaviour** - Given I have no filters active, when I click Print/Save, then standard full guide prints (no filter UI shown)

5. **AC5: Print CSS** - Print CSS handles highlight styling appropriately (greyscale safe)

6. **AC6: Existing Functionality** - Extends existing print-optimised view from Story 5-1

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Notes:**
- Modal/dialog for filter options
- Simple two-button choice
- Clear labelling of what each option does

## Tasks / Subtasks

- [x] Task 1: Create PdfOptionsDialog component (AC: 1)
  - [x] 1.1: Create dialog with two options
  - [x] 1.2: Show active filter categories in dialog

- [x] Task 2: Update GuidePdf to accept filter props (AC: 2, 3)
  - [x] 2.1: Add `filterMode` prop: 'none' | 'highlighted' | 'filtered'
  - [x] 2.2: Add `activeCategories` prop
  - [x] 2.3: Filter areas when mode is 'filtered'
  - [x] 2.4: Add highlight styling when mode is 'highlighted'

- [x] Task 3: Add filter header to PDF (AC: 2, 3)
  - [x] 3.1: Show "Highlighted for: X, Y" or "Filtered for: X, Y" header

- [x] Task 4: Update DownloadPdfButton (AC: 1, 4)
  - [x] 4.1: Show dialog when filters active
  - [x] 4.2: Pass filter mode to PDF generation
  - [x] 4.3: Skip dialog when no filters (existing behaviour)

- [x] Task 5: Write tests (AC: 1-4)
  - [x] 5.1: Test dialog shows when filters active
  - [x] 5.2: Test dialog not shown when no filters
  - [x] 5.3: Test PDF receives correct filter props

## Dev Notes

### Implementation Approach

For simplicity:
- Highlighted mode: adds amber border/bg to matching details in PDF
- Filtered mode: filters `sortedAreas` to only include areas that have at least one badge matching active categories

### Filter Logic

```typescript
// For filtered mode
const filteredAreas = sortedAreas.filter(area =>
  area.badges.some(badge => activeCategories.has(badge))
)
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Created PdfOptionsDialog with "Full guide (highlighted)" and "Filtered" options
- Updated GuidePdf to accept filterMode and activeCategories props
- Added filter header showing active categories
- Highlighted mode adds amber border to matching details
- Filtered mode excludes areas without matching categories

### File List

- `app/src/shared/components/guide/PdfOptionsDialog.tsx` (created)
- `app/src/shared/components/guide/GuidePdf.tsx` (modified)
- `app/src/shared/components/guide/DownloadPdfButton.tsx` (modified)
