# BindiMaps Action Plan App

Admin dashboard and public venue guide viewer for BindiMaps.

## Stack

- **React 19** + TypeScript
- **Vite 7** - dev server & build
- **Tailwind CSS 4** - styling
- **Firebase** - Auth, Firestore, Storage, Cloud Functions, Hosting
- **Gemini 2.5 Pro** - PDF to structured guide transformation
- **TanStack Query** - server state
- **Zustand** - client state
- **React Router DOM** - routing
- **React Hook Form + Zod** - forms & validation
- **Vitest** - testing

## Getting Started

```bash
yarn install
yarn dev              # Frontend only (no Cloud Functions)
yarn dev:full         # Frontend + Functions emulator (recommended)
```

### First-time setup (one-time only)

Before using `yarn dev:full`, run these setup commands:

```bash
yarn setup:service-account   # Creates key for signing Storage URLs locally
yarn setup:cors              # Configures CORS on Storage bucket for localhost uploads
```

## Local Development Architecture

**Hybrid setup** - Functions run locally, everything else hits production Firebase:

| Service | Local Dev | Why |
|---------|-----------|-----|
| **Cloud Functions** | Emulator | Fast iteration, no deploys |
| **Gemini API** | Production | No emulator available |
| **Firestore** | Production | Real venue data, no seed scripts |
| **Storage** | Production | Real PDFs, no mock uploads |
| **Auth** | Production | Real user accounts |
| **Hosting** | Vite dev server | HMR, fast refresh |

This means changes to Functions code are instant, but you're working with real data. The Functions emulator needs a service account key to sign Storage URLs (see First-time setup above).

## Development Options

### Option 1: `yarn dev:full` (recommended)

Runs Vite + Functions emulator together, connected to production Firestore/Storage:

```bash
yarn dev:full
```

### Option 2: Separate terminals

```bash
# Terminal 1
yarn emulators:functions

# Terminal 2
yarn dev
```

### Option 3: Full emulator suite (all local)

Run everything locally (Auth, Firestore, Storage, Functions) - useful for offline dev or testing destructive operations:

```bash
yarn emulators
```

Emulator UI at `localhost:4000`. Data resets on restart unless you persist it:

```bash
yarn emulators:export   # Save current data
yarn emulators:import   # Start with saved data
```

### Option 4: Deploy Functions to production

```bash
cd functions && yarn build
firebase deploy --only functions
```

Then set `VITE_USE_EMULATORS=false` in `.env`.

## Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Vite dev server only |
| `yarn dev:full` | Start Vite + Functions emulator (recommended for full dev) |
| `yarn build` | TypeScript check + production build |
| `yarn test` | Run tests once |
| `yarn test:watch` | Run tests in watch mode |
| `yarn lint` | Run ESLint |
| `yarn setup:service-account` | Create service account key for local Functions (one-time) |
| `yarn setup:cors` | Configure CORS on Storage bucket (one-time) |
| `yarn emulators` | Start all Firebase emulators |
| `yarn emulators:functions` | Start only Functions emulator (uses production DB) |
| `yarn deploy` | Build and deploy to Firebase Hosting |
| `yarn deploy:preview` | Deploy to preview channel |

## Project Structure

```
src/
├── features/
│   ├── admin/      # Admin dashboard, venue management
│   │   └── guides/ # PDF upload, guide generation
│   └── public/     # Public pages, guide viewer
├── shared/
│   ├── hooks/      # Shared React hooks
│   └── types/      # TypeScript types
├── stores/         # Zustand stores
├── lib/            # Utilities, Firebase config, auth helpers
│   └── schemas/    # Zod validation schemas
└── test/           # Test setup
functions/          # Firebase Cloud Functions
├── src/
│   ├── storage/    # Signed URL generation
│   └── middleware/ # Auth helpers
```

## Environment

### Firebase SDK Config (Hardcoded)

Firebase web SDK config is **hardcoded** in `src/lib/firebase.ts`. This is intentional and safe:

