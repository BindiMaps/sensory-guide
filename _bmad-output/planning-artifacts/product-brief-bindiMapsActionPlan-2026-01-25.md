# BindiMaps Action Plan - Product Brief & Requirements Plan

## Overview

This document captures the complete requirements discovery for Phase 3 of the Sensory Sensitivity Wayfinding research project. It serves as the foundation for PRD, Architecture, and Implementation planning.

**Project Type:** Research project with commercial upside (not commercial-first)
**Deadline:** Before September 2026 (Milestone 3)
**Build Time:** Order of weeks, not months

---

## Executive Summary

### The Problem

People with sensory sensitivities face significant barriers navigating public transport environments. Overwhelming noise, lighting, crowds, and unpredictable stimuli make independent travel stressful or impossible. Existing solutions (static sensory maps) create cognitive overload and have been validated as ineffective through Phase 2 user testing.

### The Solution

A standalone web app that transforms venue audit notes into presentable, anxiety-reducing action plans. Users prepare *before* visiting (not real-time navigation). The interface uses progressive disclosure to start simple and expand as needed.

### Research-Validated Insight

Phase 2 MVP testing confirmed: **action plan format works, map overlays don't**. Users want predictability and advance awareness through structured narrative guidance, not dense visual information.

---

## Core Vision

### Primary Goal
Help people with sensory sensitivities prepare for visits to unfamiliar venues, reducing anxiety through advance awareness.

### Secondary Benefits
- Revenue stream for BindiMaps + ASPECT
- Scalable framework for venue accessibility

### Core User
Person with sensory sensitivities (hyper or hypo-responsive). Not carers as primary, though they may also use it.

### Scope
- **Grant Focus:** Transport hubs (Adelaide Railway Station pilot)
- **Architecture:** Generalizes to any venue type (theatres, pools, shopping centers, etc.)

---

## User Requirements (Frontend)

### Access Model
| Aspect | Decision |
|--------|----------|
| User accounts | None - read-only, no state |
| Discovery | Direct link only (`/venue/{slug}`) |
| Offline | Online only - users prep at home |
| Embedding | iframe on venue websites |

### UI/UX Requirements
- **Progressive disclosure** - starts very simple, expands on demand
- **Cognitive accessibility** - cater for all cognitive levels, never overwhelm
- **Sensory categories** - clearly labelled with icons and colors (taxonomy defined in EXPLAINER.md)
- **Images** - venue photos linked to relevant locations/warnings
- **Maps** - optional per-location BindiWeb iframe (URL parsed from PDF, if present)
- **Print support** - users can print action plan for offline reference

### Accessibility Requirements (CRITICAL)

**This app is FOR people with accessibility needs - it MUST be exemplary in its own accessibility.**

#### WCAG 2.2 AA Compliance (Minimum)
- **Perceivable:** Alt text for all images, proper heading hierarchy, sufficient color contrast (4.5:1 minimum), text resizable to 200%
- **Operable:** Full keyboard navigation, no keyboard traps, skip links, focus indicators, no time limits
- **Understandable:** Consistent navigation, clear labels, error prevention, plain language
- **Robust:** Valid HTML, ARIA landmarks, works with screen readers (VoiceOver, NVDA, JAWS)

#### Sensory-Sensitive Considerations
- **Reduce visual noise:** Clean, minimal UI - no animations unless user-triggered
- **Predictable layout:** Consistent structure across all venues
- **Color independence:** Information not conveyed by color alone (icons + text)
- **Motion preferences:** Respect `prefers-reduced-motion`
- **High contrast mode:** Support `prefers-contrast`
- **Font choices:** Readable sans-serif, adequate line height, no justified text

#### Cognitive Accessibility
- **Plain language:** Short sentences, common words, avoid jargon
- **Chunked information:** Break content into digestible sections
- **Clear visual hierarchy:** Obvious what to read first, second, etc.
- **Forgiving interactions:** Large tap targets (44x44px min), undo where possible

#### Testing Requirements
- Screen reader testing (VoiceOver on Mac/iOS, TalkBack on Android)
- Keyboard-only navigation testing
- Color blindness simulation testing
- Cognitive walkthrough with ASPECT testers
- Automated tools: axe-core, Lighthouse accessibility audit

### Analytics Requirements (for M3 Evaluation)
- Page views, time on page, bounce rate per venue
- Section expansion tracking (which content users dig into)
- Print button usage
- Map iframe interaction
- **User feedback:** Simple thumbs up/down per venue (minimal friction)

---

## Admin Requirements (Backend)

### User Model
**Multi-tenant** - venues/clients can manage their own action plans

### Authentication
- Multiple logins per organization
- Company/organization-level access
- Simple role model (admin can create/edit/publish)

### Admin Accessibility
- Admin interface should also follow WCAG 2.2 AA (admins may have accessibility needs too)
- Clear error messages and validation feedback
- Keyboard-accessible workflow

### Content Workflow
1. **Upload:** Admin uploads PDF with mapping notes (ASPECT format)
   - PDFs may be **unstructured** - LLM must handle varying formats
   - Images bundled in PDF
   - Optional map URLs embedded in notes (per-location, not required)
