#!/bin/bash

# Setup script for Gemini API integration
# This script helps configure the Google AI API key for PDF transformation

set -e

echo "🤖 Gemini API Setup for Sensory Guide"
echo "======================================"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo "This script will help you set up the Gemini API for PDF transformation."
echo ""
echo "📋 Prerequisites:"
echo "   1. A Google account"
echo "   2. Access to Google AI Studio (free)"
echo ""

# Check if already configured
echo "Checking current configuration..."
if firebase functions:secrets:access GOOGLE_AI_API_KEY &> /dev/null 2>&1; then
    echo "✅ GOOGLE_AI_API_KEY is already configured!"
    echo ""
    read -p "Do you want to update it? (y/N): " update
    if [[ ! "$update" =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration."
        exit 0
    fi
fi

echo ""
echo "🔑 Get your API key:"
echo "   1. Go to: https://aistudio.google.com/apikey"
echo "   2. Click 'Create API Key'"
echo "   3. Select your Google Cloud project (or create one)"
echo "   4. Copy the generated API key"
echo ""

read -p "Paste your Gemini API key here: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. Exiting."
    exit 1
fi

# Validate key format (basic check)
if [[ ! "$api_key" =~ ^AIza ]]; then
    echo "⚠️  Warning: API key doesn't start with 'AIza' - this might not be a valid Google API key"
    read -p "Continue anyway? (y/N): " continue
    if [[ ! "$continue" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Setting secret in Firebase..."
echo "$api_key" | firebase functions:secrets:set GOOGLE_AI_API_KEY

echo ""
echo "✅ Gemini API key configured successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy functions: cd functions && npm run deploy"
echo "   2. Test the transform by uploading a PDF in the admin portal"
echo ""
echo "💡 For local development with emulators, create a .secret.local file:"
echo "   echo 'GOOGLE_AI_API_KEY=$api_key' > functions/.secret.local"
echo ""
echo "🔗 Useful links:"
echo "   - API Dashboard: https://aistudio.google.com"
echo "   - Usage & Quotas: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com"
echo "   - Pricing: https://ai.google.dev/pricing"
