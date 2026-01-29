# Story 3.2: LLM Transformation Pipeline

Status: review

---

## Story

As an **admin user**,
I want **my PDF to be automatically transformed into structured guide content**,
So that **I don't have to manually format everything**.

---

## Acceptance Criteria

1. **Given** a PDF has been uploaded, **When** the transformation begins, **Then** I see a progress indicator with stages: "Processing PDF" → "Analysing content" → "Generating guide" → "Ready" **And** the progress updates in real-time via Firestore listener

2. **Given** the transformation is running, **When** I check my rate limit, **Then** I see my usage: "X of Y transforms used today"

3. **Given** I have exceeded my daily rate limit, **When** I try to upload a PDF, **Then** I see an error: "Daily limit reached. Try again tomorrow." **And** the upload is blocked

4. **Given** the transformation completes successfully, **When** the guide JSON is generated, **Then** it is stored at `/venues/{venueId}/versions/{timestamp}.json` **And** the venue status updates to "draft" **And** I am shown the preview interface

5. **Given** the LLM fails or times out, **When** an error occurs, **Then** I see a clear error message **And** I can retry the upload

---

## Tasks / Subtasks

- [x] **Task 1: Create Firebase Function for PDF Transformation** (AC: #1, #4, #5)
  - [x] Create `functions/src/transforms/transformPdf.ts`
  - [x] Implement Callable Function with auth + editor check
  - [x] Accept `venueId`, `uploadPath` (from Story 3.1)
  - [x] Extract text from PDF using pdf-parse or similar
  - [x] Call Gemini API with extraction prompt
  - [x] Validate LLM output against Guide Zod schema
  - [x] Store result at `/venues/{venueId}/versions/{timestamp}.json`
  - [x] Generate content suggestions as part of output
  - [x] Handle errors gracefully with retry logic

- [x] **Task 2: Implement Progress Tracking via Firestore** (AC: #1)
  - [x] Create progress doc structure: `/venues/{venueId}/progress/{jobId}`
  - [x] Stages: `uploaded` → `extracting` → `analysing` → `generating` → `ready` (or `failed`)
  - [x] Update progress doc at each stage from Function
  - [x] Include error message in progress doc if failed

- [x] **Task 3: Create Rate Limiting Logic** (AC: #2, #3)
  - [x] Use existing pattern: `/usage/{userEmail}/{date}` counter
  - [x] Check limit BEFORE starting transform (in Function)
  - [x] Increment counter AFTER successful transform only
  - [x] Return remaining count with transform response
  - [x] Define daily limit constant (e.g., 10 transforms/day)

- [x] **Task 4: Create Guide Zod Schema** (AC: #4)
  - [x] Create `app/src/lib/schemas/guideSchema.ts`
  - [x] Define structure matching ASPECT format (journey-based)
  - [x] Include: venue overview, areas/zones, sensory details per zone, facilities, suggestions
  - [x] Share schema with Functions for validation
  - [x] Also create `functions/src/schemas/guideSchema.ts` (or shared package)

- [x] **Task 5: Implement Progress UI Component** (AC: #1)
  - [x] Create `app/src/features/admin/guides/TransformProgress.tsx`
  - [x] Listen to progress doc with `onSnapshot`
  - [x] Display stages with visual indicators (spinner, checkmarks)
  - [x] Show current stage highlighted
  - [x] Handle `failed` status with error message + retry button
  - [x] **UX Enhancement:** 20 randomly rotating context messages during long 'analysing' stage
  - [x] **UX Enhancement:** Time expectation text ("This step can take a few minutes")
  - [x] **UX Enhancement:** Calming pulsing indicator (replaces spinner for long stages)

- [x] **Task 6: Implement Rate Limit Display** (AC: #2, #3)
  - [x] Create `app/src/features/admin/guides/RateLimitDisplay.tsx`
  - [x] Fetch current usage from `/usage/{userEmail}/{date}`
  - [x] Display "X of Y transforms used today"
  - [x] Show warning state when 1 remaining
  - [x] Disable upload when 0 remaining with "Resets at midnight UTC"

- [x] **Task 7: Create Gemini Prompt Engineering** (AC: #4)
  - [x] Create `functions/src/utils/gemini.ts` wrapper
  - [x] Design system prompt for ASPECT PDF parsing
  - [x] Output structure must match Guide schema exactly
  - [x] Include suggestions generation in prompt
  - [x] Handle prompt injection hardening (no user input in system prompt)

- [x] **Task 8: Update VenueDetail to Show Transform Status** (AC: #1, #4)
  - [x] Integrate TransformProgress into VenueDetail.tsx
  - [x] Show progress after upload completes (from Story 3.1)
  - [x] Transition to preview interface when ready
  - [x] Update venue status to "draft" when transform completes

- [x] **Task 9: Implement Retry Logic** (AC: #5)
  - [x] Add exponential backoff for transient failures (max 3 retries)
  - [x] Show "Retrying... (attempt 2 of 3)" in progress UI
  - [x] Don't decrement rate limit on failed transforms
  - [x] Differentiate retryable vs non-retryable errors

- [x] **Task 10: Write Tests** (AC: all)
  - [x] Unit test for Zod schema validation
  - [x] Unit test for progress stage helpers
  - [ ] Integration test for transform Function (mock Gemini) - deferred to E2E
  - [ ] Test progress doc updates - deferred to E2E
  - [ ] Test error scenarios - deferred to E2E

---

## Dev Notes

### Epic 3 Context

This is the core story of the Guide Creation & Publishing epic. It takes the uploaded PDF (from Story 3.1) and transforms it into structured guide content using Gemini. This enables Stories 3.3 (preview), 3.4 (publish), and 3.5 (suggestions).

### Architecture Patterns (MUST FOLLOW)

**PDF Processing Pattern (from architecture.md):**
```ts
// Synchronous with progress updates
// Function updates Firestore progress doc as it works
// Client listens with onSnapshot for real-time updates
// Stages: Uploading → Extracting text → Analyzing → Generating → Ready

await progressDoc.update({ stage: 'extracting', progress: 20 });
// ... do work
await progressDoc.update({ stage: 'analysing', progress: 50 });
```

**Versioned Publishing Pattern (from architecture.md):**
```ts
// Every publish creates a new versions/{timestamp}.json
// No separate guide.json - all versions stored in versions folder
// Firestore liveVersion field points to which timestamp is live
const versionPath = `venues/${venueId}/versions/${timestamp}.json`;
await storage.bucket().file(versionPath).save(JSON.stringify(guide));
```

**Rate Limiting Pattern (from project-context.md):**
```ts
// /usage/{userEmail}/{date} counter
// Check before LLM transform, increment after

const usageRef = db.collection('usage').doc(userEmail).collection('dates').doc(dateString);
const usage = await usageRef.get();
const currentCount = usage.exists ? usage.data().count : 0;

if (currentCount >= DAILY_LIMIT) {
  throw new HttpsError('resource-exhausted', 'Daily limit reached');
}
```

**Callable Functions Pattern (REQUIRED):**
```ts
export const transformPdf = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const userEmail = request.auth.token.email;
  const venue = await getVenue(request.data.venueId);

  // Check if user is an editor of this venue
  if (!venue.editors.includes(userEmail) && !isSuperAdmin(userEmail)) {
    throw new HttpsError('permission-denied', 'Not an editor of this venue');
  }

  // ... actual logic
});
```

### Data Structures

**Progress Doc:**
```ts
// /venues/{venueId}/progress/{jobId}
{
  status: 'extracting' | 'analysing' | 'generating' | 'ready' | 'failed',
  progress: number, // 0-100
  startedAt: Timestamp,
  updatedAt: Timestamp,
  error?: string, // if failed
  outputPath?: string // if ready
}
```

**Guide JSON (Output Schema):**
```ts
// Based on ASPECT format - journey-based (Place → Subject → Detail)
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
      name: string, // e.g., "Entry Hall", "Main Concourse", "Platform 1"
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

**LLM Log (from Story 3.1):**
```ts
// /llmLogs/{logId}
{
  userEmail: string,
  venueId: string,
  timestamp: Timestamp,
  uploadPath: string,
  tokensUsed: number | null, // filled after transform
  status: 'pending' | 'processing' | 'complete' | 'failed',
  outputPath?: string // if complete
}
```

### Existing Code Patterns to Follow

**From `app/src/features/admin/VenueDetail.tsx`:**
- This is where TransformProgress will be integrated
- Follow existing React Query patterns for data fetching
- Use existing Firestore listener patterns if any

**From `app/src/lib/firebase.ts`:**
- Firebase app is already initialised
- Use existing exports: `auth`, `db`, `storage`
- Add `functions` export if not present

**From Story 3.1:**
- `getSignedUploadUrl` function exists
- Upload creates record at `/venues/{venueId}/uploads/{uploadId}`
- Follow same auth/editor checking pattern

### Libraries Already Available / To Add

| Package | Version | Use For | Status |
|---------|---------|---------|--------|
| firebase | ^12.8.0 | Functions, Firestore listeners | Available |
| zod | ^4.3.6 | Schema validation | Available |
| pdf-parse | latest | PDF text extraction | **ADD to functions** |
| @google/generative-ai | latest | Gemini API | **ADD to functions** |

### File Structure to Create

```
app/src/
  features/admin/
    guides/
      TransformProgress.tsx    # NEW - progress indicator
      RateLimitDisplay.tsx     # NEW - usage display
      useTransformProgress.ts  # NEW - Firestore listener hook
  lib/
    schemas/
      guideSchema.ts           # NEW - Guide Zod schema

functions/src/
  transforms/
    transformPdf.ts            # NEW - main transform function
  utils/
    gemini.ts                  # NEW - Gemini API wrapper
    rateLimiter.ts             # NEW - rate limit helpers
  schemas/
    guideSchema.ts             # NEW - shared schema
  index.ts                     # UPDATE - export transformPdf
```

### Security Considerations

1. **Prompt Injection:** No user-provided text in system prompt. PDF content goes in user message only.
2. **LLM Output Validation:** Always validate against Zod schema before storing
3. **Rate Limiting:** Check BEFORE calling Gemini to prevent abuse
4. **Cost Protection:** Log all API calls with token counts
5. **Error Handling:** Don't expose internal errors to client

### Testing Strategy

1. **Unit tests:**
   - Zod schema validation (valid/invalid guide JSON)
   - Rate limit check logic
   - Progress stage transitions

2. **Integration tests:**
   - Transform function with mocked Gemini
   - Progress doc updates
   - Rate limit enforcement

3. **Manual testing:**
   - Upload real PDF, watch progress
   - Verify output JSON structure
   - Test rate limit blocking

### Gemini Prompt Design Notes

**System Prompt Structure:**
```
You are an accessibility auditor expert. You transform PDF audit documents
into structured JSON for Sensory Guides.

Output MUST be valid JSON matching this schema: [schema]

The guide should be organised by JOURNEY through the venue:
- Entry/Arrival
- Main Areas (in order of typical visit flow)
- Key Facilities

For each area, extract sensory information about:
- Sound levels and sources
- Lighting conditions
- Crowd expectations
- Physical obstacles
- Quiet zones
- Any warnings or concerns

Also generate 3-5 suggestions for improving the guide content.
```

**Error Cases to Handle:**
- PDF has no text (scanned image) → "Could not extract text from PDF"
- LLM returns invalid JSON → Retry with stricter prompt
- LLM timeout → Retry with backoff
- Content doesn't match venue type → Include in suggestions

---

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API-Patterns] - Callable Functions pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture] - Versioned publishing
- [Source: _bmad-output/planning-artifacts/architecture.md#PDF-Processing] - Progress updates pattern
- [Source: _bmad-output/project-context.md#Quick-Reference] - Rate limiting path
- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.2] - Acceptance criteria
- [Source: _bmad-output/implementation-artifacts/3-1-pdf-upload-to-cloud-storage.md] - Previous story patterns

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All tests pass: 32 tests across 3 test files
- Lint passes with no errors
- Functions build cleanly

### Completion Notes List

- Implemented full LLM transformation pipeline using Gemini 1.5 Flash (direct API, not Vertex AI)
- Created comprehensive Zod schemas for Guide JSON validation with all sensory categories
- Built real-time progress tracking via Firestore onSnapshot listeners
- Rate limiting integrated: 10 transforms/user/day with clear UI feedback
- Retry logic with exponential backoff (max 3 retries) for transient failures
- VenueDetail now shows full flow: upload → progress → success/error states
- Added comprehensive setup documentation in app/README.md for new environments
- Created setup script for Gemini API key configuration
- **UX Enhancement (Jan 2026):** Improved waiting experience during LLM processing:
  - 20 rotating context messages shown randomly every 6s during 'analysing' stage
  - Time expectation text: "This step can take a few minutes"
  - Calming pulsing animation instead of spinning loader (respects prefers-reduced-motion)

### File List

**New Files:**
- `app/src/lib/schemas/guideSchema.ts` - Guide Zod schema with validation helpers
- `app/src/lib/schemas/guideSchema.test.ts` - 19 unit tests for schema validation
- `app/src/features/admin/guides/TransformProgress.tsx` - Progress indicator component
- `app/src/features/admin/guides/RateLimitDisplay.tsx` - Usage display components
- `app/src/features/admin/guides/useTransformProgress.ts` - Firestore listener hook
- `app/src/features/admin/guides/useTransformProgress.test.ts` - 6 unit tests
- `app/functions/src/transforms/transformPdf.ts` - Main transform function
- `app/functions/src/utils/gemini.ts` - Gemini API wrapper with retry logic
- `app/functions/src/utils/rateLimiter.ts` - Rate limiting utilities
- `app/functions/src/schemas/guideSchema.ts` - Server-side schema (copy)
- `app/functions/README.md` - Functions documentation
- `app/scripts/setup-gemini.sh` - Gemini API key setup script

**Modified Files:**
- `app/src/features/admin/VenueDetail.tsx` - Integrated transform flow
- `app/src/features/admin/guides/TransformProgress.tsx` - UX: rotating messages, pulsing indicator, time expectation
- `app/src/index.css` - Added gentle-pulse keyframe animation
- `app/functions/src/index.ts` - Export transformPdf function
- `app/functions/package.json` - Added zod, pdf-parse, @google/generative-ai
- `app/eslint.config.js` - Ignore functions/lib folder
- `app/README.md` - Added comprehensive environment setup guide

### Previous Story Intelligence

**From Story 3-1 (PDF Upload to Cloud Storage):**
- Firebase Functions structure established in `functions/src/`
- Signed URL pattern for file uploads working
- Upload tracking in Firestore at `/venues/{venueId}/uploads/`
- Storage rules allow writes to `/venues/{venueId}/uploads/`
- Auth + editor checking pattern established
- Rate limit structure exists at `/usage/{userEmail}/{date}`

**Key patterns to follow:**
```ts
// Auth check from 3-1
if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in');
const userEmail = request.auth.token.email;
const venue = await getVenue(venueId);
if (!venue.editors.includes(userEmail) && !isSuperAdmin(userEmail)) {
  throw new HttpsError('permission-denied', 'Not an editor');
}
```

### Git Intelligence Summary

**Recent commits from Epic 2 + 3.1:**
- `80da3f5` docs
- `e69f217` fix: warn user before self-removal from venue and redirect after
- `67331a7` fix: add Firestore composite index for venues query
- `6e20331` fix: handle missing Firebase config gracefully
- `2ba317e` feat: Firestore and Storage security rules (story 2-5)
- `c3613f4` feat: Venue editor management (story 2-4)

**Patterns established:**
- Security rules updated in story 2-5 - may need extension for progress docs
- Firebase config handling is graceful - follow same error patterns
- Composite indexes may be needed for new queries
