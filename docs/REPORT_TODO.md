# Milestone 3 Final Report - TODO

**Due**: Before September 2026 (EDC + 13 months)
**Payment**: $75,000
**Reference**: [Project Agreement](./3-048%20Sensory%20Sensitivity%20Wayfinding%20Project%20Agreement%20EXECUTED%2029%20JULY%202025.pdf) Section 4.4

---

## Required Deliverables (from contract)

### 1. Summary of User Research and Insights
- [ ] Phase 1 research findings (interviews, sensory map testing results)
- [ ] Phase 2 MVP testing outcomes (map overlays tested poorly, action plans tested well)
- [ ] Key insight: users preferred text-based action plans over busy sensory maps
- [ ] ASPECT partnership and their expertise in accessibility auditing
- [ ] Pivot rationale: maps -> action plans (user-validated decision)

**Source content**: EXPLAINER.md Phase 1 & 2 sections

### 2. MVP Feature Specifications
- [ ] Frontend requirements (progressive disclosure, journey-based structure, responsive)
- [ ] Backend requirements (Firebase Auth, PDF upload, LLM transformation)
- [ ] Tech stack decisions (Vite, React, TypeScript, Tailwind, Firebase)
- [ ] Data model / display format schema
- [ ] Admin workflow (upload -> transform -> preview -> publish)
- [ ] User flow documentation

**Source content**: EXPLAINER.md Phase 3 section, PRD, Architecture docs

### 3. Summary of MVP Iterative Cycle Development Process
- [ ] Development methodology (Agile sprints)
- [ ] Testing cycles with ASPECT users
- [ ] Iteration examples showing feedback -> changes
- [ ] Screenshots of app evolution through iterations
- [ ] CI/CD pipeline screenshots showing quality gates passing

**TODO - Screenshots to capture**:
- [ ] GitHub Actions summary (all green checks)
- [ ] Pa11y accessibility test output
- [ ] Lighthouse CI scores (especially accessibility)
- [ ] App UI at different iteration stages

### 4. Evaluation Metrics and Results

**Metrics to track (from contract Section 4.3 Stage 6)**:
- [ ] Engagement rates with the action plan features
- [ ] User-reported stress levels and confidence improvements
- [ ] Number and type of alerts/features triggered and acted upon
- [ ] Satisfaction feedback from sensory-sensitive users

**Quality metrics (from CI)**:
- [ ] Lighthouse scores (performance, accessibility, best practices, SEO)
- [x] Pa11y WCAG compliance results - see `docs/accessibility-audit-v1.md`
- [x] Security audit results (no high-severity vulnerabilities) - see `docs/security-audit-v1.md`
- [ ] Test coverage statistics

### 5. Recommendations for Broader Deployment
- [ ] Technical scalability considerations
- [ ] Multi-venue deployment strategy
- [ ] Integration with existing BindiMaps platform
- [ ] Content creation workflow (PDF -> action plan pipeline)
- [ ] Training requirements for venue operators
- [ ] Potential partners beyond Adelaide Rail
- [ ] Business model recommendations (tie to EXPLAINER "Business Opportunities" section)

---

## Additional Report Content Ideas

### From EXPLAINER.md
- [ ] "What we're NOT building" section - shows disciplined scope control
- [ ] Design decisions rationale (no icons, text badges, etc.)
- [ ] Multi-provider map support (not locked to BindiMaps)
- [ ] Before/During/After framework for user experience
- [ ] Existing examples research (competitor analysis)
- [ ] BindiWeb integration deep-link format

### Accessibility & Security Assurance Section
- [x] Automated WCAG testing on every deployment
- [x] Dependency security scanning
- [ ] Why this matters for the target user group
- [ ] Screenshots of passing audits
- [ ] Commitment to ongoing accessibility compliance

**Completed Audit Documents:**
- `docs/security-audit-v1.md` - Full security audit with sign-off (2026-02-02)
- `docs/accessibility-audit-v1.md` - WCAG 2.1 AA compliance audit with sign-off (2026-02-02)

### Partnership Acknowledgements
- [ ] iMove CRC funding acknowledgement (required per contract clause 16)
- [ ] ASPECT collaboration
- [ ] Adelaide Rail pilot site

---

## Screenshot Checklist

| Screenshot | Purpose | Status |
|-----------|---------|--------|
| GitHub Actions workflow summary | Show CI/CD quality gates | [ ] |
| Pa11y test results | WCAG compliance evidence | [ ] |
| Lighthouse CI report | Accessibility/performance scores | [ ] |
| App - desktop planning view | Final UI | [ ] |
| App - mobile "during" view | Final UI | [ ] |
| Admin - PDF upload flow | Backend workflow | [ ] |
| Admin - preview mode | Quality control | [ ] |

---

## Infeasible Contract Requirements (DATA DEPENDENT)

