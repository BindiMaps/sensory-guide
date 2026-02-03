---
project_name: 'Sensory Guide'
date: '2026-01-28'
status: complete
---

# Project Context for AI Agents

_Critical rules and patterns that AI agents must follow. Focus on unobvious details._

---

## Design System (CRITICAL)

**The public UI MUST follow the approved design system: `planning-artifacts/design-system-v5.md`**

| Token | Value | Usage |
|-------|-------|-------|
| Primary Font | Inter | All public UI text |
| Accent Colour | `#B8510D` | Actions, expanded states, left borders |
| Sensory Low | `#2A6339` | Calm areas |
| Sensory Medium | `#8A5F08` | Moderate activity |
| Sensory High | `#9E3322` | Potentially overwhelming |

**Key rules:**
- Use `<button>` for expandable sections (NOT div+onclick)
- All badges must use verified contrast colours from design-system-v5.md
- 28px minimum touch targets on toggles
- Reference implementation: `planning-artifacts/ux-design-direction-v5.html`

---

## Technology Stack

| Category | Tech | Notes |
|----------|------|-------|
| Framework | React + Vite | NOT Next.js |
| Language | TypeScript (strict) | No `any`, explicit types |
| Styling | Tailwind CSS v4 | Use `cn()` for merging |
| UI Admin | Shadcn/ui | Components in `shared/components/ui/` |
| UI Public | Radix + custom Tailwind | Warm, calming aesthetic |
| State | Zustand | One store per domain |
| Data | React Query | Admin only |
| Forms | React Hook Form + Zod | Shadcn form components |
| PDF | @react-pdf/renderer | Lazy-loaded |
| Backend | Firebase Functions (Callable) | NOT HTTP functions |
| Database | Firestore | MINIMAL usage - see rules |
| Storage | Cloud Storage | Primary content store |
| Auth | Firebase Auth + Custom Claims | Claims for authorization |
| Testing | Vitest + RTL + Playwright | Co-located tests |

---

## Critical Implementation Rules

### Firebase / Data Rules

- **Firestore is MINIMAL** - only for metadata, counters, logs
- **Large content goes to Cloud Storage** - guides, PDFs, images, versions
- **Public UI has NO Firebase SDK** - fetches JSON from Storage URLs only
- **All public data served via CDN** - no Firestore reads from public
- **Feedback via GA events** - NOT Firestore writes

### Authentication Rules

- **Custom claims structure:** `{ superAdmin?: true, orgId?: string, role?: 'admin' }`
- **ALWAYS verify auth in Functions** - token is passed, NOT auto-verified
- **Check orgId matches request data** - prevent cross-org access
- **Force token refresh on role change** - claims are cached ~1hr

```ts
// REQUIRED pattern for all Callable Functions
if (!request.auth) throw new HttpsError('unauthenticated', '...');
const { orgId, superAdmin } = request.auth.token;
if (!orgId && !superAdmin) throw new HttpsError('permission-denied', '...');
if (request.data.orgId !== orgId && !superAdmin) throw new HttpsError('permission-denied', '...');
```

### API Patterns

- **Use Callable Functions** - NOT HTTP functions
- **File uploads via signed URLs** - NOT through Functions
- **Progress updates via Firestore doc** - client listens with `onSnapshot`
- **Unique upload filenames:** `{timestamp}_{logId}.pdf`

### Frontend Patterns

- **By-feature organization:** `src/features/admin/venues/`, `src/features/public/guide/`
- **Co-located tests:** `VenueCard.tsx` + `VenueCard.test.tsx` same folder
- **Import order:** React → External → Internal absolute → Relative → Types

### Admin Help Documentation