- Firebase web API keys are designed to be public (they're in your client JS bundle)
- Security is enforced via Firebase Security Rules, not by hiding the config
- Simplifies CI/CD - no env var injection needed at build time

**Do NOT** move the config to environment variables - it breaks CI builds and provides no security benefit.

### Runtime Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_USE_EMULATORS` | Set to `true` in `.env` to connect to local Firebase emulators |

### Gemini API Key

PDF transformation uses Gemini 1.5 Flash. Get an API key from [AI Studio](https://aistudio.google.com/apikey).

**For local dev** (Functions emulator reads from shell env or .secret.local):
```bash
# Option A: Export in shell (lost on terminal close)
export GOOGLE_AI_API_KEY="your-key"

# Option B: Create .secret.local file (persists, git-ignored)
echo 'GOOGLE_AI_API_KEY=your-key' > functions/.secret.local
```

**For production** (stored as Firebase secret):
```bash
firebase functions:secrets:set GOOGLE_AI_API_KEY
# Paste your key when prompted
```

---

## New Environment Setup

Complete guide to spin up a new Firebase project for this app.

### Prerequisites

- Node.js 22+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud account with billing enabled (for Functions + Storage)
- gcloud CLI: https://cloud.google.com/sdk/docs/install

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it (e.g., `sensory-guide-dev` or `sensory-guide-prod`)
4. Enable Google Analytics (optional)
5. Wait for project creation

### Step 2: Enable Firebase Services

In the Firebase Console for your project:

1. **Authentication**
   - Click "Authentication" → "Get started"
   - Enable "Google" sign-in provider
   - Add authorised domain if needed (e.g., your custom domain)

2. **Firestore Database**
   - Click "Firestore Database" → "Create database"
   - Choose "Start in production mode"
   - Select region (e.g., `australia-southeast1` for AU)

3. **Storage**
   - Click "Storage" → "Get started"
   - Choose "Start in production mode"
   - Select same region as Firestore

4. **Upgrade to Blaze Plan**
   - Click "Upgrade" in bottom left
   - Required for Cloud Functions and external API calls (Gemini)
   - Pay-as-you-go, free tier still applies

### Step 3: Configure Local Environment

```bash
# Login to Firebase
firebase login

# Select your project
firebase use your-project-id

# Create .env for local emulator support
echo 'VITE_USE_EMULATORS=true' > .env
```

**Note:** Firebase SDK config is hardcoded in `src/lib/firebase.ts` for the `sensory-guide` project. If setting up a different Firebase project, update those values directly in the source file.

### Step 4: Create Service Account Key (for local Functions)

```bash
# Run the setup script
yarn setup:service-account

# OR manually:
# 1. Go to GCP Console → IAM → Service Accounts
# 2. Click your Firebase Admin SDK service account
# 3. Keys → Add Key → Create new key → JSON
# 4. Save as functions/service-account-key.json
```

### Step 5: Configure Storage CORS

```bash
# Run the setup script
yarn setup:cors

# OR manually:
gcloud storage buckets update gs://your-project.firebasestorage.app --cors-file=cors.json
```

### Step 6: Set Up Gemini API Key

```bash
# Get key from https://aistudio.google.com/apikey

# For local development:
echo 'GOOGLE_AI_API_KEY=your-key' > functions/.secret.local

# For production:
firebase functions:secrets:set GOOGLE_AI_API_KEY
```

### Step 7: Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### Step 8: Deploy Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Step 9: Deploy Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Step 10: Verify Setup

1. Open your deployed app URL
2. Sign in with Google
3. Create a test venue
4. Upload a PDF
5. Verify transformation works

### Quick Commands Reference

```bash
# Full local dev (recommended)
yarn dev:full

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage

# View logs
firebase functions:log

# Check secrets
firebase functions:secrets:access GOOGLE_AI_API_KEY
```

### Adding a Custom Domain

If you connect a custom domain to Firebase Hosting, you must add it to the API key restrictions or Firebase calls will fail from that domain.

```bash
# Get the API key ID
KEY_ID=$(gcloud services api-keys list --project=sensory-guide --format="value(uid)")

# Update restrictions (include ALL domains - existing + new)
gcloud services api-keys update $KEY_ID \
  --project=sensory-guide \
  --allowed-referrers="sensory-guide.web.app/*,sensory-guide.firebaseapp.com/*,localhost:*/*,yourcustomdomain.com/*"
```

Current allowed domains:
- `sensory-guide.web.app`
- `sensory-guide.firebaseapp.com`
- `localhost` (local dev)

### Troubleshooting

**"SigningError" when uploading:**
- Run `yarn setup:service-account` to create the key
- Or run `gcloud auth application-default login`

**"CORS error" when uploading:**
- Run `yarn setup:cors`
- Verify cors.json includes your domain

**"GOOGLE_AI_API_KEY not configured":**
- For local: Create `functions/.secret.local` with the key
- For production: Run `firebase functions:secrets:set GOOGLE_AI_API_KEY`

**Functions not picking up secrets:**
- Redeploy functions after setting secrets
- Check function has `secrets: ['GOOGLE_AI_API_KEY']` in config

**"IAM Service Account Credentials API has not been used" or "serviceusage.services.use" error:**

The Firebase Admin service account needs permission to call Google APIs. Run:
```bash
# Get your project ID
PROJECT_ID=$(firebase use --current | head -n1)

# Grant Service Usage Consumer role to the Firebase Admin SDK service account
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

If the service account email is different, find it in GCP Console → IAM → Service Accounts.

**"Permission denied" on `/venues/{venueId}/progress/{logId}`:**

The Firestore security rules need to allow the progress subcollection. Ensure your `firestore.rules` has:
```
match /progress/{progressId} {
  allow read: if isEditor(get(/databases/$(database)/documents/venues/$(venueId)).data) || isSuperAdmin();
  allow write: if false; // Only Cloud Functions can write
}
```
Then deploy: `firebase deploy --only firestore:rules`

**Transform works locally but fails in production:**
1. Check functions are deployed: `firebase deploy --only functions`
2. Check Gemini secret is set: `firebase functions:secrets:access GOOGLE_AI_API_KEY`
3. Check function logs: `firebase functions:log --only transformPdf`

**"pdfParse is not a function" error:**

This project uses pdf-parse v2 which has a class-based API. If you see this error, ensure the code uses:
```typescript
import { PDFParse } from 'pdf-parse'
const parser = new PDFParse({ data: buffer })
const result = await parser.getText()
await parser.destroy()
```

### Environment Checklist

| Item | Local | Production |
|------|-------|------------|
| Firebase project created | ✓ | ✓ |
| Auth enabled (Google) | ✓ | ✓ |
| Firestore created | ✓ | ✓ |
| Storage bucket created | ✓ | ✓ |
| Blaze plan enabled | ✓ | ✓ |
| Firebase config in firebase.ts | ✓ (hardcoded) | ✓ (hardcoded) |
| Service account key | ✓ | N/A (auto) |
| CORS configured | ✓ | ✓ |
| Gemini API key set | .secret.local | Firebase secret |
| Security rules deployed | - | ✓ |
| Functions deployed | - | ✓ |
| Hosting deployed | - | ✓ |
