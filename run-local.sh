#!/usr/bin/env bash
# Run Flask app locally for ProtectOnt testing (port 5050 to avoid macOS using 5000).
# Install minimal deps first:  pip install -r requirements-minimal.txt
# Blueprints may fail to load; ProtectOnt routes and _ledger-status will still work.

set -e
cd "$(dirname "$0")"
export PORT=5050

if ! python3 -c "import flask" 2>/dev/null; then
  echo "Installing minimal deps..."
  pip install -q -r requirements-minimal.txt
fi

echo "Starting Flask on http://127.0.0.1:$PORT (Ctrl+C to stop)"
echo "Test: curl -H 'Host: protectont.ca' -H 'X-Forwarded-Host: protectont.ca' http://127.0.0.1:$PORT/"
echo "      curl -H 'Host: protectont.ca' http://127.0.0.1:$PORT/_ledger-status"
SKIP_BLUEPRINTS=1 python3 app.py
