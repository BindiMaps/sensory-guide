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
- FR20: Admin can view version history of published guides

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

**Index Page:**
- FR42: User can view BindiMaps information on landing page

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
| FR32-35 | Epic 5 | User Feedback & Analytics |
| FR36-39 | Epic 4 | Accessibility Compliance |
| FR40-41 | Epic 6 | Super Admin (Support Access) |
| FR42 | Epic 4 | Index Page |

**Coverage:** 42 FRs mapped ✅ (sequentially numbered, no gaps or duplicates)

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
**Then** they see the published guide content

**Given** I upload a new PDF to a published venue
**When** I preview and publish
**Then** the previous version is saved to version history
**And** the new guide replaces the live version

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

### Story 4.4: Accessibility Compliance

As an **end user with accessibility needs**,
I want **the guide to be fully accessible**,
So that **I can use it regardless of my abilities**.

**Acceptance Criteria:**

**Given** I am using keyboard only
**When** I navigate the guide
**Then** I can reach all interactive elements with Tab
**And** I can expand/collapse sections with Enter or Space
**And** focus indicators are clearly visible

**Given** I am using a screen reader
**When** I navigate the guide
**Then** all content is announced correctly
**And** sections have appropriate ARIA labels (expanded/collapsed state)
**And** images have descriptive alt text
**And** the page has semantic HTML structure (headings, landmarks)

**Given** I have reduced-motion enabled
**When** animations would normally play
**Then** they are disabled or reduced

**Given** the guide uses colour coding
**When** I view category badges or sections
**Then** icons and text accompany all colour indicators
**And** the guide is usable in greyscale

**And** Lighthouse accessibility score is ≥95

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

### Story 6.2: Version History

As an **admin user**,
I want **to view and restore previous versions of a guide**,
So that **I can recover from mistakes or compare changes**.

**Acceptance Criteria:**

**Given** I am on the venue edit page
**When** I click "Version History"
**Then** I see a list of previous versions with timestamps
**And** each version shows who published it

**Given** I select a previous version
**When** I click "Preview"
**Then** I see how that version looked

**Given** I want to restore an old version
**When** I click "Restore this version"
**Then** I see a confirmation dialog
**And** after confirming, the old version becomes the new draft
**And** I can preview and publish it

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

