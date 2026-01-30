# Story 2.14: Version History & Rollback

Status: ready-for-dev

## Story

As an **admin user**,
I want **to view all published versions and make any version live with one click**,
so that **I can quickly rollback to a known-good state or compare versions**.

## Background

> **Design Principle:** "Anything publishable is rollbackable." Version history is a first-class feature of the publishing system, not an afterthought.

This was originally Story 6.2 but moved to Epic 2 as 2-14 due to priority. This story builds on 2-13 (Venue Lifecycle Dashboard) which creates the core infrastructure (`listVersions`, `setLiveVersion` functions).

**Dependency:** Story 2-13 must be completed first (provides `listVersions` and `setLiveVersion` functions).

## Acceptance Criteria

1. **Given** I am on the venue edit page
   **When** I click "Version History"
   **Then** I see a list of ALL published versions (newest first)
   **And** each version shows:
   - Timestamp (human-readable: "2 days ago" or "15 Jan 2026")
   - Who published it (email)
   - "LIVE" badge on the currently live version
   - "Preview" button
   - "Make Live" button (disabled on current live version)

2. **Given** I click "Preview" on any version
   **When** the preview loads
   **Then** I see that version rendered exactly as users would see it
   **And** I see a banner: "Previewing version from [date] - not currently live"
   **And** I can close preview to return to version list

3. **Given** I click "Make Live" on a non-live version
   **When** the confirmation dialog appears
   **Then** I see: "This will replace the current live guide. Users will immediately see this version."
   **And** I can Cancel or Confirm

4. **Given** I confirm making a version live
   **When** the operation completes
   **Then** the `liveVersion` pointer updates to this version's timestamp
   **And** the version list refreshes showing new "LIVE" badge position
   **And** users visiting `/venue/{slug}` immediately see the new live version
   **And** a toast confirms: "Version from [date] is now live"

5. **Given** I publish a new version (via PDF upload flow)
   **When** publish completes
   **Then** the new version is automatically set as live
   **And** it appears at the top of the version history list with "LIVE" badge

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [ ] All colours match design system tokens exactly
- [ ] "LIVE" badge uses appropriate success/accent colour
- [ ] Timestamps use consistent formatting (relative for recent, absolute for older)
- [ ] Preview banner clearly distinguishes non-live state
- [ ] Confirmation dialog follows existing patterns (PublishDialog)
- [ ] Toast notifications use existing toast system
- [ ] Accessibility: version list is keyboard navigable, buttons have clear labels

## Tasks / Subtasks

