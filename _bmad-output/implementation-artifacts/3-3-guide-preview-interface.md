# Story 3.3: Guide Preview Interface

Status: ready-for-dev

---

## Story

As an **admin user**,
I want **to preview the generated guide before publishing**,
So that **I can verify the content is correct**.

---

## Acceptance Criteria

1. **Given** the LLM transformation completed, **When** I view the preview, **Then** I see the guide rendered exactly as users will see it **And** I can expand/collapse sections **And** I can see images if extracted **And** I can see category badges

2. **Given** the content looks correct, **When** I am satisfied with the preview, **Then** I can click "Publish" to make it live

3. **Given** the content has errors, **When** I review the preview, **Then** I see a "Re-upload PDF" option **And** I understand that PDF is the source of truth **And** I can upload a corrected PDF to regenerate

---

## Tasks / Subtasks

- [ ] **Task 1: Create GuidePreview Component** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/GuidePreview.tsx`
  - [ ] Accept `guideData` prop (validated Guide JSON from Storage)
  - [ ] Render venue header: name, summary, last updated, category badges
  - [ ] Render collapsible areas/zones (Entry, Main Area, Platforms, etc.)
  - [ ] Render sensory details within each area (category, level, description)
  - [ ] Render images if present (with alt text)
  - [ ] Render facilities section (exits, bathrooms, quiet zones)
  - [ ] Follow project design system: warm colours, Inter font, proper spacing

- [ ] **Task 2: Create useGuideData Hook** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/useGuideData.ts`
  - [ ] Fetch guide JSON from Cloud Storage path (`outputPath` from Story 3.2)
  - [ ] Use React Query for caching and loading states
  - [ ] Validate fetched data against `guideSchema` from `lib/schemas/guideSchema.ts`
  - [ ] Handle fetch errors with clear messaging
  - [ ] Return `{ data, isLoading, error, refetch }`

