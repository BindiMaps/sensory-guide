# Story 2.13: Venue Lifecycle Dashboard

Status: done

## Story

As an **admin user**,
I want **the venue detail page to show the current state of my venue on page load**,
so that **I can see what's published, what drafts exist, and manage versions without losing context**.

## Background

> **Context:** This story addresses a critical UX gap where page refresh/navigation loses all state. It implements the `listVersions` and `setLiveVersion` functions specified in architecture.md but never built. This is foundational to the management experience and significantly improves testing workflows.

This was originally Story 6.0 but moved to Epic 2 as 2-13 due to priority.

## Acceptance Criteria

1. **Given** I navigate to a venue detail page
   **When** the page loads
   **Then** I see the venue's current state:
   - If published: Show the live guide preview, publish date, shareable URL
   - If has unpublished draft: Show the draft preview with "Publish" option
   - If neither: Show the PDF upload prompt

2. **Given** a venue has been published
   **When** I refresh the page
   **Then** I still see the published state (not reset to upload prompt)

3. **Given** I have transformed a PDF but not published
   **When** I navigate away and return
   **Then** I see my draft preview (not lost)

4. **Given** a venue has version history
   **When** I view the venue
   **Then** I can access a list of all versions (drafts and published) with:
   - Timestamp
   - Status (draft/published/live)
   - Preview button
   - "Make Live" button (for published versions)

