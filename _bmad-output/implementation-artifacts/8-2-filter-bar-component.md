# Story 8.2: Filter Bar Component

Status: review

## Story

As a **user viewing a guide**,
I want **to see toggleable category badges at the top of the guide**,
So that **I can quickly filter to my sensitivities**.

## Acceptance Criteria

1. **AC1: Visible FilterBar** - Given I am viewing a published guide, when the page loads, then I see a FilterBar above the first section with category badges

2. **AC2: Dynamic Categories** - Given the guide has Sound and Crowds warnings but no Light warnings, when I view the FilterBar, then I only see Sound and Crowds badges (dynamic based on guide content)

3. **AC3: Toggle Interaction** - Given I tap a category badge, when it toggles, then it visually changes (filled vs outlined) to show active state and the filter is applied to section display

4. **AC4: Component Location** - `FilterBar` component at `src/shared/components/guide/FilterBar.tsx`

5. **AC5: Accessibility** - Accessible: proper button roles, `aria-pressed` state for toggle buttons

6. **AC6: Styling Match** - Matches existing badge styling from CategoryBadge component

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist**:
- [x] Badge colours match CATEGORY_COLOURS from colours.ts
- [x] Font matches Inter system
- [x] Spacing follows design system

**Accessibility Checklist**:
- [x] Uses `<button>` elements (not div+onclick)
- [x] `aria-pressed` state on toggles
- [x] Focus states visible
- [x] Touch targets ≥44x44px (achieved via padding)

## Tasks / Subtasks

- [x] Task 1: Create FilterBar component (AC: 1, 4, 6)
  - [x] 1.1: Create `src/shared/components/guide/FilterBar.tsx`
  - [x] 1.2: Accept `categories: string[]` prop for available categories
  - [x] 1.3: Use existing CategoryBadge styling patterns

- [x] Task 2: Integrate with sensory profile store (AC: 3)
  - [x] 2.1: Import and use `useSensoryProfile()` hook
  - [x] 2.2: Call `toggleCategory()` on badge click
  - [x] 2.3: Read `isCategoryActive()` to determine visual state

- [x] Task 3: Implement toggle visual states (AC: 3, 6)
  - [x] 3.1: Active state: filled background with category colour
  - [x] 3.2: Inactive state: outlined/muted appearance
  - [x] 3.3: Smooth transition between states

- [x] Task 4: Make accessible (AC: 5)
  - [x] 4.1: Use `<button>` elements for badges
  - [x] 4.2: Add `aria-pressed` attribute reflecting active state
  - [x] 4.3: Add `aria-label` describing the action

- [x] Task 5: Integrate into GuideContent (AC: 1, 2)
  - [x] 5.1: Import FilterBar into GuideContent.tsx
  - [x] 5.2: Pass guide.categories to FilterBar
  - [x] 5.3: Position above first section (after intro card)

- [x] Task 6: Write tests (AC: 1-6)
  - [x] 6.1: Create FilterBar.test.tsx
  - [x] 6.2: Test renders categories from props
  - [x] 6.3: Test toggle calls store action
  - [x] 6.4: Test visual state reflects store state
  - [x] 6.5: Test accessibility attributes

## Dev Notes

### Technical Approach

- Derive categories from `guide.categories` array (already extracted by LLM during transform)
- Use `useSensoryProfile()` for state - already persists to localStorage
- CategoryBadge is presentation-only; FilterBar wraps it in interactive buttons

### Existing Patterns

**CategoryBadge styling** (`src/shared/components/guide/CategoryBadge.tsx`):
```tsx
<span
  className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-sm"
  style={{ backgroundColor: colours.bg, color: colours.text }}
>
  {category}
</span>
```

**Colours utility** (`src/shared/utils/colours.ts`):
- `getCategoryColours(category)` returns `{ bg, text }` object
- Already handles fallback for unknown categories

### File Structure

- Component: `app/src/shared/components/guide/FilterBar.tsx`
- Test: `app/src/shared/components/guide/FilterBar.test.tsx`
- Integration point: `app/src/shared/components/guide/GuideContent.tsx`

### References

- [Source: CategoryBadge.tsx] - Badge styling reference
- [Source: colours.ts] - Category colour lookup
- [Source: sensoryProfileStore.ts] - Store integration
- [Source: design-system-v5.md] - Design tokens

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

(none)

### Completion Notes List

- Created FilterBar with toggleable badge buttons
- Active badges show filled bg, inactive show border-only muted state
- Integrated into GuideContent after intro card
- Full test coverage for render, toggle, accessibility

### File List

- `app/src/shared/components/guide/FilterBar.tsx` (created)
- `app/src/shared/components/guide/FilterBar.test.tsx` (created)
- `app/src/shared/components/guide/GuideContent.tsx` (modified)
