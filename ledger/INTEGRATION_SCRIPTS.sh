#!/bin/bash
# Integration script to add FFord to darkai-consolidated

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Integration Script for darkai-consolidated${NC}"
echo ""

# Get paths
CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Current project directory: $CURRENT_DIR"
echo ""

# Prompt for darkai-consolidated path
read -p "Enter path to darkai-consolidated repository: " DARKAI_PATH

if [ ! -d "$DARKAI_PATH" ]; then
    echo "Error: Directory $DARKAI_PATH does not exist"
    exit 1
fi

LEDGER_DIR="$DARKAI_PATH/ledger"

echo ""
echo -e "${YELLOW}Step 1: Copying project to darkai-consolidated/ledger/${NC}"

# Create ledger directory
mkdir -p "$LEDGER_DIR"

# Copy files (excluding node_modules, .next, out, .git)
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'out' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    "$CURRENT_DIR/" "$LEDGER_DIR/"

echo ""
echo -e "${GREEN}✓ Files copied successfully${NC}"
echo ""

# Build the ledger project
echo -e "${YELLOW}Step 2: Building ledger with BASE_PATH=/ledger${NC}"
cd "$LEDGER_DIR"
npm install
BASE_PATH=/ledger STATIC_EXPORT=true npm run build

echo ""
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Check if main service has public directory
if [ -d "$DARKAI_PATH/public" ]; then
    echo -e "${YELLOW}Step 3: Copying built files to public/ledger/${NC}"
    mkdir -p "$DARKAI_PATH/public/ledger"
    cp -r "$LEDGER_DIR/out/"* "$DARKAI_PATH/public/ledger/"
    echo -e "${GREEN}✓ Files copied to public directory${NC}"
else
    echo -e "${YELLOW}Note: No public/ directory found. You'll need to configure routing manually.${NC}"
fi

echo ""
echo -e "${GREEN}Integration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your Render build command to include ledger build"
echo "2. Configure routing to serve /ledger path"
echo "3. Commit and push to trigger deployment"
echo ""
echo "See INTEGRATION_GUIDE.md for detailed instructions"
