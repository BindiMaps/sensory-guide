# Feature Spec: Venue Feedback Dashboard

**Status:** Draft (Updated after Party Mode)
**Author:** John (PM) + Keith
**Date:** 2026-02-02
**Sprint Target:** Next sprint

---

## Problem Statement

Venue admins have no visibility into user feedback on their guides. Thumbs up/down and comments currently go to GA4 where they're hard to access. We need to surface feedback directly in the admin interface.

## Solution Overview

A modal-based feedback dashboard accessible from the venue admin. Feedback (thumbs + comments) stored in Firestore and displayed in admin. No GA4 API integration needed - engagement metrics (section views, downloads) remain in GA for those with GA access.

---

## User Story

As a **venue admin**,
I want **to see how users interact with my venue's guide**,
So that **I can understand if the guide is helpful and where to improve**.

---

## Requirements

### Functional Requirements

| ID | Requirement |
|----|-------------|
| VF-1 | Admin can open feedback modal from venue card/detail view |
| VF-2 | Modal displays thumbs up/down counts for the venue |
| VF-3 | Modal displays list of text feedback comments (most recent first) |
| VF-4 | Admin can select time range: 1 week / 2 weeks / 4 weeks (default) / All time |
| VF-5 | Data refreshes on modal open (no real-time needed) |
| VF-6 | Only venue editors can view feedback for their venues |
| VF-7 | Super admins can view feedback for any venue |
| VF-8 | Venue owner receives email notification when text feedback is submitted |
| VF-9 | All feedback input is sanitised server-side before storage |

### Priority Order

1. **Must Have (MVP)** - All requirements are MVP

---

## Architecture Decision (Party Mode Outcome)

### Firestore-Only Strategy

**Decision:** All feedback stored in Firestore. No GA4 Data API integration.

| Data Type | Destination |
|-----------|-------------|
| Thumbs up/down | GA4 (for trends) + Firestore (for admin display) |
| Text comments | Firestore only |
| Section expansions, PDF downloads, etc. | GA4 only (view in GA UI if needed) |

### Public Endpoint (No Firebase SDK)

The public guide pages have **no Firebase SDK dependency**. Feedback submission uses a plain HTTPS endpoint:

```
POST https://{region}-{project}.cloudfunctions.net/submitGuideFeedback
Content-Type: application/json

{
  "venueSlug": "adelaide-railway",
  "feedback": "up" | "down",
  "comment": "optional text, max 100 chars"
}
```

---

## Technical Approach

### 1. Feedback Submission Flow (Public → Firestore)

```
User clicks thumbs up/down
    ↓
[If thumbs up] → Send to GA (GUIDE_FEEDBACK_SUBMIT) + HTTPS function
[If thumbs down] → Show text input → on submit:
    → Send to HTTPS function only (NOT GA for text)
    → GA gets thumbs down event (no text param)
    ↓
HTTPS Function (submitGuideFeedback):
    → Validate request (venueSlug exists, feedback valid)
    → Sanitise comment text (strip HTML, limit length, escape)
    → Write to Firestore: /venues/{venueSlug}/feedback/{docId}
    → If comment present: send email to venue owner
    → Return 200 OK
```

### 2. Firestore Schema

```
/venues/{venueSlug}/feedback/{docId}
{
  feedback: 'up' | 'down'
  comment: string | null          // sanitised, max 100 chars
  createdAt: Timestamp            // server timestamp
  // No PII stored - anonymous feedback
}
```

### 3. Email Notification

When feedback includes a comment:

```
To: venue owner email (from /venues/{venueSlug}.editors[0] or createdBy)
Subject: New feedback on [Venue Name]

Someone left feedback on your Sensory Guide for [Venue Name]:

Rating: 👎 Not helpful
Comment: "[sanitised comment text]"

View all feedback: [admin link]

---
Sensory Guide by BindiMaps
```

**Implementation:** Use Firebase Extensions (Trigger Email) or direct SMTP via SendGrid/Mailgun.

### 4. Feedback Retrieval Flow (Admin)

```
Admin opens feedback modal
    ↓
Frontend calls getVenueFeedback (callable function)
    ↓
Function:
    → Verify caller is editor or super admin
    → Query Firestore for feedback (filtered by createdAt >= weeksAgo)
    → Count thumbs up/down
    → Return feedback list + counts
    ↓
Modal displays results
```

### 5. Input Sanitisation (Security)

Server-side sanitisation in `submitGuideFeedback`:

```typescript
function sanitiseComment(input: string): string {
  if (!input) return ''

  return input
    .slice(0, 100)                    // Enforce max length
    .replace(/<[^>]*>/g, '')          // Strip HTML tags
    .replace(/[<>&"']/g, (c) => ({    // Escape special chars
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;'
    }[c] || c))
    .trim()
}
```

Also validate:
- `venueSlug` exists in Firestore
- `feedback` is exactly 'up' or 'down'
- Rate limiting (optional): max 5 submissions per IP per venue per hour

---

## GA4 Events (Updated)

| Event | Parameters | Notes |
|-------|------------|-------|
| `GUIDE_FEEDBACK_SUBMIT` | `venue_slug`, `feedback` (up/down) | Thumbs only, NO text |

**Removed from GA:** `GUIDE_FEEDBACK_TEXT` - text now goes to Firestore only.

**Unchanged (stay in GA, view in GA UI):** `GUIDE_SECTION_EXPAND`, `GUIDE_PDF_DOWNLOAD`, etc.

