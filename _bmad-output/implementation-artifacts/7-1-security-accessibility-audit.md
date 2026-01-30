# Story 7.1: Security & Accessibility Audit

Status: backlog

## Story

As a **product owner preparing for release**,
I want **comprehensive security and accessibility audits completed**,
so that **the application is safe from common vulnerabilities and usable by all users**.

## Acceptance Criteria

### Security Audit

1. **Given** any user input field (including admin-only fields)
   **When** a user enters potentially malicious input (XSS, injection attempts)
   **Then** the input is properly sanitised or rejected
   **And** no unsanitised user input is rendered as HTML

2. **Given** the venue slug input field
   **When** a user enters a slug value
   **Then** it is validated against a safe pattern (alphanumeric + hyphens only)
   **And** special characters are rejected with a clear error message

3. **Given** Firestore security rules
   **When** reviewed against OWASP guidelines
   **Then** all rules enforce proper authentication and authorisation
   **And** no data can be accessed or modified without proper permissions

4. **Given** any file upload functionality
   **When** a file is uploaded
   **Then** file type and size are validated server-side
   **And** malicious file content is rejected

5. **Given** all API/function endpoints
   **When** called by an authenticated user
   **Then** proper authorisation checks are performed
   **And** users can only access/modify their own data (or data they have editor access to)

### Accessibility Audit

6. **Given** all interactive elements
   **When** navigating with keyboard only
   **Then** all functionality is accessible without a mouse
   **And** focus indicators are clearly visible

7. **Given** all form inputs
   **When** rendered
   **Then** they have associated labels (visible or aria-label)
   **And** error states are announced to screen readers

8. **Given** all images and icons
   **When** rendered
   **Then** decorative images have empty alt text
   **And** meaningful images have descriptive alt text

9. **Given** the colour scheme
   **When** tested for contrast
   **Then** all text meets WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text)

10. **Given** the public guide pages
    **When** tested with a screen reader (VoiceOver/NVDA)
    **Then** content is announced in a logical order
    **And** interactive elements are properly labelled

## Tasks / Subtasks

- [ ] Task 1: Input Validation Audit (AC: #1, #2)
  - [ ] 1.1 Review all text input fields in admin UI
  - [ ] 1.2 Review slug input - ensure pattern validation
  - [ ] 1.3 Review venue name/description inputs
  - [ ] 1.4 Check for any dangerouslySetInnerHTML usage
  - [ ] 1.5 Document findings and fix any issues

- [ ] Task 2: Firestore Security Rules Audit (AC: #3)
  - [ ] 2.1 Review firestore.rules against OWASP guidelines
  - [ ] 2.2 Test rules with Firebase emulator for edge cases
  - [ ] 2.3 Document any gaps and remediate

- [ ] Task 3: File Upload Security (AC: #4)
  - [ ] 3.1 Review PDF upload validation (client + Cloud Function)
  - [ ] 3.2 Ensure MIME type checking is server-side
  - [ ] 3.3 Review Cloud Storage security rules

- [ ] Task 4: Auth/Authz Review (AC: #5)
  - [ ] 4.1 Review all Cloud Functions for auth checks
  - [ ] 4.2 Review client-side route guards
  - [ ] 4.3 Test that users cannot access other users' venues

- [ ] Task 5: Keyboard Accessibility (AC: #6)
  - [ ] 5.1 Tab through all admin flows
  - [ ] 5.2 Tab through all public guide flows
  - [ ] 5.3 Document and fix focus trap issues

- [ ] Task 6: Form Accessibility (AC: #7)
  - [ ] 6.1 Audit all forms for label associations
  - [ ] 6.2 Test error announcements with screen reader
  - [ ] 6.3 Fix any missing labels/aria attributes

- [ ] Task 7: Image Alt Text Audit (AC: #8)
  - [ ] 7.1 Review all img tags and Icon components
  - [ ] 7.2 Add appropriate alt text where missing

- [ ] Task 8: Colour Contrast Audit (AC: #9)
  - [ ] 8.1 Run automated contrast checker
  - [ ] 8.2 Manually verify against design system
  - [ ] 8.3 Fix any contrast failures

- [ ] Task 9: Screen Reader Testing (AC: #10)
  - [ ] 9.1 Test public guide with VoiceOver (macOS)
  - [ ] 9.2 Test admin dashboard with VoiceOver
  - [ ] 9.3 Document and fix announcement issues

## Dev Notes

### Key Files to Review

**Input Fields (Security):**
- `app/src/features/admin/VenueDetail.tsx` - venue settings, slug input, editors
- `app/src/features/admin/CreateVenue.tsx` - new venue form
- `app/src/features/admin/guides/*.tsx` - guide editing forms

**Security Rules:**
- `app/firestore.rules`
- `app/storage.rules`
- `app/functions/src/**` - all Cloud Functions

**Accessibility:**
- All components in `app/src/features/`
- Design system tokens in `_bmad-output/planning-artifacts/design-system-v5.md`

### Tools to Use

- **Security**: OWASP ZAP, manual code review
- **Accessibility**: axe DevTools, Lighthouse, VoiceOver, keyboard testing

### References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Firebase Security Rules: https://firebase.google.com/docs/rules
