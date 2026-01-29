#!/bin/bash
# Setup Firebase service account key for local Functions development
# This enables signed URL generation in the Functions emulator

set -e

KEY_PATH="$HOME/.config/firebase/sensory-guide-service-account.json"
PROJECT_ID="sensory-guide"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
  echo "✓ Service account key already exists at $KEY_PATH"
  echo "  Run: yarn emulators:functions"
  exit 0
fi

echo "Setting up Firebase service account key for local development..."
echo ""

# Create directory
mkdir -p "$(dirname "$KEY_PATH")"

# Find the Firebase Admin SDK service account
SA_EMAIL=$(gcloud iam service-accounts list --project="$PROJECT_ID" --format="value(email)" | grep firebase-adminsdk)

if [ -z "$SA_EMAIL" ]; then
  echo "✗ Could not find Firebase Admin SDK service account"
  echo "  Make sure you're authenticated with gcloud and have access to the project"
  exit 1
fi

echo "Found service account: $SA_EMAIL"

# Create the key
gcloud iam service-accounts keys create "$KEY_PATH" \
  --iam-account="$SA_EMAIL" \
  --project="$PROJECT_ID"

echo ""
echo "✓ Service account key created at $KEY_PATH"
echo ""
echo "The 'yarn emulators:functions' script will automatically use this key."
echo "You're all set! Run: yarn emulators:functions"
