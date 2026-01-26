#!/bin/bash
# Test build by temporarily disabling new pages

echo "=== BUILD ISOLATION TEST ==="
echo ""
echo "This script will temporarily disable new pages to test if they're the issue"
echo ""

cd ledger/app

# Backup original pages
echo "1. Backing up new pages..."
mkdir -p ../../.test-backup
cp -r about ../../.test-backup/ 2>/dev/null || true
cp -r water ../../.test-backup/ 2>/dev/null || true
cp -r water_billcalculator ../../.test-backup/ 2>/dev/null || true

# Disable new pages by renaming
echo "2. Temporarily disabling new pages..."
mv about about.disabled 2>/dev/null || true
mv water water.disabled 2>/dev/null || true
mv water_billcalculator water_billcalculator.disabled 2>/dev/null || true

echo "✅ New pages disabled"
echo ""
echo "Now try the build. If it works, the new pages are the problem."
echo ""
echo "To restore pages, run:"
echo "  cd ledger/app"
echo "  mv about.disabled about"
echo "  mv water.disabled water"
echo "  mv water_billcalculator.disabled water_billcalculator"
