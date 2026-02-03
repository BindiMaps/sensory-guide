# Story 8.7: Filter Analytics Events

Status: review

## Story

As a **product team**,
I want **to track filter usage**,
So that **we understand which sensitivities users prioritise**.

## Acceptance Criteria

1. **AC1: Filter Toggle Event** - Given a user toggles a filter, when the action completes, then event `filter_toggled` fires with `{ category: string, action: 'on' | 'off' }`

2. **AC2: Threshold Change Event** - Given a user changes a threshold, when saved, then event `threshold_changed` fires with `{ category: string, from: Threshold, to: Threshold }`

3. **AC3: Profile Clear Event** - Given a user clears their profile, when cleared, then event `profile_cleared` fires

4. **AC4: Analytics Integration** - Events fire via existing analytics util (GA4)

5. **AC5: Dev Mode Check** - Dev mode check skips analytics in local dev (per Story 5-3 pattern)

## Design Validation

**Not applicable** - analytics events have no UI.

## Tasks / Subtasks

- [x] Task 1: Add filter analytics event types (AC: 1, 2, 3, 4)
  - [x] 1.1: Add `FILTER_TOGGLED` to AnalyticsEvent
  - [x] 1.2: Add `FILTER_THRESHOLD_CHANGED` to AnalyticsEvent
  - [x] 1.3: Add `FILTER_PROFILE_CLEARED` to AnalyticsEvent
  - [x] 1.4: Add corresponding param interfaces

- [x] Task 2: Track filter toggle in FilterBar (AC: 1, 5)
  - [x] 2.1: Import useAnalytics with useGtag option
  - [x] 2.2: Track event when category toggled on
  - [x] 2.3: Track event when category toggled off

- [x] Task 3: Track threshold changes in ThresholdSettings (AC: 2, 5)
  - [x] 3.1: Import useAnalytics
  - [x] 3.2: Track event with old and new threshold values

- [x] Task 4: Track profile clear (AC: 3, 5)
  - [x] 4.1: Add tracking in appropriate location (clearProfile action or UI)

- [x] Task 5: Write tests (AC: 1-5)
  - [x] 5.1: Test events fire with correct params
  - [x] 5.2: Test dev mode skips analytics

## Dev Notes

### Event Naming Convention

Following project pattern: `{domain}_{action}_{target}`
- `filter_toggled` - user toggles a category on/off
- `filter_threshold_changed` - user changes threshold level
- `filter_profile_cleared` - user clears entire profile

### Analytics Hook Usage

For public pages (guide), use `useAnalytics({ useGtag: true })` per project-context.md.

### Files to Modify

- `app/src/lib/analytics/types.ts` - add event types
- `app/src/shared/components/guide/FilterBar.tsx` - add toggle tracking
- `app/src/shared/components/guide/ThresholdSettings.tsx` - add threshold tracking

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Added FILTER_TOGGLED, FILTER_THRESHOLD_CHANGED, FILTER_PROFILE_CLEARED events to types.ts
- Added tracking in FilterBar for toggle on/off with category and action params
- Added tracking in ThresholdSettings for threshold changes with from/to values
- Added "Clear all filters" button to ThresholdSettings that tracks profile_cleared
- Uses useGtag mode for public pages (dev mode skips analytics automatically)
- Added comprehensive test coverage for all analytics events

### File List

- `app/src/lib/analytics/types.ts` (modified)
- `app/src/shared/components/guide/FilterBar.tsx` (modified)
- `app/src/shared/components/guide/FilterBar.test.tsx` (modified)
- `app/src/shared/components/guide/ThresholdSettings.tsx` (modified)
- `app/src/shared/components/guide/ThresholdSettings.test.tsx` (created)