2. **Transform:** Claude API extracts and structures content into display model
3. **Review:** Admin previews transformed content
   - **Guided corrections:** Admin flags issues → LLM regenerates specific sections
   - NOT free-form editing, NOT simple approve/reject
4. **Publish:** Content goes live (replaces current version for venue)

### Versioning
- Full version history retained
- Simple implementation: blob/file storage with timestamps
- No complex DB - keep it lightweight

### Data Model Evolution
Starting point: Phase 2 MVP `data.json` structure:
```json
{
  "actionCategoryIcons": { ... },
  "DATA": [{
    "id": "location-slug",
    "title": "Location Name",
    "summary": "Brief description",
    "categories": ["brightLight", "sound"],
    "blocks": [{
      "type": "list",
      "items": [{ "text": "...", "className": "warning|positive" }]
    }]
  }]
}
```

**Additions needed:**
- Venue metadata (name, slug, bindiWebUrl, organization)
- Image references per location/item
- Version metadata (created, published, author)
- Feedback data structure

---

## Technical Architecture (High-Level)

### Stack
| Layer | Technology |
|-------|------------|
| Hosting | Firebase (preferred) or GCP |
| Database | Firestore or blob storage (simple, document-based) |
| Frontend | Vite + React + TypeScript + Tailwind |
| Backend | Node.js (Firebase Functions or Cloud Functions) |
| LLM | Claude API (structured extraction from PDF) |
| Analytics | Google Analytics + Microsoft Clarity |
| IaC | If simple (Firebase config or Terraform) |

### Key Integration Points
- **BindiWeb:** iframe embed via URL from audit notes
- **ASPECT:** PDF upload format (narrative + images + map URLs)
- **Claude API:** PDF → structured JSON transformation

---

## Sensitivity Categories (Flexible)

Categories are **not predefined** - the LLM identifies relevant sensory categories from uploaded content. This allows:
- New categories to emerge naturally from venue audits
- No maintenance burden of icon/colour mapping for new categories
- Venues can have unique sensory considerations

**Common examples:** Sound, Light, Crowds, Smell, Touch, Movement, Temperature, Vibration, Air Quality

**UI approach:** Text-based badges with colour indicator dots (no icons). Unknown categories use a default neutral colour.

See UX Design Specification "Decision: No Icons in MVP" for full rationale.

---

## Resolved Questions

| Question | Answer |
|----------|--------|
| Feedback mechanism | Simple thumbs up/down (minimal friction) |
| Admin edit granularity | Guided corrections - flag issues, LLM regenerates sections |
| Map handling | Optional per-location, URL parsed from PDF if present |
| PDF structure | Can be unstructured - LLM handles varying formats |

## Remaining Questions for PRD Phase

1. **Multi-tenant org structure** - Flat list or hierarchy?
2. **LLM prompt engineering** - How to handle truly unstructured PDFs reliably?
3. **Image extraction** - How to extract/reference images from PDF and link to locations?

---

## Requirements Stack - Next Steps

### 1. PRD (Product Requirements Document)
- Formalize user stories with acceptance criteria
- Define feature priorities (must-have vs nice-to-have)
- Specify edge cases and error states
- **Agent:** PM → `/bmad:bmm:workflows:prd`

### 2. Architecture
- Data model design (Firestore collections or blob structure)
- API contracts (admin endpoints, public endpoints)
- LLM prompt engineering for PDF → JSON transformation
- Auth architecture (Firebase Auth, role model)
- **Agent:** Architect → `/bmad:bmm:workflows:create-architecture`

### 3. Epics & Stories
- Break PRD into implementable epics
- Generate user stories with acceptance criteria
- Dependency mapping
- **Agent:** PM → `/bmad:bmm:workflows:create-epics-and-stories`

### 4. Implementation
- Sprint planning
- Story execution
- Testing with ASPECT
- **Workflow:** `/bmad:bmm:workflows:dev-story`

---

## Source Documents Referenced

- `docs/EXPLAINER.md` - Project overview and Phase 3 requirements
- `docs/3-048 Sensory Sensitivity Wayfinding Project Agreement EXECUTED 29 JULY 2025.pdf` - iMove contract
- `docs/Static Sensory Mapping Report - Milestone 2.pdf` - Phase 2 findings
- `docs/ExampleMappingNotes.pdf` - ASPECT audit format
- `docs/previouseMVP/data.json` - Phase 2 data model
- `docs/previouseMVP/*.png` - Phase 2 UI screenshots

---

## Verification & Next Steps

**This Product Brief is ready for approval.** Once approved, the next steps are:

1. **Exit plan mode** → Formalize this into `_bmad-output/planning-artifacts/product-brief-*.md`
2. **PRD workflow** → `/bmad:bmm:workflows:prd` with PM agent
3. **Architecture** → `/bmad:bmm:workflows:create-architecture` with Architect agent
4. **Epics & Stories** → `/bmad:bmm:workflows:create-epics-and-stories`

### Accessibility Gates (Non-Negotiable)
- [ ] Lighthouse accessibility score ≥ 95 before any release
- [ ] Manual screen reader testing passes
- [ ] ASPECT user testing includes accessibility validation
- [ ] No accessibility regressions in CI/CD pipeline

Remaining questions (multi-tenant structure, LLM prompt engineering, image extraction) will be addressed in PRD and Architecture phases.