- [ ] **Task 3: Create Collapsible Section Component** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/PreviewSection.tsx`
  - [ ] Implement expand/collapse with button (NOT div+onclick)
  - [ ] Show category badges on collapsed section header
  - [ ] Use chevron icon + aria-expanded for state indication
  - [ ] Animate open/close unless prefers-reduced-motion is set
  - [ ] Keyboard accessible: Enter/Space to toggle
  - [ ] 28px minimum touch targets

- [ ] **Task 4: Create Category Badge Component** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/CategoryBadge.tsx`
  - [ ] Use colours from design system (Sound=#CDE7FF, etc.)
  - [ ] Include text labels (not icons alone)
  - [ ] Verified contrast ratios per WCAG 2.2 AA
  - [ ] Sensory level variants: low (green), medium (amber), high (red)

- [ ] **Task 5: Create SensoryDetail Component** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/SensoryDetail.tsx`
  - [ ] Show category, level badge, description
  - [ ] Show image if `imageUrl` present (with proper alt text)
  - [ ] Clear visual hierarchy within detail blocks

- [ ] **Task 6: Integrate Preview into VenueDetail** (AC: #1, #2, #3)
  - [ ] Update `app/src/features/admin/VenueDetail.tsx`
  - [ ] Replace current success state placeholder with GuidePreview
  - [ ] Fetch guide data when `outputPath` is set
  - [ ] Show loading skeleton while fetching
  - [ ] Handle fetch errors with retry option

- [ ] **Task 7: Create Preview Actions Bar** (AC: #2, #3)
  - [ ] Create action bar with: "Publish", "Re-upload PDF", "Show Suggestions"
  - [ ] "Publish" button prominent (primary style)
  - [ ] "Re-upload PDF" resets transform state to idle
  - [ ] "Show Suggestions" toggles suggestions panel visibility
  - [ ] Disable "Publish" while actions in progress

- [ ] **Task 8: Create Suggestions Panel** (AC: related to 3.5)
  - [ ] Create `app/src/features/admin/guides/SuggestionsPanel.tsx`
  - [ ] Display bullet list of suggestions from guide JSON
  - [ ] Collapsible panel (hidden by default)
  - [ ] Clear explanation that re-upload is required to apply suggestions
  - [ ] Link suggestions to specific sections if possible

- [ ] **Task 9: Implement Publish Function Stub** (AC: #2)
  - [ ] Create placeholder for publish action (actual implementation in Story 3.4)
  - [ ] Show toast: "Publish functionality coming in next story"
  - [ ] Log publish intent for testing
  - [ ] Ensure state machine handles publish-pending state

- [ ] **Task 10: Write Tests** (AC: all)
  - [ ] Unit test GuidePreview renders all sections
  - [ ] Unit test PreviewSection expand/collapse and keyboard nav
  - [ ] Unit test CategoryBadge colour variants
  - [ ] Unit test useGuideData fetches and validates
  - [ ] Unit test SuggestionsPanel toggle visibility
  - [ ] Integration test: transform complete → preview visible

---

## Dev Notes

### Epic 3 Context

This is the preview story enabling content verification before publishing. It consumes the output from Story 3.2 (LLM Transformation) and prepares for Story 3.4 (Publish). Story 3.5 (Content Suggestions) is partially addressed here with the suggestions panel.

### Architecture Patterns (MUST FOLLOW)

**Guide JSON Schema (from Story 3.2):**
```ts
// Guide structure - journey-based (Place → Subject → Detail)
{
  schemaVersion: '1.0',
  venue: {
    name: string,
    address: string,
    contact?: string,
    summary: string,
    lastUpdated: string // ISO date
  },
  categories: string[], // ['Sound', 'Light', 'Crowds', etc.]
  areas: [
    {
      id: string,
      name: string, // e.g., "Entry Hall", "Main Concourse"
      order: number,
      badges: string[], // categories present in this area
      details: [
        {
          category: string, // 'Sound', 'Light', etc.
          level: 'low' | 'medium' | 'high',
          description: string,
          imageUrl?: string
        }
      ]
    }
  ],
  facilities: {
    exits: { description: string, mapUrl?: string }[],
    bathrooms: { description: string, mapUrl?: string }[],
    quietZones: { description: string }[]
  },
  suggestions: string[], // Content improvement suggestions
  generatedAt: string // ISO date
}
```

**Cloud Storage URL Pattern:**
```ts
// outputPath from transform is relative to bucket
// Public URL: https://storage.googleapis.com/{bucket}/{outputPath}
const downloadUrl = `https://storage.googleapis.com/${BUCKET}/${outputPath}`;

// Alternatively, use Firebase Storage SDK
import { ref, getDownloadURL } from 'firebase/storage';
const url = await getDownloadURL(ref(storage, outputPath));
```

**Design System Tokens (from project-context.md):**
| Token | Value | Usage |
|-------|-------|-------|
| Primary Font | Inter | All public UI text |
| Accent Colour | `#B8510D` | Actions, expanded states, left borders |
| Sensory Low | `#2A6339` | Calm areas |
| Sensory Medium | `#8A5F08` | Moderate activity |
| Sensory High | `#9E3322` | Potentially overwhelming |

**Category Badge Colours (from UX spec):**
- Sound: `#CDE7FF` (light blue)
- Light: `#FFF4CC` (light yellow)
- Crowds: `#FFE0CC` (light peach)
- Touch/Texture: `#E8D5FF` (light purple)
- Smell: `#D5F5E3` (light mint)
- Movement: `#FFD6E8` (light pink)

### Existing Code Patterns to Follow

**From VenueDetail.tsx (current state):**
```tsx
// Current success state placeholder (lines 350-378)
// Replace this with GuidePreview component
{transformState === 'complete' && outputPath ? (
  <div className="space-y-4">
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <h3 className="font-medium text-green-800 mb-2">
        Guide generated successfully!
      </h3>
      // ... placeholder content
    </div>
    <div className="flex gap-3">
      <button onClick={() => console.log('Preview:', outputPath)}>
        Preview Guide
      </button>
      // ...
    </div>
  </div>
) : null}
```

**From guideSchema.ts (existing):**
```ts
// Already have full schema from Story 3.2
// Import and use for validation:
import { guideSchema, type Guide } from '@/lib/schemas/guideSchema';
```

**From TransformProgress.tsx (animation pattern):**
```tsx
// Respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In CSS:
@keyframes gentle-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}
```

### Component Architecture

```
VenueDetail.tsx
├── PdfUpload (idle state)
├── TransformProgress (transforming state)
└── GuidePreview (complete state) ← NEW
    ├── GuideHeader (venue name, summary, badges)
    ├── PreviewSection (collapsible area)
    │   ├── SectionHeader (name + category badges)
    │   └── SensoryDetail[] (category, level, description, image)
    ├── FacilitiesSection
    │   ├── Exits
    │   ├── Bathrooms
    │   └── QuietZones
    ├── SuggestionsPanel (collapsible)
    └── PreviewActionsBar (Publish, Re-upload, Show Suggestions)
```

### File Structure to Create

```
app/src/features/admin/guides/
├── GuidePreview.tsx        # NEW - main preview component
├── GuidePreview.test.tsx   # NEW - unit tests
├── PreviewSection.tsx      # NEW - collapsible section
├── PreviewSection.test.tsx # NEW - unit tests
├── CategoryBadge.tsx       # NEW - category badge
├── CategoryBadge.test.tsx  # NEW - unit tests
├── SensoryDetail.tsx       # NEW - detail block
├── SuggestionsPanel.tsx    # NEW - suggestions display
├── useGuideData.ts         # NEW - fetch hook
├── useGuideData.test.ts    # NEW - unit tests
├── TransformProgress.tsx   # EXISTS
├── RateLimitDisplay.tsx    # EXISTS
└── PdfUpload.tsx           # EXISTS (from 3.1)
```

### Accessibility Requirements (CRITICAL)

1. **Collapsible sections MUST use `<button>` elements** (NOT div+onclick)
2. **aria-expanded** attribute must reflect section state
3. **aria-controls** must reference the controlled panel id
4. **Focus visible** outline on all interactive elements
5. **28px minimum touch targets** on toggles
6. **Keyboard navigation**: Tab through sections, Enter/Space to toggle
7. **Screen reader**: Announce "Section Name, collapsed/expanded, button"
8. **Icons + text labels** - never icon-only buttons
9. **Colour contrast** verified for all badge colours (WCAG 2.2 AA)
10. **prefers-reduced-motion** respected for expand/collapse animations

### Example Section Button Markup
```tsx
<button
  type="button"
  aria-expanded={isExpanded}
  aria-controls={`section-${area.id}`}
  onClick={() => setIsExpanded(!isExpanded)}
  className="flex w-full items-center justify-between py-3 px-4 text-left hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
>
  <span className="font-medium">{area.name}</span>
  <div className="flex items-center gap-2">
    {area.badges.map(badge => <CategoryBadge key={badge} category={badge} />)}
    <ChevronIcon className={isExpanded ? 'rotate-180' : ''} aria-hidden="true" />
  </div>
</button>
<div
  id={`section-${area.id}`}
  hidden={!isExpanded}
  className="px-4 pb-4"
>
  {/* Section content */}
</div>
```

### Libraries Available / To Add

| Package | Version | Use For | Status |
|---------|---------|---------|--------|
| react | ^18.x | Component framework | Available |
| @tanstack/react-query | latest | Data fetching | Available (admin) |
| zod | ^4.3.6 | Schema validation | Available |
| firebase | ^12.8.0 | Storage access | Available |
| tailwindcss | ^4.x | Styling | Available |
| lucide-react | latest | Icons (Chevron) | Available |

### Testing Strategy

1. **Unit tests:**
   - GuidePreview renders venue header and all areas
   - PreviewSection expand/collapse state
   - PreviewSection keyboard navigation (Enter, Space)
   - CategoryBadge correct colours for each category
   - useGuideData loading, success, error states
   - SuggestionsPanel toggle visibility

2. **Integration tests:**
   - VenueDetail: outputPath set → useGuideData fetches → GuidePreview renders
   - Error handling: fetch fails → error message + retry

3. **Manual testing:**
   - Tab through all sections (keyboard nav)
   - Screen reader announces section states correctly
   - Expand/collapse animation respects prefers-reduced-motion
   - All badge colours pass contrast check

### Previous Story Intelligence

**From Story 3.2 (LLM Transformation Pipeline):**
- `outputPath` is set when transform completes successfully
- Path format: `venues/{venueId}/versions/{timestamp}.json`
- Guide JSON is validated against `guideSchema` before storage
- Suggestions are included in the guide JSON (not separate)
- Transform creates progress doc at `/venues/{venueId}/progress/{jobId}`

**Key state from VenueDetail:**
```ts
const [outputPath, setOutputPath] = useState<string | null>(null);
// When transform completes:
setOutputPath(result.data.outputPath);
setTransformState('complete');
```

### Git Intelligence Summary

**Recent patterns from Epic 2-3:**
- Components colocated with tests (`.tsx` + `.test.tsx`)
- React Query used for admin data fetching
- Firestore composite indexes may be needed for new queries
- Firebase config handling is graceful - follow same error patterns

**Relevant commits:**
- `80da3f5` docs
- `e69f217` fix: warn user before self-removal from venue and redirect after
- Story 3.2 added TransformProgress with rotating messages pattern

---

## References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] - React Query, component patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Progressive-Disclosure] - Collapsible sections pattern
- [Source: _bmad-output/project-context.md#Design-System] - Colour tokens, fonts, accessibility rules
- [Source: _bmad-output/implementation-artifacts/3-2-llm-transformation-pipeline.md] - outputPath, guide schema, suggestions
- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.3] - Acceptance criteria

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

