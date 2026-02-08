# Story 6.6: Global Venue Map

Status: done

---

## Story

As an **end user viewing a sensory guide**,
I want **a single, prominent venue map accessible from anywhere in the guide**,
So that **I can orient myself within the venue without hunting through multiple small section maps**.

---

## Acceptance Criteria

1. **Given** a venue has a `mapUrl` set, **When** I view the guide on desktop, **Then** I see a terracotta pill FAB (bottom-right) labelled "View Map" that opens a near-fullscreen lightbox with the map iframe

2. **Given** a venue has a `mapUrl` set, **When** I view the guide on mobile, **Then** I see an inline card after the intro section that opens the map in a new tab (no lightbox)

3. **Given** I'm an admin editing a venue, **When** I open "Maps & Media", **Then** I see a "Venue Map URL" field at the top that validates against the embed URL allowlist

4. **Given** I save a venue map URL on an already-published guide, **When** I click Save, **Then** the live guide is auto-republished with the new map URL

5. **Given** I generate a PDF of a guide with a venue map, **When** the PDF renders, **Then** a QR code linking to the map URL appears at the top (after header, before intro)

6. **Given** a venue has no `mapUrl`, **When** I view the guide, **Then** neither the FAB, inline card, nor PDF QR code appear

7. **Given** I open the map (desktop lightbox or mobile new tab), **When** analytics are active, **Then** a `GUIDE_MAP_OPEN` event is tracked

---

## Technical Approach

### Schema Changes

Added `mapUrl?: string` to `venueOverviewSchema` in `guideSchema.ts`. Stored as `globalMapUrl` on the venue Firestore document, merged into `venue.mapUrl` at publish time (same pattern as section embeds).

### Admin UX

- "Venue Map URL" field added to top of existing EmbedEditor modal (now titled "Maps & Media")
- Same `isEmbeddableUrl` allowlist validation
- `useGlobalMapUrl` hook reads/writes `globalMapUrl` on venue Firestore doc
- Auto-republish on save when guide is already published (via `useRepublishEmbeddings`)

### Public UI — Desktop

- `MapLightbox` component: terracotta pill FAB (`hidden sm:inline-flex`) fixed bottom-right
- Opens Radix Dialog lightbox: `calc(100vw-2rem) x calc(100vh-2rem)` (nearly fullscreen)
- Header with venue name + close button, full-bleed iframe body
- iframe src set on open, cleared on close (performance)
- Respects `prefers-reduced-motion`

### Public UI — Mobile

- `MapInlineCard` component: terracotta-tinted card (`sm:hidden`) placed after intro card
- Opens map in new browser tab (`window.open`)
- Shows "Open Venue Map" with "Interactive map opens in a new tab" hint
- No lightbox on mobile — full native browser experience for maps

### PDF

- Venue map QR code rendered at top of PDF (after header/badges, before intro card)
- Generated in parallel with PDF module lazy-loading for performance
- Label: "Venue Map", hint: "Scan to view the interactive venue map"

### Per-Section Embeds

Completely untouched — global map is purely additive. Different purpose: section embeds = section-specific detail, global map = venue overview.

---

## Tasks / Subtasks

- [x] **Task 1: Schema — add `mapUrl` to venue overview**
  - [x] Add `mapUrl: z.string().url().optional()` to `venueOverviewSchema`
  - [x] Mirror in functions schema

- [x] **Task 2: Admin — `useGlobalMapUrl` hook**
  - [x] Read/write `globalMapUrl` on venue Firestore doc
  - [x] Expose loading/error states

- [x] **Task 3: Admin — Venue Map URL field in EmbedEditor**
  - [x] Add URL input at top of editor modal
  - [x] `isEmbeddableUrl` validation
  - [x] Rename "Embeds" to "Maps & Media" throughout admin UI
  - [x] Pass `globalMapUrl` through save flow

- [x] **Task 4: Admin — Auto-republish on save**
  - [x] Wire `useRepublishEmbeddings` in GuidePreview
  - [x] Trigger republish when `isPublished && venueId`
  - [x] Success/error feedback UI
  - [x] Wire republish in PublishedSuccess screen too

- [x] **Task 5: Publish pipeline — merge `mapUrl`**
  - [x] Fetch `globalMapUrl` from venue doc at publish time
  - [x] Merge into `venue.mapUrl` in published JSON
  - [x] Same pattern as section embed merging

- [x] **Task 6: Public — `MapLightbox` component (desktop)**
  - [x] Terracotta pill FAB, fixed bottom-right
  - [x] Radix Dialog lightbox with near-fullscreen sizing
  - [x] iframe lazy-load on open, clear on close
  - [x] `prefers-reduced-motion` support
  - [x] `print:hidden` to hide in print

