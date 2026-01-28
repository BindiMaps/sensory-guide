---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-bindiMapsActionPlan-2026-01-25.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
  - docs/EXPLAINER.md
---

# UX Design Specification - Sensory Guide

**Author:** You
**Date:** 2026-01-28

---

## Executive Summary

### Project Vision

**Sensory Guide** is a web app that transforms venue accessibility audit PDFs into interactive, accessible sensory guides. The killer insight from Phase 2 research: **action plans work, maps don't**. Users want predictability and advance awareness through structured narrative, not dense visual information overlays.

**Core Value Proposition:** "Know what to expect before you arrive" → Reduces anxiety through predictability.

**Key Differentiator:** Unlike most sensory guides (which are static PDFs), our solution is web-first, interactive, and can dynamically personalise content based on each user's individual sensory triggers.

### Target Users

| User Type | Context | Primary Device | Primary Goal |
|-----------|---------|----------------|--------------|
| **End User** | Person with sensory sensitivities planning a venue visit | Desktop (before), Mobile (during) | Reduce anxiety through predictability |
| **Admin (ASPECT)** | Auditors publishing guides from their PDF reports | Desktop | Efficiently publish professional guides |
| **Admin (Venue)** | Staff managing guides for their organization | Desktop | Keep venue information current |

**Critical User Insight:** Users might be hyper-sensitive OR hypo-sensitive. The UI itself must not add to sensory load - "no calm mode toggle needed; the default IS calm."

### Key Design Challenges

1. **Cognitive Accessibility Paradox** - An app for overwhelmed people must never overwhelm. Progressive disclosure is critical but the "expand" interaction itself needs to be obvious and low-friction.

2. **Two Distinct Aesthetics** - Admin (Shadcn, functional, form-heavy) vs Public (warm, calming, not clinical). Both must feel like the same product family while serving different needs.

3. **Print is First-Class** - Users print at home before visiting. Print CSS must be as polished as screen CSS. This is not an afterthought.

4. **Journey-Based Structure** - Content follows venue layout (Entry → Main Area → Platforms), not sensory category. This matches how users actually experience spaces but might not be intuitive to scan for "all sound issues."

5. **Mobile During-Visit** - Quick access to exits, bathrooms, help - when user is already stressed. Must be dead simple.

### Design Opportunities

1. **"Warm, Calming" Visual Identity** - Most accessibility tools look clinical/medical. A genuinely warm, reassuring aesthetic could be a differentiator.

2. **Sensitivity Filters (Growth)** - Users set their triggers once in localStorage, all guides auto-highlight relevant sections. Personalisation without accounts.

3. **PDF Generation Superiority** - Web generates *better* PDFs than static docs - personalised, filtered, with only what the user cares about.

4. **Category Badges as Scanning Aid** - Quick visual scan of "what sensory types are flagged here" without reading everything.

## Core User Experience

### Defining Experience

**Core User Action (End User):** "Expand a venue section and feel prepared for what's there"

The primary interaction loop:
1. See venue overview (name, summary, category badges)
2. Scan section headings (journey-based: Entry → Main Area → Platforms)
3. Expand area of interest
4. Read sensory details and warnings
5. Feel more confident about what to expect

Everything else (print, filters, mobile shortcuts) serves this core loop.

### Platform Strategy

| Platform | Role | Target Bundle |
|----------|------|---------------|
| Desktop Web | Primary "before" planning | Public: ~50KB minimal |
| Mobile Web | Secondary "during" quick reference | Same codebase, responsive |
| Admin Web | Content management | Larger (Shadcn, React Query, Firebase) |

- No native apps required - responsive web covers both use cases
- Offline not required (users prep at home with wifi)
- Public bundle must be minimal - no Firebase SDK

### Effortless Interactions

| Interaction | Effortless Standard |
|-------------|---------------------|
| **Section expand/collapse** | Zero friction. Tap/click, it opens. No hunting for affordances. |
| **Print** | One click, beautiful output, all sections auto-expanded. |
| **Find exits/bathrooms (mobile)** | When stressed, one tap maximum to critical info. |
| **Understand on first load** | No "where do I start?" moment. Structure is self-evident. |
| **Category scanning** | Badges visible on collapsed sections - know what's inside before expanding. |

### Critical Success Moments

| Moment | What Must Happen | Failure = |
|--------|-----------------|-----------|
| **First page load** | User immediately gets it: "This is a guide for [venue]" | Confused, bounces |
| **First section expand** | User thinks "oh, this is useful" | Too much text, overwhelmed |
| **Print preview** | User thinks "I can take this with me" | Layout broken, missing content |
| **During-visit quick access** | Find exit in <3 seconds | Too many taps, stress increases |
| **Post-visit reflection** | User gave thumbs up | Guide was inaccurate, trust broken |

### Experience Principles

1. **Calm by Default** - The baseline state is already calm. No "enable calm mode" toggle - the UI just IS calm. Muted colours, generous whitespace, no competing elements.

2. **Reveal on Demand** - Start simple, depth available when wanted. Never front-load complexity. Progressive disclosure is the core pattern.

3. **One Tap to Safety** - Critical during-visit actions (exits, help, quiet zones) are always within immediate reach on mobile.

4. **Print = First-Class Citizen** - The printed output is as designed as the screen version. Print CSS is not an afterthought.

5. **Trust Through Accuracy** - If the guide says X, X must be true. Accuracy is existential. Admin review process ensures this.

