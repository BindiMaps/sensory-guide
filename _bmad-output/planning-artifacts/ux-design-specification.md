---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
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

## Desired Emotional Response

### Primary Emotional Goals

| Desired State | What It Looks Like |
|---------------|-------------------|
| **Anxiety reduced** | User feels calmer about upcoming visit |
| **Sense of control** | User feels empowered, not helpless ("I can do this") |
| **Felt seen/valued** | "It's nice the venue thought about this" |
| **Increased independence** | "I didn't need to ask my carer as much" |
| **Trust in information** | Post-visit: "It was accurate" |

### Emotional Journey Mapping

| Stage | Desired Emotion | Design Implication |
|-------|-----------------|-------------------|
| **Discovery** | Relief - "This exists for me" | Clear value prop, recognisable purpose |
| **First Load** | Clarity - "I understand what this is" | Self-evident structure, no learning curve |
| **Exploring** | Confidence building - "I know what to expect" | Details feel reassuring, not scary |
| **Preparing to Print** | Prepared - "I can take this with me" | Print button prominent, preview confidence |
| **At Venue** | Reassured - "This matches what I read" | Accuracy is existential |
| **Post-Visit** | Trust & Gratitude | Thumbs up, would use again |

### Emotions to Avoid

| Emotion | How It Happens | Prevention |
|---------|----------------|------------|
| **Overwhelm** | Too much info at once | Progressive disclosure, calm defaults |
| **Confusion** | Unclear structure | Self-evident hierarchy, no jargon |
| **Anxiety from UI** | Busy visuals, motion | Calm by default, respect prefers-reduced-motion |
| **Frustration** | Too many steps to find info | One-tap to critical info |
| **Doubt** | Info seems outdated or wrong | "Last updated" visible, accuracy gating |

### Design Implications

| Emotion Goal | UX Design Approach |
|--------------|-------------------|
| **Calm** | Muted colours, whitespace, no competing elements, no unsolicited motion |
| **Confidence** | Clear headings, predictable structure, "you are here" orientation |
| **Control** | User decides what to expand, what to print, when to dig deeper |
| **Trust** | Accuracy disclaimer + date, professional but warm aesthetic |
| **Seen/Valued** | Warm (not clinical) design, content written *for* them not *about* them |

### Emotional Design Principles

1. **Never Add to the Load** - If users are already anxious, the UI must subtract from anxiety, never add. Every design choice should pass the test: "Does this calm or stress?"

2. **Agency Creates Calm** - Users feel calmer when they control the pace. Let them expand when ready. Never auto-play, auto-expand, or surprise.

3. **Warm ≠ Childish** - The aesthetic should feel welcoming and human, but also professional and trustworthy. Not medical, not patronising.

4. **Trust is Earned Visually** - A polished, well-organised design signals competence. Sloppy UI undermines trust in content accuracy.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

#### Headspace / Calm

| What They Nail | How It Applies |
|----------------|----------------|
| **Colour palette** | Muted, warm tones - not clinical white, not childish bright |
| **Breathing room** | Generous whitespace, nothing feels cramped |
| **Gentle motion** | Subtle, purposeful, respects reduced-motion |
| **Voice/tone** | Reassuring without being patronising |
| **Onboarding** | You feel guided, not lectured |

**Steal:** The colour warmth. The whitespace. The "you're okay" vibe.

#### Notion

| What They Nail | How It Applies |
|----------------|----------------|
| **Toggle blocks** | Progressive disclosure done right - obvious affordance, smooth expand |
| **Clean hierarchy** | You always know where you are |
| **Keyboard-first** | Full navigation without mouse |
| **Print** | Actually looks good printed |

**Steal:** Toggle pattern for sections. The hierarchy clarity. Keyboard nav patterns.

#### Linear

| What They Nail | How It Applies |
|----------------|----------------|
| **Professional warmth** | Feels serious but not cold |
| **Typography** | Readable, consistent, well-spaced |
| **Accessibility** | Excellent focus states, keyboard nav |
| **Density control** | Shows what you need, hides what you don't |

**Steal:** The "serious but warm" aesthetic balance. Typography choices. Focus states.

### Transferable UX Patterns

| Pattern | Source | Use In Sensory Guide |
|---------|--------|---------------------|
| **Toggle sections** | Notion | Venue area expand/collapse |
| **Warm muted palette** | Headspace | Public guide aesthetic |
| **Generous whitespace** | Headspace/Calm | Everywhere - never cramped |
| **Clear focus states** | Linear | Keyboard navigation |
| **Reassuring microcopy** | Calm | "Last updated", section intros |

### Anti-Patterns to Avoid

