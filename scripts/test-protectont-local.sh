#!/usr/bin/env bash
# Quick local test for ProtectOnt routing (no deploy needed).
# Usage:
#   1. From repo root:  pip install -r requirements.txt  (if needed)
#   2. Ensure ledger/out exists (copy from FFord or run: cd ledger && npm run build:protectont)
#   3. Start Flask:  python app.py   (or: flask run --port 5000)
#   4. In another terminal:  ./scripts/test-protectont-local.sh http://127.0.0.1:5000
#
# Or after deploy, hit in browser:  https://protectont.ca/_ledger-status

set -e
BASE="${1:-http://127.0.0.1:5000}"
echo "Testing ProtectOnt host detection and Ledger serving at $BASE"
echo ""

echo "1. GET $BASE/_ledger-status (with Host: protectont.ca, X-Forwarded-Host: protectont.ca)"
curl -s -H "Host: protectont.ca" -H "X-Forwarded-Host: protectont.ca" "$BASE/_ledger-status" | python3 -m json.tool
echo ""

echo "2. GET $BASE/ (with same headers) - expect Ledger HTML or 503 if ledger/out missing"
HEADERS=$(curl -s -o /tmp/protectont_root.html -w "%{http_code}" -H "Host: protectont.ca" -H "X-Forwarded-Host: protectont.ca" "$BASE/")
echo "HTTP status: $HEADERS"
if [ "$HEADERS" = "200" ]; then
  echo "First 3 lines of response:"
  head -3 /tmp/protectont_root.html
elif [ "$HEADERS" = "503" ]; then
  echo "Response body:"
  cat /tmp/protectont_root.html | python3 -m json.tool 2>/dev/null || cat /tmp/protectont_root.html
fi
echo ""

echo "3. GET $BASE/_ledger-status (no special headers - request.host will be 127.0.0.1:5000)"
curl -s "$BASE/_ledger-status" | python3 -m json.tool
echo ""
echo "Done. If step 1 shows is_protect_ontario: true and ok: true, routing and build are good."
