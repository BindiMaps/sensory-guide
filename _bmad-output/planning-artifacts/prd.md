---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain-skipped
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-bindiMapsActionPlan-2026-01-25.md
  - docs/EXPLAINER.md
  - docs/previouseMVP/Sensory Sen Notes.md
  - docs/Static Sensory Mapping Report - Milestone 2.pdf
  - docs/previouseMVP/Thematic Analysis from Focus Group One.pdf
documentCounts:
  briefs: 1
  research: 2
  projectDocs: 2
  brainstorming: 0
workflowType: 'prd'
projectType: greenfield
classification:
  projectType: web_app
  domain: assistive_technology_accessibility
  complexity: medium_high
  projectContext: greenfield
naming:
  primaryTerm: "Sensory Guide"
  rationale: "Literal, professional, not map-centric, works B2B and user-facing"
keyInsights:
  - "Print view is non-negotiable - must be first-class"
  - "Accessibility testing from day 1 with ASPECT"
  - "Primary value is predictability, not navigation"
  - "Before mode (desktop planning) is primary use case"
  - "LLM transformation is low-risk - admin review catches issues"
  - "Multi-tenant is a solved problem - AI builds quickly"
  - "M2 was successful - validated action plans over maps"
  - "Most existing guides are PDFs - web must demonstrably improve on this"
  - "Sensitivity filters enable personalisation - show only what matters to each user"
  - "Web generates better PDFs - personalised print based on user's selections"
---

# Product Requirements Document - Sensory Guide

**Author:** Keith Urquhart
**Date:** 2026-01-27
**Status:** Complete

## Executive Summary

**Sensory Guide** is a web application that transforms venue accessibility audit PDFs from ASPECT and other organizations into interactive, accessible sensory guides for people with sensory sensitivities. The primary use case is pre-visit planning—helping users know what to expect before arriving at a venue, reducing anxiety, and increasing independence.

**Key differentiator:** Unlike most sensory guides—which are typically just static web pages or PDFs—our solution is web-first, interactive, and can dynamically personalise content based on each user's individual sensory triggers.

**Timeline:** MVP ready for ASPECT user testing by July 2026, M3 research report due September 2026.

**Tech stack:** React + TypeScript + Firebase, with Gemini (via Firebase) for PDF-to-structured-content transformation.

## Success Criteria

### User Success

#### Pre-Visit (Planning Phase) - PRIMARY

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Findability** | User locates Sensory Guide for their venue | Analytics: page reached, low bounce |
| **Comprehension** | User understands structure without confusion | Testing: no "where do I start?" moments |
| **Predictability achieved** | User knows what to expect before arriving | Interview: "I knew about X before I got there" |
| **Sensory challenges identified** | User spots potential triggers relevant to *them* | Interview: "I saw there's [sound/light/crowds] in [area]" |
| **Route/timing planned** | User can plan when to go, which entrance, etc. | Interview: "I decided to arrive at [time] via [entrance]" |
| **Confidence increased** | User feels more prepared than without guide | Pre/post comparison: anxiety level self-report |
| **Shareable** | User can share plan with support person/carer | Testing: share/print workflow completes |
| **Printable** | User gets usable printed output | Testing: print matches expectations, is legible |
| **Personalisation mental model** | User mentally filters to *their* sensitivities | Interview: "I focused on [category] because that's my thing" |

> **Growth Enhancement:** Sensitivity filters (see Innovation section) will automate this - users set profile once, guides auto-highlight relevant content.

#### Cognitive Accessibility Success

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Low cognitive load** | User isn't overwhelmed by information density | Testing: no signs of fatigue/frustration |
| **Progressive disclosure works** | User expands only what they need | Analytics: expansion patterns; Testing: users don't expand everything |
| **Plain language lands** | User understands without re-reading | Testing: no "what does this mean?" questions |
| **Clear hierarchy** | User knows what to read first | Eye tracking or verbal protocol: logical scan path |
| **Chunked information** | User can process in pieces | Testing: users take breaks, return, find place |

