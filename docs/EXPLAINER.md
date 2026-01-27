# BindiMaps Action Plan (Visual Story)

An web based action plan app designed to be used for people with sensory sensitivity to carefully plan their trip to a new place like a train station, airport, theatre, swimming pool etc.

A sensory sensitivity action plan is a personalized, proactive, and reactive strategy designed to help individuals with hyper-sensitivities (over-responsivity) or hypo-sensitivities (under-responsivity) manage their sensory environment, reduce overwhelm, and regulate their nervous system.

## Deliverables

Milestone 3, which is due strictly before september 2026 (which is plenty of time), requires a Final Report: Prototype that includes the following deliverables:

- Summary of user research and insights
- MVP feature specifications
- Summary of the MVP iterative cycle development process
- Evaluation metrics and results
- Recommendations for broader deployment

## Problems to solve

- Reduce sensory overload for people who suffer from sensory processing differences
- User: Planning (more so than in location)
- User: Experience “in the moment”
- Location: Discovery of issues to address in venues
- Reducing anxiety in general for visitors of a location

## Requirements

- Must focus on transport contexts
- Must solve real problems for people with sensory sensitivity
- Must align with BindiMaps technology and core philosophy
- Should build on existing BindiMaps technology and research where possible
- Should create commercial opportunities with Aspect
- Should be generalizable and marketable to a broad range of BindiMaps customers
- Must be technically feasible and maintainable
- Should be adaptable to multiple types of spaces (e.g., airport, train station, shopping center, supermarket, event venues, etc.)
- Must ensure security and respect user privacy
- Must prioritize user safety and the perception of safety
- Should closely follow WCAG guidelines (especially aspects relevant to autistic people)
- Must adhere to the details of the contract with iMove

## Background

We are building the **3rd and last phase** of a multiphase project as a funded research project which should result in helping people with sensory sensitivity issues.  The project is a collaboration between BindiMaps (accessible digital indoor way-finding company) and iMove (national centre for transport and mobility R&D)