5. **Given** I want to re-publish an old version
   **When** I click "Make Live" on a previous version
   **Then** it becomes the live version immediately

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [x] All colours match design system tokens exactly (accent #B8510D, hover #9A4409)
- [x] Typography (font, size, weight) matches design system (Inter, text-sm/text-xs)
- [x] Component patterns (badges, toggles, cards) match existing admin patterns
- [x] Spacing and layout match design system specifications
- [x] Accessibility requirements (contrast, touch targets) verified

## Tasks / Subtasks

- [x] Task 1: Create `listVersions` Firebase Function (AC: #4)
  - [x] 1.1 Create `app/functions/src/admin/listVersions.ts`
  - [x] 1.2 Auth + editor access middleware
  - [x] 1.3 List files from `venues/{venueId}/versions/` in Cloud Storage
  - [x] 1.4 Return array: `{ timestamp, previewUrl, size, created }`
  - [x] 1.5 Export from `app/functions/src/index.ts`
  - [x] 1.6 Write unit test (7 tests passing)

- [x] Task 2: Create `setLiveVersion` Firebase Function (AC: #5)
  - [x] 2.1 Create `app/functions/src/admin/setLiveVersion.ts`
  - [x] 2.2 Auth + editor access middleware
  - [x] 2.3 Verify version exists in Storage
  - [x] 2.4 Copy version to `public/guides/{slug}.json` and make public
  - [x] 2.5 Update Firestore `venues/{id}.liveVersion` pointer
  - [x] 2.6 Export from `app/functions/src/index.ts`
  - [x] 2.7 Write unit test (9 tests passing)

- [x] Task 3: Create `useVenueState` hook for lifecycle detection (AC: #1, #2, #3)
  - [x] 3.1 Create `app/src/features/admin/guides/useVenueState.ts`
  - [x] 3.2 Determine state: 'empty' | 'draft' | 'published'
  - [x] 3.3 Load `liveVersion` from Firestore venue doc
  - [x] 3.4 Check for draft JSON in `versions/` folder if liveVersion exists
  - [x] 3.5 Return `{ state, liveVersion, draftPath, isLoading }`
  - [x] 3.6 Write tests (10 tests passing)

- [x] Task 4: Create `useVersionHistory` hook (AC: #4)
  - [x] 4.1 Create `app/src/features/admin/guides/useVersionHistory.ts`
  - [x] 4.2 Call `listVersions` function
  - [x] 4.3 Merge with `liveVersion` to mark which is live
  - [x] 4.4 Sort by timestamp descending
  - [x] 4.5 Return `{ versions, isLoading, error, refetch }`
  - [x] 4.6 Write tests (7 tests passing)

- [x] Task 5: Create `VersionHistory` component (AC: #4, #5)
  - [x] 5.1 Create `app/src/features/admin/guides/VersionHistory.tsx`
  - [x] 5.2 List all versions with timestamp, status badge
  - [x] 5.3 "LIVE" badge on current live version
  - [x] 5.4 "Preview" button opens preview in dialog/panel
  - [x] 5.5 "Make Live" button (disabled on current live)
  - [x] 5.6 Confirmation dialog before making live
  - [x] 5.7 Toast on success (handled in parent component)
  - [x] 5.8 Write component tests (11 tests passing)

- [x] Task 6: Refactor VenueDetail.tsx for state-aware rendering (AC: #1, #2, #3)
  - [x] 6.1 Integrate `useVenueState` hook
  - [x] 6.2 Render based on state:
    - `empty`: Show PDF upload prompt
    - `draft`: Show draft preview with Publish button
    - `published`: Show live preview + shareable URL + "Upload New" option
  - [x] 6.3 Add "Version History" expandable section/tab
  - [x] 6.4 Ensure page refresh preserves state
  - [x] 6.5 Tests passing (9 VenueDetail tests + hooks/component tests)

- [x] Task 7: Update Firestore venue doc on transform (AC: #3)
  - [x] 7.1 When transform completes, set `draftVersion` field in Firestore
  - [x] 7.2 On publish, draftVersion left for history (liveVersion tracks what's live)
  - [x] 7.3 Update `transformPdf.ts` function

## Dev Notes

### Architecture Requirements

**From architecture.md:**
- Versioned Publishing Model (lines 190-200):
  - Every publish creates `versions/{timestamp}.json`
  - Firestore `liveVersion` points to which timestamp is live
  - "Rollback" = update `liveVersion` pointer only (no data copying)

**From project-context.md:**
- `setLiveVersion(venueId, timestamp)` - make any version live
- `listVersions(venueId)` - get all versions with preview URLs
- Live version pointer: Firestore `venues/{venueId}.liveVersion`

### Existing Patterns to Follow

**Function Pattern (from `publishGuide.ts:29-135`):**
```ts
export const functionName = onCall<RequestType>(
  { cors: true, timeoutSeconds: 30, memory: '256MiB' },
  async (request): Promise<ResponseType> => {
    const userEmail = requireAuth(request)
    await requireEditorAccess(userEmail, venueId)
    // ... logic
  }
)
```

**Hook Pattern (from `usePublishGuide.ts`):**
```ts
export function useHookName() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ... return object with state and functions
}
```

### Key Files to Modify

| File | Change |
|------|--------|
| `app/functions/src/admin/listVersions.ts` | NEW - list versions function |
| `app/functions/src/admin/setLiveVersion.ts` | NEW - rollback function |
| `app/functions/src/index.ts` | Export new functions |
| `app/src/features/admin/guides/useVenueState.ts` | NEW - lifecycle detection hook |
| `app/src/features/admin/guides/useVersionHistory.ts` | NEW - version list hook |
| `app/src/features/admin/guides/VersionHistory.tsx` | NEW - version list UI |
| `app/src/features/admin/VenueDetail.tsx` | MODIFY - state-aware rendering |
| `app/functions/src/transforms/transformPdf.ts` | MODIFY - set draftVersion |

### Cloud Storage Structure

```
/venues/{venueId}/
  uploads/{timestamp}_{logId}.pdf
  versions/{timestamp}.json     # All versions here

/public/guides/{slug}.json      # Copy of live version (public access)
```

### Firestore Venue Doc Fields

```ts
interface VenueDoc {
  slug: string
  name: string
  status: 'draft' | 'published'
  editors: string[]
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
  liveVersion?: string      // Timestamp of live version (e.g., "2026-01-28T10:30:00Z")
  draftVersion?: string     // Timestamp of unpublished draft (if any)
}
```

### State Logic

```
State = 'empty' if:
  - No liveVersion AND no draftVersion

State = 'draft' if:
  - draftVersion exists AND (no liveVersion OR draftVersion !== liveVersion)

State = 'published' if:
  - liveVersion exists AND (no draftVersion OR draftVersion === liveVersion)
```

### Previous Story Intelligence

**From 2-12 (editor-removal-safeguards):**
- VenueDetail.tsx is ~550 lines, well-structured
- Uses `useVenue` hook for venue data
- Has existing dialog patterns for confirmations
- Tests are in `VenueDetail.test.tsx`

**Recent Commits:**
- `bef751b upload and preview` - upload and preview flow exists
- `e69f217 fix: warn user before self-removal` - confirmation patterns

### Testing Strategy

1. **Unit tests** for Firebase Functions (listVersions, setLiveVersion)
2. **Hook tests** for useVenueState, useVersionHistory
3. **Component tests** for VersionHistory
4. **Integration tests** for VenueDetail state transitions
5. **E2E test**: Navigate → refresh → state persists

### References

- [Source: architecture.md#Versioned-Publishing-Model]
- [Source: architecture.md#Version-Management-Functions]
- [Source: project-context.md#Versioned-Publishing-Pattern]
- [Source: epics.md#Story-6.0-Venue-Lifecycle-Dashboard]
- Existing publish flow: `app/functions/src/admin/publishGuide.ts`
- Auth middleware: `app/functions/src/middleware/auth.ts`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (code-review)

### Debug Log References

N/A

### Completion Notes List

- Implemented `listVersions` and `setLiveVersion` Firebase Functions with auth/editor access middleware
- Created `useVenueState` hook for lifecycle state detection (empty/draft/published)
- Created `useVersionHistory` hook for fetching and managing version list
- Built `VersionHistory` component with Make Live confirmation dialog
- Refactored `VenueDetail.tsx` for state-aware rendering based on Firestore venue doc
- Updated `transformPdf.ts` to set `draftVersion` field on transform complete
- Added `liveVersion` and `draftVersion` fields to Venue type
- Code review: removed unused `venueId` prop from VersionHistory, removed duplicate sort

### File List

- app/functions/src/admin/listVersions.ts (NEW)
- app/functions/src/admin/setLiveVersion.ts (NEW)
- app/functions/src/index.ts (MODIFIED - exports)
- app/functions/src/transforms/transformPdf.ts (MODIFIED - draftVersion)
- app/src/features/admin/guides/useVenueState.ts (NEW)
- app/src/features/admin/guides/useVenueState.test.ts (NEW)
- app/src/features/admin/guides/useVersionHistory.ts (NEW)
- app/src/features/admin/guides/useVersionHistory.test.tsx (NEW)
- app/src/features/admin/guides/VersionHistory.tsx (NEW)
- app/src/features/admin/guides/VersionHistory.test.tsx (NEW)
- app/src/features/admin/VenueDetail.tsx (MODIFIED)
- app/src/features/admin/VenueDetail.test.tsx (MODIFIED)
- app/src/shared/types/venue.ts (MODIFIED)
