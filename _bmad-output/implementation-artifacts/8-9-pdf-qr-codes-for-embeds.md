# Story 8.9: PDF QR Codes for Embeds

Status: done

---

## Story

As an **end user viewing a printed guide**,
I want **QR codes to appear next to sections that have embedded maps**,
So that **I can scan them with my phone and access the interactive map even from a printed PDF**.

---

## Acceptance Criteria

1. **Given** a section has one or more embedUrls, **When** the PDF is generated, **Then** a QR code linking to the first embed URL appears in the section

2. **Given** a section has no embedUrl, **When** the PDF is generated, **Then** no QR code is shown for that section

3. **Given** I scan a QR code with my phone, **When** the QR decodes, **Then** it opens the embed URL directly (BindiWeb map, YouTube, etc.)

4. **Given** a QR code is displayed, **When** I view it in the PDF, **Then** it has a label like "Scan for interactive map" to explain its purpose

5. **Given** the PDF is printed, **When** I view the QR code, **Then** it is large enough to scan reliably (minimum ~60px)

---

## Technical Approach

### QR Code Library

Use `qrcode` npm package with `toDataURL()` for base64 PNG generation compatible with `@react-pdf/renderer`'s `<Image>` component.

```typescript
import QRCode from 'qrcode'

const qrDataUrl = await QRCode.toDataURL(embedUrl, {
  width: 80,
  margin: 1,
  errorCorrectionLevel: 'M',
})
```

### PDF Integration

Add QR code to the section header or as a sidebar element in GuidePdf.tsx:

```tsx
// In area section
{embedUrl && qrDataUrls[area.id] && (
  <View style={styles.qrContainer}>
    <Image src={qrDataUrls[area.id]} style={styles.qrCode} />
    <Text style={styles.qrLabel}>Scan for map</Text>
  </View>
)}
```

### Data Flow

1. Before rendering PDF, pre-generate all QR codes as data URLs
2. Pass `qrDataUrls` map to GuidePdf component
3. GuidePdf renders QR images using the pre-generated data URLs

### Design System v5 Styling

- QR code size: 60-80px (scannable at print resolution)
- Label: 8px, uppercase, muted colour
- Position: Right side of section header (aligned with level badge)

---

## Tasks / Subtasks

- [x] **Task 1: Install qrcode package**
  - [x] Add `qrcode` and `@types/qrcode` to app dependencies
  - [x] Verify build passes

- [x] **Task 2: Create QR code generation utility**
  - [x] Create `app/src/shared/utils/qrCode.ts` with `generateQRCodeDataUrl(url: string): Promise<string>`
  - [x] Configure sensible defaults (80px, M error correction)
  - [x] Add unit tests for the utility

- [x] **Task 3: Generate QR codes before PDF render**
  - [x] In DownloadPdfButton.tsx, pre-generate QR data URLs for all areas with embedUrls
  - [x] Pass `qrDataUrls` map to GuidePdf component
  - [x] Handle errors gracefully (missing QR = no QR shown)

- [x] **Task 4: Render QR codes in GuidePdf**
  - [x] Add `qrDataUrls?: Record<string, string>` prop to GuidePdf
  - [x] Add styles for QR container (position, size, label)
  - [x] Render QR Image + label when area has embed and QR data

- [x] **Task 5: Add tests**
  - [x] Unit test for QR generation utility (10 tests)
  - [x] GuidePdf test with mock QR data URLs (5 tests)
  - [x] Integration coverage via utility tests for area processing

---

## Dev Notes

### File References

- `app/src/shared/components/guide/GuidePdf.tsx` - Main PDF component
- `app/src/shared/components/guide/DownloadPdfButton.tsx` - Pre-generation point
- `app/src/shared/utils/colours.ts` - Design system colours
- `_bmad-output/planning-artifacts/design-system-v5.md` - Design reference

### Party Log Context

From `_bmad-output/party-log.md` discussion on Story 6.5:
> "Print handling - Static snapshot vs QR code to live map?"
> "qr code is a good idea"

This story implements the party log decision.

### Edge Cases

| Case | Handling |
|------|----------|
| Very long embed URL | QR still works, just denser pattern |
| Multiple embeds per section | Only first embed gets QR (v1) |
| QR generation fails | Skip QR, no error shown |
| Invalid URL | QR still generates (decoding is user's problem) |

### Accessibility

- QR code Image should have alt text describing its purpose
- Label provides context for sighted users
- QR is supplemental - embed is always visible in web view

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [x] QR code sized appropriately (60px)
- [x] Label uses muted text colour (#595959)
- [x] Positioned to not interfere with section content (after details, before next section)
- [x] Consistent with overall PDF styling (surface background, rounded corners)

---

## References

- [Source: _bmad-output/party-log.md] - QR code decision
- [Source: _bmad-output/implementation-artifacts/6-5-section-embed-urls.md] - Embed URLs story
- [Source: app/src/shared/components/guide/GuidePdf.tsx] - PDF component

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

- All 5 tasks completed successfully
- 359 tests passing (15 new tests added: 10 for qrCode utility, 5 for GuidePdf)
- Build passes
- QR codes are generated lazily during PDF generation (not blocking initial page load)
- QR generation runs in parallel with module lazy-loading for optimal performance
- Fixed pre-existing TypeScript errors in Epic 8 code (getOverallLevel signature, unused imports)

### File List

**New Files:**
- `app/src/shared/utils/qrCode.ts` - QR code generation utility
- `app/src/shared/utils/qrCode.test.ts` - 10 tests
- `app/src/shared/components/guide/GuidePdf.test.tsx` - 5 tests

**Modified Files:**
- `app/package.json` - Added qrcode and @types/qrcode dependencies
- `app/src/shared/components/guide/GuidePdf.tsx` - Added qrDataUrls prop and QR rendering
- `app/src/shared/components/guide/DownloadPdfButton.tsx` - Pre-generate QR codes before PDF render

**Incidental Fixes (Epic 8 code):**
- `app/src/shared/components/guide/GuidePdf.tsx` - Fixed getOverallLevel call signature
- `app/src/shared/components/guide/GuideContent.tsx` - Removed unused CategoryBadge import
- `app/src/shared/components/guide/GuideContent.test.tsx` - Removed unused mock

---

## Change Log

- 2026-02-03: Story created - QR codes for embed URLs in PDF output
- 2026-02-03: Implementation complete - all tasks done, 359 tests passing