- [ ] Task 1: Extend version metadata to include publisher email (AC: #1)
  - [ ] 1.1 Update `publishGuide.ts` to store publisher email in version metadata
  - [ ] 1.2 Update `listVersions.ts` to return `publishedBy` field
  - [ ] 1.3 Write test for metadata storage

- [ ] Task 2: Enhance VersionHistory UI with full details (AC: #1)
  - [ ] 2.1 Display human-readable timestamps (use date-fns `formatDistanceToNow` + `format`)
  - [ ] 2.2 Show publisher email for each version
  - [ ] 2.3 Style "LIVE" badge prominently (green/success colour)
  - [ ] 2.4 Disable "Make Live" button on current live version
  - [ ] 2.5 Write component tests

- [ ] Task 3: Create VersionPreview component (AC: #2)
  - [ ] 3.1 Create `app/src/features/admin/guides/VersionPreview.tsx`
  - [ ] 3.2 Accept version timestamp and venueId props
  - [ ] 3.3 Fetch version JSON from Storage URL
  - [ ] 3.4 Render using existing GuidePreview component
  - [ ] 3.5 Add banner: "Previewing version from [date] - not currently live"
  - [ ] 3.6 Close button to return to version list
  - [ ] 3.7 Write tests

- [ ] Task 4: Create MakeLiveDialog component (AC: #3, #4)
  - [ ] 4.1 Create `app/src/features/admin/guides/MakeLiveDialog.tsx`
  - [ ] 4.2 Accept version timestamp and onConfirm/onCancel props
  - [ ] 4.3 Show warning: "This will replace the current live guide..."
  - [ ] 4.4 Cancel and Confirm buttons (Confirm is primary/accent)
  - [ ] 4.5 Loading state while setLiveVersion is called
  - [ ] 4.6 Write tests

- [ ] Task 5: Integrate rollback flow into VersionHistory (AC: #4)
  - [ ] 5.1 Call `setLiveVersion` function on confirm
  - [ ] 5.2 Refetch version list to update LIVE badge position
  - [ ] 5.3 Show toast on success: "Version from [date] is now live"
  - [ ] 5.4 Handle errors with toast notification
  - [ ] 5.5 Write integration tests

- [ ] Task 6: Ensure new publish updates version history (AC: #5)
  - [ ] 6.1 After publish success, refetch version history
  - [ ] 6.2 New version appears at top with LIVE badge
  - [ ] 6.3 Write test: publish → version list shows new entry as live

## Dev Notes

### Architecture Requirements

**From architecture.md (Versioned Publishing Model):**
- Every publish creates `versions/{timestamp}.json`
- Firestore `liveVersion` points to which timestamp is live
- "Rollback" = update `liveVersion` pointer + copy to public path (no data copying needed)

**From project-context.md:**
- `setLiveVersion(venueId, timestamp)` - make any version live
- `listVersions(venueId)` - get all versions with preview URLs

### Dependencies

**Story 2-13 provides:**
- `listVersions` Firebase Function
- `setLiveVersion` Firebase Function
- `useVenueState` hook
- `useVersionHistory` hook
- Basic `VersionHistory` component

**This story extends those with:**
- Publisher email metadata
- Enhanced UI with timestamps and publisher info
- Preview dialog for any version
- Make Live confirmation dialog
- Toast notifications

### Key Files to Modify

| File | Change |
|------|--------|
| `app/functions/src/admin/publishGuide.ts` | MODIFY - store publisher email in metadata |
| `app/functions/src/admin/listVersions.ts` | MODIFY - return publishedBy field |
| `app/src/features/admin/guides/VersionHistory.tsx` | MODIFY - enhanced UI |
| `app/src/features/admin/guides/VersionPreview.tsx` | NEW - preview any version |
| `app/src/features/admin/guides/MakeLiveDialog.tsx` | NEW - confirmation dialog |

### Existing Patterns to Follow

**Dialog Pattern (from `PublishDialog.tsx`):**
```tsx
<Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Toast Pattern (if exists, or add):**
```tsx
import { toast } from '@/shared/components/ui/toast'
toast({ title: 'Success', description: 'Version is now live' })
```

**Date Formatting:**
```tsx
import { formatDistanceToNow, format } from 'date-fns'

// "2 days ago" for recent
formatDistanceToNow(date, { addSuffix: true })

// "15 Jan 2026" for older
format(date, 'dd MMM yyyy')
```

### Version Metadata Storage

**Option 1: Custom metadata on Storage file**
```ts
await file.setMetadata({
  metadata: {
    publishedBy: userEmail,
    publishedAt: new Date().toISOString()
  }
})
```

**Option 2: Firestore subcollection** (if metadata querying needed)
```
/venues/{venueId}/versions/{timestamp}
  publishedBy: string
  publishedAt: Timestamp
  size: number
```

Recommend Option 1 (Storage metadata) for simplicity — we're already listing files.

### UI States

```
VersionHistory States:
- loading: Show spinner
- empty: "No versions yet. Upload a PDF to get started."
- loaded: Show version list
- error: "Failed to load versions. Try again."

VersionPreview States:
- loading: Show spinner
- loaded: Show guide preview with banner
- error: "Failed to load version preview."

MakeLiveDialog States:
- idle: Show confirmation text + buttons
- loading: Confirm button shows spinner, disabled
- error: Show error message, allow retry
```

### Testing Strategy

1. **Unit tests** for date formatting helpers
2. **Component tests** for VersionPreview, MakeLiveDialog
3. **Integration tests** for full rollback flow
4. **E2E test**: Publish → view history → rollback → verify public page shows old version

### References

- [Source: epics.md#Story-6.2-Version-History-Rollback]
- [Source: architecture.md#Versioned-Publishing-Model]
- Existing publish flow: `app/functions/src/admin/publishGuide.ts`
- Dialog pattern: `app/src/features/admin/guides/PublishDialog.tsx`
- Story 2-13: Venue Lifecycle Dashboard (dependency)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
