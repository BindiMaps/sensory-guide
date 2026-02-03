# Story 8.5: First-Visit Onboarding Prompt

Status: review

## Story

As a **first-time user**,
I want **a gentle prompt explaining personalisation**,
So that **I discover the feature without hunting for settings**.

## Acceptance Criteria

1. **AC1: Initial Display** - Given I visit a guide for the first time (no profile set), when the page loads, then I see a subtle banner above FilterBar: "Tap categories that matter to you"

2. **AC2: Auto-Dismiss on Filter** - Given I toggle any filter, when the filter activates, then the onboarding banner dismisses permanently

3. **AC3: Manual Dismiss** - Given I explicitly dismiss the banner (X button), when I return later, then the banner does not reappear

4. **AC4: Persistence** - Dismissal state persisted in localStorage

5. **AC5: Non-Intrusive** - Banner is non-intrusive: doesn't block content, subtle styling

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Notes:**
- Subtle, warm styling matching intro card pattern
- Not a modal or overlay - inline banner
- X button small but accessible

## Tasks / Subtasks

- [x] Task 1: Add onboarding state to store (AC: 2, 3, 4)
  - [x] 1.1: Add `hasSeenOnboarding: boolean` to sensoryProfileStore
  - [x] 1.2: Add `dismissOnboarding()` action
  - [x] 1.3: Auto-dismiss when first filter toggled

- [x] Task 2: Create OnboardingBanner component (AC: 1, 5)
  - [x] 2.1: Create `src/shared/components/guide/OnboardingBanner.tsx`
  - [x] 2.2: Subtle banner styling (surface bg, no border)
  - [x] 2.3: Text: "Tap categories that matter to you"

- [x] Task 3: Add dismiss functionality (AC: 3)
  - [x] 3.1: X button to manually dismiss
  - [x] 3.2: Call `dismissOnboarding()` on click

- [x] Task 4: Integrate into GuideContent (AC: 1)
  - [x] 4.1: Show banner above FilterBar when not dismissed
  - [x] 4.2: Only show when filters exist but none active

- [x] Task 5: Write tests (AC: 1-5)
  - [x] 5.1: Test banner shows when no filters active and not dismissed
  - [x] 5.2: Test banner hides when dismissed
  - [x] 5.3: Test banner hides when filter toggled

## Dev Notes

### Store Changes

Adding to sensoryProfileStore:
```typescript
hasSeenOnboarding: boolean
dismissOnboarding: () => void
```

Auto-dismiss in `toggleCategory`:
```typescript
toggleCategory: (category) => {
  set((state) => {
    // Auto-dismiss onboarding on first filter
    const shouldDismiss = !state.hasSeenOnboarding && state.activeCategories.size === 0
    // ... rest of toggle logic
    return {
      activeCategories: newCategories,
      hasSeenOnboarding: shouldDismiss ? true : state.hasSeenOnboarding
    }
  })
}
```

### Banner Styling

- Light background matching surface colour
- Small info icon or sparkle
- Compact, single line
- Terracotta accent for dismiss X on hover

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Added hasSeenOnboarding to sensoryProfileStore with auto-dismiss
- Created OnboardingBanner with subtle styling
- Integrated above FilterBar in GuideContent
- Tests verify show/hide behaviour

### File List

- `app/src/stores/sensoryProfileStore.ts` (modified)
- `app/src/shared/components/guide/OnboardingBanner.tsx` (created)
- `app/src/shared/components/guide/GuideContent.tsx` (modified)
