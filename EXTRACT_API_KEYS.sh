#!/bin/bash
# Extract all API keys from existing projects for Render deployment

echo "🔑 Extracting API Keys from All Projects"
echo "=========================================="
echo ""

cd /Users/aazir/Desktop/AIModules/DarkAI

# Check all possible .env file locations
for file in \
  PersonaForge/.env \
  Extort/.env \
  AIPornTracker/ncii-infra-mapping/.env \
  BlackWire/.env \
  ShadowStack/.env; do
  
  if [ -f "$file" ]; then
    echo "=== $file ==="
    grep -E "API_KEY|NEO4J" "$file" | grep -v "^#" | grep -v "^$"
    echo ""
  fi
done

echo ""
echo "✅ Copy the above keys and paste into Render's Environment Variables section"
echo "   (Go to Render Dashboard → Your Web Service → Environment tab)"

