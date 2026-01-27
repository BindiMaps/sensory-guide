# What If Scenarios Review

**Method:** Explore alternative realities to stress-test assumptions and plan for contingencies

**Instructions:** For each scenario, mark if we need to plan for it, add notes on mitigation.

---

## Scenario 1: What if ASPECT isn't available long-term?

**Reality check:** ASPECT is the source of quality audits. What if they're busy, expensive, or unavailable?

**Implications:**

- No new venues without audits
- Existing venues can't be updated
- Business model depends on single supplier

**Mitigations:**

- [ ] Train other auditors (expand supplier base)
- [ ] Venue self-service mode (lower quality, but scales)
- [ ] Partner with other accessibility orgs
- [ ] Document audit methodology so others can replicate

**Include in PRD?** [ ] Yes [ ] No [ ] Note for later
**Notes:**

that's fine.. it can be anyone, aspect is just one current partner

we won't need docs at the moment to show them how to use it, we should strive to make the ui so simple we don't need to maintain documentation

---

## Scenario 5: What if this becomes wildly successful?

**Reality check:** 100+ venues, thousands of daily users. Scale problems.

**Implications:**

- Firebase costs spike
- LLM API costs spike
- Support requests increase
- Need more auditors

**Mitigations:**

- [ ] Pre-compute everything at publish time (no runtime LLM)
- [ ] Static hosting for published guides (cheap, fast)
- [ ] Usage-based pricing for venues (costs covered)
- [ ] Self-service reduces support load

**Include in PRD?** [ ] Yes [ ] No [ ] Architecture concern
**Notes:**

firebase will be for the backend we will only use firebase hosting for the user facing so the risk of runaway costs is virtually nill

we will only allow trusted users to use the app

---

## Scenario 8: What if accessibility testing reveals major issues?

**Reality check:** ASPECT testers can't use the site. Screen readers fail. Ironic disaster.

**Implications:**

- Core mission failure
- M3 evaluation disaster
- Reputation damage

**Mitigations:**

- [x] Lighthouse ≥95 gate (already planned)
- [x] Manual screen reader testing (already planned)
- [ ] Accessibility testing EARLY, not just before launch
- [ ] Budget time for accessibility fixes
- [ ] ASPECT reviews UI before user testing

**Include in PRD?** [ ] Yes [ ] No [ ] Already covered
**Notes:**

fair

---

## Summary: Scenarios Needing Action

**Add to PRD:**

- [tick] Disclaimer requirement for accuracy/liability
- [tick] Early accessibility testing checkpoint
- [ ] Note: Don't over-invest in mobile "during" for MVP

the fundamental design should include mobile.. this is equal to desktop

**Architecture considerations:**

- [tick] Pre-compute at publish (no runtime LLM) - enables scale
- [tick] Static hosting for published guides

**Note for later:**

- [tick] Venue self-service mode (Growth)
- [tick] Expand auditor base beyond ASPECT

---

## Your Additions

Other scenarios to consider:

-

---

**When done:** Save and let me know.
