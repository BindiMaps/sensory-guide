# Story 4.1: Public Guide Page Layout

Status: done

---

## Story

As an **end user**,
I want **to view a venue's Sensory Guide**,
So that **I can plan my visit and know what to expect**.

---

## Acceptance Criteria

1. **Given** a guide is published for a venue, **When** I visit `/venue/{slug}`, **Then** I see the venue name prominently displayed **And** I see the venue address and contact info (if available) **And** I see the last updated date **And** I see an accuracy disclaimer: "Information may change. Verify on arrival." **And** I see category badges showing what sensory info is covered

2. **Given** the slug doesn't exist or guide isn't published, **When** I visit `/venue/{invalid-slug}`, **Then** I see a 404 page with helpful message

3. **And** the page loads without requiring authentication **And** no Firebase SDK is loaded (static JSON fetch only)

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

### Existing Implementation (from Story 3.4)

Story 3.4 (Publish Guide) already implemented most of this functionality:
- `/venue/:slug` route exists in `app/src/App.tsx`
- `GuidePage.tsx` fetches JSON from Storage (NO Firebase SDK - correct!)
- Venue name, address, last updated date are displayed
- 404 handling works for non-existent/unpublished venues
- Skip to content link for accessibility
- Design System v5 styling applied

### Gaps to Address

| Gap | Location | Fix |
|-----|----------|-----|
| Contact info not displayed | `GuideContent.tsx` | Add contact line to header if `venue.contact` exists |
| Accuracy disclaimer missing | `GuideContent.tsx` | Add disclaimer below header, above intro card |
| Top-level category badges | `GuideContent.tsx` | Display `guide.categories[]` as badges below venue name |

### Schema Confirmation

From `guideSchema.ts`:
```ts
venueOverviewSchema = z.object({
  name: z.string(),
  address: z.string(),
  contact: z.string().optional(),  // ← EXISTS but not displayed
  summary: z.string(),
  lastUpdated: z.string(),
})

guideSchema = z.object({
  categories: z.array(sensoryCategorySchema).default([]),  // ← Top-level categories
  ...
})
```

---

## Tasks / Subtasks

