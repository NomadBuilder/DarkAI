#!/usr/bin/env bash
# Build the Ledger for protectont.ca (root, no base path) and prepare a folder
# you can copy into the Flask/deployed repo so the site works without Render's build step.
set -e
cd "$(dirname "$0")/.."

echo "Building Ledger for protectont.ca (static export, no base path)..."
npm run build:protectont

PREBUILT_DIR="prebuilt-for-deploy"
rm -rf "$PREBUILT_DIR"
mkdir -p "$PREBUILT_DIR"
cp -r out/. "$PREBUILT_DIR/"

echo ""
echo "Done. Pre-built output is in: $PREBUILT_DIR/"
echo ""
echo "To make protectont.ca self-contained:"
echo "  1. In your Flask/deployed repo (e.g. DarkAI-consolidated):"
echo "     - Copy contents of FFord/$PREBUILT_DIR/ into either:"
echo "       ledger/out/   or   static/protectont/"
echo "     - Ensure your Flask app's _ledger_dir() checks that path first."
echo "  2. Commit and push the deployed repo so Render deploys with those files."
echo ""
echo "See PREBUILT_DEPLOY.md for details."
