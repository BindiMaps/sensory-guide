# Story 7.2: Venue Feedback Dashboard

Status: complete

---

## Story

As a **venue admin**,
I want **to see user feedback on my venue's guide**,
So that **I can understand if the guide is helpful and where to improve**.

---

## Acceptance Criteria

1. **Given** I am a venue editor, **When** I click the feedback button on venue detail, **Then** I see a modal with thumbs up/down counts and text comments

2. **Given** a user submits feedback on a public guide, **When** they click thumbs up/down, **Then** the feedback is stored in Firestore AND sent to GA

3. **Given** a user submits text feedback, **When** they click submit, **Then** the text is stored in Firestore (not GA) AND the venue owner receives an email notification

4. **Given** I am viewing feedback, **When** I select a time range (1w/2w/4w/all), **Then** the counts and comments filter accordingly

5. **Given** malicious input is submitted, **When** the server receives it, **Then** HTML is stripped, special chars escaped, and length enforced

6. **Given** a request comes from an unauthorised origin, **When** the HTTPS endpoint is called, **Then** it returns 403 Forbidden

---

## Tasks

- [x] **Task 1: Create submitGuideFeedback HTTPS function**
  - [x] Create `app/functions/src/public/submitGuideFeedback.ts`
  - [x] Add CORS/origin validation
  - [x] Validate venueSlug exists, feedback is 'up'/'down'
  - [x] Sanitise comment text (strip HTML, escape, limit 100 chars)
  - [x] Write to Firestore `/venues/{venueSlug}/feedback/{docId}`
  - [x] Send email notification on text comment
  - [x] Export from index.ts

- [x] **Task 2: Create getVenueFeedback callable function**
  - [x] Create `app/functions/src/admin/getVenueFeedback.ts`
  - [x] Verify caller is editor or super admin
  - [x] Query Firestore with date filter (1w/2w/4w/all)
  - [x] Count thumbs up/down, return with comments list
  - [x] Export from index.ts

- [x] **Task 3: Update GuideFeedback component**
  - [x] Modify `app/src/shared/components/guide/GuideFeedback.tsx`
  - [x] Call HTTPS endpoint for feedback submission
  - [x] Keep GA event for thumbs (GUIDE_FEEDBACK_SUBMIT)
  - [x] Remove GUIDE_FEEDBACK_TEXT from GA
  - [x] Handle endpoint errors gracefully

- [x] **Task 4: Create VenueFeedbackModal**
  - [x] Create `app/src/features/admin/VenueFeedbackModal.tsx`
  - [x] Create `app/src/features/admin/useVenueFeedback.ts`
  - [x] Time range toggle (1w/2w/4w/all)
  - [x] Thumbs counts display
  - [x] Comments list with timestamps
  - [x] Loading/error/empty states

- [x] **Task 5: Add feedback button to VenueDetail**
  - [x] Add feedback button to header area
  - [x] Open VenueFeedbackModal on click

---

## Technical Notes

### Firestore Schema

```
/venues/{venueSlug}/feedback/{docId}
{
  feedback: 'up' | 'down'
  comment: string | null
  createdAt: Timestamp
}
```

### HTTPS Endpoint

```
POST https://{region}-sensory-guide.cloudfunctions.net/submitGuideFeedback
{
  "venueSlug": "adelaide-railway",
  "feedback": "up" | "down",
  "comment": "optional text"
}
```

### Allowed Origins

- `https://sensory-guide.web.app`
- `https://sensory-guide.firebaseapp.com`
- `http://localhost:*`
- `https://*.bindimaps.com`

---

## File Changes

### New Files
- `app/functions/src/public/submitGuideFeedback.ts`
- `app/functions/src/admin/getVenueFeedback.ts`
- `app/src/features/admin/VenueFeedbackModal.tsx`
- `app/src/features/admin/useVenueFeedback.ts`

### Modified Files
- `app/functions/src/index.ts`
- `app/src/shared/components/guide/GuideFeedback.tsx`
- `app/src/lib/analytics/types.ts`
- `app/src/features/admin/VenueDetail.tsx`
