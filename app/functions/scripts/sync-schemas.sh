#!/bin/bash
# Sync shared schemas from client to functions
# Run before build to ensure schemas stay in sync

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FUNCTIONS_DIR="$(dirname "$SCRIPT_DIR")"
CLIENT_SCHEMAS="$FUNCTIONS_DIR/../src/lib/schemas"
FUNCTIONS_SCHEMAS="$FUNCTIONS_DIR/src/schemas"

# Copy guideSchema from client (source of truth) to functions
cp "$CLIENT_SCHEMAS/guideSchema.ts" "$FUNCTIONS_SCHEMAS/guideSchema.ts"

echo "Synced schemas from client to functions"
