#!/usr/bin/env bash
# Pack a Chrome Web Store–ready zip (runtime files only).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT="$ROOT/extension"
OUT_DIR="$EXT/store"
ZIP="$OUT_DIR/anti-default-extension.zip"

cd "$ROOT"
npm run extension:rules
python3 scripts/generate-extension-assets.py

mkdir -p "$OUT_DIR"
rm -f "$ZIP"

# Stage a clean folder so the zip root is the extension contents
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp "$EXT/manifest.json" "$STAGE/"
cp "$EXT/content.js" "$STAGE/"
cp "$EXT/content.css" "$STAGE/"
cp "$EXT/popup.html" "$STAGE/"
cp "$EXT/popup.js" "$STAGE/"
cp "$EXT/rules.json" "$STAGE/"
mkdir -p "$STAGE/icons"
cp "$EXT"/icons/icon-*.png "$STAGE/icons/"

(
  cd "$STAGE"
  zip -r "$ZIP" . -x "*.DS_Store"
)

echo "Packed $ZIP"
unzip -l "$ZIP"
