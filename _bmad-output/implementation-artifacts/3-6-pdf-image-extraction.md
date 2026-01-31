# Story 3.6: PDF Image Extraction

Status: complete

---

## Story

As an **admin user**,
I want **images from my PDF audit document to be automatically extracted and included in the guide**,
So that **end users can see photos of venue areas alongside sensory descriptions**.

---

## Acceptance Criteria

1. **Given** a PDF contains embedded images, **When** the LLM transformation runs, **Then** images are extracted and stored in Cloud Storage at `/venues/{venueId}/images/`

2. **Given** images are extracted, **When** the guide JSON is generated, **Then** images are associated with their corresponding sections based on PDF position (image appears between section title and next title)

3. **Given** the PDF has no extractable images, **When** transformation completes, **Then** the guide is still valid with empty `imageUrl` fields (graceful degradation)

4. **Given** images are extracted, **When** I view the guide preview, **Then** I see images displayed within their associated sections

---

## Technical Approach: Positional Matching

### Core Insight

PDF structure tells us which section an image belongs to:
- Image appears AFTER a section title
- Image appears BEFORE the next section title
- Therefore: image belongs to that section

```
"Entry Hall"        ← Title A (page 2, y=100)
   [IMAGE]          ← page 2, y=150 → belongs to Entry Hall
   [IMAGE]          ← page 2, y=200 → belongs to Entry Hall
"Main Concourse"    ← Title B (page 2, y=300)
   [IMAGE]          ← page 2, y=350 → belongs to Main Concourse
"Platforms"         ← Title C (page 3, y=50)
```

### Pipeline

```
PDF Buffer
    │
    ├──→ pdf.js extracts TEXT with positions [(text, page, y), ...]
    │
    ├──→ pdf.js extracts IMAGES with positions [(imageData, page, y), ...]
    │
    ↓
Build position map:
    - Identify headings (by font size, bold, or pattern matching)
    - For each image, find: heading.y < image.y < nextHeading.y
    - Result: { "Entry Hall": [img1, img2], "Main Concourse": [img3] }
    │
    ↓
Send TEXT to Gemini → returns section structure with IDs
    │
    ↓
Match sections by name: Gemini's "Entry Hall" ↔ position map's "Entry Hall"
    │
    ↓
Upload images to Storage: /venues/{venueId}/images/{sectionId}-{index}.jpg
    │
    ↓
Set imageUrl fields in guide JSON
```

---

## Tasks / Subtasks

- [x] **Task 1: Add pdf.js (pdfjs-dist) for positional parsing**
  - [x] Uses pdf-parse v2 (already installed) which wraps pdfjs-dist
  - [x] Created `extractPdfContent()` function - returns images grouped by page
  - [x] Handle PDF parsing errors gracefully

- [x] **Task 2: Build heading detection logic**
  - [x] Implemented `detectHeadings()` using font size ratio
  - [x] Fallback: page-order mapping when no headings detected
  - [x] Returns ordered list of headings with positions

- [x] **Task 3: Create image-to-section mapping**
  - [x] `mapImagesToSections()` matches images to headings
  - [x] `mapImagesByPageOrder()` fallback for simple PDFs
  - [x] Handle edge cases: images before first heading, multiple images per section

- [x] **Task 4: Upload images to Cloud Storage**
  - [x] Generate filename: `{sectionId}-{index}.png`
  - [x] Upload to `/venues/{venueId}/images/`
  - [x] Set cache headers, content type
  - [x] Return public URLs via `uploadBatchImages()`

- [x] **Task 5: Integrate with existing transform pipeline**
  - [x] Downloads PDF buffer once, uses for both text and image extraction
  - [x] `processPdfImages()` runs after Gemini, attaches URLs to guide
  - [x] Added `images: string[]` to `areaSchema` for section-level images
  - [x] Backward compatible - works with or without images

- [x] **Task 6: Update Gemini prompt (minor)**
  - [x] Added instruction to preserve section titles exactly as they appear in PDF
  - [x] Helps with section-to-image matching

- [x] **Task 7: Add tests**
  - [x] Unit tests for heading detection (17 tests in imageMapping.test.ts)
  - [x] Unit tests for image-to-section mapping
  - [x] `yarn test:pdf` script for integration testing with real PDF
  - [x] Test graceful degradation (PDF with no images returns empty arrays)
  - [x] All 252 tests passing (50 functions + 202 frontend)

---

## Dev Notes

### Why pdf.js?

