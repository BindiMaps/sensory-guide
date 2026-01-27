# Party Mode Discussion: Map Integration for Sensory Guide

**Date:** 2026-01-27
**Topic:** How to integrate BindiWeb maps into Sensory Guide - making maps first-class citizens

---

**Re-upload Merge Strategy:**

1. LLM generates new sections with stable IDs (based on content hashing or semantic similarity)
hashing what? i assume the title??

2. Merge algorithm: new content + preserved mapUrls where IDs match
3. Orphaned mapUrls flagged for admin review ("This map link no longer matches any section")
perfect

**The simplest implementation:** Store mapUrl as just another field on each section. Parse from BindiWeb URL to extract zoom/coords/route when needed for display metadata.

we still need to store the list somewhere so we can merge back in if the text changes

no need to parse anything from the url.. just embed it in an iframe

---

- Do auditors already note GPS coordinates or location references in their PDFs?

yes

- Would they use a map interface during the audit itself? (upstream capture vs downstream admin work)

ideally yes but i don't think we cann assume this would be done.. need to keep it very simple for auditors.. let them use their own process to get to the pdf

**MVP scope check:** Is this MVP or Growth? Current PRD has 'BindiWeb map embeds' in Growth features. If we're promoting it, we need to be clear on the lift.

growth, will keep mvp small

**My instinct:** Keep the admin UX dead simple. Literally: 'Paste BindiWeb URL here' input field per section. Parse what we need client-side. Don't build a map picker yet.

yea this is probably the best way... also then it doesn't have to be a map, it can be any url that can be embedded.. let's just call it 'Paste URL to embed here' and check that the extension is compatible

this way we aren't coupled to bindiweb

---

**Admin Experience (building on John's point):**
Picture this flow:

1. Admin opens BindiWeb in another tab
2. Navigates to the spot, zooms, sets the view state they want
3. Copies URL from browser
4. Pastes into the 'Map Link' field next to each section
5. Live preview shows the embedded map immediately

No fancy picker needed. The BindiWeb URL IS the interface.

yep, especially the preview

**Public Experience Consideration:**
Per section could get overwhelming. What about:

- **Collapsed:** Section shows a small map thumbnail/icon indicating 'has map'
- **Expanded:** Full embedded map appears
- **Print:** Static map snapshot (or QR code linking to the live map?)

**Interaction pattern:** Should tapping the map open it full-screen in BindiWeb? Or do we embed with interaction disabled to keep users in the guide flow?

yes this is nice, either or

---

## Open Questions for Discussion

1. **Winston's stable ID merge strategy** - Is content hashing or semantic similarity the right approach for re-uploads?

simple is good, could just hash title

1. **John's scope question** - MVP or Growth? Current PRD has BindiWeb embeds in Growth features.

early growth

1. **Sally's embed vs link question** - For public UI, should maps be:
   - Fully interactive embeds?
   - Static previews that link out?
   - Disabled interaction to keep users in flow?

all of those

1. **Print handling** - Static snapshot vs QR code to live map?

qr code is a good idea

---

## User Comments

inline above