| Anti-Pattern | Why Bad | Where We've Seen It |
|--------------|---------|---------------------|
| **Clinical white + blue** | Feels medical, cold | Most accessibility tools |
| **Icon-only buttons** | Accessibility fail, unclear | Many mobile apps |
| **Auto-expanding accordions** | Removes user control | Bad FAQ pages |
| **Dense info grids** | Overwhelming | Apple Health |
| **Bouncy animations** | Sensory trigger for some users | Gamified apps |

### Design Inspiration Strategy

**Adopt Directly:**
- Notion-style toggles for progressive disclosure
- Headspace colour warmth (muted, earthy, not clinical)
- Linear's focus state patterns

**Adapt:**
- Calm's breathing room → even more generous for our users
- Notion's hierarchy → simplified for single-purpose app

**Explicitly Avoid:**
- Anything that "pops" or bounces
- Clinical/medical aesthetic
- Information density

## Design System Foundation

### Design System Choice

**Split Design System Approach:**

| Area | System | Rationale |
|------|--------|-----------|
| **Admin** | Shadcn/ui (Tailwind + Radix) | Fast dev, forms/tables/modals ready, accessible by default |
| **Public** | Radix primitives + custom Tailwind | Warm aesthetic, not clinical Shadcn defaults |
| **Shared** | Radix accessibility primitives | Consistent behaviour, proper ARIA |

### Rationale for Selection

**Why Split Systems:**

**Admin (Shadcn/ui):**
- ASPECT auditors don't need "warm and calming" - they need efficient
- Forms, tables, dialogs all built-in
- Keyboard nav, focus states, ARIA labels handled
- Use as-is with minor theme tweaks

**Public (Radix + Custom):**
- Radix gives accessible primitives (Accordion, Dialog, etc.)
- Style from scratch to achieve Headspace/Calm warmth
- No "Shadcn look" leaking into user-facing UI
- Full control over emotional design

### Implementation Approach

```
shared/
  components/
    ui/           ← Shadcn components (admin only)

features/
  admin/          ← Uses Shadcn directly
  public/
    components/   ← Custom Radix + Tailwind (warm aesthetic)
```

**Key Pattern:** Public components are custom-built using Radix primitives. They do not import from `shared/components/ui/`.

### Customisation Strategy

**Admin (Minimal Customisation):**
- Keep Shadcn defaults mostly unchanged
- Adjust primary colour to brand if needed
- Focus on function over aesthetics

**Public (Full Custom):**
- Define warm colour palette (Headspace-inspired muted tones)
- Custom Accordion component using `@radix-ui/react-accordion`
- Custom spacing/typography scale (more generous than Shadcn defaults)
- Print-specific variants of all components

## Defining Experience

### The Core Interaction

**The "Tinder Swipe" of Sensory Guide:**

> "Tap a venue area, see what to expect there"

If we nail the accordion expand → read → feel prepared loop, everything else follows.

### User Mental Model

**What Users Bring:**
- Used to PDFs and static web pages
- "Click to learn more" is familiar
- Accordion/FAQ pattern is universal
- Expect print to work

**Current Solutions (What They Do Now):**
- Download PDF, ctrl+F to find area
- Scroll through long web page
- Ask a carer to summarise

**Pain Points:**
- PDFs don't collapse/expand
- Web pages dump everything at once
- No personalisation

### Success Criteria

| Criteria | What It Means |
|----------|---------------|
| **Instant recognition** | User sees section header, knows what's inside before opening |
| **Zero hesitation** | Tap target is obvious, no "where do I click?" |
| **Smooth transition** | Expand feels natural, not jarring |
| **Scannable content** | Once open, can find key info in <3 seconds |
| **Reversible** | Easy to collapse and try another section |

### Novel vs Established Patterns

**Verdict: Mostly Established**

| Pattern | Type | Notes |
|---------|------|-------|
| Accordion expand/collapse | Established | FAQ pattern, universal |
| Category badges on headers | Slight innovation | Lets users scan before opening |
| Journey-based hierarchy | Established | Like a building directory |
| Print button | Established | But execution must be excellent |

**No user education needed.** People know how accordions work.

### Experience Mechanics

#### 1. Initiation (See Section Header)

- Clear venue area name
- Category badges show what's flagged (sound, light, crowds)
- Chevron indicates expandable
- Tap target is the entire row

#### 2. Interaction (Expand)

- Smooth expand animation (respects prefers-reduced-motion)
- Chevron rotates to indicate open state
- Content grouped by sensory category within section

#### 3. Feedback

- **Visual:** Section expands, chevron points down
- **Focus:** Focus stays in logical place (not jumping around)
- **Screen reader:** Announces expanded state