---

## UI Design

### Trigger Location

"Feedback" icon/button on:
- Venue card in venue list (message/comment icon)
- Venue detail/edit view (button in header)

### Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Feedback: [Venue Name]                               [X]    │
├─────────────────────────────────────────────────────────────┤
│ Time Range: [1 week]  [2 weeks]  [4 weeks ●]               │
│                                                             │
│    ┌───────────────────┐   ┌───────────────────┐           │
│    │      👍 12        │   │      👎 3         │           │
│    │     Helpful       │   │   Not helpful     │           │
│    └───────────────────┘   └───────────────────┘           │
│                                                             │
│ Comments (3)                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ "The lighting section was really helpful"    2 days ago ││
│ │ "Would be good to have more photos"          5 days ago ││
│ │ "Couldn't find the quiet room info"         12 days ago ││
│ │                                                         ││
│ │ [Show more...]                                          ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Thumbs ratio is visually dominant (large numbers)
- Comments have scrollable area with "Show more" if >5
- Time range as toggle buttons, not dropdown
- Simple and focused - just feedback, no engagement metrics

### States

| State | Display |
|-------|---------|
| Loading | Skeleton/spinner in modal body |
| Error | Error message + retry button |
| No data | "Your guide is live! Check back after users visit to see how it's performing." |
| Success | Full dashboard as above |

---

## Implementation Plan

### Phase 1: Feedback Submission Endpoint
- [ ] Create `submitGuideFeedback` HTTPS function (not callable)
- [ ] Add CORS/origin check (see Security section)
- [ ] Implement input validation (venueSlug exists, feedback valid)
- [ ] Implement comment sanitisation
- [ ] Write feedback to Firestore `/venues/{venueSlug}/feedback/`
- [ ] Set up email sending (Trigger Email extension or SMTP)
- [ ] Send notification email on comment submission

### Phase 2: Update Public Guide
- [ ] Modify `GuideFeedback.tsx` to call HTTPS endpoint
- [ ] Keep GA event for thumbs (GUIDE_FEEDBACK_SUBMIT)
- [ ] Remove GUIDE_FEEDBACK_TEXT from GA tracking
- [ ] Handle endpoint errors gracefully (still show "thanks" to user)

### Phase 3: Feedback Retrieval
- [ ] Create `getVenueFeedback` callable function
- [ ] Implement editor/super admin access check
- [ ] Query Firestore for feedback with date filter
- [ ] Count thumbs up/down, return with comments list

### Phase 4: Frontend Modal
- [ ] Create `useVenueFeedback` hook
- [ ] Create `VenueFeedbackModal` component
- [ ] Implement time range toggle (1w / 2w / 4w)
- [ ] Implement thumbs counts display
- [ ] Implement comments list with "Show more"
- [ ] Implement loading/error/empty states
- [ ] Add feedback trigger button to venue card
- [ ] Add feedback trigger button to venue detail view

### Phase 5: Polish
- [ ] Accessibility review (modal focus trap, aria labels)
- [ ] Test email delivery
- [ ] Error handling edge cases

---

## File Changes Summary

### New Files

```
app/functions/src/public/submitGuideFeedback.ts    # HTTPS endpoint
app/functions/src/admin/getVenueFeedback.ts        # Callable function
app/src/features/admin/venues/VenueFeedbackModal.tsx
app/src/features/admin/venues/useVenueFeedback.ts
```

### Modified Files

```
app/functions/src/index.ts                         # Export new functions
app/src/shared/components/guide/GuideFeedback.tsx  # Call HTTPS endpoint
app/src/lib/analytics/types.ts                     # Remove GUIDE_FEEDBACK_TEXT
app/src/features/admin/venues/VenueCard.tsx        # Add feedback button
app/src/features/admin/venues/VenueDetail.tsx      # Add feedback button
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| CORS/Origin | Check origin header in function (see below) |
| XSS via comment text | Server-side HTML stripping + escaping |
| Spam/abuse | Max 100 char limit, optional rate limiting |
| Fake venue slugs | Validate venueSlug exists before writing |
| Unauthorised feedback access | Editor/super admin check in callable function |
| Email injection | Plain text email, no user input in headers |

### CORS / Origin Check

Simple origin validation in `submitGuideFeedback` (no CORS middleware needed):

```typescript
const ALLOWED_ORIGINS = [
  'https://sensory-guide.web.app',
  'https://sensory-guide.firebaseapp.com',
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/.*\.bindimaps\.com$/
]

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.some(allowed =>
    typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
  )
}

// In function handler:
const origin = request.headers.origin
if (!isAllowedOrigin(origin)) {
  response.status(403).send('Forbidden')
  return
}
response.set('Access-Control-Allow-Origin', origin)
response.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
response.set('Access-Control-Allow-Headers', 'Content-Type')

if (request.method === 'OPTIONS') {
  response.status(204).send('')
  return
}
```

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| ~~GA4 API needed?~~ | No - just use Firestore for feedback |
| ~~CORS handling?~~ | Simple origin check in function ✓ |
| Export option? | Defer to future - not MVP |
| ~~Notification for feedback?~~ | Yes, email on text comments ✓ |

---

## Dependencies

- Email service (Firebase Trigger Email extension or SendGrid/Mailgun)

---

## Success Metrics

- Admins can view feedback without leaving admin portal
- Email notifications delivered within 1 minute of submission
- Load time <1s for feedback modal (Firestore only, no external API)
- Feedback comments visible in admin (if any exist)
