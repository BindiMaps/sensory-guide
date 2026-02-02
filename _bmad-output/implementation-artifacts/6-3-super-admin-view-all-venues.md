# Story 6.3: Super Admin - View All Venues

Status: done

---

## Story

As a **super admin**,
I want **to view all venues across all users**,
So that **I can provide support when needed**.

---

## Acceptance Criteria

1. **Given** my email is in `/config/superAdmins` Firestore doc, **When** I log into the admin portal, **Then** I see an "All Venues" tab/toggle **And** I can switch between "My Venues" and "All Venues"

2. **Given** I am viewing "All Venues", **When** the list loads, **Then** I see all venues in the system **And** each venue shows its editors **And** I can search/filter by venue name

3. **Given** I am a super admin viewing a venue I don't edit, **When** I view the venue, **Then** I can see all details (read-only support access) **And** I cannot edit unless I'm also in the editors array

4. **Given** my email is NOT in the super admin list, **When** I try to access "All Venues", **Then** I don't see that option

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

This is primarily an admin UI story - uses Shadcn/ui components, NOT the public design system.

**Design Checklist** (admin UI):
- [ ] Shadcn/ui components used consistently (Tabs, Card, Input, Badge)
- [ ] Consistent with existing AdminDashboard styling
- [ ] Clear visual distinction between "My Venues" and "All Venues" views
- [ ] Editor emails displayed in readable format

**Accessibility Checklist**:
- [ ] Tab navigation between My Venues / All Venues is keyboard accessible
- [ ] Search input has proper label
- [ ] Venue list uses semantic HTML (list or table)
- [ ] Focus management when switching views
- [ ] Screen reader announces view changes

---

## Technical Approach

### Architecture Context

**Super Admin Detection:**
- Frontend: `useApprovalStatus()` hook returns `isSuperAdmin: boolean` (see `app/src/shared/hooks/useApprovalStatus.ts:53-54`)
- Backend: `isSuperAdmin()` utility checks `/config/superAdmins.emails[]` (see `app/functions/src/utils/accessControl.ts:7-21`)

**Current Venues Pattern:**
- `useVenues()` hook queries Firestore directly with `where('editors', 'array-contains', userEmail)` (see `app/src/shared/hooks/useVenues.ts:33-37`)
- For "All Venues", super admin needs a different query path

### Data Flow Options

**Option A: Direct Firestore Query (NOT RECOMMENDED)**
- Requires Firestore security rules to allow super admin to read all venues
- Exposes all venue data to client
- Security rules become complex

**Option B: Firebase Callable Function (RECOMMENDED)**
- Create `getAllVenues` callable that verifies super admin server-side
- Returns list of venues with editor info
- Consistent with project patterns (server-side verification)

### Recommended Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [My Venues]  [All Venues]  ← Tabs (only if isSuperAdmin)   │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Search: [________________________] 🔍                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Venue Name                Status     Editors            ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Adelaide Railway Station  published  alice@..., bob@... ││
│  │ Sydney Opera House        draft      admin@bindimaps... ││
│  │ Melbourne Museum          published  curator@museum.au  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### New Files Required

```
app/src/features/admin/super-admin/
├── AllVenuesList.tsx           # Table/list component for all venues
├── AllVenuesList.test.tsx      # Tests
├── useAllVenues.ts             # Hook calling getAllVenues function
├── useAllVenues.test.ts        # Tests

app/functions/src/admin/
├── getAllVenues.ts             # Callable function returning all venues
├── getAllVenues.test.ts        # Tests
```

### Modified Files

```
app/src/features/admin/AdminDashboard.tsx
  - Add Tabs component (My Venues / All Venues) when isSuperAdmin
  - Conditionally render AllVenuesList or existing venues list

app/functions/src/index.ts
  - Export getAllVenues function
```

### Backend Function Design

