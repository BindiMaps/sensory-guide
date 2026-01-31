# Sensory Guide

A web app for sensory sensitivity action plans - helping people with sensory processing differences plan visits to venues like train stations, airports, and theatres.

## Quick Links

- **What are we building?** → [`docs/EXPLAINER.md`](docs/EXPLAINER.md)
- **Current sprint status** → [`_bmad-output/implementation-artifacts/sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml)
- **Design system** → [`_bmad-output/planning-artifacts/design-system-v5.md`](_bmad-output/planning-artifacts/design-system-v5.md)
- **App code** → [`app/`](app/) (React + Vite + Firebase)

## Development Methodology

This project uses **BMAD Method** - an AI-assisted development methodology where planning and implementation are driven by conversational agents via Claude Code.

### What that means practically

1. **Planning artifacts are generated, not hand-written** - PRDs, architecture docs, epics, and stories live in `_bmad-output/` and were created through agent workflows
2. **Stories are the unit of work** - Each feature is broken into stories with acceptance criteria. Find them in `_bmad-output/implementation-artifacts/stories/`
3. **Agents handle the ceremony** - Instead of manually updating Jira or writing specs, you invoke workflows that generate/update artifacts

### Directory structure

```
app/                    # Application code (React + Vite + Firebase)
_bmad/                  # BMAD framework (agents, workflows, templates)
_bmad-output/           # Generated artifacts
  ├── planning-artifacts/   # PRD, architecture, design system
  └── implementation-artifacts/
      ├── sprint-status.yaml    # Current sprint tracking
      └── stories/              # Story files by epic
docs/                   # Project documentation
.specify/               # Speckit templates (alternative workflow)
```

### Working on this project

**To pick up where we left off:**
1. Check `_bmad-output/implementation-artifacts/sprint-status.yaml` for current sprint state
2. Find the next unstarted story in the stories folder
3. Read the story file for acceptance criteria and context

**To invoke BMAD workflows** (via Claude Code):
- `/bmad:bmm:workflows:sprint-status` - See what's next
- `/bmad:bmm:workflows:dev-story` - Implement a story
- `/bmad:bmm:workflows:create-story` - Create the next story from an epic

**Key rule:** All UI must match `_bmad-output/planning-artifacts/design-system-v5.md` exactly.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Functions, Storage)
- **AI:** Claude API for PDF → structured content transformation
