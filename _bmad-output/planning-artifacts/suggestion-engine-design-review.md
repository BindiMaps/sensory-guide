# Suggestion Engine Design Review

**Feature:** Admin Suggestion Engine - help ASPECT create more comprehensive guides by suggesting content based on what other venues include.

---

## Two-Stage Design Summary

| Aspect | MVP (Stage 1) | Growth (Stage 2) |
|--------|---------------|------------------|
| Data source | Static checklist | Venue-typed corpus |
| Suggestions | "Missing: exits, lighting..." | "Similar venues include X" |
| Examples | None | Snippets from corpus |
| Personalization | None | By venue type |
| Learning | None | Accept/dismiss tracking |
| Contribution | None | Opt-in after publish |

we can do this per-item and also for the entire document, depending on the context, different suggestions obviously

we need to think about context, this could be a seperate call (or calls for each item) to an llm

---

## Decisions Needed

### 1. Seed Corpus Source

Where does the initial training data come from for Stage 2?

- [ ] ASPECT provides 10-20 exemplary guides (requires permission)
- [ ] Public scraping - gather publicly available sensory guides (check licensing)
- [ ] Synthetic examples - LLM generates "ideal" section examples per venue type
- [ ] Partnership - Autism orgs share their venue guides
- [ ] Combination (specify which):

**Notes:**

we are creating a doc for all of this.. we will have a standard prompt.. we will generate one now and get aspect to add to it and edit it before hard but it will be hard coded once we are live

---

### 2. Venue Taxonomy

Proposed venue types for matching suggestions:

- [ ] Transport hubs (stations, airports, bus terminals)
- [ ] Cultural venues (museums, galleries, theaters)
- [ ] Retail (shopping centers, supermarkets)
- [ ] Civic (libraries, council buildings, hospitals)
- [ ] Entertainment (stadiums, cinemas, theme parks)
- [ ] Education (universities, schools)

**Add/remove/modify categories:**

all of these but we should start with a single checklist that covers everything

---

### 3. Stage 1 Checklist Categories

What should the MVP static checklist cover? (Check all that apply)

- [ ] Emergency exits
- [ ] Bathrooms/toilets
- [ ] Quiet zones/spaces
- [ ] Lighting conditions
- [ ] Sound/noise levels
- [ ] Crowd patterns/busy times
- [ ] Staff assistance availability
- [ ] Wayfinding/signage
- [ ] Parking/drop-off
- [ ] Public transport access
- [ ] Food/drink availability
- [ ] Sensory room (if applicable)

**Add others:**

all of that plus whatever is available in the documents we are currently scraping in another chat

---

### 4. "Show Examples" Feature

When admin clicks "Show Examples" in Stage 2, what do they see?

- [ ] Anonymized snippets ("A transport hub includes: ...")
- [ ] Attributed snippets ("Adelaide Airport mentions: ...")
- [ ] Both options - attributed if venue consented, anonymous otherwise

**Notes:**

after the pdf is uploaded we see a button saying "show suggestions" which then shows a list of things that the admin could add or improve about the document

---

### 5. Contribution Consent Model

When should we ask venues to contribute to the corpus?

- [ ] After publish (as shown in UX mockup)
- [ ] During venue setup (upfront opt-in)
- [ ] Organization-level setting (one decision for all venues)
- [ ] Other:

**Notes:**

this is a hard coded thing for the foreseeable future, it's just a way of helping the admin improve the info they have uploaded... things they might have forgotten to put in for example

---

### 6. Accept/Dismiss Analytics

What do we track for improving suggestions?

- [ ] Accept rate per suggestion type
- [ ] Dismiss rate per suggestion type
- [ ] Time spent viewing suggestion before decision
- [ ] Which examples were viewed
- [ ] Free-text feedback on why dismissed

**Notes:**

nah overthinking it... this is a simple feature, only track actions to GA

---

### 7. Is Stage 2 MVP or Growth?

Current proposal: Stage 1 (static checklist) = MVP, Stage 2 (corpus-based) = Growth

- [ ] Agree - ship checklist first, corpus later
- [ ] Disagree - need corpus-based from day one
- [ ] Compromise (specify):

**Notes:**

stage 2

---

### 8. Privacy/IP Concerns

Using venue content as training data:

- [ ] Explicit opt-in required (as designed)
- [ ] Opt-out model (default contribute, can disable)
- [ ] Organization owns their contribution (can withdraw anytime)
- [ ] Content is anonymized before corpus inclusion
- [ ] Legal review needed before implementing

**Notes:**

noops we are making own own list ultimately, just getting inspiration from others

---

## Proposed FRs (Confirm/Modify)

### Stage 1 (MVP)

- [ ] FR40: System compares generated guide against completeness checklist
- [ ] FR41: Admin can view list of potentially missing content areas
- [ ] FR42: Admin can accept suggestion to add section (triggers regeneration)
- [ ] FR43: Admin can dismiss suggestion

not even that complictaed, we just show a bullet list of suggestions for the document, no need to be interactive.. the user can update their doc if they want and re-upload, or ignore the suggestions with no actual actions needed in the ui

### Stage 2 (Growth)

- [ ] FR44: Admin can specify venue type during setup
- [ ] FR45: System matches guide against corpus of similar venue types
- [ ] FR46: Admin can view example snippets from corpus
- [ ] FR47: Admin can opt-in to contribute published guide to corpus
- [ ] FR48: System tracks suggestion accept/dismiss rates for quality improvement

nothing that complicate, keep it simple

**Add/modify FRs:**

---

## URLs Reference

(Note: You opened `docs/otherGuides/urls.md` - paste relevant URLs here if they inform corpus/examples decisions)

---

note that we are still generating the prompt/suggestions document, will supply soon

**When done:** Save and let me know.
