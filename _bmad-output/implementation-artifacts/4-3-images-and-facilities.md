# Story 4.3: Images and Facilities

Status: review

---

## Story

As an **end user**,
I want **to see photos and find key facilities quickly**,
So that **I know exactly what to expect and where things are**.

---

## Acceptance Criteria

1. **Given** a section has associated images, **When** I expand that section, **Then** I see the images displayed within the section **And** images have alt text for screen readers **And** clicking an image opens a fullscreen lightbox **And** I can navigate between all guide images with prev/next controls **And** the lightbox shows which section the image belongs to

2. **Given** the guide has facility information, **When** I view the guide, **Then** I see a "Key Facilities" section (always visible or prominent) **And** it shows: exits, bathrooms, quiet zones (if available) **And** each facility can link to an external map if URL provided

3. **Given** the venue has external resources, **When** I look for more info, **Then** I see links to venue website, maps, etc. **And** external links open in new tab with appropriate icon

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

### Already Implemented

| Requirement | Status | Location |
|-------------|--------|----------|
| Images displayed in sections | ✅ DONE | `SensoryDetail.tsx:20-27` - Renders `imageUrl` with lazy loading |
| Images have alt text | ✅ DONE | `SensoryDetail.tsx:24` - Dynamic alt text |
| FacilitiesSection component | ✅ DONE | `FacilitiesSection.tsx` - Full component exists |
| Exits, bathrooms, quiet zones | ✅ DONE | `FacilitiesSection.tsx:26-96` - All three rendered |
| Map links for facilities | ✅ DONE | `FacilitiesSection.tsx:37-45, 63-71` - "View map" links |
| Facilities schema | ✅ DONE | `guideSchema.ts:35-53` - `facilitySchema`, `facilitiesSchema` |
| FacilitiesSection in GuideContent | ✅ DONE | `GuideContent.tsx:204` - Rendered in layout |
| Image lightbox with navigation | ✅ DONE | `ImageLightbox.tsx` - Full accessible modal with prev/next |

### Gaps to Address

| Gap | Location | Implementation |
|-----|----------|----------------|
| External link icon for map links | `FacilitiesSection.tsx` | Add external link icon (↗) |
| External link icon for address link | `GuideContent.tsx` | Add external link icon |
| `target="_blank"` already present | N/A | Just add icon visual |
| Screen reader "opens in new tab" | Facilities + GuideContent | Add sr-only text |
| "Key Facilities" heading vs "Facilities" | `FacilitiesSection.tsx` | Consider renaming per AC |
| Facilities prominence/positioning | `GuideContent.tsx` | Consider making more prominent if needed |

### Schema Already Supports

```ts
// From guideSchema.ts - All structures exist
sensoryDetailSchema: { imageUrl: z.string().url().optional() }
facilitySchema: { description, mapUrl: optional }
quietZoneSchema: { description }
facilitiesSchema: { exits, bathrooms, quietZones }
```

---

## Tasks / Subtasks

