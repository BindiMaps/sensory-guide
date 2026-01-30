# Story 6.0: Venue Lifecycle Dashboard

Status: backlog

---

## Story

As an **admin user**,
I want **the venue detail page to show the current state of my venue on page load**,
So that **I can see what's published, what drafts exist, and manage versions without losing context**.

---

## Acceptance Criteria

1. **Given** I navigate to a venue detail page, **When** the page loads, **Then** I see the venue's current state:
   - If published: Show the live guide preview, publish date, shareable URL
   - If has unpublished draft: Show the draft preview with "Publish" option
   - If neither: Show the PDF upload prompt

2. **Given** a venue has been published, **When** I refresh the page, **Then** I still see the published state (not reset to upload prompt)

3. **Given** I have transformed a PDF but not published, **When** I navigate away and return, **Then** I see my draft preview (not lost)

4. **Given** a venue has version history, **When** I view the venue, **Then** I can access a list of all versions (drafts and published) with:
   - Timestamp
   - Status (draft/published/live)
   - Preview button
   - "Make Live" button (for published versions)

5. **Given** I want to re-publish an old version, **When** I click "Make Live" on a previous version, **Then** it becomes the live version immediately

---

## Tasks / Subtasks

- [ ] **Task 1: Add Draft Version Tracking to Firestore** (AC: #2, #3)
  - [ ] Update venue schema to include `draftVersion?: string` field
  - [ ] Update `transformPdf` function to set `draftVersion` on successful transform
  - [ ] Clear `draftVersion` when guide is published (or keep for history?)
  - [ ] Update TypeScript types for Venue

- [ ] **Task 2: Create useVenueState Hook** (AC: #1, #2)
  - [ ] Create `app/src/features/admin/venues/useVenueState.ts`
  - [ ] Fetch venue metadata on mount (status, liveVersion, draftVersion)
  - [ ] Determine display state: 'published' | 'draft' | 'empty'
  - [ ] Return venue data, state, loading, error
  - [ ] Use React Query for caching

- [ ] **Task 3: Create listVersions Firebase Function** (AC: #4)
  - [ ] Create `functions/src/admin/listVersions.ts`
  - [ ] List all files in `venues/{venueId}/versions/` from Cloud Storage
  - [ ] Return array of versions with: timestamp, size, created date
  - [ ] Cross-reference with Firestore to determine which is live
  - [ ] Auth + editor check

- [ ] **Task 4: Create setLiveVersion Firebase Function** (AC: #5)
  - [ ] Create `functions/src/admin/setLiveVersion.ts`
  - [ ] Verify version exists in Storage
  - [ ] Update Firestore `liveVersion` pointer
  - [ ] Update `status` to 'published' if not already
  - [ ] Auth + editor check
  - [ ] Return success with new live version info

- [ ] **Task 5: Refactor VenueDetail Page Layout** (AC: #1, #2, #3)
  - [ ] Update `app/src/features/admin/VenueDetail.tsx`
  - [ ] Load venue state on mount using useVenueState
  - [ ] Render based on state:
    - `published`: Show PublishedGuideView + "Upload New Version" + "Version History"
    - `draft`: Show GuidePreview with draft data + "Publish" + "Discard Draft"
    - `empty`: Show PdfUpload
  - [ ] Remove reliance on React local state for outputPath persistence
  - [ ] Show loading skeleton while fetching state

- [ ] **Task 6: Create PublishedGuideView Component** (AC: #1)
  - [ ] Create `app/src/features/admin/guides/PublishedGuideView.tsx`
  - [ ] Display: "Your guide is live!" banner
  - [ ] Show shareable URL with copy button
  - [ ] Show "View Live Guide" button (opens public URL)
  - [ ] Show last published date
  - [ ] Show current live guide preview (reuse GuidePreview component)
  - [ ] Show action buttons: "Upload New Version", "Version History"

- [ ] **Task 7: Create VersionHistoryPanel Component** (AC: #4, #5)
  - [ ] Create `app/src/features/admin/guides/VersionHistoryPanel.tsx`
  - [ ] Use listVersions hook to fetch versions
  - [ ] Display as list/timeline (newest first)
  - [ ] Each version shows:
    - Timestamp (human-readable: "2 days ago" or "15 Jan 2026")
    - "LIVE" badge on current live version
    - "DRAFT" badge on unpublished versions
    - "Preview" button
    - "Make Live" button (disabled on current live)
  - [ ] Collapsible panel or slide-out drawer
  - [ ] Loading and empty states

- [ ] **Task 8: Create Version Preview Modal** (AC: #4)
  - [ ] Create `app/src/features/admin/guides/VersionPreviewModal.tsx`
  - [ ] Fetch specific version JSON from Storage
  - [ ] Render using GuidePreview component
  - [ ] Show banner: "Previewing version from [date] - not currently live"
  - [ ] Close button returns to version history

- [ ] **Task 9: Create useVersions Hook** (AC: #4)
  - [ ] Create `app/src/features/admin/guides/useVersions.ts`
  - [ ] Call listVersions callable function
  - [ ] Transform response for UI consumption
  - [ ] Return { versions, isLoading, error, refetch }

- [ ] **Task 10: Create useMakeLive Hook** (AC: #5)
  - [ ] Create `app/src/features/admin/guides/useMakeLive.ts`
  - [ ] Call setLiveVersion callable function
  - [ ] Handle success: invalidate venue query, show toast
  - [ ] Handle errors with user-friendly messages
  - [ ] Return { makeLive, isMakingLive, error }

- [ ] **Task 11: Update Transform Pipeline to Set Draft Version** (AC: #3)
  - [ ] Modify `transformPdf` function
  - [ ] After successful transform, update venue doc with `draftVersion: timestamp`
  - [ ] This allows page reload to find the draft

- [ ] **Task 12: Write Tests** (AC: all)
  - [ ] Unit test useVenueState hook states
  - [ ] Unit test PublishedGuideView renders correctly
  - [ ] Unit test VersionHistoryPanel renders versions
  - [ ] Unit test useMakeLive hook
  - [ ] Integration test: page load → correct state displayed
  - [ ] Integration test: make old version live → version list updates

- [ ] **Task 13: Manual Testing Checklist** (AC: all)
  - [ ] Fresh venue → shows upload prompt
  - [ ] Transform PDF → navigate away → return → see draft preview
  - [ ] Publish draft → refresh page → see published state with URL
  - [ ] View version history → see all versions with correct badges
  - [ ] Preview old version → see correct content in modal
  - [ ] Make old version live → list updates → public URL serves old version
  - [ ] Upload new PDF to published venue → see draft state
  - [ ] Publish new version → new version is live → history shows both

---

## Dev Notes

### Architectural Context

**The Gap This Fills:**

The current implementation treats VenueDetail as a stateless upload→transform→publish pipeline. State is stored in React local state and lost on navigation/refresh. This story makes the venue detail page state-aware by:

1. Persisting `draftVersion` in Firestore when transform completes
2. Loading venue state on page mount to determine what to show
3. Providing version history and rollback capabilities

**From architecture.md (already specified but not implemented):**

```ts
// These functions were defined but never built:
export const setLiveVersion = onCall(async (request) => { ... });
export const listVersions = onCall(async (request) => { ... });
```

**Firestore Schema Update:**

```ts
// /venues/{venueId}
{
  name: string,
  slug: string,
  status: 'draft' | 'published',
  editors: string[],
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  liveVersion?: string,    // timestamp of live published version
  draftVersion?: string,   // NEW: timestamp of unpublished draft (if any)
}
```

**Cloud Storage Structure (unchanged):**

```
/venues/{venueId}/
  uploads/{timestamp}_{logId}.pdf
  images/
  versions/{timestamp}.json    # all versions (draft and published)
```

### State Machine for Venue Detail Page

```
On Page Load:
  ├─ Fetch venue metadata
  │
  ├─ Has liveVersion? ──────────────────────┐
  │   │                                      │
  │   ├─ YES → Show PublishedGuideView       │
  │   │         • Live guide preview         │
  │   │         • Shareable URL              │
  │   │         • "Upload New Version"       │
  │   │         • "Version History"          │
  │   │                                      │
  │   │   Also has draftVersion? ───────────┤
  │   │     YES → Show "Draft pending"      │
  │   │           banner with publish option│
  │   │                                      │
  │   └─ NO → Check draftVersion? ──────────┤
  │            │                             │
  │            ├─ YES → Show draft preview  │
  │            │         • Publish button   │
  │            │         • Re-upload option │
  │            │                             │
  │            └─ NO → Show PdfUpload       │
  │                     • Fresh venue       │
  └──────────────────────────────────────────┘
```

### Component Hierarchy

```
VenueDetail.tsx
├── VenueHeader (name, slug, status badge)
├── [State-based content]
│   ├── PublishedGuideView (if liveVersion)
│   │   ├── LiveBanner (URL, copy, view live)
│   │   ├── GuidePreview (live version content)
│   │   └── ActionBar (Upload New, Version History)
│   │
│   ├── DraftGuideView (if draftVersion only)
│   │   ├── DraftBanner
│   │   ├── GuidePreview (draft content)
│   │   └── ActionBar (Publish, Discard, Re-upload)
│   │
│   └── PdfUpload (if neither)
│
├── VersionHistoryPanel (slide-out or collapsible)
│   ├── VersionList
│   │   └── VersionItem (timestamp, badges, actions)
│   └── VersionPreviewModal
│
└── (draft pending banner if published + draft)
```

### Existing Components to Reuse

- `GuidePreview.tsx` - for rendering guide content
- `PublishedSuccess.tsx` - partial reuse for live URL display
- `PublishDialog.tsx` - for publish confirmation
- React Query setup in App.tsx

### File Structure

```
app/src/features/admin/
├── VenueDetail.tsx                    # MODIFY - refactor state handling
├── venues/
│   └── useVenueState.ts               # NEW
├── guides/
│   ├── PublishedGuideView.tsx         # NEW
│   ├── PublishedGuideView.test.tsx    # NEW
│   ├── VersionHistoryPanel.tsx        # NEW
│   ├── VersionHistoryPanel.test.tsx   # NEW
│   ├── VersionPreviewModal.tsx        # NEW
│   ├── useVersions.ts                 # NEW
│   ├── useVersions.test.ts            # NEW
│   ├── useMakeLive.ts                 # NEW
│   ├── useMakeLive.test.ts            # NEW
│   ├── GuidePreview.tsx               # EXISTS
│   └── ...

functions/src/admin/
├── listVersions.ts                    # NEW
├── setLiveVersion.ts                  # NEW
├── publishGuide.ts                    # EXISTS
└── ...
```

### Testing Benefits

This story directly addresses the testing pain point mentioned:

1. **Repeatable testing:** Can refresh page and see same state
2. **Version comparison:** Can switch between versions to verify correct behaviour
3. **Rollback testing:** Can test that old versions work correctly
4. **Draft persistence:** Can close browser, come back, continue testing

### Dependencies

- Story 3.4 (Publish Guide) must be complete - DONE (in review)
- Story 3.2 (LLM Transformation) must be complete - DONE

### Related Stories

- **6.1 (Guide Update via Re-upload):** Benefits from this story's state management
- **6.2 (Version History & Rollback):** Largely superseded by this story - may need to merge or deprecate 6.2

---

## References

- [Source: _bmad-output/planning-artifacts/architecture.md#Versioned-Publishing-Model] - liveVersion pointer pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#API-Patterns] - listVersions, setLiveVersion specs
- [Source: _bmad-output/implementation-artifacts/3-4-publish-guide.md] - Current publish implementation
- [Source: _bmad-output/project-context.md#Versioned-Publishing-Pattern] - Quick reference

---

## Change Log

- 2026-01-30: Story created to address venue state persistence gap
