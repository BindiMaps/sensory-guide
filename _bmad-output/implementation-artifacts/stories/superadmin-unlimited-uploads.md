# Story: Superadmin Unlimited Uploads

## Summary
Normal users get 20 uploads/day limit, superadmins get unlimited. Display "Unlimited admin amount" for superadmins.

## Acceptance Criteria
- [x] AC1: Normal user daily limit is 20 (was 50)
- [x] AC2: Superadmins bypass rate limit entirely
- [x] AC3: Superadmins see "Unlimited admin amount" text instead of "X of Y remaining"
- [x] AC4: Backend returns `isUnlimited: true` for superadmins in usage responses

## Tasks

### Task 1: Update rateLimiter.ts
- [x] 1.1 Change DAILY_TRANSFORM_LIMIT from 50 to 20
- [x] 1.2 Add isSuperAdmin param to checkRateLimit, skip check if true
- [x] 1.3 Add isSuperAdmin param to getCurrentUsage, return isUnlimited flag

### Task 2: Update getSignedUploadUrl.ts
- [x] 2.1 Import isSuperAdmin from accessControl
- [x] 2.2 Check superadmin status before rate limit
- [x] 2.3 Pass superadmin flag to checkRateLimit
- [x] 2.4 Return isUnlimited in response

### Task 3: Update transformPdf.ts
- [x] 3.1 Import isSuperAdmin and DAILY_TRANSFORM_LIMIT
- [x] 3.2 Check superadmin status
- [x] 3.3 Pass to checkRateLimit
- [x] 3.4 Return isUnlimited in response
- [x] 3.5 Use constant instead of hardcoded 50

### Task 4: Update RateLimitDisplay.tsx
- [x] 4.1 Add isUnlimited prop to RateLimitDisplay
- [x] 4.2 Render "Unlimited admin amount" with Shield icon when isUnlimited=true
- [x] 4.3 Update RateLimitBlocker to return null for unlimited users

### Task 5: Update VenueDetail.tsx
- [x] 5.1 Add isUnlimited to usageInfo state type
- [x] 5.2 Pass isUnlimited to RateLimitDisplay
- [x] 5.3 Pass isUnlimited to RateLimitBlocker
- [x] 5.4 Update isRateLimitExhausted check to skip for unlimited users

## Files Modified
- app/functions/src/utils/rateLimiter.ts
- app/functions/src/storage/getSignedUploadUrl.ts
- app/functions/src/transforms/transformPdf.ts
- app/src/features/admin/guides/RateLimitDisplay.tsx
- app/src/features/admin/VenueDetail.tsx

## Status: COMPLETE