| Library | Position Data | Images | Node.js | Notes |
|---------|--------------|--------|---------|-------|
| pdf-parse | ❌ | ❌ | ✅ | Current - text only |
| pdfjs-dist | ✅ | ✅ | ✅ | Mozilla's lib, battle-tested |
| pdf2json | ✅ | ⚠️ | ✅ | Positions yes, image extraction limited |
| pdf-lib | ❌ | ✅ | ✅ | Good for images, no positions |

**pdfjs-dist** gives us both text positions AND image extraction in one library.

### Heading Detection Strategies

1. **Font size**: Headings typically larger than body text
2. **Bold/weight**: Headings often bold
3. **Pattern matching**: "Entry Hall", "Main Concourse" etc.
4. **Gemini assistance**: Ask Gemini to return exact heading text it found

### Edge Cases

| Case | Handling |
|------|----------|
| Image before first heading | Attach to first section or skip |
| Image after last heading | Attach to last section |
| Multiple images per section | Array of imageUrls, or pick first |
| Image spans page break | Use page + y to determine section |
| No images in PDF | Return guide with no imageUrls (current behavior) |
| Heading text mismatch | Fuzzy match or skip image |

### Cloud Storage Structure

```
/venues/{venueId}/
  uploads/{timestamp}_{logId}.pdf
  images/
    entry-hall-0.jpg        # First image in Entry Hall section
    entry-hall-1.jpg        # Second image
    main-concourse-0.jpg
  versions/{timestamp}.json
```

### Schema (No Changes Needed)

```ts
// Already supports imageUrl
sensoryDetailSchema = z.object({
  category: sensoryCategorySchema,
  level: sensoryLevelSchema,
  description: z.string(),
  imageUrl: z.string().url().optional(),  // ← Already here
})
```

**Decision needed:** Should `imageUrl` be on `sensoryDetailSchema` (per-detail) or `areaSchema` (per-section)?

Current schema has it on detail. May want to add `images: string[]` to `areaSchema` for section-level images.

---

## References

- [Source: app/functions/src/transforms/transformPdf.ts] - Current pipeline to modify
- [Source: app/functions/src/utils/gemini.ts] - LLM integration
- [Source: app/src/lib/schemas/guideSchema.ts] - Schema with imageUrl
- [Source: app/src/shared/components/guide/SensoryDetail.tsx] - Display code (already done)
- [pdfjs-dist npm](https://www.npmjs.com/package/pdfjs-dist) - PDF.js for Node

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- `yarn test:pdf` - Tests extraction against ExampleMappingNotes.pdf (7 pages, 7 images)

### Completion Notes List

1. **Simplified approach**: Used pdf-parse v2 for image extraction (already installed) instead of raw pdfjs-dist due to worker setup complexity in Node.js
2. **Page-text mapping**: Scans each page for known section titles to determine which section the page belongs to. Correctly handles: sections starting mid-page, sections without images, multiple images per section, sections spanning multiple pages
3. **Schema change**: Added `images: string[]` to `areaSchema` (section-level images vs per-detail)
4. **UI updated**: `AreaSection.tsx` displays images in a horizontal scroll when section is expanded
5. **Final fix**: Replaced `extractPageHeadings()` (first-line only) with `findSectionTitlesInPage()` (scans ALL lines for matches to known section titles)

### File List

**New files:**
- `app/functions/src/utils/extractPdfContent.ts` - PDF content extraction (text + images)
- `app/functions/src/utils/imageMapping.ts` - Heading detection and image-to-section mapping
- `app/functions/src/utils/imageMapping.test.ts` - Unit tests (17 tests)
- `app/functions/src/utils/imageStorage.ts` - Cloud Storage upload utilities
- `app/functions/src/utils/pdfImagePipeline.ts` - Orchestrates the complete pipeline
- `app/functions/scripts/test-pdf-extraction.ts` - Integration test script

**Modified files:**
- `app/functions/src/transforms/transformPdf.ts` - Integrated image pipeline
- `app/functions/src/utils/gemini.ts` - Updated prompt for section title preservation
- `app/functions/package.json` - Added vitest, tsx, test scripts
- `app/src/lib/schemas/guideSchema.ts` - Added `images` field to areaSchema
- `app/src/shared/components/guide/AreaSection.tsx` - Display images in sections
- `app/src/shared/components/guide/AreaSection.test.tsx` - Updated for new schema
- `app/src/features/admin/guides/GuidePreview.test.tsx` - Updated for new schema
- `app/src/shared/components/guide/GuideContent.test.tsx` - Updated for new schema

---

## Change Log

- 2026-01-31: Story created with positional matching approach
- 2026-01-31: Implemented full pipeline (extract → map → upload → attach to guide)
- 2026-01-31: Fixed mapping by scanning ALL page text for section titles (not just first line)
