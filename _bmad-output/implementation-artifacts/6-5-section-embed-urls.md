# Story 6.5: Section Embed URLs

Status: done

---

## Story

As an **admin user**,
I want **to add embeddable URLs (maps, videos, etc.) to guide sections that persist across PDF re-uploads**,
So that **end users can see interactive maps and media alongside sensory information**.

---

## Acceptance Criteria

1. **Given** I'm viewing a guide preview, **When** I click "Edit Embeds" (or similar), **Then** I see an input field for each section to paste an embed URL

2. **Given** I paste a URL into an embed field, **When** I click Save, **Then** the URL is stored in Firestore (not in the guide JSON) **And** the preview shows the embedded content

3. **Given** a section has an embed URL, **When** I re-upload a new PDF, **Then** the embed URL is preserved if a section with matching ID exists

4. **Given** a section with an embed URL is removed in a re-upload, **When** transformation completes, **Then** the orphaned embed URL is flagged for admin review (or silently dropped - TBD)

5. **Given** I'm viewing a published guide as an end user, **When** I expand a section with an embed, **Then** I see the embedded content (iframe) within the section

6. **Given** I paste an invalid or non-embeddable URL, **When** I try to save, **Then** I see a validation error **And** the save is blocked

7. **Given** I want to remove an embed, **When** I clear the URL field and save, **Then** the embed is removed from that section

---

## Technical Approach

### Data Model

**Firestore (persists across re-uploads):**
```
/venues/{venueId}/embeddings (single doc)
{
  "entry-hall": "https://bindiweb.com/map/...",
  "main-concourse": "https://www.youtube.com/embed/...",
  ...
}
```

Key is section `id` (stable across re-uploads if LLM preserves structure).

**Guide JSON Schema (extended):**
```typescript
// areaSchema addition
embedUrl: z.string().url().optional()
```

The `embedUrl` is populated at runtime by merging Firestore embeddings into the guide JSON when loading for preview/display.

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Upload PDF                                              │
│       ↓                                                     │
│  2. LLM transforms → Guide JSON (areas with IDs)            │
│       ↓                                                     │
│  3. Fetch embeddings from Firestore                         │
│       ↓                                                     │
│  4. Merge: areas[].embedUrl = embeddings[area.id]           │
│       ↓                                                     │
│  5. Display preview with embeds                             │
│       ↓                                                     │
│  6. Admin edits embed URLs                                  │
│       ↓                                                     │
│  7. Save embeddings to Firestore (separate from guide JSON) │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     RE-UPLOAD FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. New PDF uploaded                                        │
│       ↓                                                     │
│  2. LLM generates new guide JSON with (hopefully) same IDs  │
│       ↓                                                     │
│  3. Fetch existing embeddings from Firestore                │
│       ↓                                                     │
│  4. Merge: match embeddings to new section IDs              │
│       ↓                                                     │
│  5. Orphaned embeddings (no matching ID):                   │
│     - Option A: Silently drop                               │
│     - Option B: Show warning to admin                       │
│       ↓                                                     │
│  6. Preview shows preserved embeds                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PUBLIC FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Guide JSON includes embedUrl per area (at publish time) │
│       ↓                                                     │
│  2. AreaSection renders iframe when embedUrl present        │
│       ↓                                                     │
│  3. Collapsed: show "Has map" indicator                     │
│  4. Expanded: show full iframe embed                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
app/src/features/admin/guides/
├── components/
│   └── EmbedEditor/
│       ├── index.tsx           # Modal with embed URL inputs per section
│       └── EmbedUrlInput.tsx   # Single input with preview
├── useEmbeddings.ts            # Hook to fetch/save embeddings from Firestore

app/src/shared/components/guide/
├── AreaSection.tsx             # MODIFY: render iframe when embedUrl present
├── EmbedPreview.tsx            # NEW: iframe wrapper with loading state
```

### URL Validation Strategy

**Allowlist approach (recommended):**
```typescript
const ALLOWED_EMBED_DOMAINS = [
  'bindiweb.com',
  'youtube.com',
  'youtube-nocookie.com',
  'vimeo.com',
  'google.com/maps',
  'maps.google.com',
]