```typescript
// getAllVenues.ts
interface VenueListItem {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdAt: string  // ISO date
  updatedAt: string
}

interface GetAllVenuesResponse {
  venues: VenueListItem[]
}

// Verifies super admin status server-side
// Returns ALL venues with editor list
// Sorted by updatedAt descending
```

### Frontend Hook Design

```typescript
// useAllVenues.ts
interface UseAllVenuesResult {
  venues: VenueListItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Calls getAllVenues callable function
// Handles loading/error states
// Does NOT use real-time listener (page load fetch is sufficient)
```

### Read-Only Access Pattern

When a super admin clicks on a venue they don't edit:
- VenueDetail.tsx already checks `editors.includes(userEmail)` for edit permissions
- No changes needed - super admin can VIEW but cannot EDIT (AC #3)
- If super admin is ALSO in editors array, they can edit (existing behaviour)

**Question for confirmation:** Should super admins be able to view the venue detail page for venues they don't edit? Current AC says "read-only support access" but the existing VenueDetail has edit-only UI. Options:
1. Allow super admin to VIEW venue detail (add read-only mode)
2. Super admin only sees list view, not detail (simpler for v1)

For MVP, recommend Option 2 - super admin sees all venues in list but clicking opens nothing unless they're an editor.

---

## Tasks / Subtasks

- [x] **Task 1: Create getAllVenues Firebase function** (AC: #2)
  - [x] Create `app/functions/src/admin/getAllVenues.ts`
  - [x] Verify caller is super admin using `isSuperAdmin()`
  - [x] Query all documents from `venues` collection
  - [x] Return simplified venue list (id, name, slug, status, editors, timestamps)
  - [x] Add sorting by updatedAt descending
  - [x] Export from `functions/src/index.ts`

- [x] **Task 2: Create useAllVenues hook** (AC: #2)
  - [x] Create `app/src/features/admin/super-admin/useAllVenues.ts`
  - [x] Call `getAllVenues` callable function
  - [x] Handle loading, error, refetch states
  - [x] Return typed venue list

- [x] **Task 3: Create AllVenuesList component** (AC: #2, #4)
  - [x] Create `app/src/features/admin/super-admin/AllVenuesList.tsx`
  - [x] Display venues in card/list format
  - [x] Show: venue name, slug, status badge, editors (comma-separated)
  - [x] Add search/filter input for venue name
  - [x] Link venue name to `/admin/venues/{id}` (existing detail page)

- [x] **Task 4: Add Tabs to AdminDashboard** (AC: #1, #4)
  - [x] Modify `app/src/features/admin/AdminDashboard.tsx`
  - [x] Import `useApproval` to get `isSuperAdmin`
  - [x] Conditionally render Tabs (My Venues / All Venues) when `isSuperAdmin`
  - [x] Default to "My Venues" tab
  - [x] Non-super-admins see existing UI (no tabs)

- [x] **Task 5: Implement venue name search** (AC: #2)
  - [x] Add controlled search input to AllVenuesList
  - [x] Filter displayed venues by name (case-insensitive)
  - [x] Client-side filtering is fine (venue count expected < 1000)
  - [x] Clear search button

- [x] **Task 6: Add tests** (all ACs)
  - [x] Unit tests for useAllVenues hook (5 tests)
  - [x] Component tests for AllVenuesList (13 tests)
  - [x] Firebase function tests for getAllVenues (5 tests)

- [x] **Task 7: Firestore security rules** (AC: #4)
  - [x] Verified existing rules block direct venue reads for non-editors
  - [x] Function-based access bypasses client-side rules (server SDK)
  - [x] No new rules needed - using callable functions only

---

## Dev Notes

### Existing Patterns to Follow

**Hook Pattern:** See `useApprovalStatus.ts` for callable function hook pattern:
```typescript
const fn = httpsCallable<void, ResponseType>(functions!, 'functionName')
const result = await fn()
```

**Venue Type:** Import from `@/shared/types/venue`:
```typescript
interface Venue {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  editors: string[]
  createdAt: Date
  updatedAt: Date
  liveVersion?: string
  draftVersion?: string
}
```

**Callable Function Pattern:** See `checkApproval.ts`:
```typescript
export const functionName = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be logged in')
  const email = request.auth.token.email
  if (!email) throw new HttpsError('permission-denied', 'No email')
  // ... verify permissions
})
```

### Super Admin Check (Critical)

**MUST verify super admin server-side.** Never trust client claims.

```typescript
// In getAllVenues.ts
import { isSuperAdmin } from '../utils/accessControl'

export const getAllVenues = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in')
  }

  const email = request.auth.token.email
  if (!email || !(await isSuperAdmin(email))) {
    throw new HttpsError('permission-denied', 'Not a super admin')
  }

  // Proceed with fetching all venues...
})
```

### Project Structure Notes

- Super admin components go in `app/src/features/admin/super-admin/`
- Hook files co-located with components
- Firebase functions in `app/functions/src/admin/`
- Tests co-located with source files

### Shadcn Components to Use

- `Tabs, TabsList, TabsTrigger, TabsContent` - for My Venues / All Venues toggle
- `Table, TableHeader, TableBody, TableRow, TableCell` - for venue list
- `Input` - for search
- `Badge` - for status display

Import example:
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
```

### Security Considerations

- Super admin list is in Firestore at `/config/superAdmins.emails[]`
- Only super admin can call `getAllVenues` (server-verified)
- Client-side Firestore rules still apply for direct reads
- The callable function uses admin SDK which bypasses client rules

### Testing Strategy

**Unit Tests:**
- `useAllVenues.test.ts`: Mock firebase functions, test loading states
- `AllVenuesList.test.tsx`: Mock hook, test render/search/filtering

**Integration Tests:**
- AdminDashboard with super admin context → sees tabs
- AdminDashboard without super admin → no tabs
- getAllVenues function with mocked isSuperAdmin

### Edge Cases

| Case | Handling |
|------|----------|
| No venues in system | Show "No venues found" message |
| Search with no matches | Show "No venues match your search" |
| Super admin removed mid-session | Function call will fail, UI shows error |
| Very long editor list | Truncate at 3 editors + "+N more" |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.3] - Original story definition
- [Source: _bmad-output/planning-artifacts/architecture.md:175-176] - Super admin config location
- [Source: app/functions/src/utils/accessControl.ts] - isSuperAdmin utility
- [Source: app/src/shared/hooks/useApprovalStatus.ts] - Existing approval hook pattern
- [Source: app/src/features/admin/AdminDashboard.tsx] - Current dashboard to modify
- [Source: app/src/shared/hooks/useVenues.ts] - Existing venues hook pattern

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- All 7 tasks completed successfully
- 282 frontend tests passing (23 new tests added: 5 hook + 13 component + 5 function)
- Functions build passes
- Lint passes
- Used simple button-based tabs instead of adding Radix Tabs dependency
- Super admin verification happens server-side via `isSuperAdmin()` utility
- Editors list truncates at 3 with "+N more" for readability

### File List

**New Files:**
- `app/functions/src/admin/getAllVenues.ts` - Firebase callable function
- `app/functions/src/admin/getAllVenues.test.ts` - 5 tests
- `app/src/features/admin/super-admin/useAllVenues.ts` - Hook for fetching all venues
- `app/src/features/admin/super-admin/useAllVenues.test.ts` - 5 tests
- `app/src/features/admin/super-admin/AllVenuesList.tsx` - Component displaying all venues with search
- `app/src/features/admin/super-admin/AllVenuesList.test.tsx` - 13 tests

**Modified Files:**
- `app/functions/src/index.ts` - Export getAllVenues
- `app/src/features/admin/AdminDashboard.tsx` - Added tab navigation for super admins

