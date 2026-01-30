# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

***IMPORTANT: The high-level project overview is tracked and described in [docs/EXPLAINER.md](docs/EXPLAINER.md)***

The project is being built roughly using BMAD Method.

This is a **planning and implementation project** for BindiMaps, using two integrated frameworks:

- **Speckit**: Feature specification workflow (`.specify/` + `.claude/commands/speckit.*`)
- **BMad Method v6.0**: Agent-based development methodology (`_bmad/`)

Application code lives in `app/` (React + Vite + Firebase). Planning artifacts are generated in `_bmad-output/`.

## Key Workflows

### Speckit Commands (via `/speckit.*`)

```
/speckit.specify <description>  → Create feature spec + branch
/speckit.plan                   → Generate technical plan + research
/speckit.tasks                  → Generate dependency-ordered tasks.md
/speckit.implement              → Execute implementation phases
/speckit.clarify                → Resolve underspecified areas
/speckit.analyze                → Cross-artifact consistency check
```

Typical flow: `specify` → `plan` → `tasks` → `implement`

### BMad Agents

Invoke via skill system (e.g., `/bmad:bmm:agents:architect`). Key agents:

- **analyst**: Requirements analysis
- **architect**: Technical architecture
- **pm**: Product management
- **dev**: Development execution
- **sm**: Scrum master

### BMad Workflows

Invoke via skill system. Key workflows:

- **prd**: Create/validate Product Requirements
- **create-architecture**: Design system architecture
- **create-epics-and-stories**: Break PRD into stories
- **sprint-planning**: Generate sprint status tracking
- **dev-story**: Execute story implementation

## Directory Structure

```
.specify/
  memory/constitution.md    # Project principles (template - needs filling)
  templates/                # Spec, plan, tasks templates
  scripts/bash/             # Helper scripts for workflows

_bmad/
  core/                     # Core framework (agents, workflows)
  bmb/                      # BMad Builder (create agents/workflows)
  bmm/                      # BMad Method (full methodology)
  cis/                      # Creative/Innovation Suite
  _config/manifest.yaml     # Installed modules

_bmad-output/               # Generated artifacts go here
docs/                       # Documentation output
specs/                      # Feature specs (created per-feature)
```

## Script Usage

```bash
# Check prerequisites before planning
.specify/scripts/bash/check-prerequisites.sh --json

# Create new feature branch + spec
.specify/scripts/bash/create-new-feature.sh --json "feature description"

# Setup planning phase
.specify/scripts/bash/setup-plan.sh --json

# Update agent context after plan changes
.specify/scripts/bash/update-agent-context.sh claude
```

## Constitution

Project principles live in `.specify/memory/constitution.md`. Currently a template - must be filled out before implementation. The constitution defines:

- Core development principles
- Governance rules
- Quality gates

## Feature Branch Naming

Pattern: `{number}-{short-name}` (e.g., `1-user-auth`, `5-analytics-dashboard`)

Scripts auto-increment feature numbers across remote branches, local branches, and specs directories.

## Design System (CRITICAL)

**Source of Truth**: `_bmad-output/planning-artifacts/design-system-v5.md`

**Reference Implementation**: `_bmad-output/planning-artifacts/ux-design-direction-v5.html`

All UI implementations MUST match the approved design system exactly. When implementing UI:

1. **Reference by path, not inline values** - Never hardcode hex colours in stories or tasks. Always reference the design doc.

2. **Key v5 tokens**:
   - Terracotta accent: `#B8510D`
   - Font: Inter (system fallback)
   - Max width: 720px
   - Border radius: 4px (rounded-sm)

3. **Badge colours** (see design doc for full list):
   - Sound: `#E3ECF0` / `#264854`
   - Light: `#F4EBDA` / `#4D3F14`
   - Crowds: `#EDE6E0` / `#3F352C`

4. **Sensory levels**:
   - Low: `#2A6339` (12px square + text)
   - Medium: `#8A5F08`
   - High: `#9E3322`

5. **Component patterns**:
   - Divider-separated rows (not bordered cards)
   - SVG chevron toggle (not Lucide icons)
   - Uppercase badge text with tracking-wide

**Validation**: Before marking UI stories complete, verify implementation matches v5 design doc exactly.