#### 4. Completion

- User reads content, feels informed
- Can collapse (tap header again) or move to next section
- Can print anytime (button always visible)

## Visual Design Foundation

### Colour System

**Neutrals (Warm, Not Clinical):**

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#FDFBF7` | Page background (warm cream) |
| `--foreground` | `#2D2A26` | Body text (soft charcoal) |
| `--muted` | `#F5F2ED` | Card backgrounds, subtle sections |
| `--muted-foreground` | `#6B6560` | Secondary text |
| `--border` | `#E8E4DD` | Dividers, card borders |

**Accent (Warm Teal):**

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#2A7D7D` | Links, primary buttons |
| `--primary-foreground` | `#FFFFFF` | Text on primary |

**Category Colours (From EXPLAINER - Already Defined):**

| Category | Colour |
|----------|--------|
| Sound | `#CDE7FF` |
| Bright Light | `#FFF5B1` |
| Crowds | `#FFD6A5` |
| Smells | `#D9EACB` |
| High Sensory | `#F3D6FF` |
| Textures | `#FFE3D9` |
| Alert | `#FF6B6B` |
| Hazard | `#E63946` |

**Semantic:**

| Token | Value | Use |
|-------|-------|-----|
| `--success` | `#4A7C4E` | Confirmations |
| `--warning` | `#C4841D` | Cautions |
| `--destructive` | `#C53030` | Errors, hazards |

### Typography System

**Font Family:**

```css
--font-sans: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
```

**Type Scale:**

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| h1 | 2rem (32px) | 600 | Venue name |
| h2 | 1.5rem (24px) | 600 | Section headers |
| h3 | 1.125rem (18px) | 600 | Category headings |
| body | 1rem (16px) | 400 | Content |
| small | 0.875rem (14px) | 400 | Metadata, badges |

**Line Height:** 1.6 for body text (generous for readability)

### Spacing & Layout Foundation

**Base Unit:** 8px

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Default |
| `--space-3` | 12px | Between related items |
| `--space-4` | 16px | Section padding |
| `--space-6` | 24px | Between sections |
| `--space-8` | 32px | Major divisions |

**Philosophy:** When in doubt, add more space. Breathing room is calming.

### Accessibility Considerations

| Check | Requirement | Status |
|-------|-------------|--------|
| Text contrast | ≥4.5:1 | ✅ `#2D2A26` on `#FDFBF7` = 11.3:1 |
| Large text contrast | ≥3:1 | ✅ |
| Focus visible | 2px ring | ✅ Use primary colour |
| Reduced motion | Respect `prefers-reduced-motion` | ✅ |
| Min tap target | 44×44px | ✅ |

## Design Decisions Log

### Decision: No Icons in MVP

**Status:** Decided
**Date:** 2026-01-28

**Context:** The original MVP concept included iconography for sensory categories (sound icon, light icon, etc.) and UI affordances.

**Decision:** We decided against icons for MVP.

**Rationale:**
1. **Sourcing labour-intensive** - Finding/creating a consistent set of good-looking icons proved time-consuming
2. **Consistency challenges** - Difficult to get a cohesive set that matched the warm institutional aesthetic
3. **Clean look works better** - The minimalist Arts Centre Melbourne-inspired design actually benefits from NOT having icons; the category badges with simple colour dots and text are cleaner and more professional
4. **Accessibility** - Text labels are inherently more accessible than icon-only affordances anyway

**Outcome:** The final design uses text-based badges with small colour indicator dots instead of icons. This aligns with our "warm institutional" direction (Australian Museum, Arts Centre Melbourne references).

### Future Consideration: Icons (Growth Phase)

**Status:** Deferred
**Target Phase:** Growth (post-MVP)

If time permits in a later phase, we may revisit iconography for:
- Category badges (could add subtle icons alongside text)
- Mobile quick-access buttons (exits, bathrooms, help)
- Print version visual scanning

**Criteria for revisiting:**
- Must have budget for custom icon set or find one that matches aesthetic
- Must prove value over text-only approach through user feedback
- Must not compromise the clean, minimal look we've achieved

---

## Final Design System Reference

**Status:** APPROVED (2026-01-28)

The visual design direction has been finalised as **v5**. All implementation must conform to:

| Document | Purpose |
|----------|---------|
| `design-system-v5.md` | **Source of truth** - all tokens, components, a11y requirements |
| `ux-design-direction-v5.html` | Reference implementation (interactive) |
| `screenshots/v5-chosen.png` | Visual reference |

This design system is also referenced in `project-context.md` to ensure AI agents always have visibility.

