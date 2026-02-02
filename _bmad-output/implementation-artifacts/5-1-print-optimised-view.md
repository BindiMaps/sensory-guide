# Story 5.1: Print-Optimised View

Status: done

## Story

As an **end user**,
I want **to print a Sensory Guide**,
So that **I can have a physical copy for my visit**.

## Acceptance Criteria

1. **Given** I am viewing a guide
   **When** I click the "Print" button
   **Then** the browser print dialog opens
   **And** the print layout is clean (no navigation, no footer chrome)
   **And** all sections are automatically expanded
   **And** images are included and print-friendly
   **And** page breaks occur at sensible points (not mid-section)

2. **Given** I am printing to PDF
   **When** I save the file
   **Then** the PDF is readable and well-formatted

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

### Print Styles (from design-system-v5.md)

> When `@media print`:
> - Hide header, skip link
> - Expand all sections automatically
> - Remove toggle indicators
> - Full width, minimal padding

**Design Checklist**:
- [ ] All colours match design system tokens exactly
- [ ] Typography (font, size, weight) matches design system
- [ ] Print removes sticky header, skip link, footer
- [ ] All AreaSections rendered expanded (no collapsed state)
- [ ] Toggle chevrons/indicators hidden in print
- [ ] Page breaks avoid orphans/widows (avoid-break-inside on sections)

**Accessibility Checklist**:
- [ ] Print button has visible text label (not icon-only)
- [ ] Button meets min 44px touch target
- [ ] Focus ring visible on keyboard navigation
- [ ] `aria-label` describes action if button text is short

## Tasks / Subtasks

- [ ] Task 1: Add Print button to GuidePage header (AC: #1)
  - [ ] 1.1 Create `PrintButton.tsx` component in `src/shared/components/guide/`
  - [ ] 1.2 Button triggers `window.print()` on click
  - [ ] 1.3 Button styled per design system (border button style, 44px min height)
  - [ ] 1.4 Button text: "Print" with optional printer icon + text (never icon-only)
  - [ ] 1.5 Visible focus ring using `focus-visible:ring-2 focus-visible:ring-[#B8510D]`
  - [ ] 1.6 Add to GuidePage.tsx in header area (after skip-link, before main content)

- [ ] Task 2: Create print stylesheet (AC: #1, #2)
  - [ ] 2.1 Create `print.css` or add `@media print` rules to existing styles
  - [ ] 2.2 Hide elements: skip-link, sticky header, footer, expand/collapse all button
  - [ ] 2.3 Hide AreaSection toggle chevrons/indicators
  - [ ] 2.4 Force all AreaSection content visible (override collapsed state)
  - [ ] 2.5 Remove interactive hover/focus states (not needed in print)
  - [ ] 2.6 Set body to full width, minimal margins/padding for print
  - [ ] 2.7 Add `break-inside: avoid` to AreaSection and FacilitiesSection
  - [ ] 2.8 Ensure images scale appropriately (max-width: 100%)

- [ ] Task 3: Print state management (AC: #1)
  - [ ] 3.1 Ensure sections expand for print without altering visible state
  - [ ] 3.2 Option A: Pure CSS `.print\:block` for hidden content
  - [ ] 3.3 Option B: `beforeprint` event to temporarily expand all, `afterprint` to restore
  - [ ] 3.4 Test: user's collapsed sections remain collapsed after print dialog closes

- [ ] Task 4: Write tests (AC: all)
  - [ ] 4.1 Unit test: PrintButton renders, calls window.print on click
  - [ ] 4.2 Integration test: Print button visible on GuidePage
  - [ ] 4.3 Visual regression: print media query snapshot (if Playwright supports)
  - [ ] 4.4 a11y test: button has accessible name, meets contrast

## Dev Notes

### Architecture Compliance

- **NO Firebase SDK** in public bundle - this story is pure frontend, no backend changes
- Keep bundle size minimal - no new heavy dependencies
- Follow design-system-v5.md exactly for button styling

### File Structure

```
src/
  features/
    public/
      guide/
        GuidePage.tsx          # Add PrintButton here
  shared/
    components/
      guide/
        PrintButton.tsx        # NEW - Print button component
        PrintButton.test.tsx   # NEW - Co-located test
        AreaSection.tsx        # Add print:block for collapsed content
```

### Implementation Approach

**Recommended: CSS-only print expansion**

Use Tailwind's `print:` variant to force visibility:

```tsx
// AreaSection.tsx - content wrapper
<div className={cn(
  expanded ? 'block' : 'hidden',
  'print:block'  // Always visible in print
)}>
```

This avoids JavaScript complexity with beforeprint/afterprint events and keeps sections visually collapsed for screen users.

**PrintButton Pattern:**

```tsx
<button
  type="button"
  onClick={() => window.print()}
  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#DDDDD9] text-[#3D3D3D] rounded hover:bg-[#F8F8F6] font-medium text-sm min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2 print:hidden"
>
  Print
</button>
```

### Hide Elements in Print

```css
@media print {
  /* Skip link, footer, interactive controls */
  .print\:hidden { display: none !important; }

  /* Force sections expanded */
  .print\:block { display: block !important; }

  /* Page break control */
  .print\:break-inside-avoid { break-inside: avoid; }
}
```

### Previous Story Learnings (from 4-4)

- All a11y patterns already established in codebase
- Focus rings use `focus-visible:ring-2 focus-visible:ring-[#B8510D] focus-visible:ring-offset-2`
- Button touch targets already 44px+ throughout
- prefers-reduced-motion already respected
- Semantic HTML patterns established

### Testing Standards

- Co-located tests: `PrintButton.test.tsx` next to `PrintButton.tsx`
- Use Vitest + RTL for unit tests
- Test `window.print()` call with mock
- Run Pa11y after implementation to verify zero violations

### References

- [Source: design-system-v5.md#Print Styles]
- [Source: project-context.md#Frontend Patterns]
- [Source: epics.md#Epic 5: Print & Feedback]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

**Pivoted from CSS print approach to PDF generation:**
- Initial CSS `@media print` approach was rejected as "looking bad"
- Implemented `@react-pdf/renderer` for proper PDF generation
- PDF is lazy-loaded (1.5MB) to keep main bundle small (~960KB)

**Final Implementation:**
- Two buttons: "Print" (opens print dialog directly via iframe) and "Save" (downloads PDF)
- Uses Helvetica font (built-in) - CDN fonts caused DataView errors
- PDF includes: venue header, category badges, areas with sensory details, facilities, sensory key
- Design System v5 colours applied throughout

**Issues Resolved:**
- Buffer polyfill for Vite/browser compatibility
- Font italic variant error (removed italic styling)
- DataView error with CDN fonts (switched to Helvetica)

### File List

**Created:**
- `app/src/shared/components/guide/GuidePdf.tsx` - PDF document component
- `app/src/shared/components/guide/DownloadPdfButton.tsx` - GuidePdfActions component with Print + Save buttons
- `app/src/shared/components/guide/DownloadPdfButton.test.tsx` - Unit tests

**Modified:**
- `app/src/shared/components/guide/index.ts` - Export GuidePdfActions
- `app/src/features/public/guide/GuidePage.tsx` - Added GuidePdfActions to header
- `app/vite.config.ts` - Buffer polyfill for react-pdf
- `app/package.json` - Added @react-pdf/renderer, buffer dependencies