The contract (Section 4.3, Stage 4) explicitly acknowledges data dependency risk:
> "The use of these data sources depends on third parties and whether these parties have appropriate APIs and are prepared to share them with BindiMaps... some of the data that may be needed to address the user requirements uncovered in the surveys and interviews may not exist or may be private and BindiMaps is unable to access it."

### Summary Table

| Contract Feature | Section | Status | Reason |
|-----------------|---------|--------|--------|
| Live crowding data from transit APIs | Stage 4 | ❌ Infeasible | Adelaide Metro GTFS-RT has no OccupancyStatus field |
| Real-time crowding alerts | Stage 3 | ❌ Infeasible | No live data source available |
| IoT sensor data (sound levels) | Stage 4 | ❌ Infeasible | No public API for venue sound sensors |
| Maintenance/cleaning schedules | Stage 4 | ❌ Infeasible | Internal systems, not API-exposed |
| Static sensory mapping (heatmaps/overlays) | Stage 3 | ⚠️ Pivoted | User research: maps tested poorly, action plans preferred |
| Google Popular Times (live busyness) | Research | ❌ Infeasible | No official API; scraping violates Google ToS |

### Detailed Analysis

#### 1. Live Transit Crowding (Stage 4)
**Contract:** "Live crowding data from transit APIs"

**Research findings:**
- Adelaide Metro publishes GTFS (static) and SIRI (real-time arrivals) only
- No `OccupancyStatus` field in their GTFS-RT feed
- TfNSW has crowding data but: (a) NSW only, (b) requires API key, (c) Protocol Buffer parsing complexity
- No Australian transit agency publishes real-time crowding for Adelaide Rail network

**Mitigation:** Static sensory information captured in action plans (e.g., "This platform is usually busy during peak hours 7-9am")

#### 2. IoT Sensor Data - Sound Levels (Stage 4)
**Contract:** "IoT sensor data (e.g. sound levels)"

**Research findings:**
- No public APIs exist for venue sound level monitoring
- Adelaide Rail does not expose any IoT sensor data
- Would require hardware installation + custom integration (out of scope)

**Mitigation:** Static noise level categorisation in action plans based on ASPECT auditor observations

#### 3. Maintenance/Cleaning Schedules (Stage 4)
**Contract:** "Maintenance or cleaning schedules"

**Research findings:**
- These are typically internal operational systems
- No public API access
- Would require direct integration with venue operator systems

**Mitigation:** General time-based advice in action plans (e.g., "Cleaning typically occurs early morning")

#### 4. Google Popular Times (Historical Busyness)
**Contract:** Not explicitly required but identified as potential crowd data source

**Research findings:**
- Google Places API does **not** expose Popular Times / busyness data
- Third-party services (BestTime.app) scrape this data - $60/yr subscription
- Direct scraping of Google Maps **violates Google Terms of Service**
- Previous research indicated scraping "ToS risk acceptable for MVP" - **this is incorrect**

**Decision:** Cannot implement Google Popular Times feature without either:
1. Violating Google ToS (unacceptable risk)
2. Paying for third-party service (adds ongoing cost)
3. Google adding this to their official API (unlikely)

**Mitigation:** Rely on static time-based advice from venue audits

#### 5. Static Sensory Mapping with Visual Overlays (Stage 3)
**Contract:** "Static sensory mapping with visual overlays (e.g. icons or heatmaps for noise, crowding)"

**Research findings:**
- Phase 2 user testing showed map overlays tested **poorly** with target users
- Users found busy visual maps overwhelming (ironic for sensory sensitivity tool)
- Text-based action plans tested **well** - clear, step-by-step, progressive disclosure

**Decision:** Pivoted from map-based visualisation to text-based action plans based on user research. This is a **user-validated design decision**, not a technical limitation.

---

## API Research: Live Crowding Data (FR53)

**Contract requirement:** "Live crowding data" identified as DATA DEPENDENT risk.

| Source | Outcome | Reason |
|--------|---------|--------|
| Adelaide Metro GTFS-RT | ❌ Not available | Only static GTFS + SIRI arrivals, no OccupancyStatus field |
| TfNSW GTFS-RT | ⚠️ NSW only | Requires API key, Protocol Buffer parsing, wrong state |
| Google Places API | ❌ No Popular Times | Official API doesn't expose busyness/popularity data |
| BestTime.app | ⚠️ Costs $60/yr | Works but adds ongoing subscription cost |
| Google scraping | ❌ ToS violation | Violates Google Terms of Service |

**Decision:** Real-time and historical crowding data features are **not feasible** for MVP without either violating third-party ToS or incurring ongoing costs. Static time-based advice from venue audits will be used instead.

---

## Notes

- Contract requires "images and video" in reports (Section 4.5)
- Must acknowledge iMOVE funding in any publications
- Consider including video walkthrough of the app
- Reference Milestone 2 report for continuity
