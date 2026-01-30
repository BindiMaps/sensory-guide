# Story 2.11: Signup Approval (Allow-List)

**Epic:** 2 - Admin Authentication & Venue Sharing
**Status:** ready-for-dev
**Priority:** HIGH - Security/LLM budget protection
**Estimated Effort:** Small (half day)

---

## User Story

As a **platform owner**,
I want **only approved users to be able to create venues**,
So that **I can control who consumes LLM API budget**.

---

## Context

Open Firebase Auth signup combined with per-user rate limiting doesn't prevent abuse via multiple account creation. This story implements an invite-only (allow-list) model to ensure only known users can consume LLM API budget.

**Why now:** This is a security concern that should be addressed before broader testing. Minimal implementation effort with high protection value.

---

## Acceptance Criteria

### AC1: Allow-list data structure exists

**Given** the Firestore database
**When** the app is deployed
**Then** a document exists at `/config/access` with an `allowedEmails` array
**And** a document exists at `/config/superAdmins` with an `emails` array

### AC2: Approved users can create venues

**Given** my email IS in the `/config/access.allowedEmails` array
**When** I click "Create New Venue"
**Then** venue creation proceeds normally (no change to existing behaviour)

### AC3: Non-approved users are blocked

**Given** my email is NOT in the `allowedEmails` array
**And** I am NOT a super admin
**When** I click "Create New Venue"
**Then** I see a message: "Your account is pending approval. Contact support to request access."
**And** the create venue form/dialog is not shown
**And** I can still view the dashboard (empty state is fine)

### AC4: Super admins bypass the check

**Given** my email IS in `/config/superAdmins.emails`
**When** I try to create a venue
**Then** I can create venues regardless of allow-list status

### AC5: Check happens server-side

**Given** a malicious user bypasses the client-side check
**When** they call `createVenue` directly
**Then** the Cloud Function rejects with `permission-denied` error
**And** no venue is created

### AC6: Super admin can manage allow-list

**Given** I am a super admin
**When** I view the super admin dashboard
**Then** I see an "Approved Users" section
**And** I can add emails to the allow-list
**And** I can remove emails from the allow-list

### AC7: Removal doesn't affect existing venues

**Given** a user has existing venues
**When** their email is removed from the allow-list
**Then** their existing venues remain accessible
**And** they can still edit their existing venues
**And** they cannot create NEW venues

---

## Technical Implementation

### Firestore Structure

```
/config/access
  allowedEmails: ["user1@example.com", "auditor@aspect.org.au"]

/config/superAdmins
  emails: ["admin@bindimaps.com"]
```

### Cloud Function Change (createVenue)

```typescript
// In functions/src/admin/createVenue.ts

export const createVenue = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const userEmail = request.auth.token.email;

  // Check if super admin (bypass allow-list)
  const superAdminsDoc = await getDoc(doc(db, 'config', 'superAdmins'));
  const superAdmins = superAdminsDoc.data()?.emails || [];
  const isSuperAdmin = superAdmins.includes(userEmail);

  if (!isSuperAdmin) {
    // Check allow-list
    const accessDoc = await getDoc(doc(db, 'config', 'access'));
    const allowedEmails = accessDoc.data()?.allowedEmails || [];

    if (!allowedEmails.includes(userEmail)) {
      throw new HttpsError('permission-denied', 'Account not yet approved for venue creation');
    }
  }

  // ... existing venue creation logic
});
```

### Client-Side Changes

1. **VenueList.tsx** - Before showing "Create New Venue" button, check approval status
2. **CreateVenueDialog.tsx** - Handle `permission-denied` error gracefully
3. **Super Admin UI** - Add simple list management (add/remove emails)

### Suggested Helper Function

```typescript
// functions/src/utils/accessControl.ts

export async function isApprovedUser(email: string): Promise<boolean> {
  const superAdminsDoc = await getDoc(doc(db, 'config', 'superAdmins'));
  if (superAdminsDoc.data()?.emails?.includes(email)) {
    return true; // Super admins always approved
  }

  const accessDoc = await getDoc(doc(db, 'config', 'access'));
  return accessDoc.data()?.allowedEmails?.includes(email) ?? false;
}
```

---

## Out of Scope

- Approval queue/workflow (future enhancement)
- Domain-based auto-approval (future enhancement)
- Email notifications when approved/rejected
- Self-service approval request form

---

## Testing Notes

### Manual Testing

1. Create a new Firebase Auth account not in allow-list
2. Try to create venue → should see "pending approval" message
3. Add email to `/config/access.allowedEmails` via Firebase console
4. Refresh → should now be able to create venue
5. Remove email from list → should still access existing venue but not create new

### Automated Tests

- Unit test for `isApprovedUser` helper
- Integration test for `createVenue` with non-approved user
- E2E test for full flow (optional, manual testing sufficient for MVP)

---

## Dependencies

- None (builds on existing auth infrastructure)

## Blocked By

- None

## Blocks

- Nothing critical, but should be done before user testing

---

## Definition of Done

- [ ] `/config/access` and `/config/superAdmins` docs created in Firestore
- [ ] `createVenue` Cloud Function checks allow-list
- [ ] Non-approved users see friendly "pending approval" message
- [ ] Super admin UI can add/remove emails from allow-list
- [ ] Existing venues unaffected by allow-list changes
- [ ] Manual testing completed
- [ ] Code reviewed