- [x] **Task 1: Add external link icon to facility map links** (AC: #3)
  - [x] Create reusable `ExternalLinkIcon` component or inline SVG
  - [x] Add icon after "View map" text in FacilitiesSection
  - [x] Style: small, muted colour, terracotta on hover
  - [x] Add `sr-only` text: "opens in new tab"

- [x] **Task 2: Add external link icon to address link** (AC: #3)
  - [x] Add icon after address link in GuideContent header
  - [x] Use same icon pattern as Task 1
  - [x] Add `sr-only` text: "opens in new tab"

- [x] **Task 3: Rename "Facilities" to "Key Facilities"** (AC: #2)
  - [x] Update heading in FacilitiesSection.tsx
  - [x] Update any test references

- [x] **Task 4: Add tests for external link indicators** (AC: #3)
  - [x] Test external link icon is rendered
  - [x] Test sr-only text is present
  - [x] Test `target="_blank"` and `rel="noopener noreferrer"` present

- [x] **Task 5: Verify image alt text quality** (AC: #1)
  - [x] Review existing alt text pattern
  - [x] Ensure alt text is descriptive (current: `"{category} detail for this area"`)
  - [x] Add test for alt text presence

- [x] **Task 6: Add image lightbox with navigation** (AC: #1 enhancement) ✅ DONE
  - [x] Create `ImageLightbox` component with accessible modal
    - Click any image → opens in full-screen modal
    - Shows section/area title above image
    - Prev/Next navigation through ALL images in guide
    - Keyboard: Esc to close, Left/Right arrows for navigation
    - Focus trap with return-to-trigger on close (Radix Dialog)
    - `aria-modal="true"`, proper role and labels
    - Respect `prefers-reduced-motion`
  - [x] `ClickableImage` component auto-registers with lightbox context
  - [x] `ImageLightboxProvider` wraps guide content
  - [x] `useImageLightbox` hook for context access

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Component Structure:**
```
app/src/shared/components/guide/
├── GuideContent.tsx         # ← MODIFY: Add external icon to address link
├── FacilitiesSection.tsx    # ← MODIFY: Add external icons, rename heading
├── SensoryDetail.tsx        # Already has image + alt text (verify only)
├── AreaSection.tsx
├── CategoryBadge.tsx
└── SensoryKey.tsx
```

**Design System v5 External Link Pattern:**
```tsx
// External link with icon - per v5 spec and Story 4.7
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-[#B8510D] hover:underline"
>
  {text}
  <span aria-hidden="true" className="ml-0.5 text-xs">↗</span>
  <span className="sr-only">(opens in new tab)</span>
</a>
```

**Accessibility Requirements (CRITICAL):**
- External links MUST have `rel="noopener noreferrer"` ✅ (already done)
- External links MUST indicate they open in new tab (add sr-only text)
- Images MUST have alt text ✅ (already done)
- All text must meet 4.5:1 contrast ✅ (v5 colours verified)

### Previous Story Learnings (from 4-2)

- Expand/collapse all button added successfully
- Store pattern: `useGuideStore` with localStorage persistence
- Test pattern: RTL with mock store state
- All 202 tests passed after implementation

### File References

- `app/src/shared/components/guide/FacilitiesSection.tsx` - Main file to modify
- `app/src/shared/components/guide/GuideContent.tsx` - Address link modification
- `app/src/shared/components/guide/SensoryDetail.tsx` - Image rendering (verify)
- `app/src/lib/schemas/guideSchema.ts` - Schema reference (no changes needed)
- `_bmad-output/planning-artifacts/design-system-v5.md` - Design tokens

### Project Context Notes

- Public bundle has NO Firebase SDK - already correct
- Use `font-['Inter',system-ui,sans-serif]` for public UI
- Terracotta accent: `#B8510D`, hover: `#9A4409`
- External icons should be subtle, not distracting

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.3] - Original AC
- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.7] - External link treatment
- [Source: _bmad-output/planning-artifacts/design-system-v5.md] - Design tokens
- [Source: app/src/shared/components/guide/FacilitiesSection.tsx] - Existing component
- [Source: app/src/shared/components/guide/SensoryDetail.tsx] - Image handling
- [Source: app/src/shared/components/guide/GuideContent.tsx] - Layout component

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Implementation straightforward

### Completion Notes List

- Added external link icon (↗) + sr-only "(opens in new tab)" to facility map links in FacilitiesSection
- Added external link icon + sr-only to address link in GuideContent header
- Renamed "Facilities" heading to "Key Facilities" per AC #2
- Created FacilitiesSection.test.tsx with 10 tests covering external links
- Added 2 tests to GuideContent.test.tsx for address link accessibility
- Created SensoryDetail.test.tsx with 5 tests verifying alt text
- All 231 tests pass, build passes, lint passes

### File List

- app/src/shared/components/guide/FacilitiesSection.tsx (modified)
- app/src/shared/components/guide/GuideContent.tsx (modified)
- app/src/shared/components/guide/FacilitiesSection.test.tsx (new)
- app/src/shared/components/guide/SensoryDetail.test.tsx (new)
- app/src/shared/components/guide/GuideContent.test.tsx (modified)

---

## Change Log

- 2026-01-31: Story created by create-story workflow - 90% already implemented
- 2026-01-31: Task 6 (lightbox) confirmed complete - already in codebase
- 2026-01-31: Tasks 1-5 completed - external link icons, "Key Facilities" rename, tests added. All 231 tests pass.