Project website: [Sensory Sensitivity Wayfinding for Complex Public Transport Hubs](https://imoveaustralia.com/project/sensory-sensitivity-wayfinding-for-complex-public-transport-hubs/)

> People with sensory sensitivities often face significant barriers when navigating public transport environments. These barriers include overwhelming noise, lighting, and crowding, which can make independent travel stressful or inaccessible. While tools like static sensory maps exist, BindiMaps’ early research has shown that such solutions are often generic and fail to address the complexity of individual sensory needs in real-time.  
>
> The Sensory Sensitivity Wayfinding project is being undertaken to explore how digital wayfinding technology can better serve this user group. By conducting user research, co-design workshops, and early prototyping, BindiMaps aims to develop a foundational understanding of what meaningful, personalised navigation support for sensory sensitivities should look like. This work will inform future feature development in BindiMaps’ infrastructure-free, accessible wayfinding platforms, and will generate valuable insights for the broader transport and accessibility sectors.

The entire project agreement is [available in this folder](./3-048%20Sensory%20Sensitivity%20Wayfinding%20Project%20Agreement%20EXECUTED%2029%20JULY%202025.pdf).

## Business opportunities

We found in our research that many companies put effort into action plans and there is a lot of awareness of them in the Autistic community.

We also found that many places have substandard maps for people with sensory sensitivities to plan their trip or nothing at all.

We could potentially increase BindiMaps revenue by offering this service to potential clients and also us this as a way to get BindiMaps maps into new places.

We could also enhance and augment ASPECT's work by helping them present their research (apid for by their clients) in a professional way and possibly add another service to their offering.

These opportunities are not the primary purpose of the project (which is to actually help people with our grant) but are hopefully another benefit of what we build.

## Phase 1

Phase 1 was research to understand people with sensory sensitivities and see what they need.  This initial research was heavily biased towards offering sensory maps but it became very clear during the user interviews that very few people seek these out, preferring to reply on other forms of planning, mostly using the destination website.

## Phase 2

We built an MVP which was a digital sensory map on top of the existing BindiMaps web map (BindiWeb).  Including these features

- Standard digital way-finding map, search routes etc
- Simple UI to view images of a venue and click though via the map
- Overlays+icons on the map to show areas affected by things people could be sensitive to like smalls, noise, bright lights etc
- Simple action plan with simple titles and option to view more detailed information

We hired a team from ASPECT to travel to Adelaide railway station to audit it for sensory sensitivity issues.  They produced a report with a floor plan marked up with danger zones of various categories and a very thorough text walkthrough of what to expect from the point of view of a person with sensory sensitivities

_Aspect (Autism Spectrum Australia) is a child safe organisation committed to protecting the rights and interests of children and vulnerable people by providing them with a safe environment. This commitment extends to ensuring a culturally safe and inclusive environment that recognises and respects an individual’s heritage, relationships and cultural practices._

It became clear that the map needed to be very busy in order to show all the hazards.  We would have to use a complicated UI to simplify this to the public.

What also became clear was that this company excelled in creating text action plans and the quality of this side of things was vastly superior to the map the sent.

We tested the MVP with users with lived experience and the maps overlays tested as expected.  Users found them confusing, messy and too much information.  It became clear that this wasn't the way forward.

Users seemed to understand the action plan MVP better even though it was essentially color coded text and icons.

In my opinion, the original plan was flawed in terms of helping people in a pragmatic way.  I assume the original decision was influenced by the fact that BindiMaps primarily produced maps, so the assumption was that maps were the answer.  As more research was done it because clear that this assumption was wrong.

[Milestone 2 report is here](./Static Sensory Mapping Report - Milestone 2.pdf)

For further reference, the documentation and data from our previous MVP can be found here:

- [Previous MVP `data.json` example](./previouseMVP/data.json)
- [Supporting documentation and files in the `previouseMVP` folder](./previouseMVP/)

## Phase 3

_**we should update this part of the document as the project progresses**_

This is what we are building now. This plan could easily and should change.

The whole thing should only take the order of a few weeks to build before testing.

IMPORTANT: challenge me on any of this or more where appropriate

### Overview

Build a new standalone app that displays action plans to users. One action plan per venue, supporting multiple venues.

This is still an MVP so should not be overcooked or over-engineered, always pick the simplest option. We are building greenfield because small focused apps are easy to make in 2026.

Like a good MVP, we should prioritise features in order of unavoidable, core, then less valuable when we make plans for work to do

### Frontend Requirements

- Starts VERY simple - cater for all cognitive levels, worst thing we can do is overwhelm
- Information opens up progressively as needed (progressive disclosure)
- Includes maps (optional)
- Sensory categories clearly labelled and color coded
  - [Icons available here](../assets/icons/)
- Simple but professional design, this could be used by airports, government, entertainment etc on a public scale
- very usable for mobile and desktop (responsive)
- mobile version we could assume they are most likely in the venue
  - for example, an easy way to call help quickly in case of a panic attack
- printable
- pdf-able
- MORE TODO

### Backend Requirements

- Secure authentication - multiple logins, company logins (only if quick and simple)
- weill probably need to sanitise input quite a bit to avoid prompt injection
- Parse free text and format with LLM into display model
- Test/preview before publishing
- Publish to frontend
- Version history
- Link items to BindiWeb map POI URLs
- MORE TODO

### Tech Stack

- **Hosting**: Firebase (preferred) or Google Cloud - both already in use at BindiMaps
- **Database**: Simple architecture, probably no SQL needed - blob/document storage likely sufficient
- **Infrastructure**: IaC if simple
- **Frontend**: Vite, React, TypeScript, Tailwind (or appropriate design system), yarn workspaces
- **Analytics**: Google Analytics, Microsoft Clarity
- **Backend**: Node
- MORE TODO

### Admin Workflow

1. **Upload**: Admin uploads PDF with mapping notes, map URLs, images, all data
   - [Example mapping notes PDF](./ExampleMappingNotes.pdf)
2. **Transform**: LLM converts text to view model
   - [Example data.json from MVP](./previouseMVP/data.json) (starting point, will need more fields)
3. **Review**: Admin previews/tests before publishing
4. **Publish**: Content goes live (replaces current for that venue)

### User Flow

1. User loads page (probably embedded on company site)
2. User browses action plan content progressively
3. User can access maps as secondary reference
4. MORE TODO

### Testing Strategy

We will employ ASPECT again for:

- Frontend user testing (lived experience validation)
- Backend admin workflow testing

Test with testers before public release - no point spending time and tokens unless it helps UX.

## Sensitivity Categories

| Key | Label | Color | Icon |
|-----|-------|-------|------|
| `brightLight` | Bright Light | `#FFF5B1` | `overlay-light` |
| `sound` | Sound | `#CDE7FF` | `overlay-sound2` |
| `crowds` | Crowds | `#FFD6A5` | `overlay-crowd` |
| `smells` | Smells | `#D9EACB` | `overlay-smell` |
| `highSensory` | High Sensory | `#F3D6FF` | `overlay-sensory` |
| `textures` | Textures | `#FFE3D9` | `overlay-texture` |
| `alert` | Alert | `#FF6B6B` | `overlay-alert` |
| `hazard` | Hazard | `#E63946` | `overlay-hazard` |
| `staffOnly` | Staff Only | `#A0AEC0` | `overlay-staffOnly` |
| `construction` | Construction | `#FFD700` | `overlay-construction` |
| `maintenance` | Maintenance | `#4169E1` | `overlay-maintenance` |

Icons located at: [../assets/icons/](../assets/icons/)

## Existing Examples

> **Note:** Most existing sensory guides are PDFs. This is the status quo for good reasons (easy to print, easy to produce, works offline). Our web-based approach must demonstrably improve on PDFs, not just replicate them. Key differentiators: progressive disclosure, live updates, mobile "during" features, embedded maps, analytics, and accessibility features (dynamic text size, screen reader optimization).

**Museums & Venues:**

- [Australian Museum: Accessibility and Inclusion](https://australian.museum/visit/accessibility-and-inclusion/)
- [Australian Museum: Visual Story](https://australian.museum/visit/access/visual-story/)
- [Scienceworks (Museums Victoria): The Autism Friendly Museum](https://museumsvictoria.com.au/scienceworks/plan-your-visit/accessibility/the-autism-friendly-museum/)
- [Questacon: Sensory Sensitivity](https://www.questacon.edu.au/visiting/accessibility-and-inclusion/sensory-sensitivity)

**Transport:**

- [Hobart Airport: Social Stories](https://hobartairport.com.au/travellers/airport-guide/accessibility/social-stories/)

**Shopping:**

- [Stockland Burleigh Heads: Sensory Shopping Guide](https://www.stockland.com.au/shopping-centres/centres/stockland-burleigh-heads/offers-and-events/news/sensory-shopping-guide)

**Local Government (PDF examples):**

- [Mitchell Shire Council: Sensory Resource Guides](https://www.mitchellshire.vic.gov.au/community/diversity-inclusion-and-support/sensory-resource-guides) - PDF guides for libraries and community centres

**Relaxed Performance Guides:**

- [TSO Venue Guide 2023 (PDF)](https://tso-files.s3.ca-central-1.amazonaws.com/RP+Venue+Guide+2023+(1).pdf)
- [Stratford Festival: 2025 Annie Relaxed Guide (PDF)](https://cds.stratfordfestival.ca/uploadedFiles/Visit/Accessibility/American_Sign_Language_Performances(1)/2025_Annie-Relaxed-Guide.pdf)
- [Arts Centre Melbourne: Visual Story Library for Relaxed Performances](https://www.artscentremelbourne.com.au/visit/accessibility/when-you-visit/relaxed-performances/visual-story-library)

## BindiWeb Integration

### Deep-link URL Format

```
https://demo.bindiweb.com/p/{locationId}?e={venueId}&ow=f&gid=f
```

- `p/{locationId}` - The location/project (e.g., `iQwHrzhpu3Q9s4braCpY26`)
- `e={venueId}` - The venue/POI to highlight (from `locationData.json` venue IDs)
- `ow=f&gid=f` - Display flags

### Extractable Data from `locationData.json`

The map data file contains venue information that can auto-populate action plan content:

| Facility Type | Use Case |
|--------------|----------|
| Emergency Exit | "Get Me Out" quick escape |
| Accessible Entry | Pre-arrival planning, alternative entry |
| Secondary Entry | Avoid main entrance crowds |
| Bathrooms (all types) | Quick bathroom finder |
| Accessible Bathrooms | Accessibility needs |
| Parents Room | Families with children |
| Lifts | Vertical navigation |
| Stairs | Alternative to lifts |
| Breakout/Chat Rooms | Potential quiet zones |
| Casual Seating | Rest spots |

## Brainstorm Ideas (Unprioritized)

Ideas from party mode brainstorm session. To be prioritized later.

### Before / During / After Framework

| Phase | User Need | Platform |
|-------|-----------|----------|
| **Before** | Plan and reduce anxiety | Desktop (primary), Mobile |
| **During** | Navigate and cope in-venue | Mobile (primary) |
| **After** | Reflect and contribute | Either |

Simple assumption: Mobile = likely "during", Desktop = likely "before". No fancy detection needed.

---

## Key Decisions (from brainstorm session 2025-01-25)

### What we're NOT building

- ❌ Sensory maps as primary focus (tested poorly in Phase 2)
- ❌ Complex wearables/AI prediction systems
- ❌ Real-time location detection
- ❌ Runtime data processing (all preprocessing at publish time)

### What we ARE building

- ✅ Action plans as the core solution
- ✅ Maps as optional embeds (if content provider wants them)
- ✅ Simple web app (not over-engineered)
- ✅ Mobile-first with "during" features for in-venue use
- ✅ Desktop for "before" planning
- ✅ Backend with LLM transformation (PDF → display format) is critical path
- ✅ Support for multiple map providers (not just BindiMaps)
- ✅ Facility link extraction preprocessed at publish time

### Architecture decisions

- Preprocessing at publish time, not runtime
- Multi-provider map support via abstract deep-link format
- Progressive disclosure UI pattern
- Quick shortcuts prominent on mobile

### Data flow (admin publish pipeline)

```
PDF (ASPECT report) + Map data (optional)
    ↓ [Upload]
LLM Transform
    ↓ [Parse + structure]
Display Model (JSON)
    ↓ [+ Facility links extracted from map data]
Admin Reviews (preview)
    ↓ [Publish]
Frontend Consumes (static/pre-built)
```

### Multi-provider map link format

```typescript
interface MapLink {
  provider: 'bindiweb' | 'google' | 'apple' | 'other';
  url: string;        // pre-built at publish time
  venueId?: string;   // for reference
  venueName: string;
}
```

Backend builds full URL per provider at publish time. Frontend just renders `<a href={url}>`.

### Open questions (to resolve later)

- Display model schema - extends previous MVP `data.json` but needs more fields
- LLM transformation prompts - how to structure for consistent output
- How to match facility names from map data to narrative sections (start simple)
- Positive experience categories - which to add beyond existing sensitivity categories

---

## MVP Scope

### MVP Foundation (must have)

**Backend (Admin):**

- PDF upload + LLM transformation to display format
- Preview/test before publishing
- Publish to frontend
- Facility link extraction from map data (preprocessed at publish time, not runtime)
- Support for multiple map providers (not just BindiMaps)

**Frontend (User):**

- Action plan content display (responsive)
- Progressive disclosure UI (starts simple, details on demand)
- Map integration (optional per venue, via deep-links)
- Mobile-first design
- Desktop planning view
- Pre-generated facility quick-links (exits, bathrooms, parents room, lifts, etc.)
- Emergency contact display

### MVP 'During' Features

- Quick shortcuts button (prominent on mobile)
- Facility quick-links: exits, bathrooms, quiet spaces
- One-tap to venue help/emergency number

---

## Post-MVP Ideas (prioritize later)

### Quick Shortcuts Enhancements

- **Panic Mode** - Triple-tap quick help → immediate "nearest exit + call for help"
- **Staff scripts** - Pre-written cards to show staff when overwhelmed:
  - "I'm feeling overwhelmed and need a quiet space"
  - "I have sensory sensitivities - please speak softly"
  - "Can you help me find the exit?"

### Auto-populated Sections

Parse `locationData.json` to auto-generate action plan sections:

- "Exits are located at..." (with map deep-links)
- "Bathrooms available..." (with accessibility info)
- "Quiet spaces include..." (breakout rooms, chat rooms)
- Floor-by-floor facility summary

**Implementation note:** Start simple - try what's easy and likely to work. Options if needed:

1. Use consistent naming conventions in LLM-generated content
2. Generate facility sections separately from narrative sections

### Positive Experience Categories

Expand beyond hazard warnings to highlight good experiences:

- Quiet zone
- Dim lighting area
- Low traffic times/areas
- Staff trained in sensory needs
- Sensory-friendly hours

### User Feedback

- "How did this plan work for you?" - thumbs up/down after visit
- "Add your own tip" - user-contributed notes (moderated)

### Action Plan Templates

Pre-built plans for common scenarios:

- First visit to a shopping centre
- Taking my child to the movies
- Job interview in unfamiliar building
- Catching a train for the first time

### Support Tools

- Breathing/grounding prompts
- "Share this plan with my carer/buddy"
- Print summary card (wallet-sized essentials)
- "What to tell venue staff if I need help"