function isEmbeddable(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_EMBED_DOMAINS.some(domain =>
      parsed.hostname.endsWith(domain) || parsed.hostname === domain
    )
  } catch {
    return false
  }
}
```

**Alternative: Try embed and catch X-Frame-Options errors** (more permissive but harder to validate upfront).

### Iframe Security

```tsx
<iframe
  src={embedUrl}
  title={`Map for ${sectionName}`}
  className="w-full h-64 rounded border-0"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-popups"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

---

## Tasks / Subtasks

- [x] **Task 1: Add embedUrl to schema**
  - [x] Add `embedUrl: z.string().url().optional()` to `areaSchema`
  - [x] Update `getGuideJsonSchemaString()` if needed for LLM prompt (N/A - embedUrl is merged at runtime, not LLM output)

- [x] **Task 2: Create useEmbeddings hook**
  - [x] Fetch embeddings from `/venues/{venueId}/embeddings`
  - [x] Save embeddings to Firestore
  - [x] Handle merge logic (match by section ID)
  - [x] Expose loading/error states

- [x] **Task 3: Create EmbedEditor modal**
  - [x] List all sections with input field for embed URL
  - [ ] Live preview of embed (small iframe) - deferred to polish
  - [x] Save/Cancel buttons
  - [x] Validation feedback for invalid URLs
  - [x] Design system v5 styling

- [x] **Task 4: Add "Edit Embeds" button to GuidePreview**
  - [x] Button in action bar
  - [x] Opens EmbedEditor modal
  - [x] Pass current guide areas + venue ID

- [x] **Task 5: Merge embeddings into guide on load**
  - [x] In `useGuideData` or wrapper, fetch embeddings
  - [x] Merge `embedUrl` into each area before returning
  - [x] Handle case where embeddings doc doesn't exist

- [x] **Task 6: Update AreaSection for public display**
  - [x] If `embedUrl` present and section expanded, render iframe
  - [x] Collapsed state: show small icon/indicator "Has map"
  - [x] Responsive iframe sizing
  - [x] Loading state for iframe (using native lazy loading)

- [x] **Task 7: Bake embeddings into published guide JSON**
  - [x] At publish time, merge embeddings into guide JSON
  - [x] Public guide JSON includes embedUrl per area
  - [x] No Firestore lookup needed for public access

- [x] **Task 8: Handle re-upload merge**
  - [x] After LLM transform, fetch existing embeddings (embeddings persist in Firestore, separate from guide JSON)
  - [x] Match by section ID (done at display/publish time)
  - [x] Log/flag orphaned embeddings (section ID no longer exists) - logged at publish time

- [x] **Task 9: Firestore security rules**
  - [x] `/venues/{venueId}/embeddings` readable/writable by venue editors
  - [x] Add rules to existing security rules file

- [x] **Task 10: Add tests**
  - [x] Unit tests for URL validation (isEmbeddableUrl - 8 tests)
  - [x] Schema tests for embedUrl field (guideSchema.test.ts - 3 tests)
  - [x] Hook tests for useEmbeddings (useEmbeddings.test.ts - 6 tests)
  - [x] Component tests for EmbedEditor (EmbedEditor.test.tsx - 10 tests)
  - [x] AreaSection tests for embed display (AreaSection.test.tsx - 4 new tests)
  - [x] GuidePreview tests for Edit Embeds button (2 new tests)

---

## Dev Notes

### Design System v5 Styling

**Embed input field:**
```tsx
<input
  type="url"
  placeholder="Paste embed URL (BindiWeb, YouTube, etc.)"
  className="w-full px-3 py-2 border border-[#DDDDD9] rounded-sm text-sm focus:ring-2 focus:ring-[#B8510D] focus:border-transparent"
/>
```

**Embed preview in section (public):**
```tsx
<div className="mt-3 aspect-video w-full max-w-md">
  <iframe
    src={embedUrl}
    title={`Map for ${area.name}`}
    className="w-full h-full rounded-sm border border-[#E8E8E5]"
    loading="lazy"
  />
</div>
```

