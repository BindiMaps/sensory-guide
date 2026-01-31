# Story 4.5: Landing Page

Status: done

---

## Story

As a **visitor**,
I want **to understand what Sensory Guide is**,
So that **I can learn about the service**.

---

## Acceptance Criteria

1. **Given** I visit `/`, **When** the page loads, **Then** I see BindiMaps branding and information

2. **And** I see a brief explanation of Sensory Guides

3. **And** I see a link to the admin portal for content creators

4. **And** the page is simple and professional

5. **And** the page meets accessibility requirements

6. **And** the page passes Lighthouse performance gate

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [x] All colours match design system tokens exactly
- [x] Typography (font, size, weight) matches design system
- [x] Component patterns match reference implementation
- [x] Spacing and layout match design system specifications
- [x] Accessibility requirements (contrast, touch targets) verified

**Note:** The landing page is public-facing and MUST use the warm, calming public UI aesthetic (Radix + custom Tailwind), NOT Shadcn/ui admin components.

---

## Implementation Analysis

### Already Implemented (from Story 1.4)

| Requirement | Status | Location |
|-------------|--------|----------|
| Route `/` exists | DONE | `App.tsx:31` - `<Route path="/" element={<HomePage />} />` |
| HomePage component exists | PLACEHOLDER | `features/public/home/HomePage.tsx` |
| Document title set | DONE | `HomePage.tsx:6` - "Sensory Guide - BindiMaps" |
| Link to admin portal | DONE | `HomePage.tsx:15-19` |
| Container layout | PARTIAL | Basic container, needs v5 styling |

### Gaps to Address

| Gap | Implementation |
|-----|----------------|
| BindiMaps branding/logo | Add BindiMaps logo or text branding at top |
| Service explanation | Add hero section explaining Sensory Guides |
| v5 design tokens | Apply proper v5 typography, colours, spacing |
| Professional layout | Create a proper landing page structure |
| Accessibility compliance | Semantic HTML, focus states, landmarks |
| Performance | Ensure minimal bundle, no heavy deps |

---

## Tasks / Subtasks

- [x] **Task 1: Apply v5 design tokens to HomePage** (AC: #1, #4)
  - [x] Update container max-width to 720px (max-w-3xl)
  - [x] Apply Inter font family
  - [x] Use v5 colour tokens for text and accents
  - [x] Apply v5 spacing scale

- [x] **Task 2: Add BindiMaps branding** (AC: #1)
  - [x] Add BindiMaps icon in header (BindiMaps-Icon.png)
  - [x] Add full BindiMaps logo in footer (BindiMaps-logo.png)
  - [x] "Powered by" links to bindimaps.com

- [x] **Task 3: Create hero section with explanation** (AC: #2)
  - [x] Write clear, concise copy explaining what Sensory Guides are
  - [x] Target audience: venue owners and disability advocates
  - [x] Use v5 typography scale

- [x] **Task 4: Style the admin portal link** (AC: #3)
  - [x] Use v5 accent colour for link (#B8510D)
  - [x] Add clear call-to-action: "Create a guide for your venue"
  - [x] Ensure link has proper focus states (focus-visible ring)

- [x] **Task 5: Add semantic HTML and accessibility** (AC: #5)
  - [x] Add `<main>` landmark
  - [x] Ensure heading hierarchy (h1 for Sensory Guide)
  - [x] Verify keyboard navigation
  - [x] All images have alt text

- [x] **Task 6: Ensure performance** (AC: #6)
  - [x] No Firebase SDK imports
  - [x] No heavy dependencies
  - [x] Build passes, images bundled (~28KB total)

- [x] **Task 7: Add/update tests** (AC: all)
  - [x] Test page renders with expected content (12 tests)
  - [x] Test admin link is present and navigable
  - [x] Test accessibility (semantic structure, focus states, alt text)
  - [x] Test v5 design token compliance

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Public UI Stack:**
- NO Firebase SDK
- NO Shadcn/ui components
- Radix primitives + custom Tailwind
- Minimal bundle size (~50KB target for public)

**Component Location:**
```
app/src/features/public/home/
├── HomePage.tsx      # ← MODIFY: Enhance with v5 design
├── HomePage.test.tsx # Create or update
```

**v5 Design Tokens (from design-system-v5.md):**
```css
/* Typography */
--font: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif

/* Core Colours */
--text: #1A1A1A
--text-secondary: #3D3D3D
--text-muted: #595959
--accent: #B8510D
--accent-hover: #9A4409
--surface: #F8F8F6
--background: #FFFFFF

/* Spacing */
--space-5: 1rem (16px)
--space-8: 1.5rem (24px)
--space-10: 2rem (32px)
--space-16: 4rem (64px)
```

### Copy Suggestions

**Headline:** "Sensory Guide"

**Tagline/Explanation:**
> Helping people with sensory sensitivities plan venue visits with confidence.
>
> Sensory Guides provide detailed information about sounds, lighting, crowds, smells, and other sensory experiences at venues - helping people with autism, anxiety, and sensory processing differences prepare for their visit.

**CTA:** "Are you a venue owner? Create a Sensory Guide for your venue."

### Accessibility Requirements

- Semantic HTML structure (`<main>`, `<h1>`, proper heading hierarchy)
- All interactive elements keyboard accessible
- Link has visible focus state
- Text meets 4.5:1 contrast ratio (v5 tokens are pre-verified)
- `document.title` already set correctly

### Performance Requirements

- No external font loading (use system fallback until Inter loaded)
- No images unless essential (text-based branding preferred)
- Lighthouse Performance >= 80

---

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.5] - Original AC
- [Source: _bmad-output/planning-artifacts/design-system-v5.md] - Design tokens (MUST FOLLOW)
- [Source: _bmad-output/project-context.md] - Critical implementation rules
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] - Public bundle constraints
- [Source: app/src/features/public/home/HomePage.tsx] - Existing placeholder

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Clean implementation

### Completion Notes List

- Implemented full landing page with v5 design tokens
- Added BindiMaps icon in header, full logo in footer with link to bindimaps.com
- Hero section with clear explanation of Sensory Guides
- CTA section with left border accent linking to admin portal
- All v5 colours applied via inline styles for precise control
- Semantic HTML with `<main>` landmark and proper heading hierarchy
- 12 comprehensive tests covering content, structure, accessibility, and design compliance
- All 214 tests pass (no regressions)
- Build passes, images bundled efficiently

### File List

- `app/src/features/public/home/HomePage.tsx` - Modified (full redesign with v5 tokens and logos)
- `app/src/features/public/home/HomePage.test.tsx` - Created (12 tests)

---

## Change Log

- 2026-01-31: Story created via create-story workflow
- 2026-01-31: Implementation complete - v5 design, logos, tests, manual testing passed
