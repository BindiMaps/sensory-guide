# Firebase Functions

Cloud Functions for Sensory Guide - handles PDF transformation, storage, and admin operations.

## Setup

### Prerequisites

- Node.js 22+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Blaze plan (required for external API calls)

### Install Dependencies

```bash
cd functions
npm install
```

### Configure Gemini API

The PDF transformation uses Google's Gemini API (direct, not Vertex AI).

**Option 1: Run setup script (recommended)**

```bash
../scripts/setup-gemini.sh
```

**Option 2: Manual setup**

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set it as a Firebase secret:
   ```bash
   firebase functions:secrets:set GOOGLE_AI_API_KEY
   ```

**For local development:**

Create `functions/.secret.local`:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_AI_API_KEY` | Yes | Gemini API key from AI Studio |

## Functions

### `getSignedUploadUrl`

Generates a signed URL for PDF upload to Cloud Storage.

**Input:**
```typescript
{ venueId: string }
```

**Output:**
```typescript
{
  uploadUrl: string      // Signed URL for upload
  destinationPath: string // Storage path
  logId: string          // LLM log record ID
  usageToday: number     // Transforms used today
  usageLimit: number     // Daily limit (10)
}
```

### `transformPdf`

Transforms uploaded PDF to structured guide JSON using Gemini.

**Input:**
```typescript
{
  venueId: string
  uploadPath: string  // From getSignedUploadUrl
  logId: string       // From getSignedUploadUrl
}
```

**Output:**
```typescript
{
  success: boolean
  outputPath: string   // Storage path to guide JSON
  tokensUsed: number
  suggestions: string[]
}
```

**Progress:** Updates `/venues/{venueId}/progress/{logId}` in Firestore with:
- `status`: 'uploaded' → 'extracting' → 'analysing' → 'generating' → 'ready' | 'failed'
- `progress`: 0-100
- `error`: Error message if failed

## Development

### Run Emulator

```bash
npm run serve
```

This starts the Functions emulator on port 5001.

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
# or specific function:
firebase deploy --only functions:transformPdf
```

### View Logs

```bash
npm run logs
# or
firebase functions:log
```

## Testing

### Test Script (without UI)

Test the PDF transformation pipeline directly without running the full app:

```bash
# From app/ directory
export GOOGLE_AI_API_KEY="your-key"
npx ts-node scripts/test-transform.ts [path-to-pdf]
```

Default test file: `docs/ExampleMappingNotes.pdf`

The script:
1. Extracts text from the PDF using pdf-parse
2. Sends it to Gemini API with the transformation prompt
3. Validates the JSON response
4. Saves output to `{input}-guide.json`

## Architecture

```
functions/src/
├── index.ts              # Function exports
├── middleware/
│   └── auth.ts           # Auth + editor access checks
├── storage/
│   └── getSignedUploadUrl.ts
├── transforms/
│   └── transformPdf.ts   # PDF → Guide transformation
├── schemas/
│   └── guideSchema.ts    # Zod schemas for validation
└── utils/
    ├── gemini.ts         # Gemini API wrapper
    └── rateLimiter.ts    # Rate limiting helpers
```

## Rate Limiting

- 50 transforms per user per day
- Counter stored at `/usage/{userEmail}/daily/{YYYY-MM-DD}`
- Resets at midnight UTC
- Check happens before Gemini API call
- Increment happens after successful transform only

## Error Handling

| Error Code | Meaning |
|------------|---------|
| `unauthenticated` | Not logged in |
| `permission-denied` | Not an editor of the venue |
| `resource-exhausted` | Daily rate limit reached |
| `invalid-argument` | Bad input parameters |
| `failed-precondition` | Missing configuration (e.g., API key) |
| `internal` | Server error |

## Costs

**Gemini 2.5 Pro (current model):**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens
- Free tier: 15 requests/minute, 1M tokens/day

Typical PDF transform: ~2,000-5,000 tokens = ~$0.001 or less

## Troubleshooting

**"IAM Service Account Credentials API has not been used" error:**

The Firebase Admin service account needs Service Usage Consumer role:
```bash
PROJECT_ID=your-project-id
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

**"GOOGLE_AI_API_KEY not configured":**
- Local: Create `functions/.secret.local` with `GOOGLE_AI_API_KEY=your-key`
- Production: Run `firebase functions:secrets:set GOOGLE_AI_API_KEY`

**Transform times out:**
- Function has 5min timeout, increase in `transformPdf.ts` if needed
- Very large PDFs (50+ pages) may need chunking

**Invalid JSON from Gemini:**
- Check function logs for raw response: `firebase functions:log --only transformPdf`
- Gemini may return markdown code blocks despite `responseMimeType: 'application/json'`
- The code strips markdown fences, but edge cases may slip through

## Links

- [Google AI Studio](https://aistudio.google.com) - Get API keys, test prompts
- [Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
