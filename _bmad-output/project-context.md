---
project_name: 'Sensory Guide'
date: '2026-01-28'
status: complete
---

# Project Context for AI Agents

_Critical rules and patterns that AI agents must follow. Focus on unobvious details._

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

## Quick Reference

**Public guide URL:** `https://storage.googleapis.com/{bucket}/{orgSlug}/{venueSlug}/guide.json`

**Rate limiting:** Firestore counter at `/organizations/{orgId}/usage/{period}`

**LLM audit log:** `/organizations/{orgId}/llmLogs/{logId}`

**Progress updates:** `/organizations/{orgId}/venues/{venueId}/progress/{jobId}`

---

_Refer to `architecture.md` for full architectural decisions and rationale._