#### Sensory Accessibility Success

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **UI doesn't add overload** | Clean interface, no competing stimuli | Testing: no comments about busy/overwhelming UI |
| **No unexpected motion** | Respects prefers-reduced-motion | Technical: CSS audit + testing |
| **Colour not sole indicator** | Icons + text accompany colour coding | Technical: colour blindness simulation passes |
| **Readable typography** | Font size, spacing, contrast all comfortable | Testing: no squinting, zooming complaints |

#### Technical Accessibility Success

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Screen reader navigable** | Blind/low-vision users can use guide | Testing with VoiceOver/NVDA users |
| **Keyboard accessible** | No mouse required | Testing: complete all tasks keyboard-only |
| **Works on user's device** | Mobile, tablet, desktop all functional | Cross-device testing matrix |
| **Fast enough** | Doesn't test patience on slow connections | Lighthouse perf, real-device testing |

#### Emotional/Psychological Success

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Anxiety reduced** | User feels calmer about upcoming visit | Self-report: before/after anxiety rating |
| **Sense of control** | User feels empowered, not helpless | Interview: language of agency ("I can", "I'll") |
| **Felt seen/valued** | User feels venue cares about their needs | Interview: "It's nice they thought about this" |
| **Increased independence** | User needs less support than usual | Interview: "I didn't need to ask [carer] as much" |
| **Trust in information** | User believes guide is accurate | Post-visit: "It was accurate" vs "It was wrong about X" |

#### During Visit (Mobile - Secondary)

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Quick reference works** | User can pull up key info fast | Testing: timed task to find exits/bathrooms |
| **Information matches reality** | Guide was accurate to actual venue | Post-visit interview: accuracy confirmation |
| **Doesn't add stress** | Using app during visit isn't another stressor | Interview: "It was easy to check" not "I couldn't figure it out" |

#### Post-Visit / Longitudinal

| Success Indicator | What It Looks Like | How We'll Know |
|-------------------|-------------------|----------------|
| **Would use again** | User would use for return visits | Direct question in testing |
| **Would use for other venues** | User wants Sensory Guides elsewhere | Interview: "I wish [X venue] had this" |
| **Would recommend** | User would tell others in community | Direct question + NPS-style |
| **Thumbs up** | User gives positive feedback | Analytics: thumbs up/down ratio |

#### Anti-Success (What Failure Looks Like)

| Failure Mode | Indicator |
|--------------|-----------|
| Guide ignored | User visited without consulting guide |
| Information overload | User gave up partway through |
| Didn't match reality | Guide was inaccurate, broke trust |
| Added anxiety | Using guide was stressful itself |
| Couldn't print | Print output was broken/useless |
| Accessibility fail | User with access needs couldn't use it |

### Business Success (M3 Deliverables)

| Deliverable | Success Criteria |
|-------------|------------------|
| User research summary | Documented findings from ASPECT testing sessions |
| MVP feature specifications | This PRD + Architecture docs complete |
| Iterative cycle documentation | Dev process documented, showing pivots/learnings |
| Evaluation metrics & results | Quantitative analytics + qualitative user feedback |
| Deployment recommendations | Scalability path documented (ASPECT automation, BindiMaps clients) |

**Testing Protocol:** Video calls + potential live testing at Adelaide Rail (with planning phase first)

**Secondary:** Commercial interest signals from venues (nice-to-have, not required for M3)

### Technical Success

See **Non-Functional Requirements** section for detailed targets. Key gates:

- Lighthouse Accessibility ≥95 (CI/CD gate)
- Lighthouse Performance ≥80 (CI/CD gate)
- `yarn audit` clean (CI/CD gate)
- Print quality validated via manual QA + user testing

### Measurable Outcomes

**Quantitative (Analytics):**

- Page views per venue
- Section expansion rate (progressive disclosure usage)
- Print button clicks
- Time on page
- Thumbs up/down feedback ratio

**Qualitative (Testing):**

- User interview transcripts
- Anecdotal "better than PDF" comparisons
- ASPECT tester observations

## Product Scope

### MVP - Minimum Viable Product

