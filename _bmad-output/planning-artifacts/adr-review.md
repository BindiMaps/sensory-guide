# Architecture Decision Records Review

**Method:** Multiple architect personas debate key technical choices with explicit trade-offs

**Instructions:** Review each ADR. Mark decisions to keep, reconsider, or add notes.

---

## ADR-004: UI Split (Shadcn Admin / Radix+Custom Public)

**Decision:** Different UI approaches for admin vs public

**Architect A (Unified Advocate):**
- Single design system is simpler
- Less code to maintain
- Consistent patterns

**Architect B (Split Advocate):**
- Admin needs speed (Shadcn gives that)
- Public needs warmth (custom gives that)
- Different users, different needs
- Radix is shared, so accessibility is consistent

**Architect C (Pragmatist):**
- The split makes sense for this product
- Admin is internal, can be utilitarian
- Public is user-facing, needs to feel calming
- Radix underneath both = shared accessibility

**Trade-offs:**
| Factor | Unified | Split |
|--------|---------|-------|
| Maintenance | Simpler | More work |
| Design fit | Compromise | Optimized for each |
| Accessibility | Same | Same (both Radix) |
| Dev speed | Consistent | Admin faster, public more custom |

**Verdict:** Split is correct. Different audiences, different needs. Radix keeps accessibility consistent.

**Keep decision?** [ ] Yes [ ] Reconsider
**Notes:**

---

## ADR-005: Zustand vs Alternatives

**Decision:** Zustand for state management

**Architect A (Zustand Fan):**
- Simple, minimal boilerplate
- Works well with React
- Good TypeScript support
- Perfect for small-medium apps

**Architect B (Redux Advocate):**
- More mature, more tooling
- Better for large apps
- Redux Toolkit reduced boilerplate

**Architect C (No State Library Advocate):**
- Do we even need state management?
- React Query for server state
- Local state for UI
- Maybe Zustand is overkill?

**Trade-offs:**
| Factor | Zustand | Redux | None |
|--------|---------|-------|------|
| Boilerplate | Low | Medium | Lowest |
| Complexity | Low | Medium | Lowest initially |
| Scalability | Good | Best | Limited |
| Learning curve | Easy | Medium | None |

**Question:** What state actually needs managing?
- User's filter preferences (localStorage?)
- Admin form state (local component state?)
- Auth state (Firebase handles this)

**Verdict:** Zustand is fine, but might be overkill. Could start simpler.

**Keep decision?** [ ] Yes [ ] Reconsider [ ] Start without, add if needed
**Notes:**

---

## ADR-006: Monorepo Structure

**Decision:** Yarn workspaces (frontend + backend + shared)

**Architect A (Monorepo Fan):**
- Shared TypeScript types between frontend/backend
- Single repo = easier to manage
- Atomic commits across packages

**Architect B (Separate Repos Advocate):**
- Clearer separation
- Independent deployments
- Simpler CI/CD per repo

**Architect C (Pragmatist):**
- For a small team/project, monorepo is fine
- Shared types are valuable
- Can always split later if needed

**Verdict:** Monorepo is correct for project size. Shared types are valuable.

**Keep decision?** [ ] Yes [ ] Reconsider
**Notes:**

---

## ADR-007: Static Hosting for Published Guides

**Decision:** Pre-compute at publish, serve as static files

**Architect A (Static Advocate):**
- Cheapest possible hosting
- Fastest possible load times
- No server to maintain
- Scales infinitely

**Architect B (Dynamic Advocate):**
- Could personalize server-side
- Could add real-time features
- More flexibility

**Architect C (Pragmatist):**
- Static is perfect for this use case
- Guides don't change after publish
- Any personalization is client-side (filters)
- No runtime LLM = no server needed for public

**Verdict:** Static is absolutely correct. No reason for dynamic serving.

**Keep decision?** [ ] Yes [ ] Reconsider
**Notes:**

---

## Summary

| ADR | Decision | Status |
|-----|----------|--------|
| 001 | SPA | Keep |
| 002 | Firebase | Keep |
| 003 | React | Keep |
| 004 | UI Split | Keep |
| 005 | Zustand | Reconsider? |
| 006 | Monorepo | Keep |
| 007 | Static hosting | Keep |

**Open question:** Do we need Zustand, or is React Query + local state enough?

---

## Your Notes

-

---

**When done:** Save and let me know.
