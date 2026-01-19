#!/bin/bash
# Auto-restart dev server on file changes

cd "$(dirname "$0")/.."

# Kill any existing dev server
pkill -f "next dev" 2>/dev/null

# Clear cache
rm -rf .next

# Start dev server
echo "🚀 Starting dev server with auto-reload..."
npm run dev
