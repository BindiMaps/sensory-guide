# Story 3.1: PDF Upload to Cloud Storage

Status: ready-for-dev

---

## Story

As an **admin user**,
I want **to upload a PDF audit document for my venue**,
So that **it can be transformed into a Sensory Guide**.

---

## Acceptance Criteria

1. **Given** I am on the venue edit page, **When** I click "Upload PDF", **Then** I see a file picker that accepts only PDF files

2. **Given** I select a valid PDF file, **When** the upload begins, **Then** I see a progress indicator showing upload percentage **And** the file is uploaded directly to Cloud Storage via signed URL **And** the file is stored at `/venues/{venueId}/uploads/{timestamp}.pdf`

3. **Given** the upload completes, **When** the file is stored, **Then** a Firestore record is created linking the upload to the venue **And** the LLM transformation is automatically triggered (Story 3.2 will implement the actual transform - this story just needs to prepare the trigger)

4. **Given** I select a non-PDF file, **When** I try to upload, **Then** I see an error: "Only PDF files are accepted"

---

## Tasks / Subtasks

- [ ] **Task 1: Create Firebase Function for Signed Upload URL** (AC: #2)
  - [ ] Create `functions/src/storage/getSignedUploadUrl.ts`
  - [ ] Implement Callable Function with auth + editor check
  - [ ] Generate signed URL with write permissions for `/venues/{venueId}/uploads/{timestamp}.pdf`
  - [ ] Return URL and destination path to client
  - [ ] Add rate limit check (use existing `/usage/{userEmail}/{date}` pattern)

- [ ] **Task 2: Create Firestore upload tracking structure** (AC: #3)
  - [ ] Create `functions/src/admin/createUploadRecord.ts` OR integrate into upload flow
  - [ ] Structure: `/venues/{venueId}/uploads/{uploadId}` with fields: `pdfPath`, `status: 'uploaded' | 'processing' | 'ready' | 'failed'`, `createdAt`, `uploadedBy`
  - [ ] Alternatively: use `/llmLogs/{logId}` as per architecture (link to venue + upload path)

- [ ] **Task 3: Implement PDF upload UI component** (AC: #1, #4)
  - [ ] Create `app/src/features/admin/guides/PdfUpload.tsx`
  - [ ] File input accepting only `.pdf` (use `accept="application/pdf"`)
  - [ ] Client-side validation for PDF MIME type
  - [ ] Display error toast for non-PDF files: "Only PDF files are accepted"

- [ ] **Task 4: Implement upload progress indicator** (AC: #2)
  - [ ] Use XMLHttpRequest or fetch with progress events to track upload %
  - [ ] Display progress bar component showing 0-100%
  - [ ] Show file name being uploaded
  - [ ] Consider cancel button (stretch goal)

- [ ] **Task 5: Integrate upload flow into VenueDetail page** (AC: #1, #2, #3)
  - [ ] Add "Upload PDF" button/section to `VenueDetail.tsx`
  - [ ] Call `getSignedUploadUrl` function to get URL
  - [ ] Upload file directly to Storage via signed URL
  - [ ] On success: create/update Firestore record
  - [ ] Prepare for Story 3.2: set status to trigger LLM (or call a trigger function)

- [ ] **Task 6: Add Zod schema for upload data** (AC: #3)
  - [ ] Create `app/src/lib/schemas/uploadSchema.ts`
  - [ ] Validate upload record structure
  - [ ] Share types between frontend and functions

- [ ] **Task 7: Update Firestore security rules** (AC: #2, #3)
  - [ ] Allow editors to write to `/venues/{venueId}/uploads/`
  - [ ] Only authenticated users with editor access

- [ ] **Task 8: Update Storage security rules** (AC: #2)
  - [ ] Allow writes to `/venues/{venueId}/uploads/` for authenticated users
  - [ ] Restrict to PDF content type if possible

- [ ] **Task 9: Write tests** (AC: all)
  - [ ] Unit test for PDF validation
  - [ ] Integration test for signed URL generation
  - [ ] Test security rules (editor can upload, non-editor cannot)

---

## Dev Notes

### Epic 3 Context
This is the first story in the Guide Creation & Publishing epic. It establishes the foundation for the LLM transformation pipeline. The focus is on:
- Secure file upload via signed URLs (not through Functions)
- Proper tracking in Firestore for status updates
- Setting up the structure for subsequent stories (3.2 LLM transform, 3.3 preview)

### Architecture Patterns (MUST FOLLOW)

**File Upload Pattern (from architecture.md):**
- Use signed URLs for file uploads - NOT through Functions
- Unique filename: `{timestamp}_{logId}.pdf` OR `{timestamp}.pdf`
- Client uploads directly to Storage
- Link to Firestore log record

**Callable Functions Pattern:**
```ts
// REQUIRED auth check in ALL functions
export const getSignedUploadUrl = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const userEmail = request.auth.token.email;
  const venue = await getVenue(request.data.venueId);

  // Check if user is an editor of this venue
  if (!venue.editors.includes(userEmail) && !isSuperAdmin(userEmail)) {
    throw new HttpsError('permission-denied', 'Not an editor of this venue');
  }

  // ... generate signed URL
});
```

**Progress Updates Pattern (for Story 3.2, but set up structure now):**
```ts
// Firestore doc for progress - client listens with onSnapshot
// /venues/{venueId}/progress/{jobId}
// Stages: 'uploaded' → 'extracting' → 'analyzing' → 'generating' → 'ready'
```

### Data Structures

**Upload Record (Option A - dedicated collection):**
```ts
// /venues/{venueId}/uploads/{uploadId}
{
  pdfPath: 'venues/abc123/uploads/1706500000000.pdf',
  status: 'uploaded' | 'processing' | 'ready' | 'failed',
  uploadedBy: 'user@example.com',
  createdAt: Timestamp,
  fileSize: number,
  logId: string  // links to /llmLogs/{logId}
}
```

**LLM Log Record (from architecture):**
```ts
// /llmLogs/{logId}
{
  userEmail: string,
  venueId: string,
  timestamp: Timestamp,
  uploadPath: string,
  tokensUsed: number | null,  // filled after transform
  status: 'pending' | 'processing' | 'complete' | 'failed'
}
```

### Existing Code Patterns to Follow

**From `app/src/lib/firebase.ts`:**
- Firebase app is already initialized
- Use existing `auth` and `db` (Firestore) exports
- Need to add `storage` export

**From `app/src/lib/auth.ts`:**
- Use existing auth helpers for current user

**From `app/src/features/admin/VenueDetail.tsx`:**
- This is where the upload UI will be added
- Follow existing patterns for React Query, forms, etc.

**From `app/src/shared/hooks/useVenue.ts`:**
- Follow this pattern for any new hooks

### Libraries Already Available

| Package | Version | Use For |
|---------|---------|---------|
| firebase | ^12.8.0 | Storage, Functions, Firestore |
| @tanstack/react-query | ^5.90.20 | Data fetching for upload state |
| react-hook-form | ^7.71.1 | Form handling if needed |
| zod | ^4.3.6 | Schema validation |
| lucide-react | ^0.563.0 | Icons (Upload, File, X for cancel) |

### File Structure to Create

```
app/src/
  features/admin/
    guides/
      PdfUpload.tsx         # NEW - upload component
      useUpload.ts          # NEW - upload hook (optional)
  lib/
    storage.ts              # NEW - Storage helper (add getStorage export)
    schemas/
      uploadSchema.ts       # NEW - Zod schemas

functions/src/
  storage/
    getSignedUploadUrl.ts   # NEW - signed URL generator
  index.ts                  # UPDATE - export new function
```

### Project Structure Notes

- App lives in `/app` folder (not root `/src`)
- Functions are in `/functions` (not yet created - will need setup)
- Follow by-feature organization in `features/admin/guides/`
- Co-locate tests: `PdfUpload.test.tsx` next to `PdfUpload.tsx`

### Security Considerations

1. **Signed URL expiration:** Set short expiration (15 minutes max)
2. **Content type validation:** Check both client-side AND server-side
3. **Max file size:** Consider limiting (e.g., 10MB) to prevent abuse
4. **Rate limiting:** Check daily usage before generating signed URL

### Testing Strategy

1. **Unit tests:**
   - PDF MIME type validation
   - File size validation
   - Error message display

2. **Integration tests:**
   - Signed URL generation with valid auth
   - Rejection of non-editor requests
   - Upload success creates Firestore record

3. **Manual testing:**
   - Upload a real PDF
   - Verify it appears in Storage
   - Verify Firestore record created

---

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API-Patterns] - Signed URL pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture] - Storage structure
- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.1] - Acceptance criteria
- [Source: _bmad-output/project-context.md#API-Patterns] - Callable Functions pattern
- [Source: _bmad-output/project-context.md#Firebase-Rules] - Minimal Firestore usage

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

### Git Intelligence Summary

**Recent commits from Epic 2:**
- `e69f217` fix: warn user before self-removal from venue and redirect after
- `67331a7` fix: add Firestore composite index for venues query
- `6e20331` fix: handle missing Firebase config gracefully
- `2ba317e` feat: Firestore and Storage security rules (story 2-5)
- `c3613f4` feat: Venue editor management (story 2-4)
- `3bca3bf` feat: Create new venue form (story 2-3)

**Patterns to follow from recent work:**
- Security rules were updated in story 2-5 - extend these for uploads
- Firebase config handling is graceful (story 2-4) - follow same pattern
- Composite indexes may be needed for upload queries
