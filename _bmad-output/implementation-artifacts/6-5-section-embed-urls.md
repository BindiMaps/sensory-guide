# Story 6.5: Section Embed URLs

Status: ready-for-dev

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

- [ ] **Task 1: Add embedUrl to schema**
  - [ ] Add `embedUrl: z.string().url().optional()` to `areaSchema`
  - [ ] Update `getGuideJsonSchemaString()` if needed for LLM prompt

- [ ] **Task 2: Create useEmbeddings hook**
  - [ ] Fetch embeddings from `/venues/{venueId}/embeddings`
  - [ ] Save embeddings to Firestore
  - [ ] Handle merge logic (match by section ID)
  - [ ] Expose loading/error states

- [ ] **Task 3: Create EmbedEditor modal**
  - [ ] List all sections with input field for embed URL
  - [ ] Live preview of embed (small iframe)
  - [ ] Save/Cancel buttons
  - [ ] Validation feedback for invalid URLs
  - [ ] Design system v5 styling

- [ ] **Task 4: Add "Edit Embeds" button to GuidePreview**
  - [ ] Button in action bar
  - [ ] Opens EmbedEditor modal
  - [ ] Pass current guide areas + venue ID

- [ ] **Task 5: Merge embeddings into guide on load**
  - [ ] In `useGuideData` or wrapper, fetch embeddings
  - [ ] Merge `embedUrl` into each area before returning
  - [ ] Handle case where embeddings doc doesn't exist

- [ ] **Task 6: Update AreaSection for public display**
  - [ ] If `embedUrl` present and section expanded, render iframe
  - [ ] Collapsed state: show small icon/indicator "Has map"
  - [ ] Responsive iframe sizing
  - [ ] Loading state for iframe

- [ ] **Task 7: Bake embeddings into published guide JSON**
  - [ ] At publish time, merge embeddings into guide JSON
  - [ ] Public guide JSON includes embedUrl per area
  - [ ] No Firestore lookup needed for public access

- [ ] **Task 8: Handle re-upload merge**
  - [ ] After LLM transform, fetch existing embeddings
  - [ ] Match by section ID
  - [ ] Log/flag orphaned embeddings (section ID no longer exists)

- [ ] **Task 9: Firestore security rules**
  - [ ] `/venues/{venueId}/embeddings` readable/writable by venue editors
  - [ ] Add rules to existing security rules file

- [ ] **Task 10: Add tests**
  - [ ] Unit tests for URL validation
  - [ ] Unit tests for merge logic
  - [ ] Component tests for EmbedEditor
  - [ ] Integration test for re-upload preservation

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

- 2026-01-31: Story created - embed URLs for sections with Firestore persistence
