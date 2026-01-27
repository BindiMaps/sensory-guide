# Challenge from Critical Perspective Review

**Method:** Devil's advocate stress-testing tech stack decisions

**Instructions:** Review each challenge, mark adjustments to make.

---

## Challenge 1: Firebase Coupling

**Devil's advocate says:**

- Firestore pricing can surprise you (reads/writes add up)
- Functions cold starts can be slow for PDF upload
- Coupling auth, database, hosting, functions to one vendor
- What if you need something Firebase doesn't do well?

**Counter-argument:**

- Team knows it, time-to-market matters for M3
- Cold starts only affect admin (rare), not public (static)
- Acceptable trade-off for this scope
- Can migrate later if needed

**Verdict:** Keep Firebase

**Adjust?** [ ] Keep as-is [ ] Add concern to PRD [ ] Reconsider
**Notes:**

convenience vs unlikely future means firebase is still the best choice imo

---

## Challenge 2: Shadcn/Radix UI Split

**Devil's advocate says:**

- Maintaining two design approaches
- Developer context-switching
- Custom public design might take forever
- Shadcn would be fast for both

**Counter-argument:**

- Public UI is simple (accordion, badges, print)
- Radix handles accessibility
- Different audiences justify split
- Can fall back to Shadcn if custom stalls

**Proposed adjustment:** Add time-box. If custom public design stalls, fall back to themed Shadcn.

**Adjust?** [ ] Keep split [ ] Add time-box/fallback note [ ] Use Shadcn for both
**Notes:**

 we should use lazy loading to ensure that the two design systems don't add too much to the download size.. we should be careful about this, especially in the front end since this is a form of accessibility too

---

## Challenge 3: Do You Need Zustand?

**Devil's advocate says:**

- What state needs global management?
- Filter preferences → localStorage
- Auth state → Firebase handles it
- Form state → local component state
- Server data → React Query or SWR
- Adding complexity for no reason?

**Counter-argument:**

- Zustand is tiny, low overhead
- Nice to have if needed
- Easy to add, easy to remove

**Proposed adjustment:** Start without Zustand. Add only if needed.

**Adjust?** [ ] Keep Zustand [ ] Remove from initial stack (add if needed) [ ] Replace with something else
**Notes:**

i always seem to end up moving to zustand so might as well start with it... is good to simplify architecture

---

## Challenge 4: TypeScript Everywhere

**Devil's advocate says:**

- For research MVP, do you need strict types?
- Adds compile time, more verbose
- Could ship faster with JS for functions

**Counter-argument:**

- Types catch bugs, especially with LLM-generated JSON
- Shared types between frontend/backend are valuable
- Modern TS is fast enough

**Verdict:** Keep TypeScript

**Adjust?** [ ] Keep TypeScript [ ] Relax to JS for some parts
**Notes:**

yes TS is needed

---

## Challenge 5: Over-Planning?

**Devil's advocate says:**

- PRD is getting comprehensive
- Sept 2026 is plenty of time
- Gold-plating the planning phase?
- Ship something, learn, iterate

**Counter-argument:**

- Good planning prevents rework
- Research project needs clear requirements
- Will iterate based on ASPECT testing

**Proposed adjustment:** After PRD, move fast to architecture and build.

**Adjust?** [ ] Keep current pace [ ] Speed up after this step [ ] Other
**Notes:**

it's fine

---


## Your Additions

Other concerns or adjustments:

-

---

**When done:** Save and let me know.
