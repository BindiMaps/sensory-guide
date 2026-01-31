# Story 3.6: PDF Image Extraction

Status: backlog

---

## Story

As an **admin user**,
I want **images from my PDF audit document to be automatically extracted and included in the guide**,
So that **end users can see photos of venue areas alongside sensory descriptions**.

---

## Acceptance Criteria

1. **Given** a PDF contains embedded images, **When** the LLM transformation runs, **Then** images are extracted and stored in Cloud Storage at `/venues/{venueId}/images/`

2. **Given** images are extracted, **When** the guide JSON is generated, **Then** relevant images are associated with their corresponding areas/details via `imageUrl` fields

3. **Given** the PDF has no extractable images, **When** transformation completes, **Then** the guide is still valid with empty `imageUrl` fields (graceful degradation)

4. **Given** images are extracted, **When** I view the guide preview, **Then** I see images displayed within their associated sections

---

## Design Validation

**Design System Reference**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Design Checklist** (for UI stories):
- [x] N/A - Backend story, display already implemented in SensoryDetail.tsx

---

## Implementation Analysis

### Already Implemented

| Requirement | Status | Location |
|-------------|--------|----------|
| Image display in sections | ✅ DONE | `SensoryDetail.tsx:20-27` |
| Image alt text | ✅ DONE | `SensoryDetail.tsx:24` |
| Schema supports imageUrl | ✅ DONE | `guideSchema.ts:18` - `imageUrl: z.string().url().optional()` |
| Cloud Storage structure | ✅ DONE | Architecture defines `/venues/{venueId}/images/` |

### Gaps to Implement

| Gap | Location | Implementation |
|-----|----------|----------------|
| PDF image extraction | `transformPdf.ts` | Use pdf-lib or Gemini Vision to extract images |
| Image upload to Storage | `transformPdf.ts` | Upload extracted images to `/venues/{venueId}/images/` |
| Image URL generation | `transformPdf.ts` | Get public URLs for uploaded images |
| LLM image association | `gemini.ts` | Tell Gemini about available images, let it associate with areas |
| Fallback for no images | `transformPdf.ts` | Handle PDFs with no extractable images gracefully |

---

## Technical Approaches

### Option A: Gemini Vision (Recommended)

Use Gemini's multimodal capabilities to process PDF with images:

```ts
// Send PDF as file input to Gemini
const result = await model.generateContent([
  SYSTEM_PROMPT,
  {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdfBuffer.toString('base64')
    }
  }
])
```

**Pros:**
- Gemini can see images AND associate them with content
- No separate image extraction library needed
- Better context for image-to-area mapping

**Cons:**
- Higher token usage (images cost tokens)
- May need Gemini 2.0 Flash for PDF support

### Option B: Separate Image Extraction

1. Use pdf-lib or pdf.js to extract images from PDF
2. Upload images to Storage, get URLs
3. Pass image URLs to Gemini in prompt
4. Gemini associates URLs with areas

**Pros:**
- More control over image handling
- Can filter/resize images before storage

**Cons:**
- More complex implementation
- LLM has to match images to content without seeing them

### Option C: Manual Image Upload (Simplest MVP)

1. Keep current text-only transformation
2. Add separate "Upload Images" UI in admin
3. Admin manually associates images with sections

**Pros:**
- Simplest to implement
- No change to LLM pipeline

**Cons:**
- Manual work for admins
- Defeats purpose of automated transformation

---

## Tasks / Subtasks

### If Option A (Gemini Vision):

- [ ] **Task 1: Research Gemini PDF multimodal support**
  - [ ] Verify Gemini 2.5 Pro or 2.0 Flash supports PDF input
  - [ ] Test token costs for PDF with images
  - [ ] Check if extracted image URLs are returned or need separate handling

- [ ] **Task 2: Update transformPdf to send PDF as multimodal input**
  - [ ] Modify `transformPdfToGuide` to accept PDF buffer
  - [ ] Send PDF as inline data instead of text-only
  - [ ] Update system prompt to describe images

- [ ] **Task 3: Update schema/prompt for image associations**
  - [ ] Update LLM prompt to output imageUrl fields
  - [ ] Handle case where Gemini references images by position/description

- [ ] **Task 4: Extract and store images separately (if needed)**
  - [ ] If Gemini can't return image URLs, extract images post-processing
  - [ ] Upload to `/venues/{venueId}/images/{hash}.{ext}`
  - [ ] Map Gemini's image references to Storage URLs

- [ ] **Task 5: Add tests**
  - [ ] Test PDF with images produces imageUrl fields
  - [ ] Test PDF without images works (graceful degradation)
  - [ ] Test image Storage paths are correct

### If Option B (Separate Extraction):

- [ ] **Task 1: Add PDF image extraction**
  - [ ] Install pdf-lib or similar
  - [ ] Extract embedded images from PDF buffer
  - [ ] Handle various image formats (JPEG, PNG)

- [ ] **Task 2: Upload images to Cloud Storage**
  - [ ] Generate unique filenames (hash or UUID)
  - [ ] Upload to `/venues/{venueId}/images/`
  - [ ] Set appropriate cache headers
  - [ ] Get public URLs

- [ ] **Task 3: Update LLM prompt**
  - [ ] Pass list of available image URLs to Gemini
  - [ ] Ask Gemini to associate images with areas by description
  - [ ] Handle partial matching (some images may not match)

- [ ] **Task 4: Add tests**
  - [ ] Unit test image extraction
  - [ ] Integration test full pipeline with images

---

## Dev Notes

### Architecture Patterns (MUST FOLLOW)

**Cloud Storage Structure:**
```
/venues/{venueId}/
  uploads/{timestamp}_{logId}.pdf
  images/{hash}.jpg           # ← NEW: Extracted images
  images/{hash}.png
  versions/{timestamp}.json
```

**Image Naming:**
- Use content hash for deduplication
- Or UUID if hashing is complex
- Include extension for content-type

**Public URL Pattern:**
```
https://storage.googleapis.com/{bucket}/venues/{venueId}/images/{filename}
```

### Current Pipeline (for reference)

```
PDF Upload → extractPdfText() → transformPdfToGuide() → storeGuideJson()
                 ↑                      ↑
           TEXT ONLY            TEXT TO LLM

Needs to become:

PDF Upload → extractPdfContent() → transformPdfToGuide() → storeGuideJson()
                 ↑                      ↑
           TEXT + IMAGES         MULTIMODAL OR
                                 TEXT + IMAGE URLS
```

### Rate Limiting Consideration

- Images increase token usage significantly
- May need to adjust rate limits or warn users
- Consider image count/size limits

### Schema Already Supports Images

```ts
// guideSchema.ts - No changes needed
sensoryDetailSchema = z.object({
  category: sensoryCategorySchema,
  level: sensoryLevelSchema,
  description: z.string(),
  imageUrl: z.string().url().optional(), // ← Already here!
})
```

---

## References

- [Source: _bmad-output/planning-artifacts/architecture.md] - Storage structure
- [Source: app/functions/src/transforms/transformPdf.ts] - Current pipeline
- [Source: app/functions/src/utils/gemini.ts] - LLM integration
- [Source: app/src/lib/schemas/guideSchema.ts] - Schema with imageUrl
- [Source: app/src/shared/components/guide/SensoryDetail.tsx] - Display code

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

- 2026-01-31: Story created - Image extraction not implemented in current pipeline
