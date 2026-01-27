---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
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
- FR5: User can expand/collapse content sections by sensory category
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
- FR16: Admin can flag individual sections for regeneration
- FR17: Admin can provide guidance text when flagging sections
- FR18: System regenerates flagged sections incorporating admin guidance
- FR19: Admin can publish guide to make it publicly accessible
- FR20: Admin can copy shareable URL after publishing
- FR21: Admin can update existing guide by uploading new PDF
- FR22: Admin can view version history of published guides
- FR23: Admin can flag PDF quality issues for template improvement feedback

**Content Suggestions (Admin):**
- FR24: System generates content improvement suggestions after LLM transform
- FR25: Admin can view suggestions as bullet list via "Show Suggestions" button
- FR26: Admin can re-upload updated PDF to incorporate suggestions

**Organisation Management:**
- FR27: Admin can access only venues within their organisation
- FR28: Organisation can manage multiple venues
- FR29: Organisation can have multiple admin users
- FR30: System enforces organisation data boundaries

**Authentication:**
- FR31: Admin can authenticate to access admin portal
- FR32: System restricts admin features to authenticated users
- FR33: Public guides are accessible without authentication

**User Feedback & Analytics:**
- FR34: User can submit thumbs up/down feedback on guide (via GA events)
- FR35: System records page views per venue (via GA)
- FR36: System records section expansion events (via GA)
- FR37: System records print button usage (via GA)

**Accessibility Compliance:**
- FR38: User can navigate entire guide using keyboard only
- FR39: User can consume guide content via screen reader
- FR40: System respects prefers-reduced-motion setting
- FR41: System uses icons + text alongside colour indicators

**Index Page:**
- FR42: User can view BindiMaps information on landing page

**Super Admin (Global Management):**
- FR43: Super Admin can create and manage organisations
- FR44: Super Admin can set and adjust LLM usage quotas per organisation
- FR45: Super Admin can view all venues across all organisations (support access)
- FR46: Super Admin can view global analytics and system health
- FR47: Super Admin can manage organisation billing/status (active, suspended, etc.)

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
- NFR15: Organisation data boundaries enforced (Integration tests)

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
- AR5: Firestore for metadata (orgs, users, venues), LLM usage counters, audit logs
- AR6: Public guides served as static JSON from Storage URLs (no Firebase SDK)
- AR7: Zod for data validation and LLM output validation

**From Architecture - Authentication & Security:**
- AR8: Firebase Custom Claims for authorisation (superAdmin, orgId, role)
- AR9: Force token refresh on role change
- AR10: Rate limiting via Firestore counter (per-user daily cap MVP, per-org quotas growth)
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
| FR5-9 | Epic 4 | Guide Content Display |
| FR10-12 | Epic 5 | Print & Export |
| FR13-20 | Epic 3 | Content Management (Create/Publish) |
| FR21-23 | Epic 6 | Content Management (Update/Versioning) |
| FR24-26 | Epic 3 | Content Suggestions |
| FR27-30 | Epic 2 | Organisation Management |
| FR31-33 | Epic 2 | Authentication |
| FR34-37 | Epic 5 | User Feedback & Analytics |
| FR38-41 | Epic 4 | Accessibility Compliance |
| FR42 | Epic 4 | Index Page |
| FR43-47 | Epic 6 | Super Admin |

**Coverage:** 47/47 FRs mapped ✅

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

### Epic 1: Project Foundation
**Goal:** Deployable app shell with CI/CD quality gates in place

**User Outcome:** Development team has a working, deployable foundation with automated quality enforcement.

**FRs covered:** None directly (infrastructure enabling all future work)

**Key Deliverables:**
- Vite + React + TypeScript project initialised
- shadcn/ui configured with Tailwind
- Firebase project setup (dev environment)
- GitHub Actions CI pipeline (lint, test, build, Lighthouse, yarn audit)
- Basic routing structure (`/`, `/admin`, `/venue/:slug`)
- Deployable to Firebase Hosting

---

### Epic 2: Admin Authentication & Multi-Tenancy
**Goal:** Admins can securely log in and access only their organisation's data

**User Outcome:** Admin users can authenticate and the system enforces organisation boundaries.

**FRs covered:** FR27-33 (Organisation Management + Authentication)

**Key Deliverables:**
- Firebase Auth integration
- Login/logout flow
- Custom claims for org membership and roles
- Firestore security rules enforcing org isolation
- Protected admin routes
- Basic admin layout/shell

---

### Epic 3: Guide Creation & Publishing
**Goal:** Admin can upload PDF → get LLM-transformed content → preview → publish a live guide

**User Outcome:** Admins can create and publish Sensory Guides from PDF audits.

**FRs covered:** FR13-20, FR24-26 (Content Management + Suggestions)

**Key Deliverables:**
- PDF upload to Cloud Storage (signed URLs)
- Gemini LLM transformation with progress updates
- Guide preview interface
- Section flagging and regeneration
- Publish flow (JSON to Storage, venue metadata to Firestore)
- Shareable URL generation
- Content suggestions display

---

### Epic 4: Public Guide Experience
**Goal:** End users can view, navigate, and interact with a published Sensory Guide

**User Outcome:** People with sensory sensitivities can access and use guides to plan venue visits.

**FRs covered:** FR1-9, FR38-42 (Venue Discovery + Display + Accessibility + Index)

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

**FRs covered:** FR10-12, FR34-37 (Print + Analytics)

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
**Goal:** Admins can maintain guides over time; Super Admins can manage the platform

**User Outcome:** Guides stay current; platform can scale to multiple organisations.

**FRs covered:** FR21-23, FR43-47 (Guide Updates + Super Admin)

**Key Deliverables:**
- Guide update via new PDF upload
- Version history viewing
- Section-level regeneration
- PDF quality flagging
- Super Admin: create/manage organisations
- Super Admin: LLM quota management
- Super Admin: view all venues (support access)
- Super Admin: global analytics
- Super Admin: org status management

---

## Stories

### 🚧 IN PROGRESS: Story creation paused after Epic 1 proposal

**Resume point:** Epic 1 stories proposed, awaiting user review before writing full acceptance criteria.

**Proposed Epic 1 Stories (pending approval):**
- Story 1.1: Initialise React Project with Vite and TypeScript
- Story 1.2: Firebase Project Setup and Local Development
- Story 1.3: CI/CD Pipeline with Quality Gates
- Story 1.4: Basic Routing and App Shell

