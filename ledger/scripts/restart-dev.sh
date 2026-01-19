#!/bin/bash
# Quick restart script for dev server

echo "🔄 Restarting dev server..."

# Kill existing server
pkill -f "next dev" 2>/dev/null
sleep 1

# Clear cache
rm -rf .next
echo "✅ Cleared .next cache"

# Start fresh
echo "🚀 Starting dev server..."
npm run dev