- **Help popup location:** `src/features/admin/AdminHelpPopup.tsx`
- **When adding admin features:** Update the `helpContent` array with new capability
- **Keep it simple:** Short bullet points, grouped by section (Dashboard, Venue Management, etc.)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `VenueCard.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Functions | camelCase | `transformPdf` |
| JSON fields | camelCase | `{ venueId, createdAt }` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Zod schemas | camelCase + Schema | `venueSchema` |

### Accessibility (CRITICAL)

- **WCAG 2.2 AA is MANDATORY** - not optional
- **Lighthouse Accessibility ≥95** - CI gate, will fail build
- **Keyboard navigation required** - all interactive elements
- **Screen reader support** - proper ARIA, semantic HTML
- **Icons MUST have text labels** - never icon-only
- **Color is never sole indicator** - always paired with text/shape
- **Respect `prefers-reduced-motion`** - check before animations

### Testing Rules

- **Unit tests:** Co-located, Vitest + RTL
- **E2E tests:** `e2e/` folder, Playwright
- **Lighthouse CI gates:** a11y ≥95, perf ≥80
- **yarn audit:** No high/critical vulnerabilities

### Analytics (CRITICAL)

**Every user interaction MUST be tracked via GA events.**

| Context | Import | Notes |
|---------|--------|-------|
| Admin pages | `import { trackEvent, AnalyticsEvent } from '@/lib/analytics'` | Firebase Analytics |
| Public pages | `const { track } = useAnalytics({ useGtag: true })` | Raw gtag, no Firebase |

**Event naming:** `{domain}_{action}_{target}` (e.g., `venue_publish_confirm`)

Domains: `guide_`, `admin_`, `auth_`, `venue_`

**Required events for new features:**
- Page/view load
- Primary action (clicks, submits)
- Success/failure states
- Error conditions with codes

**New events:** Add to `lib/analytics/types.ts` first (type-safe event names).

---

## Anti-Patterns (DO NOT DO)

- **DO NOT** expose Firestore to public users
- **DO NOT** store large documents in Firestore
- **DO NOT** use HTTP Functions (use Callable)
- **DO NOT** skip auth verification in Functions
- **DO NOT** use `any` in TypeScript
- **DO NOT** create icon-only buttons
- **DO NOT** rely on color alone for meaning
- **DO NOT** import Firebase SDK in public bundle
- **DO NOT** write feedback to Firestore (use GA)
- **DO NOT** add dependencies without checking bundle size impact
- **DO NOT** add interactive features without GA event tracking
- **DO NOT** use raw gtag in admin (use analyticsService)
- **DO NOT** use Firebase Analytics in public bundle (use gtagService)

---

## Project Structure Reference

```
src/
  features/
    admin/         # Firebase SDK, Shadcn, React Query
      auth/
      venues/
      guides/
      organizations/
      super-admin/
    public/        # NO Firebase SDK, minimal bundle
      guide/
      print/
      home/
  shared/
    components/ui/ # Shadcn components
    hooks/
    utils/
    types/
  stores/          # Zustand stores
  lib/             # Firebase init, API wrappers, Zod schemas

functions/
  src/
    middleware/    # Auth checking
    transforms/    # LLM operations
    admin/         # Org/venue management
    storage/       # Signed URL generation
```

---

## Versioned Publishing Pattern

**Core principle:** "Anything publishable is rollbackable."

- Every publish creates `versions/{timestamp}.json` in Storage
- Firestore `venues/{id}.liveVersion` points to which timestamp is live
- Firestore `venues/{id}.draftVersion` points to unpublished transform (if any)
- "Rollback" = update liveVersion pointer only (no data copying)
- "Publish new" = create new version + update liveVersion atomically
- Transform sets `draftVersion`; publish clears it (or keeps for history)

**Functions:**
- `setLiveVersion(venueId, timestamp)` - make any version live
- `listVersions(venueId)` - get all versions with preview URLs

---

## Quick Reference

**Public guide URL:** `https://storage.googleapis.com/{bucket}/venues/{venueId}/versions/{liveVersion}.json`

**Version storage:** `/venues/{venueId}/versions/{timestamp}.json`

**Live version pointer:** Firestore `venues/{venueId}.liveVersion`

**Rate limiting:** Firestore counter at `/usage/{userEmail}/{date}`

**LLM audit log:** `/llmLogs/{logId}`

**Progress updates:** `/venues/{venueId}/progress/{jobId}`

---

_Refer to `architecture.md` for full architectural decisions and rationale._
