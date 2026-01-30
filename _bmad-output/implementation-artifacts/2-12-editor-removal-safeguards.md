# Story 2.12: Editor Removal Safeguards

Status: done

## Story

As an **admin user managing venue editors**,
I want **safeguards when removing editors, especially the owner**,
so that **I don't accidentally remove critical collaborators or the venue owner**.

## Acceptance Criteria

1. **Given** I am NOT the venue owner (my email !== `createdBy`)
   **When** I view the editors list
   **Then** I cannot see a remove button next to the owner's email
   **And** only the owner can remove themselves (via existing self-removal flow)

2. **Given** I am any editor and click remove on ANOTHER editor (not self, not owner)
   **When** the remove button is clicked
   **Then** I see a confirmation dialog before the removal happens
   **And** the dialog shows the email being removed
   **And** I can cancel or confirm the action

3. **Given** the owner wants to remove themselves
   **When** they click remove on their own email
   **Then** the existing self-removal flow applies (already has confirmation)

## Design Validation

**Design System Reference**: N/A (uses existing Shadcn patterns)

**Design Checklist**:
- [x] Confirmation dialog uses existing dialog patterns from PublishDialog
- [x] Destructive actions use red/danger styling consistent with delete venue flow
- [x] Accessible - dialog traps focus, Escape to close

## Tasks / Subtasks

- [x] Task 1: Add owner protection logic (AC: #1)
  - [x] 1.1 Add `isOwner` check: compare `user?.email` with `venue.createdBy`
  - [x] 1.2 Modify remove button visibility: hide if target is owner AND current user is NOT owner
  - [x] 1.3 Write test: non-owner cannot see remove button on owner row

- [x] Task 2: Add confirmation dialog for removing other editors (AC: #2)
  - [x] 2.1 Create state for `editorToRemove: string | null`
  - [x] 2.2 When remove clicked (for non-self), set `editorToRemove` instead of calling `handleRemoveEditor`
  - [x] 2.3 Add AlertDialog component showing "Remove [email] from editors?"
  - [x] 2.4 On confirm, call `handleRemoveEditor(editorToRemove)`
  - [x] 2.5 On cancel, set `editorToRemove` to null
  - [x] 2.6 Write test: clicking remove shows dialog, confirming calls remove, cancelling dismisses

- [x] Task 3: Ensure existing self-removal flow is unchanged (AC: #3)
  - [x] 3.1 Verify self-removal still uses existing `showSelfRemoveConfirm` flow
  - [x] 3.2 Write test: self-removal skips new dialog, uses existing warning

## Dev Notes

### Architecture Requirements
- UI-only change, no backend modifications needed
- `createdBy` field already exists on venue document and is populated

### Key Files to Modify
- `app/src/features/admin/VenueDetail.tsx` - main changes here

### Existing Patterns to Follow
- Self-removal confirmation at lines 401-423 shows inline warning pattern
- `PublishDialog.tsx` shows AlertDialog pattern with Shadcn
- Use `Dialog` from `@/shared/components/ui/dialog`

### Implementation Approach
Added `canRemoveEditor()` helper function and `handleRemoveClick()` to separate self vs other editor removal flows. Used existing Dialog component pattern.

### Testing Strategy
- Unit tests for `canRemoveEditor` logic
- Component tests for dialog appearance/dismissal
- Keep existing self-removal test coverage

### References
- Current implementation: `app/src/features/admin/VenueDetail.tsx:376-423`
- Dialog pattern: `app/src/features/admin/guides/PublishDialog.tsx`
- [Source: epics.md#Story-2.4-Venue-Editor-Management]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

- Added `currentUserIsOwner` derived state for owner detection
- Added `canRemoveEditor(targetEmail)` function with owner protection logic
- Added `editorToRemove` state for dialog control
- Added `handleRemoveClick()` to route self vs other removal
- Added `handleConfirmRemoveEditor()` for dialog confirmation
- Added Dialog component for editor removal confirmation
- Self-removal flow unchanged (uses existing inline warning)
- 9 comprehensive tests covering all acceptance criteria

### File List

- `app/src/features/admin/VenueDetail.tsx` (modified)
- `app/src/features/admin/VenueDetail.test.tsx` (new)
