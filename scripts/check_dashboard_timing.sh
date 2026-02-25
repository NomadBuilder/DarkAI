#!/usr/bin/env bash
# Hit the PersonaForge dashboard and print timing from response headers.
# Start the app first (e.g. flask run), then run this from project root:
#   ./scripts/check_dashboard_timing.sh
# Or with a base URL:
#   BASE_URL=http://localhost:5000 ./scripts/check_dashboard_timing.sh

BASE_URL="${BASE_URL:-http://127.0.0.1:5000}"
URL="${BASE_URL}/personaforge/dashboard"

echo "Checking: $URL"
echo ""

headers=$(curl -s -I -o /dev/null -D - --max-time 60 "$URL" 2>/dev/null) || { echo "Failed to connect. Is the app running?"; exit 1; }

echo "$headers" | grep -i "X-Dashboard-" || true
total=$(echo "$headers" | grep -i "X-Dashboard-Total-S" | tr -d '\r' | cut -d' ' -f2)
if [ -n "$total" ]; then
  echo ""
  echo "Total dashboard load: ${total}s"
fi