### Stable Section IDs

The LLM generates section IDs like `entry-hall`, `main-concourse`. For embed persistence to work:
- IDs must be deterministic (same content → same ID)
- Current approach: LLM generates from section name (slugified)
- Risk: If section name changes, ID changes, embed is orphaned

**Mitigation options:**
1. Accept some embed loss on significant restructures (simplest)
2. Fuzzy match by section name similarity (complex)
3. Store embed by section name, not ID (but names can change too)

Recommend option 1 for MVP - most re-uploads are minor edits, not restructures.

### Accessibility

- Iframe must have descriptive `title` attribute
- Provide "Open in new tab" link as fallback
- Collapsed indicator should be screen-reader accessible

### Edge Cases

| Case | Handling |
|------|----------|
| Embed URL returns X-Frame-Options deny | Show error in preview, don't save |
| Section deleted in re-upload | Orphan the embed (log it) |
| Very long embed URL | Truncate display, full URL in tooltip |
| Embed fails to load | Show fallback link |
| Multiple embeds per section | Not supported in v1 (one per section) |

### File References

- `app/src/lib/schemas/guideSchema.ts` - Schema to extend
- `app/src/features/admin/guides/GuidePreview.tsx` - Add button
- `app/src/shared/components/guide/AreaSection.tsx` - Render embed
- `app/functions/src/admin/publishGuide.ts` - Merge embeddings at publish
- `_bmad-output/planning-artifacts/architecture.md` - Firestore structure
- `_bmad-output/party-log.md` - Original feature discussion

### Party Log Decisions

From party-mode discussion:
- "Paste URL to embed here" - not coupled to BindiWeb specifically
- Live preview when URL pasted
- Collapsed: indicator; Expanded: full embed
- QR code for print (future - not this story)

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [ ] All colours match design system tokens exactly
- [ ] Typography matches design system
- [ ] Input styling matches existing admin inputs
- [ ] Iframe has proper aspect ratio and responsive behaviour
- [ ] Accessibility requirements (iframe title, fallback link) verified

---

## References

- [Source: _bmad-output/party-log.md] - Feature discussion and decisions
- [Source: _bmad-output/planning-artifacts/architecture.md] - Data model
- [Source: _bmad-output/planning-artifacts/prd.md:248] - Growth feature list
- [Source: app/src/shared/components/guide/AreaSection.tsx] - Integration point

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- All 10 tasks completed successfully
- 265 tests passing (33 new tests added)
- Functions build passes
- Firestore security rules updated
- Live preview deferred to polish phase
- Design system v5 styling applied

### File List

**New Files:**
- `app/src/features/admin/guides/useEmbeddings.ts` - Hook for fetching/saving embeddings
- `app/src/features/admin/guides/useEmbeddings.test.ts` - 6 tests
- `app/src/features/admin/guides/EmbedEditor.tsx` - Modal for editing embed URLs
- `app/src/features/admin/guides/EmbedEditor.test.tsx` - 18 tests

**Modified Files:**
- `app/src/lib/schemas/guideSchema.ts` - Added embedUrl to areaSchema
- `app/functions/src/schemas/guideSchema.ts` - Added embedUrl to areaSchema
- `app/src/lib/schemas/guideSchema.test.ts` - 3 new embedUrl tests
- `app/src/features/admin/guides/GuidePreview.tsx` - Added Edit Embeds button, merge embeddings
- `app/src/features/admin/guides/GuidePreview.test.tsx` - 2 new tests
- `app/src/shared/components/guide/AreaSection.tsx` - Render iframe + "Has map" indicator
- `app/src/shared/components/guide/AreaSection.test.tsx` - 4 new tests
- `app/functions/src/admin/publishGuide.ts` - Bake embeddings into published JSON
- `app/firestore.rules` - Added embeddings subcollection rules

---

## Change Log

- 2026-01-31: Story created - embed URLs for sections with Firestore persistence
