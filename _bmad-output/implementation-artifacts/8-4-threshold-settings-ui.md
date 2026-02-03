# Story 8.4: Threshold Settings UI

Status: review

## Story

As a **user who wants fine-grained control**,
I want **to set sensitivity thresholds per category**,
So that **only relevant severity levels are highlighted**.

## Acceptance Criteria

1. **AC1: Gear Icon Access** - Given I tap a gear icon on the FilterBar, when the settings panel opens, then I see each active category with a threshold selector

2. **AC2: Threshold Options** - Given I view threshold options, when I select for a category, then options are: "All levels", "Medium & High only", "High only" and selection updates store via `setThreshold`

3. **AC3: Threshold Filtering** - Given I set Sound to "High only", when I view sections with low/medium sound warnings, then those are not highlighted (only high severity Sound warnings highlighted)

4. **AC4: Dismissibility** - Panel dismissible (tap outside or X button)

5. **AC5: Accessibility** - Accessible: focus trap when open, Escape to close

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist**:
- [x] Uses design system colours
- [x] Panel matches surface/border styling
- [x] Gear icon visible but not intrusive

**Accessibility Checklist**:
- [x] Focus trap when panel open
- [x] Escape to close
- [x] Proper ARIA for dialog pattern

## Tasks / Subtasks

- [x] Task 1: Add gear icon to FilterBar (AC: 1)
  - [x] 1.1: Add settings gear button after filter badges
  - [x] 1.2: Only show when at least one filter is active
  - [x] 1.3: Accessible button with aria-label

- [x] Task 2: Create ThresholdSettings panel component (AC: 1, 2)
  - [x] 2.1: Create `src/shared/components/guide/ThresholdSettings.tsx`
  - [x] 2.2: Show each active category with threshold selector
  - [x] 2.3: Options: All levels, Medium & High only, High only

- [x] Task 3: Implement threshold selection (AC: 2)
  - [x] 3.1: Use radio buttons or segmented control for threshold options
  - [x] 3.2: Call `setThreshold()` on selection change
  - [x] 3.3: Show current threshold from store

- [x] Task 4: Update highlighting logic for thresholds (AC: 3)
  - [x] 4.1: Modify AreaSection to check detail.level against threshold
  - [x] 4.2: Only highlight if level meets threshold requirement

- [x] Task 5: Make panel dismissible (AC: 4)
  - [x] 5.1: Close on X button click
  - [x] 5.2: Close on click outside panel
  - [x] 5.3: Close on Escape key

- [x] Task 6: Add focus trap (AC: 5)
  - [x] 6.1: Trap focus within panel when open
  - [x] 6.2: Return focus to gear button on close

- [x] Task 7: Write tests (AC: 1-5)
  - [x] 7.1: Test panel opens/closes
  - [x] 7.2: Test threshold selection updates store
  - [x] 7.3: Test Escape closes panel

## Dev Notes

### Threshold Logic

```typescript
function meetsThreshold(level: SensoryLevel, threshold: Threshold): boolean {
  if (threshold === 'all') return true
  if (threshold === 'medium-high') return level !== 'low'
  if (threshold === 'high-only') return level === 'high'
  return true
}
```

### Panel Design

- Compact popover/dropdown style (not full modal)
- Positioned below gear icon
- Max 3 active categories visible at once (scrollable if more)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Added gear button to FilterBar (only when filters active)
- Created ThresholdSettings dropdown panel
- Segmented control for threshold selection
- Updated AreaSection highlighting to respect thresholds
- Focus trap + Escape to close + click outside

### File List

- `app/src/shared/components/guide/FilterBar.tsx` (modified)
- `app/src/shared/components/guide/ThresholdSettings.tsx` (created)
- `app/src/shared/components/guide/AreaSection.tsx` (modified)
- `app/src/shared/utils/sensory.ts` (modified - added meetsThreshold)
