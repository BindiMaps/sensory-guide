# Story 2.15: Edit Venue Name

Status: done

## Story

As an **admin user**,
I want **to edit the name of my venue**,
So that **I can correct mistakes or update the venue name if it changes**.

## Background

> **Context:** Venues currently have immutable names set at creation. Users need to fix typos or update names when venues rebrand. The slug remains unchanged to preserve URLs.

Final story in Epic 2 - completing this closes out the epic.

## Acceptance Criteria

1. **Given** I am viewing a venue I have edit access to
   **When** I look at the venue header
   **Then** I see the venue name with an "Edit" icon/button beside it

2. **Given** I click to edit the venue name
   **When** the edit mode activates
   **Then** the name becomes an editable text field with the current value
   **And** I see "Save" and "Cancel" buttons

3. **Given** I enter a new valid name and click Save
   **When** the update is submitted
   **Then** the venue name is updated in Firestore
   **And** I see inline success feedback: "Name updated"
   **And** the display returns to view mode with the new name

4. **Given** I try to save an empty name
   **When** I click Save
   **Then** I see a validation error: "Venue name is required"
   **And** the save is blocked

5. **Given** I click Cancel while editing
   **When** the edit mode closes
   **Then** the original name is preserved (no changes saved)

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [ ] Edit icon uses existing Lucide pattern (Pencil or similar)
- [ ] Input field matches existing form styling in VenueDetail
- [ ] Save/Cancel buttons match existing button patterns (primary/secondary)
- [ ] Validation error uses existing red text pattern
- [ ] Success feedback uses muted text, auto-dismisses after 2-3s

## Tasks / Subtasks

- [x] Task 1: Add `updateName` to useVenue hook (AC: #3)
  - [x] 1.1 Add `updateName(newName: string)` function to `useVenue.ts`
  - [x] 1.2 Update Firestore `name` field + `updatedAt` timestamp
  - [x] 1.3 Validate name is non-empty before update (throw if empty)

- [x] Task 2: Add inline edit UI to VenueDetail header (AC: #1, #2, #5)
  - [x] 2.1 Add `isEditingName` state + `editedName` state
  - [x] 2.2 Add Pencil icon button next to venue name h1
  - [x] 2.3 Swap h1 to input field when editing (preserves same visual size)
  - [x] 2.4 Add Save/Cancel buttons in edit mode
  - [x] 2.5 Cancel resets `editedName` to original and exits edit mode

- [x] Task 3: Wire up save + validation + feedback (AC: #3, #4)
  - [x] 3.1 Empty name validation with inline error message
  - [x] 3.2 Call `updateName` on Save click
  - [x] 3.3 Show success message for 2-3s then auto-dismiss
  - [x] 3.4 Handle save errors (show inline error)
  - [x] 3.5 Exit edit mode on successful save

- [x] Task 4: Update security rules if needed (AC: #3)
  - [x] 4.1 Verify existing editor security rules allow `name` field updates
  - [x] 4.2 No rule change needed - existing rule allows editors to update any field

## Dev Notes

### Existing Patterns

**useVenue hook** (`app/src/shared/hooks/useVenue.ts`):
- Already has `addEditor`, `removeEditor`, `deleteVenue` patterns
- Uses `updateDoc` with `serverTimestamp()` for `updatedAt`

**VenueDetail header** (`app/src/features/admin/VenueDetail.tsx:581-595`):
```tsx
<div className="flex justify-between items-start mb-6">
  <div>
    <h1 className="text-3xl font-bold">{venue.name}</h1>
    <p className="text-muted-foreground">/venue/{venue.slug}</p>
  </div>
  <span className={...}>{venue.status}</span>
</div>
```

**Input styling** - reuse from editor email input (line 683-689):
```tsx
className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
```

### Key Constraints

- **Slug immutable**: Only `name` field updates, never `slug`
- **No toast system**: Use inline feedback (like editor error messages)
- **Editor access only**: Security rules already require editor membership

### References

- Hook: `app/src/shared/hooks/useVenue.ts`
- UI: `app/src/features/admin/VenueDetail.tsx`
- Security rules: `app/firestore.rules`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- Added `updateName` function to `useVenue` hook with validation
- Added inline edit UI to VenueDetail header (Pencil icon → input + Save/Cancel)
- Keyboard support: Enter to save, Escape to cancel
- Success feedback shows "Name updated" for 2.5s then auto-dismisses
- Empty name validation shows inline error
- Security rules already allow editors to update venue fields - no change needed
- Updated test mock to include `updateName`

### File List

- app/src/shared/hooks/useVenue.ts (MODIFIED - added updateName)
- app/src/features/admin/VenueDetail.tsx (MODIFIED - inline edit UI)
- app/src/features/admin/VenueDetail.test.tsx (MODIFIED - added mock)
