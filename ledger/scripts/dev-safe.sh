#!/bin/bash

# Safe dev server startup script
# Clears cache, validates build, then starts dev server

set -e

echo "🧹 Cleaning build cache..."
rm -rf .next
echo "✓ Cache cleared"

echo "🔍 Validating build..."
npm run build:validate || {
  echo "❌ Build validation failed. Fix errors before starting dev server."
  exit 1
}

echo "🚀 Starting dev server..."
npm run dev