- [x] **Task 7: Public — `MapInlineCard` component (mobile)**
  - [x] Inline card after intro, `sm:hidden`
  - [x] Opens map in new tab
  - [x] Terracotta-tinted styling with pin icon + chevron

- [x] **Task 8: Wire into GuideContent**
  - [x] Import `MapLightbox` and `MapInlineCard`
  - [x] Render inline card after intro card (inside 720px container)
  - [x] Render FAB + lightbox outside container (fixed positioning)
  - [x] `GUIDE_MAP_OPEN` analytics event

- [x] **Task 9: PDF — venue map QR code**
  - [x] Generate QR code for `venue.mapUrl` in `DownloadPdfButton`
  - [x] Add `mapQrCode` prop to `GuidePdf`
  - [x] Render at top of PDF with label

- [x] **Task 10: Mockups**
  - [x] Desktop FAB variations mockup (`mockup-global-map-fab.html`)
  - [x] Mobile button variations mockup (`mockup-map-button-mobile.html`)
  - [x] User chose: Bold Pill FAB (desktop) + Inline Card #7 (mobile)

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist**:
- [x] Terracotta accent `#B8510D` used for FAB and inline card
- [x] Inter font family with system fallback
- [x] 720px max-width container respected (inline card inside, FAB outside)
- [x] 4px border-radius on inline card
- [x] Focus-visible ring styling matches v5 (`ring-[#B8510D]`)
- [x] Muted text colours `#595959` for secondary content
- [x] Surface colour `#F8F8F6` for lightbox loading state
- [x] `print:hidden` on interactive elements
- [x] `prefers-reduced-motion` respected on FAB hover animation

---

## References

- [Source: _bmad-output/planning-artifacts/mockup-global-map-fab.html] — Desktop FAB mockup
- [Source: _bmad-output/planning-artifacts/mockup-map-button-mobile.html] — Mobile variations mockup
- [Source: _bmad-output/implementation-artifacts/6-5-section-embed-urls.md] — Section embeds (predecessor)
- [Source: _bmad-output/implementation-artifacts/8-9-pdf-qr-codes-for-embeds.md] — QR code infrastructure
- [Source: app/src/shared/components/guide/MapLightbox.tsx] — Implementation

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 / Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- All 10 tasks completed successfully
- 384 tests passing at completion
- Build passes, lint clean
- Desktop: Bold Pill FAB chosen from 4 variations
- Mobile: Inline Card (#7) chosen from 10 variations
- Mobile uses CSS breakpoints (`sm:hidden` / `hidden sm:inline-flex`) — no JS matchMedia
- Lightbox sized near-fullscreen (`calc(100vw-2rem) x calc(100vh-2rem)`)
- Auto-republish wired for both GuidePreview and PublishedSuccess save paths
- PDF QR code generated in parallel with module loading for performance

### File List

**New Files:**
- `app/src/shared/components/guide/MapLightbox.tsx` — FAB (desktop) + inline card (mobile) + lightbox
- `app/src/features/admin/guides/useGlobalMapUrl.ts` — Hook for venue-level map URL
- `_bmad-output/planning-artifacts/mockup-global-map-fab.html` — Desktop FAB mockup
- `_bmad-output/planning-artifacts/mockup-map-button-mobile.html` — Mobile variations mockup

**Modified Files:**
- `app/src/lib/schemas/guideSchema.ts` — Added `mapUrl` to `venueOverviewSchema`
- `app/functions/src/schemas/guideSchema.ts` — Added `mapUrl` to `venueOverviewSchema`
- `app/src/features/admin/guides/EmbedEditor.tsx` — Venue Map URL field, renamed to "Maps & Media"
- `app/src/features/admin/guides/GuidePreview.tsx` — `isPublished` prop, auto-republish on save
- `app/src/features/admin/venue-detail/GuidePreviewWrapper.tsx` — Pass `isPublished`
- `app/src/features/admin/guides/PublishedSuccess.tsx` — `useGlobalMapUrl`, republish with map URL
- `app/src/shared/components/guide/GuideContent.tsx` — Render MapInlineCard + MapLightbox
- `app/src/shared/components/guide/GuidePdf.tsx` — `mapQrCode` prop, venue map QR at top
- `app/src/shared/components/guide/DownloadPdfButton.tsx` — Generate venue map QR code
- `app/functions/src/admin/publishGuide.ts` — Merge `globalMapUrl` into published JSON
- `app/src/lib/analytics.ts` — Added `GUIDE_MAP_OPEN` event

---

## Change Log

- 2026-02-04: Story created — global venue map with desktop lightbox, mobile inline card, PDF QR
- 2026-02-06: Implementation complete — all tasks done, 384 tests passing
