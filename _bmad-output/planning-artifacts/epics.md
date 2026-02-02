---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
status: complete
---

# Sensory Guide - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Sensory Guide, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Venue Discovery & Access:**
- FR1: User can access venue's Sensory Guide via direct URL
- FR2: User can view venue overview (name, summary, category badges)
- FR3: User can view venue address and contact information
- FR4: User can view accuracy disclaimer with last-updated date

**Guide Content Display:**
- FR5: User can expand/collapse content sections by venue area/zone (journey-based: Entry → Main Area → etc.)
- FR6: User can view all sections expanded simultaneously
- FR7: User can view images associated with specific sensory warnings
- FR8: User can navigate to external venue resources (maps, websites)
- FR9: User can locate key facilities (exits, bathrooms, quiet zones) quickly

**Print & Export:**
- FR10: User can print guide with clean, print-optimised layout
- FR11: User can preview print view before printing
- FR12: Printed output includes all content sections expanded

**Content Management (Admin):**
- FR13: Admin can upload PDF audit document for a venue
- FR14: System transforms PDF content to structured guide format via LLM
- FR15: Admin can preview generated guide before publishing
- FR16: Admin can re-upload PDF if guide content is incorrect (PDF is source of truth)
- FR17: Admin can publish guide to make it publicly accessible
- FR18: Admin can copy shareable URL after publishing
- FR19: Admin can update existing guide by uploading new PDF
- FR20: Admin can view version history of published guides with preview links
- FR20a: Admin can set any previous version as the live version (one-click rollback)
- FR20b: Publishing a new version automatically makes it live (latest = default)

**Content Suggestions (Admin):**
- FR21: System generates content improvement suggestions after LLM transform
- FR22: Admin can view suggestions as bullet list via "Show Suggestions" button
- FR23: Admin can re-upload updated PDF to incorporate suggestions

**Venue Sharing (Doc-Style Model):**
- FR24: Admin can view list of all venues they have edit access to
- FR25: Admin can create new venues (creator becomes an editor)
- FR26: Admin can add other users as editors to a venue (by email, max 5 editors)
- FR27: Admin can remove editors from a venue (except last editor)
- FR28: Last remaining editor can delete the venue

**Signup Approval (LLM Budget Protection):**
- FR43: Only approved emails can create venues (invite-only model)
- FR44: Super Admin can add/remove emails from the approved list
- FR45: Non-approved users see "Account pending approval" message when attempting venue creation

**Authentication:**
- FR29: Admin can authenticate to access admin portal
- FR30: System restricts admin features to authenticated users
- FR31: Public guides are accessible without authentication

**User Feedback & Analytics:**
- FR32: User can submit thumbs up/down feedback on guide (via GA events)
- FR33: System records page views per venue (via GA)
- FR34: System records section expansion events (via GA)
- FR35: System records print button usage (via GA)

**Accessibility Compliance:**
- FR36: User can navigate entire guide using keyboard only
- FR37: User can consume guide content via screen reader
- FR38: System respects prefers-reduced-motion setting
- FR39: System uses icons + text alongside colour indicators

**Super Admin (Support Access):**
- FR40: Super Admin can view all venues across all users (support access)
- FR41: Super Admin can view global analytics and system health
- FR46: Super Admin can administer any venue (add/remove editors, delete)
- FR47: Super Admin can view all users with their venue counts
- FR48: Super Admin can disable a user account (reversible)
- FR49: Super Admin can delete a user account (with venue reassignment)

**Index Page:**
- FR42: User can view BindiMaps information on landing page

**Future Data Integration (CONTRACT REQUIREMENT):**
> ⚠️ **Contract Flagged:** These requirements are part of the contractual deliverables. Data availability depends on third-party APIs (TfNSW, Adelaide Rail, etc.) and may be optional if data sources are unavailable or private.

- FR50: Real-time alerts based on available data feeds (e.g. cleaning schedules, live crowding data) [CONTRACT]
- FR51: Personalisation settings allowing users to adjust thresholds and preferences [CONTRACT]
- FR52: Pre-journey route previews showing sensory information [CONTRACT]
- FR53: Live crowding data from transit APIs (e.g. TfNSW, Adelaide Rail) [CONTRACT - data dependent]
- FR54: Maintenance or cleaning schedules integration [CONTRACT - data dependent]
- FR55: IoT sensor data integration (e.g. sound levels) [CONTRACT - OPTIONAL, contingent on data availability; report should note this was collected manually by ASPECT audit]

**Pilot & Evaluation (CONTRACT REQUIREMENT - Stage 5 & 6):**
> ⚠️ **Contract Flagged:** Adelaide Rail is the designated pilot site (existing BindiMaps customer with mapping/location data available). Pilot runs 7 weeks with 10 recruited users.

- FR56: Static sensory map layer at pilot site [CONTRACT - MVP]
- FR57: At least one dynamic input integration [CONTRACT - MVP]
- FR58: In-app survey/feedback collection mechanism [CONTRACT - Stage 5]
- FR59: Interaction data capture for user testing [CONTRACT - Stage 5]
- FR60: "Sensory Awareness Mode" engagement tracking [CONTRACT - Stage 6 metric]
- FR61: User-reported stress/confidence measurement [CONTRACT - Stage 6 metric]
- FR62: Alerts triggered/acted upon tracking [CONTRACT - Stage 6 metric]
- FR63: Satisfaction feedback collection from sensory-sensitive users [CONTRACT - Stage 6 metric]

**Growth & Reporting (CONTRACT SUPPORT):**
> For contract deliverable documentation - surfaces GA analytics in usable format for stakeholder reports

- FR64: Super admin GA reporting dashboard for contract deliverables [GROWTH]
- FR65: Exportable usage statistics for documentation/reports [GROWTH]

### NonFunctional Requirements

**Accessibility (Critical):**
- NFR1: WCAG 2.2 AA compliance (Manual audit)
- NFR2: Lighthouse Accessibility ≥95 (CI/CD gate)
- NFR3: Screen Reader compatible - VoiceOver + NVDA (Manual testing)
- NFR4: Full keyboard navigation functionality (Manual testing)
- NFR5: Respects prefers-reduced-motion (CSS audit)
- NFR6: Colour never sole indicator (Design review)

**Performance:**
- NFR7: Lighthouse Performance ≥80 (CI/CD gate)
- NFR8: First Contentful Paint <2s (Lighthouse)
- NFR9: Time to Interactive <3s (Lighthouse)
- NFR10: Lazy load UI components for bundle size (Build audit)

**Security:**
- NFR11: No high/critical dependency vulnerabilities (yarn audit CI gate)
- NFR12: All user input sanitised (Code review)
- NFR13: LLM prompt injection hardened - no user input in system prompts (Security review)
- NFR14: Firebase Auth best practices (Config review)
- NFR15: Venue editor access enforced (Integration tests)

**Integration:**
- NFR16: Gemini API via Firebase with graceful degradation on failure (Error handling tests)
- NFR17: GA4 + Clarity analytics integration (Integration test)
- NFR18: Firebase Services - Auth, Firestore, Hosting, Functions (E2E tests)

### Additional Requirements

**From Architecture - Starter Template:**
- AR1: Use Official Vite `react-ts` template + shadcn init
- AR2: Project initialisation should be first implementation story
- AR3: Initialisation sequence: Vite create → shadcn init → add dependencies

**From Architecture - Data Architecture:**
- AR4: Cloud Storage for guide content (JSON), PDFs, images, version history
- AR5: Firestore for metadata (venues with editors array), LLM usage counters, audit logs
- AR6: Public guides served as static JSON from Storage URLs (no Firebase SDK)
- AR7: Zod for data validation and LLM output validation

**From Architecture - Authentication & Security:**
- AR8: Doc-style sharing model (venues have editors array, no orgs)
- AR9: Any editor can add/remove other editors (except last one)
- AR10: Rate limiting via Firestore counter (per-user daily cap)
- AR11: Audit logging: Firestore log collection + GA events

**From Architecture - API Patterns:**
- AR12: Firebase Callable Functions for all admin operations
- AR13: Signed URLs for file uploads (unique filename: {timestamp}_{logId}.pdf)
- AR14: PDF processing with progress updates via Firestore snapshots
- AR15: Standard HttpsError codes for error responses

**From Architecture - Frontend Patterns:**
- AR16: React Hook Form + Zod for admin forms
- AR17: React Query (TanStack Query) for admin data fetching
- AR18: @react-pdf/renderer for PDF generation (lazy-loaded, ~250KB)
- AR19: GA events for public analytics (no Firebase SDK in public bundle)

**From Architecture - Infrastructure:**
- AR20: Firebase Remote Config for feature flags
- AR21: Hybrid dev setup (Functions emulator, cloud Firestore/Storage/Auth)
- AR22: Two Firebase projects: sensory-guide-dev, sensory-guide-prod
- AR23: CI/CD: yarn audit gate, Lighthouse gates (a11y ≥95, perf ≥80)

