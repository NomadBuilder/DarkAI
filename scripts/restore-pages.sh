#!/bin/bash
# Restore disabled pages

echo "=== RESTORING PAGES ==="
cd ledger/app

mv about.disabled about 2>/dev/null && echo "✅ Restored about" || echo "⚠️  about not found"
mv water.disabled water 2>/dev/null && echo "✅ Restored water" || echo "⚠️  water not found"
mv water_billcalculator.disabled water_billcalculator 2>/dev/null && echo "✅ Restored water_billcalculator" || echo "⚠️  water_billcalculator not found"

echo ""
echo "✅ All pages restored"