- [x] **Task 1: Add contact info to header** (AC: #1)
  - [x] Update `app/src/shared/components/guide/GuideContent.tsx`
  - [x] Display `venue.contact` below address if present
  - [x] Format: "Contact: {contact}" or just {contact} inline with address
  - [x] Use `text-[#595959]` muted text colour per v5

- [x] **Task 2: Add accuracy disclaimer** (AC: #1)
  - [x] Add disclaimer below header, above intro card
  - [x] Text: "Information may change. Verify details on arrival."
  - [x] Style: smaller text (`text-sm`), muted colour, possibly with icon
  - [x] Should be visually distinct but not alarming

- [x] **Task 3: Add top-level category badges** (AC: #1)
  - [x] Display `guide.categories[]` as CategoryBadge components
  - [x] Position: below venue name/address, before disclaimer
  - [x] Use existing `CategoryBadge` component from `shared/components/guide`
  - [x] Add `aria-label` for accessibility: "Sensory categories covered in this guide"

- [x] **Task 4: Update tests** (AC: all)
  - [x] Update/add test for GuideContent to verify new elements render
  - [x] Test contact info displays when present, hidden when absent
  - [x] Test disclaimer always appears
  - [x] Test category badges render from `guide.categories`

- [x] **Task 5: Manual testing checklist**
  - [x] Visit published guide - see all elements (name, address, contact, date, disclaimer, badges)
  - [x] Visit guide without contact info - no "Contact:" appears
  - [x] Visit guide with multiple categories - all badges display
  - [x] Verify keyboard navigation works
  - [x] Verify screen reader announces elements correctly

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Public Guide Page - NO Firebase SDK:**
- Guide JSON fetched from Storage URL: `public/guides/{slug}.json`
- Zero Firestore reads from public users
- No Firebase SDK in public bundle

**Design System v5 Tokens:**
```css
--text: #1A1A1A
--text-secondary: #3D3D3D
--text-muted: #595959
--accent: #B8510D
--surface: #F8F8F6
```

### Existing Component Structure

```
app/src/features/public/guide/
├── GuidePage.tsx        # Route handler, state machine, JSON fetch

app/src/shared/components/guide/
├── GuideContent.tsx     # ← MODIFY: Add contact, disclaimer, top badges
├── CategoryBadge.tsx    # ← USE: Already exists with v5 colours
├── AreaSection.tsx      # Progressive disclosure sections
├── SensoryDetail.tsx    # Individual sensory items
├── FacilitiesSection.tsx
├── SensoryKey.tsx
```

### Design Reference

From `design-system-v5.md`:

**Category Badges:**
| Category | Background | Text |
|----------|------------|------|
| Sound | `#E3ECF0` | `#264854` |
| Light | `#F4EBDA` | `#4D3F14` |
| Crowds | `#EDE6E0` | `#3F352C` |
| Smells | `#E6EEE7` | `#263D29` |

### Implementation Example

**Updated GuideContent header:**
```tsx
<header className="mb-8">
  <h1 className="text-[26px] font-bold leading-tight tracking-tight mb-1.5">
    {venue.name}
  </h1>

  {/* Address + Contact */}
  <p className="text-sm text-[#595959] mb-3">
    {venue.address}
    {venue.contact && <> · {venue.contact}</>}
    {' · '}Updated {formatDate(venue.lastUpdated)}
  </p>

  {/* Top-level category badges */}
  {categories.length > 0 && (
    <div
      className="flex flex-wrap gap-2 mb-3"
      aria-label="Sensory categories covered in this guide"
    >
      {categories.map((cat) => (
        <CategoryBadge key={cat} category={cat} />
      ))}
    </div>
  )}

  {/* Accuracy disclaimer */}
  <p className="text-sm text-[#595959] italic">
    Information may change. Verify details on arrival.
  </p>
</header>
```

### Accessibility Requirements

1. **Disclaimer:** Should be readable but not create alarm - use `italic` or distinct styling
2. **Category badges:** Add `aria-label` to container explaining what they represent
3. **Contact info:** Just display inline, no special treatment needed

### Future A11y Review (Story 4-4)

- **Phone/Email/Address links**: Currently `<a>` elements. Consider converting to `<button>` for actions (tel:, mailto:) vs navigation - review in 4-4 accessibility audit
- Ensure touch targets meet 44x44px minimum on mobile for these interactive elements

### Previous Story Intelligence

**From Story 3.4:**
- GuidePage is well-structured with state machine pattern
- GuideContent is shared between public view and admin preview
- All v5 styling is in place
- Tests exist for CategoryBadge

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.1] - Original AC
- [Source: _bmad-output/planning-artifacts/design-system-v5.md] - Design tokens
- [Source: _bmad-output/implementation-artifacts/3-4-publish-guide.md] - Prior implementation
- [Source: app/src/lib/schemas/guideSchema.ts] - Schema with contact field
- [Source: app/src/shared/components/guide/GuideContent.tsx] - Component to modify

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- Added contact info display inline with address (conditionally rendered)
- Added accuracy disclaimer with italic styling per v5 design
- Added top-level category badges with role="list" and aria-label for accessibility
- Created comprehensive test suite for GuideContent (12 tests)
- Enhanced: Address links to Google Maps (works on all devices, iOS prompts for Apple Maps)
- Enhanced: Phone numbers link via tel: for tap-to-call
- All 182 tests pass, lint clean, build successful

### File List

**Modified:**
- `app/src/shared/components/guide/GuideContent.tsx` - Added contact info, category badges, accuracy disclaimer to header

**Created:**
- `app/src/shared/components/guide/GuideContent.test.tsx` - 12 unit tests for new header elements

---

## Change Log

- 2026-01-31: Story created with comprehensive dev context
- 2026-01-31: Implementation complete - all tasks done, 12 tests added, manual testing passed
- 2026-01-31: Enhanced - address links to maps, phone links to tel: for tap-to-call
- 2026-01-31: Enhanced - phone/email parsed separately with individual links
- 2026-01-31: Review complete, story marked done