**Must ship for M3:**

- Multi-venue support (any PDF → any venue)
- Multi-tenant admin (orgs manage their own venues)
- Simple role model (admin creates/edits/publishes within their org)
- Admin: PDF upload → LLM transform → review → publish
- User: Progressive disclosure action plan view
- Print view (first-class)
- Basic analytics (GA + Clarity)
- Thumbs up/down feedback
- WCAG 2.2 AA compliant
- Security: yarn audit clean, input sanitization
- **ASPECT PDF template guidance** - Provide recommended PDF structure to improve LLM consistency
- **Accuracy disclaimer** - All guides display disclaimer: "Information may change. Verify on arrival. Last updated: [date]"
- **Early accessibility checkpoint** - ASPECT reviews UI for accessibility before user testing begins, not just at end

**M3 Testing Focus:** Adelaide Railway Station (but software isn't artificially limited)

**Architecture Constraints:**

- **Pre-compute at publish time** - No runtime LLM calls. All transformation happens during admin publish flow.
- **Static hosting for user-facing** - Published guides served via Firebase Hosting (static). Backend only for admin functions. Minimises cost and maximizes performance.

**Milestone Timeline (working backwards from Sept 2026):**

| Milestone | Target | Notes |
|-----------|--------|-------|
| M3 Report Due | Sept 2026 | Hard deadline |
| User Testing Complete | Aug 2026 | Need buffer for report writing |
| MVP Ready for Testing | July 2026 | ASPECT schedules testers |
| Development Complete | June 2026 | Feature freeze |
| Development Sprint | May-June 2026 | Core build |
| Architecture Complete | April 2026 | Ready to build |
| PRD Complete | Feb 2026 | ← We are here |

### Growth Features (Post-MVP)

- **Sensitivity filters** - User selects their triggers (sound, crowds, light, etc.), stored in localStorage (no account needed). Defaults to showing everything.
  - **Filter selection UI:** Inline toggleable badges at top of guide - tap a category badge to toggle it on/off. Only shows categories that exist in the current document (if venue has no smell warnings, don't show smell filter). Subtle "Tap to filter" hint on first visit. No modals, no separate settings page - the badges ARE the filter UI.
  - **Filter display UX:**
    - **Collapsed sections:** Badge filtering - only show category badges matching user's profile on collapsed area headers (helps scan which areas have relevant content)
    - **Expanded sections:** Highlight, don't hide - user's triggers are visually prominent (bolder, coloured border, etc.) while other content remains visible but secondary
    - Journey structure stays intact - filters emphasise within the place-based hierarchy, don't replace it
  - **State management:** Zustand for filter state (persisted to localStorage)
  - Rationale: Users might not know to filter for something until they see it; hiding content risks missing important warnings
- **Smart PDF generation** - Print view respects filter selections, generating personalised PDF with only the user's relevant categories
- **Prep checklist generator** - Auto-generate "what to bring" based on venue's sensory profile (e.g., "Sound issues → Consider noise-canceling headphones")
- **Wallet card print** - Tiny printable (wallet/phone-sized) with just essentials: exits, bathrooms, quiet spots, emergency number. Content based on user filter selections.
- **Text-only mode** - Accessibility option: no images, structured text only. Faster, cleaner, screen-reader optimised.
- **"If overwhelmed" escape plan** - Each venue has a clear "if you need to leave" section with nearest exit, quiet zone, and help contact
- **Universal sensory iconography** - Standardised icon set across all venues (like airport symbols) for cross-venue consistency
- **Admin prompts post-LLM** - After LLM transform, prompt admin with suggestions: "Have you considered adding X?" (mini-bmad style). MVP uses hardcoded checklist; Growth adds venue-type-specific suggestions and potentially dynamic corpus learning.
- **AI packing list** - Auto-generate "what to bring" with disclaimers (AI-generated), user can edit before saving/printing
- ASPECT workflow automation (reduce their manual effort)
- BindiWeb map embeds
- Mobile "during" quick shortcuts (exits, bathrooms, help)
- User-contributed tips (moderated)
- Advanced roles/permissions (if needed beyond simple admin)
- **Venue self-service mode** - Venues can create/edit guides without professional audit (lower quality tier, clearly marked)
- **Expand auditor base** - Support auditors beyond ASPECT (other accessibility orgs, trained venue staff)

### Vision (Future)

- Staff communication cards ("I'm overwhelmed, need quiet space")
- Panic mode (quick escape + call help)
- API for venue websites to embed
- White-label for ASPECT / other partners
- **Sensory forecast** - Crowd/noise conditions by time of day (requires venue schedule data)
- **Multi-language via icons** - Translate content at publish time, option to review translations or auto-publish
- **Quietest route suggestions** - Recommended paths through venue avoiding high-sensory areas

### Design Principles

- **UI is always calming** - No "calm mode" toggle needed; the default IS calm. Muted colours, generous whitespace, no competing elements.
- **UI so simple no docs needed** - Strive for self-explanatory interfaces. If we need documentation to explain how to use it, the UI has failed.
- **Mobile = desktop** - Mobile is equal priority, not secondary. The fundamental design includes both from day one.

## User Journeys

### User Types

1. **End User** - Person with sensory sensitivities planning a venue visit
2. **Admin (ASPECT)** - Auditor publishing a new Sensory Guide from their PDF
3. **Admin (Venue/BindiMaps)** - Staff managing guides for their organization

### Journey 1A: End User - Before Visit (Planning) - PRIMARY

```
Discovery
    ↓
[Find guide via venue website / direct link / search]
    ↓
Landing
    ↓
[See venue overview - name, summary, key categories flagged]
    ↓
    ├── Scan & Leave (got enough from summary)
    │
    └── Explore Further
            ↓
        [Expand sections by venue area - following the journey]
            ↓
            ├── Entry Hall → sound warnings, crowd levels, lighting notes
            ├── Main Concourse → what to expect as you pass through
            ├── Platforms → announcements, waiting areas
            └── etc. (structured as user would walk through)
            ↓
        [View images of key areas (optional)]
            ↓
        [Check map link if available (optional)]
            ↓
        Decision Point: Print?
            ├── Yes → Print summary view
            └── No → Done / bookmark for later
```

**Error States:**

| What Goes Wrong | Recovery |
|-----------------|----------|
| Can't find guide | SEO, venue links to it prominently |
| Overwhelmed by info | Progressive disclosure - starts collapsed |
| Info not relevant to MY triggers | Clear category labels, expand only what matters |
| Can't print | Print CSS works, fallback PDF generation? |
| Info seems outdated | Show "last updated" date |

**What They Need to See:**

- Venue name + address
- Overview summary (1-2 sentences)
- Category badges (quick scan of what sensory types are flagged across the venue)
- Expandable sections per venue area/zone (journey-based: Entry → Main Area → etc.)
- Within each area: sensory category labels + details
- Images linked to relevant warnings
- Print button (prominent)
- Last updated date

### Journey 1B: End User - During Visit (Mobile Reference) - SECONDARY

```
Already at venue, need quick info
    ↓
[Open guide on phone (bookmarked or search)]
    ↓
[Quick scan for specific info]
    ├── Where's the bathroom?
    ├── Where's the exit?
    ├── Where's a quiet spot?
    └── What did it say about [area]?
    ↓
[Find info → continue visit]
```

**Error States:**

| What Goes Wrong | Recovery |
|-----------------|----------|
| Can't find quickly | Good heading structure, ctrl+F works |
| Page loads slow | Lightweight, cached, no heavy assets |
| Info doesn't match reality | Trust broken - need accuracy + update process |

**What They Need:**

- Fast load
- Clear headings (scannable)
- Facility locations prominent (exits, bathrooms)

### Journey 1C: End User - Print Flow

```
User decides to print
    ↓
[Click print button]
    ↓
[Print-optimised view renders]
    ├── Clean layout, no nav chrome
    ├── All sections expanded
    ├── Images included but optimised
    └── Readable fonts, good contrast
    ↓
[Browser print dialog]
    ↓
[User prints / saves as PDF]
```

**Error States:**

| What Goes Wrong | Recovery |
|-----------------|----------|
| Print layout broken | Print CSS testing, QA |
| Too many pages | Concise content, section summaries |
| Images missing/broken | Print-friendly image handling |

### Journey 2A: Admin - Publish New Sensory Guide

```
Admin has PDF audit ready
    ↓
[Login to admin portal]
    ↓
[Select organization (if multi-org access)]
    ↓
[Create new venue OR select existing venue]
    ↓
[Upload PDF]
    ↓
[System: LLM transforms PDF → structured content]
    ↓
[Preview generated content]
    ↓
Decision Point: Content OK?
    ├── Yes → Publish
    │           ↓
    │       [Content live at /venue/{slug}]
    │           ↓
    │       [Copy shareable URL]
    │
    └── No → Re-upload corrected PDF
              ↓
          [Update source PDF with fixes]
              ↓
          [Re-upload → LLM transforms again]
              ↓
          [Back to Preview]
```

**Error States:**

| What Goes Wrong | Recovery |
|-----------------|----------|
| PDF upload fails | Clear error message, retry |
| LLM produces garbage | Admin review catches it, update PDF and re-upload |
| LLM misses sections | Update source PDF, re-upload |
| Wrong category assigned | Admin can correct category tags |
| Images not extracted | Manual image upload fallback |

**Photo Requirement:** ASPECT PDFs should include photos of specific trigger areas (e.g., "the loud PA speaker area"). Photo-based warnings are more concrete than icons alone. Ensure ASPECT audit spec includes photo requirements.

**What Admin Needs:**

- Clear upload flow
- Preview that matches public view
- Section-by-section review
- Re-upload option if content is wrong (PDF is source of truth)
- Publish confirmation
- Shareable URL after publish

### Journey 2B: Admin - Update Existing Guide

```
Admin needs to update published guide
    ↓
[Login → Select org → Select venue]
    ↓
[View current published version]
    ↓
Decision Point: Need to update?
    ↓
[Upload updated PDF → LLM transforms → review → publish]
    ↓
[Previous version saved to history]
```

**What Admin Needs:**

- Version history visible
- Previous versions accessible (rollback if needed)

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|--------------------------|
| End User - Before | Progressive disclosure UI, category filtering, image display, print view |
| End User - During | Fast load, scannable structure, mobile-friendly |
| End User - Print | Print CSS, clean layout, all content accessible |
| Admin - Publish | PDF upload, LLM integration, preview, re-upload if wrong, publish flow |
| Admin - Update | Version history, re-upload, rollback |

**Future Enhancement (Growth):** Sensitivity filters will transform Journey 1A - users set their profile once, then all guides auto-highlight relevant sections and print personalised PDFs.

## Innovation & Differentiation

### Core Innovation: Web as PDF Generator, Not PDF Replacement

The key insight: we're not replacing PDFs, we're **generating better PDFs**. Most sensory guides are static PDFs. Our web approach doesn't compete with PDF - it produces superior, personalised PDFs while adding web-only benefits.

| Aspect | Static PDF | Our Approach |
|--------|-----------|--------------|
| Personalisation | One-size-fits-all | Filter by user's sensitivities |
| Updates | Redownload entire doc | Live updates, versioned |
| Print | Generic printout | Personalized PDF with only relevant sections |
| Analytics | None | Track what content helps users |
| Accessibility | Fixed | Dynamic text size, screen reader optimised |

### Sensitivity Filters: Personalisation Without Accounts

**Innovation:** User sets their sensitivity profile (sound, crowds, light, etc.) once in local storage. Every guide they visit automatically highlights relevant sections. No login required.

**Technical approach (Growth phase):**

- Precompute per-category summaries at publish time
- Store user preferences in localStorage
- Filter/highlight client-side for instant response
- Print generates personalised PDF based on active filters

### First Principles Foundation

Built from fundamental truths about the problem:

| Truth | Design Implication |
|-------|-------------------|
| Predictability reduces anxiety | Primary value is "know what to expect" |
| Different people, different triggers | Personalisation > one-size-fits-all |
| Preparation > Navigation | "Before" mode is primary, not "during" |
| Trust is everything | Accuracy is existential - admin review required |
| Cognitive load is the enemy | Progressive disclosure, not information dump |
| Print still matters | First-class print, not afterthought |

### Validation Approach

- **M3 Testing:** Does filtered view reduce cognitive load vs unfiltered?
- **Analytics:** Do users with filters engaged have better outcomes (lower bounce, more prints)?
- **Qualitative:** "Did showing only your sensitivities help?" in user interviews

## Web App Specific Requirements

### Project-Type Overview

**Architecture:** Single Page Application (SPA) with two distinct areas:

- **Public:** `/` - Index page with BindiMaps info (simple, for completeness)
- **Public:** `/venue/{slug}` - Static published guides (Firebase Hosting)
- **Admin:** `/admin/*` - Protected admin portal (Firebase Auth + Functions)

### Browser Support Matrix

| Browser | Support Level |
|---------|---------------|
| Chrome, Firefox, Safari, Edge (last 2 versions) | Full |
| iOS Safari, Chrome Android | Full |
| IE11, legacy browsers | Not supported |

**Policy:** Modern browsers only. No polyfills for legacy. Keep build simple.

### Responsive Design

| Breakpoint | Target |
|------------|--------|
| Mobile | 320px - 767px |
| Tablet | 768px - 1023px |
| Desktop | 1024px+ |

**Approach:** Mobile-first CSS. Mobile = desktop in priority.

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥80 |
| Lighthouse Accessibility | ≥95 |
| First Contentful Paint | <2s |
| Time to Interactive | <3s |

### SEO Strategy

Basic only: meta tags, semantic HTML, Open Graph. Not a priority.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Language | **TypeScript** (frontend and backend) |
| Framework | React + Vite |
| **UI - Admin** | **Shadcn/ui** (Tailwind + Radix) - fast dashboard development |
| **UI - Public** | **Radix primitives + custom Tailwind** - warm, calming aesthetic |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Routing | React Router |
| Backend | Node.js + Firebase Functions |
| Database | Firestore |
| Auth | Firebase Auth |
| Hosting | Firebase Hosting |

### Design System Split

| Area | Approach | Rationale |
|------|----------|-----------|
| Admin portal | Shadcn/ui defaults | Fast dev, forms/tables/modals ready |
| Public guides | Custom Tailwind + Radix | Warm, calming, not clinical |
| Shared | Radix accessibility primitives | Both accessible, consistent behaviour |

**Performance note:** Use lazy loading for UI components to minimise bundle size. Bundle size is an accessibility concern - don't make users with slow connections wait.

### Code Location & Structure

All application code lives in `/sensoryGuideApp/` folder (separate from planning docs):

```
sensoryGuideApp/
├── src/                  # Frontend React app
├── functions/            # Firebase Functions (backend)
├── shared/               # Shared TypeScript types
├── public/               # Static assets (icons, etc.)
├── package.json
├── firebase.json
├── tsconfig.json
└── vite.config.ts
```

### Implementation Considerations

| Consideration | Decision |
|---------------|----------|
| Repo structure | Single repo, folder-based (not yarn workspaces) |
| Testing | Vitest + React Testing Library + Playwright |
| Linting | ESLint + Prettier |
| CI/CD | GitHub Actions (yarn audit gate, Lighthouse gate) |

## Functional Requirements

### Venue Discovery & Access

- **FR1:** User can access venue's Sensory Guide via direct URL
- **FR2:** User can view venue overview (name, summary, category badges)
- **FR3:** User can view venue address and contact information
- **FR4:** User can view accuracy disclaimer with last-updated date

### Guide Content Display

- **FR5:** User can expand/collapse content sections by venue area/zone (journey-based structure: Entry → Main Area → Platforms, etc.)
- **FR6:** User can view all sections expanded simultaneously
- **FR7:** User can view images associated with specific sensory warnings
- **FR8:** User can navigate to external venue resources (maps, websites)
- **FR9:** User can locate key facilities (exits, bathrooms, quiet zones) quickly

> **Note:** Content structure follows the user's journey through the venue (Place → Subject → Detail), matching how ASPECT audits are structured. Sensory categories (sound, crowds, light) appear as labels/badges within each place section, not as the top-level hierarchy.

### Print & Export

- **FR10:** User can print guide with clean, print-optimised layout
- **FR11:** User can preview print view before printing
- **FR12:** Printed output includes all content sections expanded

### Content Management (Admin)

- **FR13:** Admin can upload PDF audit document for a venue
- **FR14:** System transforms PDF content to structured guide format via LLM
- **FR15:** Admin can preview generated guide before publishing
- **FR16:** Admin can re-upload PDF if guide content is incorrect (PDF is source of truth)
- **FR17:** Admin can publish guide to make it publicly accessible
- **FR18:** Admin can copy shareable URL after publishing
- **FR19:** Admin can update existing guide by uploading new PDF
- **FR20:** Admin can view version history of published guides

### Content Suggestions (Admin)

- **FR21:** System generates content improvement suggestions after LLM transform
- **FR22:** Admin can view suggestions as bullet list via "Show Suggestions" button
- **FR23:** Admin can re-upload updated PDF to incorporate suggestions

### Venue Sharing (Doc-Style Model)

- **FR24:** Admin can view list of all venues they have edit access to
- **FR25:** Admin can create new venues (creator becomes an editor)
- **FR26:** Admin can add other users as editors to a venue (by email, max 5 editors)
- **FR27:** Admin can remove editors from a venue (except last editor)
- **FR28:** Last remaining editor can delete the venue

### Super Admin (Support Access)

- **FR40:** Super Admin can view all venues across all users (support access)
- **FR41:** Super Admin can view global analytics and system health

### Authentication

- **FR29:** Admin can authenticate to access admin portal
- **FR30:** System restricts admin features to authenticated users
- **FR31:** Public guides are accessible without authentication

### User Feedback & Analytics

- **FR32:** User can submit thumbs up/down feedback on guide (captured via GA events, no Firebase writes)
- **FR33:** System records page views per venue (via GA)
- **FR34:** System records section expansion events (via GA)
- **FR35:** System records print button usage (via GA)

### Accessibility Compliance

- **FR36:** User can navigate entire guide using keyboard only
- **FR37:** User can consume guide content via screen reader
- **FR38:** System respects prefers-reduced-motion setting
- **FR39:** System uses icons + text alongside colour indicators

### Index Page

- **FR42:** User can view BindiMaps information on landing page

## Non-Functional Requirements

### Accessibility (Critical)

| Requirement | Target | Verification |
|-------------|--------|--------------|
| WCAG Compliance | 2.2 AA | Manual audit |
| Lighthouse Accessibility | ≥95 | CI/CD gate |
| Screen Reader | VoiceOver + NVDA compatible | Manual testing |
| Keyboard Navigation | Full functionality | Manual testing |
| Motion | Respects prefers-reduced-motion | CSS audit |
| Colour | Never sole indicator | Design review |

### Performance

| Requirement | Target | Verification |
|-------------|--------|--------------|
| Lighthouse Performance | ≥80 | CI/CD gate |
| First Contentful Paint | <2s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Bundle Size | Lazy load UI components | Build audit |

### Security

| Requirement | Target | Verification |
|-------------|--------|--------------|
| Dependencies | No high/critical vulns | `yarn audit` CI gate |
| Input Sanitization | All user input sanitized | Code review |
| LLM Prompt Injection | Hardened prompts, no user input in system prompts | Security review |
| Auth | Firebase Auth best practices | Config review |
| Data Isolation | Venue editor access enforced | Integration tests |

### Integration

| Requirement | Target | Verification |
|-------------|--------|--------------|
| LLM API | Gemini (via Firebase), graceful degradation on failure | Error handling tests |
| Analytics | GA4 + Clarity | Integration test |
| Firebase Services | Auth, Firestore, Hosting, Functions | E2E tests |