**From Architecture - Project Structure:**
- AR24: By-feature organisation (features/admin/*, features/public/*)
- AR25: Public bundle minimal (~50KB), admin bundle larger (shadcn, React Query)
- AR26: Co-located tests (Component.tsx + Component.test.tsx)
- AR27: E2E tests in e2e/ at project root

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1-4 | Epic 4 | Venue Discovery & Access |
| FR5-9 | Epic 4 | Guide Content Display (journey-based progressive disclosure) |
| FR10-12 | Epic 5 | Print & Export |
| FR13-20 | Epic 3 | Content Management (Create/Publish) |
| FR21-23 | Epic 3 | Content Suggestions |
| FR24-28 | Epic 2 | Venue Sharing (Doc-Style Model) |
| FR29-31 | Epic 2 | Authentication |
| FR43-45 | Epic 2 | Signup Approval (LLM Budget Protection) |
| FR32-35 | Epic 5 | User Feedback & Analytics |
| FR36-39 | Epic 4 | Accessibility Compliance |
| FR20a-b | Epic 6 | Version Rollback (make any version live) |
| FR40-41 | Epic 6 | Super Admin (Support Access) |
| FR46-49 | Epic 6 | Super Admin Venue & User Administration |
| FR42 | Epic 4 | Index Page |
| FR50-55 | Epic 9 (Backlog) | Future Data Integration [CONTRACT] |
| FR56-63 | Epic 10 (Backlog) | Pilot Deployment & Evaluation [CONTRACT] |
| FR64-65 | Epic 11 (Backlog) | Growth & Reporting [GROWTH] |

**Coverage:** 64 FRs mapped ✅ (FR20a-b added for versioned publishing, FR46-49 for super admin administration, FR50-55 for contract data integration, FR56-63 for pilot/evaluation, FR64-65 for growth/reporting)

---

## Implementation Rules

### 🚨 CRITICAL: Releasable After Every Story

**Every story must leave the codebase in a releasable, manually testable state.**

- No broken builds
- No half-implemented features behind flags
- Each story is independently deployable
- Manual testing checkpoint after each story before proceeding
- If a feature requires multiple stories, each story delivers a working subset

This enables continuous deployment and reduces integration risk.

---

## Epic List

### Epic 1: Project Foundation (Sprint 0)
**Goal:** Deployable app shell with CI/CD quality gates in place

**User Outcome:** Development team has a working, deployable foundation with automated quality enforcement.

**FRs covered:** None directly (infrastructure enabling all future work)

> ⚠️ **Sprint 0 Exception:** This epic is technical infrastructure with no direct user value. This is accepted for greenfield projects where foundation work is unavoidable. Stories are developer-focused and must complete before user-facing work begins.

**Key Deliverables:**
- Vite + React + TypeScript project initialised
- shadcn/ui configured with Tailwind
- Firebase project setup (dev environment)
- GitHub Actions CI pipeline (lint, test, build, Lighthouse, yarn audit)
- Basic routing structure (`/`, `/admin`, `/venue/:slug`)
- Deployable to Firebase Hosting

---

### Epic 2: Admin Authentication & Venue Sharing
**Goal:** Admins can securely log in and manage access to their venues

**User Outcome:** Admin users can authenticate, see their venues, and share edit access with others.

**FRs covered:** FR24-31 (Venue Sharing + Authentication)

**Key Deliverables:**
- Firebase Auth integration
- Login/logout flow
- Admin dashboard showing "Your Venues" list
- Create new venue (creator becomes editor)
- Add/remove editors by email
- Firestore security rules enforcing editors array access
- Protected admin routes
- Basic admin layout/shell

---

### Epic 3: Guide Creation & Publishing
**Goal:** Admin can upload PDF → get LLM-transformed content → preview → publish a live guide

**User Outcome:** Admins can create and publish Sensory Guides from PDF audits.

**FRs covered:** FR13-23 (Content Management + Content Suggestions)

**Key Deliverables:**
- PDF upload to Cloud Storage (signed URLs)
- Gemini LLM transformation with progress updates
- Rate limit display (transforms used today)
- Guide preview interface
- Re-upload if content wrong (PDF is source of truth)
- Publish flow (JSON to Storage, venue metadata to Firestore)
- Shareable URL generation
- Content suggestions display

---

### Epic 4: Public Guide Experience
**Goal:** End users can view, navigate, and interact with a published Sensory Guide

**User Outcome:** People with sensory sensitivities can access and use guides to plan venue visits.

**FRs covered:** FR1-9, FR36-39, FR42 (Venue Discovery + Display + Accessibility + Index)

**Key Deliverables:**
- Public guide view at `/venue/:slug`
- Progressive disclosure (expand/collapse sections)
- Category badges and overview
- Images associated with warnings
- Facilities quick-access (exits, bathrooms, quiet zones)
- Full keyboard navigation
- Screen reader compatibility
- Reduced motion support
- Landing page at `/`

---

### Epic 5: Print & Feedback
**Goal:** Users can print guides and provide feedback on usefulness

**User Outcome:** Users get high-quality printed guides and can signal what's helpful.

**FRs covered:** FR10-12, FR32-35 (Print + Analytics)

**Key Deliverables:**
- Print-optimised CSS
- Print preview
- All sections expanded in print
- Thumbs up/down feedback (GA events)
- Page view tracking (GA)
- Section expansion tracking (GA)
- Print usage tracking (GA)

---

### Epic 6: Guide Management & Super Admin
**Goal:** Admins can maintain guides over time; Super Admins can provide support

**User Outcome:** Guides stay current; support team can help users.

**FRs covered:** FR19-20, FR40-41 (Guide Updates + Super Admin)

**Key Deliverables:**
- Guide update via new PDF upload
- Version history viewing
- Super Admin: view all venues (support access)
- Super Admin: global analytics

---

## Stories

---

## Epic 1: Project Foundation

### Story 1.1: Initialise React Project with Vite and TypeScript

As a **developer**,
I want **a properly configured React + TypeScript project with all dependencies installed**,
So that **I have a solid foundation to build features on**.

**Acceptance Criteria:**

**Given** no project exists
**When** I run the initialisation commands
**Then** a Vite project with React and TypeScript is created
**And** shadcn/ui is configured with Tailwind CSS
**And** the following dependencies are installed: zustand, react-router, firebase, zod, @tanstack/react-query, react-hook-form
**And** the folder structure matches Architecture doc (src/features/, src/shared/, src/lib/, src/stores/)
**And** `npm run dev` starts the dev server without errors
**And** `npm run build` completes without errors
**And** `npm test` runs (even if no tests yet)

---

### Story 1.2: Firebase Project Setup and Local Development

As a **developer**,
I want **Firebase configured for local development**,
So that **I can develop against real Firebase services**.

**Acceptance Criteria:**

**Given** the React project from Story 1.1
**When** I configure Firebase
**Then** a Firebase dev project exists (sensory-guide-dev)
**And** Firebase SDK is initialised in the app (src/lib/firebase.ts)
**And** Auth, Firestore, Storage, and Hosting are enabled in the project
**And** Functions emulator runs locally via `npm run emulators`
**And** .env.example documents all required environment variables
**And** .env is in .gitignore
**And** `firebase deploy --only hosting` successfully deploys to Firebase Hosting
**And** the deployed site loads without errors

---

### Story 1.3: CI/CD Pipeline with Quality Gates

As a **developer**,
I want **automated quality checks on every PR**,
So that **code quality is enforced before merge**.

**Acceptance Criteria:**

**Given** a GitHub repository with the project
**When** a PR is opened or updated
**Then** GitHub Actions runs: lint, test, build
**And** Lighthouse CI runs with gates: accessibility ≥95, performance ≥80
**And** `yarn audit` runs and fails on high/critical vulnerabilities
**And** all checks must pass before merge is allowed

**Given** a PR is merged to main
**When** the merge completes
**Then** the app auto-deploys to Firebase Hosting (dev project)
**And** deployment status is visible in GitHub

---

### Story 1.4: Basic Routing and App Shell

As a **developer**,
I want **basic routing and layout structure in place**,
So that **future features have a consistent navigation framework**.

**Acceptance Criteria:**

**Given** the configured project
**When** I set up React Router
**Then** the following routes exist:
  - `/` renders a placeholder public home page
  - `/admin` renders a placeholder admin dashboard
  - `/venue/:slug` renders a placeholder public guide page
  - Any other path renders a 404 page

**And** a PublicLayout component wraps public routes (/, /venue/:slug)
**And** an AdminLayout component wraps admin routes (/admin/*)
**And** all routes are keyboard navigable
**And** each route has a unique page title (document.title)
**And** navigation between routes works without full page reload
**And** the app remains deployable and passes all CI checks

---

## Epic 2: Admin Authentication & Venue Sharing

### Story 2.1: Firebase Auth Integration

As an **admin user**,
I want **to log in securely to the admin portal**,
So that **I can manage my venues**.

**Acceptance Criteria:**

**Given** I am not logged in
**When** I navigate to `/admin`
**Then** I am redirected to `/admin/login`

**Given** I am on the login page
**When** I enter valid email/password credentials
**Then** I am authenticated and redirected to `/admin`
**And** my auth state persists across page refresh

**Given** I am on the login page
**When** I click "Sign in with Google"
**Then** I can authenticate via Google OAuth
**And** I am redirected to `/admin`

**Given** I am logged in
**When** I click "Logout"
**Then** I am logged out and redirected to `/admin/login`

---

### Story 2.2: Admin Dashboard - Your Venues List

As an **admin user**,
I want **to see all venues I have edit access to**,
So that **I can quickly find and manage my venues**.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I navigate to `/admin`
**Then** I see a list of venues where my email is in the `editors` array
**And** each venue shows its name and status (draft/published)
**And** clicking a venue navigates to `/admin/venues/:id`

**Given** I am logged in but have no venues
**When** I view the dashboard
**Then** I see an empty state message: "No venues yet"
**And** I see a prominent "Create New Venue" button

**Given** I have venues
**When** I view the dashboard
**Then** I see a "Create New Venue" button in the header

---

### Story 2.3: Create New Venue

As an **admin user**,
I want **to create a new venue**,
So that **I can start building a Sensory Guide for it**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click "Create New Venue"
**Then** I see a form with: venue name (required), slug (auto-generated, editable)

**Given** I enter a venue name
**When** I type in the name field
**Then** the slug field auto-populates with a URL-friendly version (lowercase, hyphens)
**And** I can manually edit the slug if needed

**Given** I submit the form with valid data
**When** the venue is created
**Then** my email is automatically added to the `editors` array
**And** `createdBy` is set to my email
**And** I am redirected to `/admin/venues/:id`
**And** the venue appears in my dashboard list

**Given** I enter a slug that already exists
**When** I try to submit
**Then** I see an error: "This slug is already taken"

---

### Story 2.4: Venue Editor Management

As an **admin user**,
I want **to share venue edit access with others**,
So that **collaborators can help manage the guide**.

**Acceptance Criteria:**

**Given** I am viewing a venue I have edit access to
**When** I go to venue settings
**Then** I see a list of current editors (emails)
**And** I see an "Add editor" input field

**Given** I enter a valid email and click Add
**When** the email is not already an editor and there are fewer than 5 editors
**Then** the email is added to the editors array
**And** the list updates to show the new editor

**Given** there are already 5 editors
**When** I try to add another editor
**Then** I see an error: "Maximum 5 editors per venue"

**Given** there are multiple editors
**When** I click remove (X) on an editor
**Then** that editor is removed from the array
**And** they can no longer access this venue

**Given** I am the last remaining editor
**When** I view the editors list
**Then** I cannot remove myself
**And** I see a "Delete Venue" button instead

**Given** I am the last editor and click "Delete Venue"
**When** I confirm the deletion
**Then** the venue and all its data are deleted
**And** I am redirected to the dashboard

---

### Story 2.5: Firestore Security Rules

As a **developer**,
I want **security rules that enforce editor access**,
So that **users can only access venues they're editors of**.

**Acceptance Criteria:**

**Given** a user is authenticated
**When** they try to read a venue where their email is in `editors`
**Then** the read is allowed

**Given** a user is authenticated
**When** they try to read a venue where their email is NOT in `editors`
**Then** the read is denied

**Given** a user is authenticated
**When** they try to write to a venue where their email is in `editors`
**Then** the write is allowed

**Given** a user tries to remove the last editor from a venue
**When** the write would result in an empty editors array
**Then** the write is denied

**Given** a super admin (email in hardcoded list)
**When** they try to read any venue
**Then** the read is allowed (support access)

**And** all rules are tested with Firestore emulator tests
**And** tests are part of CI pipeline

---

## Epic 3: Guide Creation & Publishing

### Story 3.1: PDF Upload to Cloud Storage

As an **admin user**,
I want **to upload a PDF audit document for my venue**,
So that **it can be transformed into a Sensory Guide**.

**Acceptance Criteria:**

**Given** I am on the venue edit page
**When** I click "Upload PDF"
**Then** I see a file picker that accepts only PDF files

**Given** I select a valid PDF file
**When** the upload begins
**Then** I see a progress indicator showing upload percentage
**And** the file is uploaded directly to Cloud Storage via signed URL
**And** the file is stored at `/venues/{venueId}/uploads/{timestamp}.pdf`

**Given** the upload completes
**When** the file is stored
**Then** a Firestore record is created linking the upload to the venue
**And** the LLM transformation is automatically triggered

**Given** I select a non-PDF file
**When** I try to upload
**Then** I see an error: "Only PDF files are accepted"

---

### Story 3.2: LLM Transformation Pipeline

As an **admin user**,
I want **my PDF to be automatically transformed into structured guide content**,
So that **I don't have to manually format everything**.

**Acceptance Criteria:**

**Given** a PDF has been uploaded
**When** the transformation begins
**Then** I see a progress indicator with stages: "Processing PDF" → "Analysing content" → "Generating guide" → "Ready"
**And** the progress updates in real-time via Firestore listener

**Given** the transformation is running
**When** I check my rate limit
**Then** I see my usage: "X of Y transforms used today"

**Given** I have exceeded my daily rate limit
**When** I try to upload a PDF
**Then** I see an error: "Daily limit reached. Try again tomorrow."
**And** the upload is blocked

**Given** the transformation completes successfully
**When** the guide JSON is generated
**Then** it is stored at `/venues/{venueId}/guide.json`
**And** the venue status updates to "draft"
**And** I am shown the preview interface

**Given** the LLM fails or times out
**When** an error occurs
**Then** I see a clear error message
**And** I can retry the upload

---

### Story 3.3: Guide Preview Interface

As an **admin user**,
I want **to preview the generated guide before publishing**,
So that **I can verify the content is correct**.

**Acceptance Criteria:**

**Given** the LLM transformation completed
**When** I view the preview
**Then** I see the guide rendered exactly as users will see it
**And** I can expand/collapse sections
**And** I can see images if extracted
**And** I can see category badges

**Given** the content looks correct
**When** I am satisfied with the preview
**Then** I can click "Publish" to make it live

**Given** the content has errors
**When** I review the preview
**Then** I see a "Re-upload PDF" option
**And** I understand that PDF is the source of truth
**And** I can upload a corrected PDF to regenerate

---

### Story 3.4: Publish Guide

As an **admin user**,
I want **to publish my guide to make it publicly accessible**,
So that **users can view the Sensory Guide for my venue**.

**Acceptance Criteria:**

**Given** I am previewing a draft guide
**When** I click "Publish"
**Then** I see a confirmation dialog: "This will make the guide publicly visible"

**Given** I confirm publishing
**When** the publish completes
**Then** the guide JSON is copied to the public location
**And** the venue status changes to "published"
**And** I see the shareable URL: `/venue/{slug}`
**And** I can copy the URL with one click

**Given** the guide is published
**When** a user visits `/venue/{slug}`
**Then** they see the version pointed to by `liveVersion`

**Given** I upload a new PDF to a published venue
**When** I preview and publish
**Then** a new version is created in `versions/{timestamp}.json`
**And** `liveVersion` pointer is updated to the new timestamp
**And** the new version immediately becomes live (latest = default)
**And** previous versions remain accessible in version history

---

### Story 3.5: Content Suggestions Display

As an **admin user**,
I want **to see suggestions for improving my guide**,
So that **I can update my PDF to create better content**.

**Acceptance Criteria:**

**Given** the LLM transformation completed
**When** I view the preview
**Then** I see a "Show Suggestions" button

**Given** I click "Show Suggestions"
**When** the suggestions panel opens
**Then** I see a bullet list of improvement ideas
**And** suggestions are specific and actionable (e.g., "Consider adding info about quiet hours")

**Given** I want to implement suggestions
**When** I update my source PDF
**Then** I can re-upload the PDF
**And** the guide regenerates with new content

---

## Epic 4: Public Guide Experience

### Story 4.1: Public Guide Page Layout

As an **end user**,
I want **to view a venue's Sensory Guide**,
So that **I can plan my visit and know what to expect**.

**Acceptance Criteria:**

**Given** a guide is published for a venue
**When** I visit `/venue/{slug}`
**Then** I see the venue name prominently displayed
**And** I see the venue address and contact info
**And** I see the last updated date
**And** I see an accuracy disclaimer: "Information may change. Verify on arrival."
**And** I see category badges showing what sensory info is covered

**Given** the slug doesn't exist or guide isn't published
**When** I visit `/venue/{invalid-slug}`
**Then** I see a 404 page with helpful message

**And** the page loads without requiring authentication
**And** no Firebase SDK is loaded (static JSON fetch only)

---

### Story 4.2: Progressive Disclosure Sections

As an **end user**,
I want **to expand only the venue areas relevant to my journey**,
So that **I'm not overwhelmed with information**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** the page loads
**Then** all venue area sections are collapsed by default (Entry, Main Concourse, Platforms, etc.)
**And** I can see section headings representing each area of the venue
**And** each section shows category badges indicating what sensory types are flagged in that area

**Given** I want to read about a specific area
**When** I click on an area section heading
**Then** the section expands to show sensory details for that area (organised by subject: sound, crowds, light, etc.)
**And** clicking again collapses it

**Given** I want to see everything
**When** I click "Expand all"
**Then** all area sections expand simultaneously
**And** the button changes to "Collapse all"

**Given** I have reduced-motion enabled in my OS
**When** sections expand/collapse
**Then** transitions are instant (no animation)

**And** expanded/collapsed state is visually clear (chevron icon or similar)

> **Note:** Content structure is journey-based (Place → Subject → Detail), matching ASPECT audit format. User walks through the guide as they would walk through the venue.

---

### Story 4.3: Images and Facilities

As an **end user**,
I want **to see photos and find key facilities quickly**,
So that **I know exactly what to expect and where things are**.

**Acceptance Criteria:**

**Given** a section has associated images
**When** I expand that section
**Then** I see the images displayed within the section
**And** images have alt text for screen readers

**Given** the guide has facility information
**When** I view the guide
**Then** I see a "Key Facilities" section (always visible or prominent)
**And** it shows: exits, bathrooms, quiet zones (if available)
**And** each facility can link to an external map if URL provided

**Given** the venue has external resources
**When** I look for more info
**Then** I see links to venue website, maps, etc.
**And** external links open in new tab with appropriate icon

---

### Story 4.4: Accessibility Audit & Remediation

> **Note:** With shift-left a11y approach, all new stories now include accessibility criteria via updated workflow templates. This story audits existing work built before those gates were in place.

As a **product owner**,
I want **to audit and remediate accessibility gaps in existing UI**,
So that **all previously-built features meet WCAG 2.1 AA standards**.

**Acceptance Criteria:**

**Given** the dev-story workflow now includes a11y validation
**When** I audit stories completed before this change (4-1, 4-2, 4-3, 4-5)
**Then** I identify any a11y gaps against the new checklist

**Given** gaps are identified
**When** I remediate each issue
**Then** the following are verified for all public guide pages:
  - Keyboard navigation: all interactive elements reachable via Tab, Enter/Space to activate
  - Focus indicators: clearly visible on all focusable elements
  - Screen reader: semantic HTML, ARIA labels on expandable sections, alt text on images
  - Colour contrast: WCAG AA (4.5:1 text, 3:1 UI components)
  - Touch targets: ≥44x44px on mobile
  - Reduced motion: animations respect prefers-reduced-motion

**Given** remediation is complete
**When** I run Pa11y/axe-core on public pages
**Then** zero critical/serious violations reported

**And** Lighthouse accessibility score is ≥95

**Technical Notes:**
- This is a remediation story, not greenfield a11y work
- Future stories include a11y criteria by default (via create-story template)
- Pa11y CI integration handled separately in Story 4-6

---

### Story 4.5: Landing Page

As a **visitor**,
I want **to understand what Sensory Guide is**,
So that **I can learn about the service**.

**Acceptance Criteria:**

**Given** I visit `/`
**When** the page loads
**Then** I see BindiMaps branding and information
**And** I see a brief explanation of Sensory Guides
**And** I see a link to the admin portal for content creators

**And** the page is simple and professional
**And** the page meets accessibility requirements
**And** the page passes Lighthouse performance gate

---

## Epic 5: Print & Feedback

### Story 5.1: Print-Optimised View

As an **end user**,
I want **to print a Sensory Guide**,
So that **I can have a physical copy for my visit**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** I click the "Print" button
**Then** the browser print dialog opens
**And** the print layout is clean (no navigation, no footer chrome)
**And** all sections are automatically expanded
**And** images are included and print-friendly
**And** page breaks occur at sensible points (not mid-section)
**And** the venue name and date appear on each page

**Given** I print to PDF
**When** I save the file
**Then** the PDF is readable and well-formatted

---

### Story 5.2: Print Preview

As an **end user**,
I want **to preview what will print before printing**,
So that **I can check it looks right**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** I click "Print Preview"
**Then** I see a preview of the print layout
**And** all sections are expanded
**And** I can scroll through the full preview

**Given** I am in print preview
**When** I click "Print"
**Then** the browser print dialog opens

**Given** I am in print preview
**When** I click "Back" or press Escape
**Then** I return to the normal guide view

---

### Story 5.3: Thumbs Up/Down Feedback

As an **end user**,
I want **to give quick feedback on the guide**,
So that **creators know if it's helpful**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** I scroll to the bottom (or see a fixed feedback prompt)
**Then** I see "Was this guide helpful?" with thumbs up/down buttons

**Given** I click thumbs up or thumbs down
**When** I submit feedback
**Then** a GA event is fired with: venue slug, feedback value (up/down)
**And** I see a "Thanks for your feedback" message
**And** the buttons disable to prevent multiple submissions

**And** no data is written to Firestore (GA only)

---

### Story 5.4: Analytics Events

As a **product owner**,
I want **to track how guides are used**,
So that **I can understand user behaviour and improve the product**.

**Acceptance Criteria:**

**Public Guide Events (GA):**

**Given** a user views a guide
**When** the page loads
**Then** a `page_view` event fires with venue slug

**Given** a user expands a section
**When** they click to expand
**Then** a `section_expand` event fires with venue slug and section name

**Given** a user clicks Print
**When** the print dialog opens
**Then** a `print_guide` event fires with venue slug

**Admin Events (GA):**

**Given** an admin uploads a PDF
**When** the upload completes
**Then** an `admin_pdf_upload` event fires with venue ID

**Given** an admin publishes a guide
**When** the publish completes
**Then** an `admin_guide_publish` event fires with venue slug

**Given** an admin adds or removes an editor
**When** the change is saved
**Then** an `admin_editor_change` event fires with action (add/remove)

**And** all events are viewable in GA4 dashboard

---

## Epic 6: Guide Management & Super Admin

### Story 6.0: Venue Lifecycle Dashboard (PRIORITY)

As an **admin user**,
I want **the venue detail page to show the current state of my venue on page load**,
So that **I can see what's published, what drafts exist, and manage versions without losing context**.

> **Context:** This story addresses a critical UX gap where page refresh/navigation loses all state. It implements the `listVersions` and `setLiveVersion` functions specified in architecture.md but never built. This is foundational to the management experience and significantly improves testing workflows.

**Acceptance Criteria:**

**Given** I navigate to a venue detail page
**When** the page loads
**Then** I see the venue's current state:
  - If published: Show the live guide preview, publish date, shareable URL
  - If has unpublished draft: Show the draft preview with "Publish" option
  - If neither: Show the PDF upload prompt

**Given** a venue has been published
**When** I refresh the page
**Then** I still see the published state (not reset to upload prompt)

**Given** I have transformed a PDF but not published
**When** I navigate away and return
**Then** I see my draft preview (not lost)

**Given** a venue has version history
**When** I view the venue
**Then** I can access a list of all versions (drafts and published) with:
  - Timestamp
  - Status (draft/published/live)
  - Preview button
  - "Make Live" button (for published versions)

**Given** I want to re-publish an old version
**When** I click "Make Live" on a previous version
**Then** it becomes the live version immediately

---

### Story 6.1: Guide Update via Re-upload

As an **admin user**,
I want **to update a published guide by uploading a new PDF**,
So that **the guide stays current as the venue changes**.

**Acceptance Criteria:**

**Given** I have a published venue
**When** I navigate to the venue edit page
**Then** I see an "Upload New PDF" option

**Given** I upload a new PDF
**When** the LLM transformation completes
**Then** I see the new preview
**And** the previous published version is automatically saved to history
**And** the venue status shows "draft (update pending)"

**Given** I publish the updated guide
**When** the publish completes
**Then** the new content replaces the live version
**And** users see the updated guide at `/venue/{slug}`

---

### Story 6.2: Version History & Rollback

As an **admin user**,
I want **to view all published versions and make any version live with one click**,
So that **I can quickly rollback to a known-good state or compare versions**.

> **Design Principle:** "Anything publishable is rollbackable." Version history is a first-class feature of the publishing system, not an afterthought.

**Acceptance Criteria:**

**Given** I am on the venue edit page
**When** I click "Version History"
**Then** I see a list of ALL published versions (newest first)
**And** each version shows:
  - Timestamp (human-readable: "2 days ago" or "15 Jan 2026")
  - Who published it (email)
  - "LIVE" badge on the currently live version
  - "Preview" button
  - "Make Live" button (disabled on current live version)

**Given** I click "Preview" on any version
**When** the preview loads
**Then** I see that version rendered exactly as users would see it
**And** I see a banner: "Previewing version from [date] - not currently live"
**And** I can close preview to return to version list

**Given** I click "Make Live" on a non-live version
**When** the confirmation dialog appears
**Then** I see: "This will replace the current live guide. Users will immediately see this version."
**And** I can Cancel or Confirm

**Given** I confirm making a version live
**When** the operation completes
**Then** the `liveVersion` pointer updates to this version's timestamp
**And** the version list refreshes showing new "LIVE" badge position
**And** users visiting `/venue/{slug}` immediately see the new live version
**And** a toast confirms: "Version from [date] is now live"

**Given** I publish a new version (via PDF upload flow)
**When** publish completes
**Then** the new version is automatically set as live
**And** it appears at the top of the version history list with "LIVE" badge

---

### Story 6.3: Super Admin - View All Venues

As a **super admin**,
I want **to view all venues across all users**,
So that **I can provide support when needed**.

**Acceptance Criteria:**

**Given** my email is in `/config/superAdmins` Firestore doc
**When** I log into the admin portal
**Then** I see an "All Venues" tab/toggle
**And** I can switch between "My Venues" and "All Venues"

**Given** I am viewing "All Venues"
**When** the list loads
**Then** I see all venues in the system
**And** each venue shows its editors
**And** I can search/filter by venue name

**Given** I am a super admin viewing a venue I don't edit
**When** I view the venue
**Then** I can see all details (read-only support access)
**And** I cannot edit unless I'm also in the editors array

**Given** my email is NOT in the super admin list
**When** I try to access "All Venues"
**Then** I don't see that option

---

### Story 6.4: Super Admin - Global Analytics Dashboard

As a **super admin**,
I want **to see platform-wide analytics**,
So that **I can monitor system health and usage**.

**Acceptance Criteria:**

**Given** I am a super admin
**When** I navigate to the analytics dashboard
**Then** I see aggregate metrics:
  - Total venues (published / draft)
  - Total guides published (all time / this month)
  - Total LLM transforms (all time / this month)
  - Active users (unique editors this month)

**Given** the dashboard loads
**When** I view the data
**Then** metrics are pulled from Firestore audit logs (`/llmLogs`)
**And** data refreshes on page load (no real-time needed)

**And** only super admins can access this dashboard

---

## Additional Stories (Extended Breakdown)

---

## Epic 1: Project Foundation (Extended)

### Story 1.5: Design System Configuration - Admin

As a **developer**,
I want **Shadcn/ui configured with admin-appropriate theming**,
So that **the admin portal has a consistent, professional UI**.

**Acceptance Criteria:**

**Given** the project with shadcn init complete
**When** I configure the admin theme
**Then** core shadcn components are available (Button, Card, Dialog, Form, Input, Table)
**And** the theme uses neutral professional colours
**And** dark mode is NOT enabled (keep it simple)
**And** components are properly typed with TypeScript

---

### Story 1.6: Design System Configuration - Public

As a **developer**,
I want **Radix primitives with custom warm styling for public pages**,
So that **public guides have a calm, welcoming aesthetic**.

**Acceptance Criteria:**

**Given** the project with Tailwind configured
**When** I set up public design tokens
**Then** CSS variables are defined for warm palette:
  - `--background: #FDFBF7` (cream)
  - `--foreground: #2D2A26` (soft charcoal)
  - `--primary: #2A7D7D` (warm teal)
**And** Plus Jakarta Sans is the default font
**And** base spacing uses 8px grid
**And** public components do NOT import from shadcn

---

### Story 1.7: Error Boundary and 404 Page

As a **user**,
I want **graceful error handling when things go wrong**,
So that **I understand what happened and know what to do next**.

**Acceptance Criteria:**

**Given** an unhandled error occurs in the React app
**When** the error boundary catches it
**Then** a friendly error page displays (not a white screen)
**And** the error is logged to console (dev) or analytics (prod)
**And** a "Go Home" button is available

**Given** I visit a non-existent route
**When** the page loads
**Then** I see a 404 page with helpful message
**And** I see links to home and admin

---

### Story 1.8: Environment Configuration

As a **developer**,
I want **environment-based configuration for dev vs prod**,
So that **the app connects to the right Firebase project**.

**Acceptance Criteria:**

**Given** the app is configured
**When** I run in development
**Then** it uses `sensory-guide-dev` Firebase project
**And** console logging is verbose

**Given** the app is deployed to production
**When** it loads
**Then** it uses `sensory-guide-prod` Firebase project
**And** console logging is minimal

**And** `.env.example` documents all required variables
**And** no secrets are committed to the repo

---

## Epic 2: Admin Authentication & Venue Sharing (Extended)

### Story 2.6: Auth State Loading UI

As an **admin user**,
I want **a loading state while auth is being checked**,
So that **I don't see a flash of login page before redirect**.

**Acceptance Criteria:**

**Given** I navigate to `/admin` while logged in
**When** Firebase auth is initialising
**Then** I see a loading spinner, NOT the login page
**And** once auth resolves, I see the dashboard

**Given** I navigate to `/admin` while NOT logged in
**When** auth check completes
**Then** I am redirected to `/admin/login`

---

### Story 2.7: Auth Error Handling

As an **admin user**,
I want **clear error messages when login fails**,
So that **I know what went wrong and how to fix it**.

**Acceptance Criteria:**

**Given** I enter wrong email/password
**When** I submit the form
**Then** I see "Invalid email or password"

**Given** my account is disabled
**When** I try to login
**Then** I see "Account disabled. Contact support."

**Given** the network is unavailable
**When** I try to login
**Then** I see "Network error. Check your connection."

**And** error messages are accessible (aria-live, colour not sole indicator)

---

### Story 2.8: Email Validation for Editor Invites

As an **admin user**,
I want **email validation when adding editors**,
So that **I don't accidentally add invalid emails**.

**Acceptance Criteria:**

**Given** I am adding an editor
**When** I enter an invalid email format
**Then** I see "Please enter a valid email address"
**And** the Add button is disabled

**Given** I enter an email that's already an editor
**When** I try to add
**Then** I see "This person is already an editor"

**Given** I enter my own email
**When** I try to add
**Then** I see "You're already an editor"

---

### Story 2.9: Venue Card Quick Actions

As an **admin user**,
I want **quick actions available on venue cards**,
So that **I can manage venues without navigating to each one**.

**Acceptance Criteria:**

**Given** I am viewing my venues list
**When** I hover over a venue card
**Then** I see quick action buttons: View, Edit, Copy URL (if published)

**Given** a venue is published
**When** I click "Copy URL"
**Then** the shareable URL is copied to clipboard
**And** I see a toast: "URL copied!"

**Given** I'm on mobile (no hover)
**When** I tap a venue card
**Then** quick actions appear in a bottom sheet

---

### Story 2.10: Venue Slug Conflict Resolution

As an **admin user**,
I want **automatic slug suggestions when my preferred slug is taken**,
So that **I don't get stuck trying to find a unique slug**.

**Acceptance Criteria:**

**Given** I enter a venue name
**When** the auto-generated slug already exists
**Then** I see "Slug taken. Suggestions: [venue-name-2], [venue-name-adelaide]"
**And** I can click a suggestion to use it

**Given** I manually enter a slug that's taken
**When** I try to submit
**Then** I see the same suggestions UI

---

### Story 2.11: Signup Approval (Allow-List)

As a **platform owner**,
I want **only approved users to be able to create venues**,
So that **I can control who consumes LLM API budget**.

> **Context:** This is a security feature to prevent open signup abuse of LLM transformation costs. Implemented as invite-only (allow-list) model rather than approval queue to minimise complexity.

**Acceptance Criteria:**

**Given** a Firestore document `/config/access` with `allowedEmails` array
**When** a user tries to create a venue
**Then** the `createVenue` function checks if their email is in `allowedEmails`

**Given** my email IS in the `allowedEmails` array
**When** I click "Create New Venue"
**Then** venue creation proceeds normally

**Given** my email is NOT in the `allowedEmails` array
**When** I click "Create New Venue"
**Then** I see a message: "Your account is pending approval. Contact [admin email] to request access."
**And** the create venue form is not shown
**And** I can still view the dashboard (but it will be empty)

**Given** I am a super admin
**When** I view the super admin dashboard
**Then** I see an "Approved Users" section
**And** I can add emails to the allow-list
**And** I can remove emails from the allow-list

**Given** I remove an email from the allow-list
**When** that user tries to create a new venue
**Then** they see the "pending approval" message
**And** their existing venues remain accessible (no retroactive removal)

**Technical Notes:**
- Check happens in `createVenue` Cloud Function, not client-side
- Super admins are automatically allowed (bypass check)
- Consider seeding with your email + ASPECT testers during deployment

---

### Story 2.15: Edit Venue Name

As an **admin user**,
I want **to edit the name of my venue**,
So that **I can correct mistakes or update the venue name if it changes**.

**Acceptance Criteria:**

**Given** I am viewing a venue I have edit access to
**When** I navigate to venue settings
**Then** I see the current venue name displayed with an "Edit" button/icon

**Given** I click to edit the venue name
**When** the edit mode activates
**Then** the name becomes an editable text field with the current value
**And** I see "Save" and "Cancel" buttons

**Given** I enter a new valid name and click Save
**When** the update is submitted
**Then** the venue name is updated in Firestore
**And** I see a success toast: "Venue name updated"
**And** the display returns to view mode with the new name

**Given** I try to save an empty name
**When** I click Save
**Then** I see a validation error: "Venue name is required"
**And** the save is blocked

**Given** I click Cancel while editing
**When** the edit mode closes
**Then** the original name is preserved (no changes saved)

**Technical Notes:**
- Slug remains unchanged (URLs should not break)
- Only editors can update the name (security rules)
- Audit log entry for name changes (optional)

---

## Epic 3: Guide Creation & Publishing (Extended)

### Story 3.6: PDF Upload Progress Details

As an **admin user**,
I want **detailed progress during PDF upload and processing**,
So that **I know what's happening and how long to wait**.

**Acceptance Criteria:**

**Given** I upload a PDF
**When** the upload is in progress
**Then** I see:
  - Upload percentage (0-100%)
  - File name being uploaded
  - Cancel button

**Given** the upload completes and processing begins
**When** I'm watching progress
**Then** I see distinct stages with completion indicators:
  - ✓ Uploaded
  - ○ Extracting text...
  - ○ Analysing structure...
  - ○ Generating guide...

---

### Story 3.7: Rate Limit Warning Before Upload

As an **admin user**,
I want **to see my remaining transforms BEFORE uploading**,
So that **I don't waste time uploading when I've hit my limit**.

**Acceptance Criteria:**

**Given** I am on the venue edit page
**When** I view the upload section
**Then** I see "Transforms today: 2 of 10 used"

**Given** I have 0 transforms remaining
**When** I view the upload section
**Then** I see "Daily limit reached. Resets at midnight UTC."
**And** the upload button is disabled

**Given** I have 1 transform remaining
**When** I view the upload section
**Then** I see a warning: "Last transform for today"

---

### Story 3.8: LLM Retry with Backoff

As an **admin user**,
I want **automatic retry when LLM processing fails transiently**,
So that **temporary issues don't require manual intervention**.

**Acceptance Criteria:**

**Given** the LLM API times out
**When** the error is retryable
**Then** the system automatically retries (max 3 attempts)
**And** I see "Retrying... (attempt 2 of 3)"

**Given** all retries fail
**When** the final attempt errors
**Then** I see "Processing failed after 3 attempts. Please try again."
**And** my rate limit counter is NOT decremented

**Given** the error is non-retryable (malformed PDF)
**When** the error occurs
**Then** no retry happens
**And** I see "Could not process PDF. Please check the file format."

---

### Story 3.9: Guide JSON Schema Validation

As an **admin user**,
I want **validation that LLM output matches expected schema**,
So that **malformed guides don't break the public view**.

**Acceptance Criteria:**

**Given** the LLM generates content
**When** the output is received
**Then** it's validated against Zod schema for Guide type
**And** missing required fields cause a validation error

**Given** validation fails
**When** the error is caught
**Then** I see "Generated content was invalid. Please try again."
**And** the invalid JSON is logged for debugging

**Given** validation passes
**When** the guide is saved
**Then** it's stored with schema version number for future migrations

---

### Story 3.10: Preview Mode Navigation

As an **admin user**,
I want **to navigate through the preview as users would**,
So that **I can verify the entire guide experience**.

**Acceptance Criteria:**

**Given** I am in preview mode
**When** I interact with the guide
**Then** I can expand/collapse all sections
**And** I can use keyboard navigation
**And** I can test the "Expand all" button

**Given** I finish reviewing
**When** I want to exit preview
**Then** I have clear "Exit Preview" and "Publish" buttons
**And** "Publish" is disabled if no changes since last publish

---

### Story 3.11: Publish Confirmation with Diff

As an **admin user**,
I want **to see what changed before publishing an update**,
So that **I confirm the right changes are going live**.

**Acceptance Criteria:**

**Given** I already have a published guide
**When** I click "Publish" on an update
**Then** I see a summary of changes:
  - Sections added/removed
  - Content significantly changed
  - Images added/removed

**Given** I'm publishing for the first time
**When** I click "Publish"
**Then** I see "This will make the guide publicly visible" (no diff needed)

---

### Story 3.12: Suggestions Quality Ranking

As an **admin user**,
I want **suggestions prioritised by impact**,
So that **I focus on the most important improvements first**.

**Acceptance Criteria:**

**Given** the LLM generates suggestions
**When** I view the suggestions panel
**Then** suggestions are grouped by priority:
  - High: Missing critical info (exits, warnings)
  - Medium: Content improvements (more detail, clarity)
  - Low: Nice-to-have (photos, additional context)

**And** each suggestion has a brief explanation of why it matters

---

## Epic 4: Public Guide Experience (Extended)

### Story 4.6: Category Badge Filtering (Scanning Aid)

As an **end user**,
I want **to see which sensory categories apply to each section**,
So that **I can quickly find areas relevant to my sensitivities**.

**Acceptance Criteria:**

**Given** I am viewing a collapsed section
**When** I look at the section header
**Then** I see small category badges (Sound, Light, Crowds, etc.) for categories flagged in that section
**And** badges use the defined category colours (Sound=#CDE7FF, etc.)
**And** badges have text labels (not icons alone)

**Given** a section has no sensory warnings
**When** I view the header
**Then** no badges appear (clean header)

---

### Story 4.7: External Link Treatment

As an **end user**,
I want **clear indication when links go to external sites**,
So that **I'm not surprised when leaving the guide**.

**Acceptance Criteria:**

**Given** a link goes to an external site (maps, venue website)
**When** I view the link
**Then** it has a small external link indicator (↗ or similar)
**And** clicking opens in a new tab
**And** the link has `rel="noopener noreferrer"`

**Given** I use a screen reader
**When** I focus on an external link
**Then** it announces "opens in new tab"

---

### Story 4.8: Skip to Content Link

As a **keyboard/screen reader user**,
I want **a skip link to bypass navigation**,
So that **I can get to the main content quickly**.

**Acceptance Criteria:**

**Given** I navigate to a guide page
**When** I press Tab as first action
**Then** a "Skip to main content" link becomes visible
**And** clicking it jumps focus to the guide content

**Given** I'm not using keyboard navigation
**When** the page loads
**Then** the skip link is visually hidden but still accessible

---

### Story 4.9: Section Deep Linking

As an **end user**,
I want **to link directly to a specific section**,
So that **I can share or bookmark specific venue areas**.

**Acceptance Criteria:**

**Given** I expand a section
**When** the section opens
**Then** the URL updates to include the section anchor (e.g., `/venue/slug#entry-hall`)

**Given** I navigate to a URL with a section anchor
**When** the page loads
**Then** that section is automatically expanded
**And** the page scrolls to that section

**Given** I copy the URL while a section is expanded
**When** I share the URL
**Then** recipients see that section expanded when they open it

---

### Story 4.10: Loading State for Guide Fetch

As an **end user**,
I want **a pleasant loading state while the guide loads**,
So that **I'm not staring at a blank screen**.

**Acceptance Criteria:**

**Given** I navigate to a guide
**When** the JSON is being fetched
**Then** I see a skeleton UI matching the guide structure:
  - Skeleton header
  - Skeleton section headers
  - Subtle animation

**Given** the fetch completes
**When** data is ready
**Then** content replaces skeletons smoothly (no flicker)

**Given** the fetch fails
**When** the error occurs
**Then** I see "Couldn't load guide. Try refreshing."
**And** a "Retry" button is available

---

### Story 4.11: Offline Handling

As an **end user**,
I want **graceful handling when I lose connectivity**,
So that **I understand why the page won't load**.

**Acceptance Criteria:**

**Given** I'm offline and visit a guide
**When** the fetch fails due to network
**Then** I see "You appear to be offline. Check your connection."
**And** a "Retry" button is available

**Given** I regain connectivity
**When** I click "Retry"
**Then** the guide loads normally

---

### Story 4.12: Last Updated Formatting

As an **end user**,
I want **the last updated date in a friendly format**,
So that **I can quickly gauge if the information is current**.

**Acceptance Criteria:**

**Given** the guide was updated today
**When** I view the last updated date
**Then** I see "Updated today"

**Given** the guide was updated yesterday
**When** I view the date
**Then** I see "Updated yesterday"

**Given** the guide was updated within the last week
**When** I view the date
**Then** I see "Updated 3 days ago"

**Given** the guide was updated more than a week ago
**When** I view the date
**Then** I see the full date: "Updated 15 January 2026"

---

### Story 4.13: Mobile Quick Actions Bar

As a **mobile user at the venue**,
I want **quick access to exits and bathrooms**,
So that **I can find essential facilities when stressed**.

**Acceptance Criteria:**

**Given** I am viewing a guide on mobile
**When** I scroll down
**Then** a floating quick actions bar appears at the bottom
**And** it shows: "Exits" and "Bathrooms" (if venue has these)

**Given** I tap "Exits"
**When** the action fires
**Then** the guide scrolls to and expands the section containing exit info
**And** exit information is highlighted

**Given** the venue has no bathroom info
**When** the bar renders
**Then** "Bathrooms" button is not shown

---

### Story 4.14: Area Preview Summaries (Guide-Like Experience)

As an **end user**,
I want **to see a brief preview of what to expect in each area without expanding**,
So that **the guide feels like it's teaching me something, not making me hunt for information**.

> **Context:** Current collapsed sections show only title + badges + level indicator. Users must tap to learn anything. This makes the UI feel like a database lookup rather than a helpful guide. Preview summaries transform passive "click to discover" into active "here's what to expect".

**Phase 1 (Implemented):**

**Given** I am viewing a collapsed section
**When** the section has sensory details
**Then** I see a 1-2 line preview of the first sensory description below the title
**And** the preview is truncated at ~120 chars with ellipsis if longer
**And** the preview disappears when the section is expanded (avoids duplication)

**Phase 2 (Schema Evolution - Future):**

**Given** the LLM transforms a PDF
**When** generating guide content
**Then** each area includes an optional `summary` field (1-2 sentences)
**And** the summary is optimised for preview display (teaser, not duplicate of details)

**Given** an area has a `summary` field
**When** I view the collapsed section
**Then** the summary is shown instead of the first detail description

**Given** an area has no `summary` field (legacy guides)
**When** I view the collapsed section
**Then** the first detail description is used as fallback

**Technical Notes:**
- Phase 1: Pure frontend change in `AreaSection` component
- Phase 2: Add optional `summary: z.string().optional()` to `areaSchema`
- Phase 2: Update LLM prompt to generate area summaries
- Backward compatible: existing guides work via fallback

---

## Epic 5: Print & Feedback (Extended)

### Story 5.5: Print Header/Footer

As an **end user**,
I want **useful headers and footers on printed pages**,
So that **multi-page printouts stay organised**.

**Acceptance Criteria:**

**Given** I print a guide
**When** the printed output renders
**Then** each page has:
  - Header: Venue name
  - Footer: Page X of Y, URL of the guide

**And** headers/footers use @page CSS rules
**And** they're unobtrusive (small, muted colour)

---

### Story 5.6: Print Page Breaks

As an **end user**,
I want **sensible page breaks in printed guides**,
So that **sections aren't awkwardly split**.

**Acceptance Criteria:**

**Given** I print a guide
**When** sections are rendered
**Then** `page-break-inside: avoid` is applied to:
  - Section headers
  - Individual sensory warnings
  - Images with captions

**And** page breaks occur between sections when possible
**And** orphan/widow control prevents single lines at page boundaries

---

### Story 5.7: Feedback Prompt Timing

As an **end user**,
I want **the feedback prompt to appear at the right time**,
So that **it doesn't interrupt my reading but I see it when ready**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** I scroll past 75% of the content
**Then** the feedback prompt fades in at the bottom

**Given** I haven't scrolled far
**When** I look at the page
**Then** the feedback prompt is not visible

**Given** I've already given feedback (stored in localStorage)
**When** I view the guide again
**Then** the feedback prompt doesn't appear

---

### Story 5.8: Analytics Event Batching

As a **developer**,
I want **analytics events batched for performance**,
So that **frequent events don't slow down the user experience**.

**Acceptance Criteria:**

**Given** a user rapidly expands/collapses sections
**When** multiple events fire quickly
**Then** events are debounced (300ms) before sending to GA

**Given** the user navigates away
**When** the page unloads
**Then** any pending events are flushed via sendBeacon

---

### Story 5.9: Admin Analytics View

As an **admin user**,
I want **to see how my guides are performing**,
So that **I know if users find them helpful**.

**Acceptance Criteria:**

**Given** I am viewing my venue in admin
**When** I navigate to the "Analytics" tab
**Then** I see (embedded GA):
  - Total views (last 30 days)
  - Thumbs up/down ratio
  - Print button clicks
  - Most expanded sections

**And** this uses GA embed, not custom analytics backend

---

## Epic 6: Guide Management & Super Admin (Extended)

### Story 6.5: Version Comparison View

As an **admin user**,
I want **to compare two versions of a guide side-by-side**,
So that **I can see exactly what changed**.

**Acceptance Criteria:**

**Given** I am viewing version history
**When** I select two versions
**Then** I can click "Compare"
**And** I see a side-by-side or diff view

**Given** the comparison view is open
**When** I view sections
**Then** added content is highlighted green
**And** removed content is highlighted red
**And** unchanged content is normal

---

### Story 6.6: Bulk Venue Actions (Super Admin)

As a **super admin**,
I want **to perform actions on multiple venues at once**,
So that **I can efficiently manage the platform**.

**Acceptance Criteria:**

**Given** I am viewing "All Venues" as super admin
**When** I select multiple venues via checkboxes
**Then** I see bulk action buttons: "Export List"

**Given** I click "Export List"
**When** the export generates
**Then** I get a CSV with: venue name, slug, editors, status, last updated

---

### Story 6.7: Super Admin Impersonation

As a **super admin**,
I want **to view the admin portal as a specific user**,
So that **I can debug issues they're experiencing**.

**Acceptance Criteria:**

**Given** I am a super admin
**When** I search for a user email
**Then** I can click "View as this user"
**And** the admin portal shows only venues that user has access to

**Given** I am impersonating a user
**When** I view the header
**Then** I see a banner: "Viewing as user@example.com"
**And** I can click "Exit impersonation" to return to super admin view

**And** impersonation is read-only (cannot make changes)
**And** impersonation sessions are logged in audit trail

---

### Story 6.8: System Health Dashboard

As a **super admin**,
I want **to monitor system health at a glance**,
So that **I can spot issues before users report them**.

**Acceptance Criteria:**

**Given** I am a super admin viewing the analytics dashboard
**When** I look at system health
**Then** I see:
  - LLM API status (operational/degraded/down)
  - Average transform time (last 24h)
  - Transform error rate (last 24h)
  - Storage usage

**Given** any metric is in warning/critical state
**When** I view the dashboard
**Then** that metric is visually highlighted

---

### Story 6.9: Audit Log Search

As a **super admin**,
I want **to search the audit log for specific events**,
So that **I can investigate issues reported by users**.

**Acceptance Criteria:**

**Given** I am on the super admin dashboard
**When** I navigate to "Audit Log"
**Then** I see a searchable list of events

**Given** I want to find events for a specific user
**When** I filter by email
**Then** I see only events for that user

**Given** I want to find events for a specific venue
**When** I filter by venue ID or name
**Then** I see only events for that venue

**And** each log entry shows: timestamp, user, action, venue, details

---

### Story 6.10: Super Admin Venue & User Administration

As a **super admin**,
I want **to administer any venue and manage users across the platform**,
So that **I can support growth, handle issues, and manage the user base**.

**Acceptance Criteria:**

#### Venue List with Ownership Clarity

**Given** I am a super admin viewing the dashboard
**When** I navigate to "All Venues"
**Then** I see venues grouped/flagged by ownership:
  - "My Venues" section: venues where I'm an editor (normal styling)
  - "Other Venues" section: venues I can see as super admin (distinct visual - e.g., muted/outlined cards, badge "Admin View")
**And** the distinction is immediately obvious at a glance

**Given** I'm viewing a venue I don't own
**When** I see the venue card
**Then** it shows the owner/editors clearly
**And** has visual indicator this is "admin access" not "my venue"

#### Full Venue Administration

**Given** I am a super admin
**When** I view any venue (owned or not)
**Then** I can:
  - Add editors (bypass normal 5-editor limit if needed)
  - Remove editors (including last editor - with warning)
  - Delete the venue entirely (with confirmation dialog)
  - Unpublish a live guide (hide from public without deleting)

**Given** I remove the last editor from a venue
**When** I confirm the action
**Then** I'm prompted: "This venue has no editors. Delete venue or assign new editor?"
**And** I must choose one before proceeding

**Given** I delete a venue as super admin
**When** I confirm
**Then** venue doc, all versions, and storage files are deleted
**And** action is recorded in audit log

#### User Management Section

**Given** I am a super admin
**When** I navigate to "Users" section
**Then** I see a list of all users who have logged in
**And** each row shows: email, venue count, last active, status (active/disabled)
**And** I can search/filter by email

**Given** I view a specific user
**When** I click on their row
**Then** I see:
  - List of venues they're an editor of
  - Whether they're on the approved list
  - Option to disable or delete account

#### Disable User Account

**Given** I click "Disable" on a user
**When** I confirm
**Then** user's `disabled` flag is set in Firestore
**And** user sees "Account disabled" on next login attempt
**And** their venues remain intact (other editors can still access)
**And** I can re-enable at any time

#### Delete User Account

**Given** I click "Delete" on a user
**When** I see the confirmation dialog
**Then** I see a list of venues they're the ONLY editor of
**And** for each such venue, I must choose:
  - "Delete venue" (removes venue entirely)
  - "Reassign to: [email input]" (transfer before deletion)

**Given** I've resolved all orphan venues
**When** I confirm deletion
**Then**:
  - User removed from editors array on all shared venues
  - User's orphan venues deleted or reassigned per my choices
  - User removed from approved list (if present)
  - Firebase Auth account deleted
  - User doc in Firestore deleted

**Given** a user has venues shared with others
**When** I delete that user
**Then** those venues remain (just that user removed from editors)

**Technical Notes:**
- Super admin check: email in `/config/superAdmins` Firestore doc
- User disable: add `disabled: true` to user doc, check in auth middleware
- User deletion requires Cloud Function (cascades, Auth deletion)
- Consider soft-delete with 30-day grace period for GDPR (optional)

---

## Epic 7: Polish & Quality (New Epic)

### Story 7.1: Loading States Consistency

As a **user**,
I want **consistent loading states across the app**,
So that **the experience feels polished and predictable**.

**Acceptance Criteria:**

**Given** any async operation is in progress
**When** I'm waiting
**Then** I see one of:
  - Skeleton UI (for content loading)
  - Spinner with label (for form submissions)
  - Progress bar (for uploads)

**And** loading states use consistent animations
**And** all loading states respect reduced motion preference

---

### Story 7.2: Toast Notifications

As a **user**,
I want **non-blocking feedback for actions**,
So that **I know my actions succeeded without modal interruptions**.

**Acceptance Criteria:**

**Given** I perform a successful action (copy URL, save, etc.)
**When** the action completes
**Then** a toast appears briefly: "[Action] successful"
**And** toast auto-dismisses after 3 seconds
**And** toast can be manually dismissed

**Given** an action fails
**When** the error occurs
**Then** a toast appears with error message
**And** error toasts are visually distinct (but not red-only)
**And** error toasts persist until dismissed

**And** toasts stack if multiple appear
**And** toasts are announced to screen readers

---

### Story 7.3: Form Validation UX

As an **admin user**,
I want **clear, helpful form validation**,
So that **I can quickly fix errors**.

**Acceptance Criteria:**

**Given** I submit a form with validation errors
**When** the errors display
**Then** each error appears below its field
**And** the first error field is focused
**And** error messages are specific (not just "Invalid input")

**Given** I correct an error
**When** I update the field
**Then** the error clears immediately (no need to resubmit)

**And** required fields are marked with * (and explained in legend)
**And** form validation uses Zod schemas (React Hook Form + Zod)

---

### Story 7.4: Empty States

As a **user**,
I want **helpful empty states**,
So that **I know what to do when there's no data**.

**Acceptance Criteria:**

**Given** I view a list with no items
**When** the page loads
**Then** I see an empty state with:
  - Friendly message (not "No data")
  - Relevant illustration or icon
  - Call to action (if applicable)

Examples:
- No venues: "You don't have any venues yet. Create your first one!"
- No version history: "No previous versions. Publish to create history."
- No search results: "No venues match your search."

---

### Story 7.5: Responsive Tables

As an **admin user on mobile**,
I want **tables that work on small screens**,
So that **I can manage venues from my phone**.

**Acceptance Criteria:**

**Given** I view a data table on mobile
**When** the screen is narrow
**Then** the table transforms to a card-based layout
**Or** horizontal scroll is enabled with visible scroll indicator

**And** critical columns remain visible
**And** actions remain accessible

---

### Story 7.6: Focus Management

As a **keyboard user**,
I want **proper focus management**,
So that **I always know where I am on the page**.

**Acceptance Criteria:**

**Given** I open a modal/dialog
**When** it opens
**Then** focus moves to the first focusable element in the modal
**And** focus is trapped within the modal

**Given** I close a modal
**When** it closes
**Then** focus returns to the element that triggered the modal

**Given** I complete a form and navigate away
**When** the new page loads
**Then** focus moves to the main content area

---

### Story 7.7: Confirmation Dialogs

As an **admin user**,
I want **confirmation for destructive actions**,
So that **I don't accidentally delete important data**.

**Acceptance Criteria:**

**Given** I click a destructive action (delete venue, remove editor)
**When** the action is triggered
**Then** a confirmation dialog appears with:
  - Clear description of what will happen
  - Cancel button (default focus)
  - Confirm button (danger style)

**Given** the action involves permanent data loss
**When** the dialog appears
**Then** I must type the venue name to confirm

---

### Story 7.8: Session Timeout Handling

As an **admin user**,
I want **graceful handling when my session expires**,
So that **I don't lose work**.

**Acceptance Criteria:**

**Given** my Firebase auth session expires
**When** I try to perform an action
**Then** I see a modal: "Your session has expired. Please log in again."
**And** I'm redirected to login after clicking OK
**And** after logging in, I'm returned to where I was

**Given** I have unsaved changes when session expires
**When** the session check runs
**Then** changes are preserved in localStorage
**And** after re-login, I see "You have unsaved changes. Restore?"

---

## Epic 8: Testing & Documentation (New Epic)

### Story 8.1: Unit Test Foundation

As a **developer**,
I want **unit testing infrastructure set up**,
So that **I can write tests for components and utilities**.

**Acceptance Criteria:**

**Given** the project is configured
**When** I run `npm test`
**Then** Vitest runs all `*.test.ts` and `*.test.tsx` files

**And** React Testing Library is configured for component tests
**And** test coverage can be generated with `npm run test:coverage`
**And** tests run in CI pipeline

---

### Story 8.2: E2E Test Foundation

As a **developer**,
I want **E2E testing infrastructure set up**,
So that **I can write user journey tests**.

**Acceptance Criteria:**

**Given** the project is configured
**When** I run `npm run test:e2e`
**Then** Playwright runs tests in the `e2e/` directory

**And** tests can run against local dev server
**And** tests can run against deployed staging
**And** E2E tests run in CI pipeline (on merge to main)

---

### Story 8.3: Critical Path E2E Tests

As a **developer**,
I want **E2E tests for critical user journeys**,
So that **regressions are caught before deployment**.

**Acceptance Criteria:**

**Given** E2E test infrastructure exists
**When** I write critical path tests
**Then** the following journeys are covered:
  - Admin: Login → Create venue → Upload PDF → Publish → View public guide
  - Public: View guide → Expand sections → Print
  - Admin: Add editor → Editor can access venue

**And** tests run on PRs and fail builds on failure

---

### Story 8.4: Accessibility Automated Testing

As a **developer**,
I want **automated accessibility testing**,
So that **a11y regressions are caught early**.

**Acceptance Criteria:**

**Given** the CI pipeline runs
**When** Lighthouse a11y audit runs
**Then** builds fail if score < 95

**Given** I run tests locally
**When** I use axe-core integration
**Then** a11y violations are reported in test output

**And** axe-core is integrated with Vitest/RTL for component tests
**And** Lighthouse CI handles page-level a11y auditing

---

### Story 8.5: API Documentation

As a **developer**,
I want **documentation for Firebase Functions API**,
So that **the backend contract is clear**.

**Acceptance Criteria:**

**Given** all Firebase Functions are implemented
**When** I view `functions/README.md`
**Then** I see documentation for each callable function:
  - Function name
  - Input parameters (with types)
  - Return value (with types)
  - Error codes possible
  - Auth requirements

**And** Zod schemas serve as source of truth for types

---

### Story 8.6: Component Storybook (Optional)

As a **developer**,
I want **a component gallery for UI components**,
So that **I can develop and review components in isolation**.

**Acceptance Criteria:**

**Given** the project has UI components
**When** I run `npm run storybook`
**Then** Storybook launches with documented components

**And** public design system components have stories
**And** stories show component variants and states
**And** accessibility checks run in Storybook

---

---

## Epic 9: Future Data Integration (Backlog) [CONTRACT REQUIREMENT]

> ⚠️ **Contract Flagged:** This epic contains contractual deliverables. Implementation is dependent on third-party API availability. Per contract note: "The use of these data sources depends on third parties and whether these parties have appropriate APIs and are prepared to share them with BindiMaps."

**Goal:** Enhance guides with real-time and dynamic data from external sources

**User Outcome:** Users get current, contextual information about venue conditions to plan visits more effectively

**FRs covered:** FR50-55

**Key Deliverables:**
- Real-time alerts system for available data feeds
- User personalisation settings for sensory thresholds
- Pre-journey route preview with sensory overlay
- Transit API integration (TfNSW, Adelaide Rail where available)
- Maintenance/cleaning schedule display
- IoT sensor data integration (optional - fallback to manual ASPECT audit data)

**Data Source Dependencies:**
| Data Type | Potential Source | Status | Notes |
|-----------|------------------|--------|-------|
| Crowding data | TfNSW Open Data, Adelaide Rail APIs | Research needed | Public APIs exist |
| Cleaning schedules | Venue operators | Research needed | May be private |
| Sound levels | IoT sensors | Optional | Manual ASPECT audit as fallback |

---

### Story 9.1: User Personalisation Settings [CONTRACT]

As an **end user**,
I want **to set my personal sensory thresholds and preferences**,
So that **alerts and information are relevant to my specific sensitivities**.

**Acceptance Criteria:**

**Given** I am viewing a guide
**When** I access personalisation settings
**Then** I can set thresholds for:
  - Sound sensitivity (low/medium/high)
  - Crowd tolerance (quiet/moderate/busy)
  - Light sensitivity (low/medium/high)
**And** my preferences persist across sessions (localStorage)

**Given** I have set preferences
**When** I view a guide
**Then** warnings are filtered/highlighted based on my thresholds
**And** I see personalised alerts relevant to my sensitivities

---

### Story 9.2: Pre-Journey Route Preview [CONTRACT]

As an **end user**,
I want **to preview my journey through a venue before visiting**,
So that **I can mentally prepare for sensory experiences along my route**.

**Acceptance Criteria:**

**Given** I am viewing a guide for a venue with multiple areas
**When** I select "Preview Journey"
**Then** I see a sequential walkthrough of areas (Entry → Main → etc.)
**And** each area shows its sensory summary
**And** I can navigate forward/back through the journey

**Given** the venue has a map
**When** I view the journey preview
**Then** my route is highlighted on the map (if available)

---

### Story 9.3: Real-Time Alerts Framework [CONTRACT]

As an **end user**,
I want **to receive alerts about current conditions at a venue**,
So that **I'm aware of unexpected sensory situations before they affect me**.

**Acceptance Criteria:**

**Given** real-time data is available for a venue
**When** I view the guide
**Then** I see an "Alerts" section showing current conditions
**And** alerts are timestamped ("Updated 5 min ago")
**And** alerts include: crowding levels, active events, maintenance

**Given** no real-time data is available
**When** I view the guide
**Then** alerts section is hidden (graceful degradation)
**And** static guide content displays normally

**Given** an alert exceeds my personalised thresholds
**When** viewing the guide
**Then** the alert is visually prominent (highlighted, icon)

---

### Story 9.4: Transit Crowding Data Integration [CONTRACT - DATA DEPENDENT]

As an **end user visiting a train station**,
I want **to see how crowded the venue currently is**,
So that **I can time my visit for quieter periods**.

**Acceptance Criteria:**

**Given** the venue is a train station with TfNSW/Adelaide Rail API access
**When** I view the guide
**Then** I see current crowding level (Low/Medium/High)
**And** I see a simple forecast ("Usually quieter after 10am")

**Given** the API is unavailable
**When** I view the guide
**Then** crowding section shows "Real-time data unavailable"
**And** static crowding notes from audit are shown as fallback

**Technical Notes:**
- TfNSW Open Data: https://opendata.transport.nsw.gov.au/
- Adelaide Metro: https://www.adelaidemetro.com.au/about/open-data
- Implement with graceful degradation for unavailable APIs

---

### Story 9.5: Cleaning/Maintenance Schedule Display [CONTRACT - DATA DEPENDENT]

As an **end user**,
I want **to know when cleaning or maintenance is scheduled**,
So that **I can avoid noisy/disruptive periods**.

**Acceptance Criteria:**

**Given** cleaning schedule data is available for a venue
**When** I view the guide
**Then** I see "Scheduled Activities" showing:
  - Time windows for cleaning
  - Maintenance periods
  - Events that may affect sensory environment

**Given** no schedule data is available
**When** I view the guide
**Then** the section is hidden or shows "No schedule data available"

---

### Story 9.6: IoT Sensor Data Integration [CONTRACT - OPTIONAL]

As an **end user**,
I want **to see real-time sound levels in different areas**,
So that **I know the current noise situation before entering**.

> **Note:** This story is contingent on IoT sensor data being available. Per contract, this data was collected manually by the ASPECT audit and may not have a live feed. Implementation should prioritise graceful fallback to static audit data.

**Acceptance Criteria:**

**Given** IoT sensor data is available for a venue
**When** I view an area section
**Then** I see current decibel reading with visual indicator
**And** readings update periodically (every 30s-1min)

**Given** IoT data is NOT available
**When** I view an area section
**Then** static sound level data from ASPECT audit is shown
**And** the display indicates "Based on audit data" not real-time

**Given** sensors go offline
**When** I view the guide
**Then** system falls back to last known reading with timestamp
**Or** falls back to static audit data with explanation

**Technical Notes:**
- Report should document: "Sound level data was collected manually by the ASPECT audit team"
- IoT integration is enhancement, not baseline requirement
- Design for offline-first with graceful enhancement

---

## Epic 10: Pilot Deployment & Evaluation (Backlog) [CONTRACT REQUIREMENT - Stage 5 & 6]

> ⚠️ **Contract Flagged:** This epic covers contractual Stage 5 (MVP at pilot site) and Stage 6 (evaluation). Adelaide Rail is the designated pilot site - existing BindiMaps customer with mapping/location data already available. In-principle agreement received from Adelaide Rail.

**Goal:** Deploy MVP at Adelaide Rail pilot site and evaluate effectiveness through defined metrics

**User Outcome:** Real-world validation of Sensory Guide features with sensory-sensitive users at an actual transit venue

**FRs covered:** FR56-63

**Pilot Parameters (from contract):**
- **Site:** Adelaide Rail (public spaces, no access restrictions)
- **Duration:** 7 weeks
- **Users:** 10 recruited from focus/survey groups + ASPECT + direct marketing
- **Cycles:** 1-2 week testing periods → internal review → refinement → redeploy
- **Testing:** 2-3 users per cycle

**Key Deliverables:**
- Static sensory map layer deployed at Adelaide Rail
- At least one dynamic input integrated (crowding, schedules, or sensor data)
- In-app feedback/survey mechanism
- Interaction data capture for analysis
- Success metrics dashboard

**Success Metrics (Stage 6):**
| Metric | Description | Collection Method |
|--------|-------------|-------------------|
| Engagement rates | Usage of "Sensory Awareness Mode" | Analytics |
| Stress/confidence | User-reported levels before/after | Survey |
| Alert effectiveness | Alerts triggered and acted upon | Analytics |
| Satisfaction | Overall user satisfaction scores | Survey + feedback |

---

### Story 10.1: Adelaide Rail Venue Configuration [CONTRACT]

As a **pilot administrator**,
I want **Adelaide Rail configured as a venue with existing BindiMaps data**,
So that **the pilot can leverage existing mapping infrastructure**.

**Acceptance Criteria:**

**Given** Adelaide Rail mapping data exists in BindiMaps
**When** I create the Sensory Guide venue
**Then** the venue is linked to existing BindiMaps location data
**And** existing maps can be referenced from the guide

**Given** the venue is configured
**When** I view it
**Then** I see Adelaide Rail-specific areas (stations, platforms, concourses)

---

### Story 10.2: Static Sensory Map Layer [CONTRACT - MVP]

As an **end user at Adelaide Rail**,
I want **to see sensory information overlaid on the venue map**,
So that **I can visually understand sensory conditions across areas**.

**Acceptance Criteria:**

**Given** I am viewing the Adelaide Rail guide
**When** I access the map view
**Then** I see sensory zones colour-coded by intensity
**And** I can tap zones to see sensory details
**And** the map integrates with existing BindiMaps mapping

**Given** areas have been audited
**When** I view the map
**Then** audited areas show sensory indicators (sound, light, crowds)
**And** unaudited areas are marked as "no data"

---

### Story 10.3: Dynamic Input Integration [CONTRACT - MVP]

As an **end user**,
I want **at least one source of live/dynamic data in the guide**,
So that **I see current conditions not just static audit data**.

> **Note:** Contract requires "at least one dynamic input". Prioritise based on data availability - likely candidates: Adelaide Rail crowding API, cleaning schedules, or event calendar.

**Acceptance Criteria:**

**Given** a dynamic data source is available
**When** I view the guide
**Then** I see real-time or near-real-time information
**And** the data is timestamped ("Updated X mins ago")
**And** fallback to static data if API unavailable

**Given** the dynamic source is crowding data
**When** I view the relevant area
**Then** I see current crowding level with visual indicator

---

### Story 10.4: In-App Survey/Feedback Collection [CONTRACT]

As a **pilot tester**,
I want **to provide feedback directly within the app**,
So that **my experience can inform development iterations**.

**Acceptance Criteria:**

**Given** I am a pilot tester using the guide
**When** I complete a session
**Then** I see an optional feedback prompt
**And** I can rate my experience (1-5 stars)
**And** I can provide free-text comments

**Given** I want to report an issue mid-session
**When** I tap the feedback button
**Then** I can submit quick feedback without leaving the guide

**Given** feedback is submitted
**When** it's stored
**Then** it includes: timestamp, user ID (anonymised), session context, venue area

---

### Story 10.5: Interaction Data Capture [CONTRACT]

As a **researcher/product owner**,
I want **detailed interaction data from pilot testers**,
So that **I can analyse usage patterns and inform development**.

**Acceptance Criteria:**

**Given** a pilot tester uses the guide
**When** they interact with features
**Then** the following events are captured:
  - Section expansions/collapses
  - Map interactions
  - Alert views and actions taken
  - Time spent per area
  - Navigation patterns (journey through venue)

**Given** data is captured
**When** I access the analytics
**Then** data is anonymised but linkable per session
**And** I can filter by date range, user cohort, feature

---

### Story 10.6: Success Metrics Dashboard [CONTRACT - Stage 6]

As a **researcher/stakeholder**,
I want **a dashboard showing Stage 6 success metrics**,
So that **I can evaluate pilot effectiveness against contract criteria**.

**Acceptance Criteria:**

**Given** the pilot has generated data
**When** I access the metrics dashboard
**Then** I see:
  - **Engagement:** "Sensory Awareness Mode" usage stats
  - **Wellbeing:** Aggregated stress/confidence survey responses
  - **Alerts:** Count of alerts triggered, % acted upon
  - **Satisfaction:** Average ratings, NPS-style score

**Given** metrics are displayed
**When** I view trends
**Then** I can see changes across testing cycles (week over week)
**And** data can be exported for reporting

**Given** I need to report to stakeholders
**When** I export data
**Then** I get a formatted report suitable for contract deliverables

---

### Story 10.7: Stress/Confidence Survey Instrument [CONTRACT]

As a **pilot tester**,
I want **to report my stress and confidence levels**,
So that **researchers can measure if the guide helps**.

**Acceptance Criteria:**

**Given** I start a pilot testing session
**When** I begin
**Then** I see a brief pre-survey:
  - "How confident do you feel about this visit?" (1-5)
  - "Current stress level?" (1-5)

**Given** I complete my visit
**When** I finish the session
**Then** I see a post-survey:
  - Same questions as pre-survey
  - "Did alerts help you prepare?" (yes/no/N/A)
  - "Would you use this again?" (yes/no)

**Given** surveys are completed
**When** data is analysed
**Then** pre/post comparisons show impact on stress/confidence

---

## Epic 11: Growth & Reporting (Backlog) [GROWTH STAGE]

> 📊 **Growth Stage:** Post-pilot features to support ongoing operations, stakeholder reporting, and contract documentation needs. Surfaces GA data in actionable format.

**Goal:** Provide super admins with reporting tools to generate documentation and stakeholder reports from GA analytics

**User Outcome:** Stakeholders receive professional reports with real usage data to demonstrate product value and fulfil contract deliverables

**FRs covered:** FR64-65

**Key Deliverables:**
- GA4 data surfaced in admin dashboard
- Exportable reports for contract documentation
- Usage trend visualisations

---

### Story 11.1: Super Admin GA Reporting Dashboard [GROWTH]

As a **super admin**,
I want **a reporting page that displays Google Analytics data**,
So that **I can see usage stats and generate reports for stakeholders**.

**Acceptance Criteria:**

**Given** I am a super admin
**When** I navigate to "Reports" section
**Then** I see a dashboard with GA4 data including:
  - Total guide views (all time, last 30 days, last 7 days)
  - Unique users
  - Top venues by views
  - Section expansion rates (which sections users engage with most)
  - Print button usage
  - Thumbs up/down ratios by venue
  - Geographic distribution of users

**Given** the dashboard loads
**When** I view metrics
**Then** data is pulled from GA4 API (or GA4 embed)
**And** I can filter by date range
**And** I can filter by specific venue(s)

**Given** GA4 data is unavailable
**When** the dashboard loads
**Then** I see a clear error with troubleshooting steps
**And** cached/last-known data shown if available

---

### Story 11.2: Contract Report Generator [GROWTH]

As a **super admin preparing contract deliverables**,
I want **to export usage statistics in a report-ready format**,
So that **I can include real data in documentation for stakeholders**.

**Acceptance Criteria:**

**Given** I am on the reporting dashboard
**When** I click "Generate Report"
**Then** I can select:
  - Report period (custom date range)
  - Venues to include (all or specific)
  - Metrics to include (checklist)

**Given** I configure and generate a report
**When** export completes
**Then** I receive a PDF/CSV with:
  - Executive summary with key figures
  - Usage trends (charts if PDF)
  - Per-venue breakdown
  - User engagement metrics
  - Feedback summary (thumbs up/down, survey responses)

**Given** I need data for contract Stage 6 metrics
**When** I generate a report
**Then** it includes specific sections for:
  - "Sensory Awareness Mode" engagement rates
  - Alert effectiveness (triggered vs acted upon)
  - User satisfaction scores
  - Stress/confidence improvements (from survey data)

---

### Story 11.3: Usage Trend Visualisations [GROWTH]

As a **super admin**,
I want **visual charts showing usage trends over time**,
So that **I can demonstrate growth and identify patterns**.

**Acceptance Criteria:**

**Given** I am viewing the reports dashboard
**When** I look at trends
**Then** I see line charts showing:
  - Daily/weekly active users over time
  - Guide views trend
  - New vs returning users

**Given** a pilot is running
**When** I view pilot-specific metrics
**Then** I can see week-over-week comparison for testing cycles
**And** overlay markers for iteration deployments

**Given** I want to share a chart
**When** I click export on a visualisation
**Then** I can download as PNG/SVG for reports

---

## Summary

**Total Epics:** 11
**Total Stories:** 73

| Epic | Stories | Theme |
|------|---------|-------|
| Epic 1: Project Foundation | 8 | Infrastructure & setup |
| Epic 2: Admin Auth & Venues | 12 | Authentication & sharing (incl. signup approval, venue name editing) |
| Epic 3: Guide Creation | 12 | PDF→Guide pipeline |
| Epic 4: Public Guide | 14 | User-facing guide experience (incl. preview summaries) |
| Epic 5: Print & Feedback | 9 | Print + analytics |
| Epic 6: Management & Super Admin | 11 | Ongoing management (incl. 6.0 lifecycle dashboard, super admin administration) |
| Epic 7: Polish & Quality | 8 | UX refinement |
| Epic 8: Testing & Docs | 6 | Quality assurance |
| Epic 9: Future Data Integration | 6 | Real-time data & personalisation [CONTRACT - Backlog] |
| Epic 10: Pilot & Evaluation | 7 | Adelaide Rail MVP + success metrics [CONTRACT - Backlog] |
| Epic 11: Growth & Reporting | 3 | GA stats dashboard + contract reports [GROWTH - Backlog] |

