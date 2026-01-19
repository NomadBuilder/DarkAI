#!/bin/bash
# Script to integrate FFord/Ledger into darkai-consolidated

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Integrating Ledger into darkai-consolidated ===${NC}"
echo ""

# Paths
FFORD_DIR="/Users/aazir/Desktop/Coding/personalprojects/FFord"
DARKAI_DIR="/Users/aazir/Desktop/Coding/DarkAI/DarkAI-consolidated"
LEDGER_DIR="$DARKAI_DIR/ledger"

# Check if darkai-consolidated exists
if [ ! -d "$DARKAI_DIR" ]; then
    echo -e "${RED}Error: darkai-consolidated not found at $DARKAI_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Copying Ledger project...${NC}"
mkdir -p "$LEDGER_DIR"

# Copy files (excluding build artifacts and node_modules)
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'out' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'BUILD_ISSUES.md' \
    --exclude 'CONSOLE_WARNINGS.md' \
    --exclude 'DATA_*.md' \
    --exclude 'DEV_SETUP.md' \
    --exclude 'ENHANCEMENT_PROPOSALS.md' \
    --exclude 'EXPANDED_ANALYSIS.md' \
    --exclude 'LAYOUT_ANALYSIS.md' \
    --exclude 'PROJECT_STATUS.md' \
    --exclude 'SETUP.md' \
    --exclude 'UI_FEATURES.md' \
    --exclude 'VENDOR_CLASSIFICATION.md' \
    --exclude 'CLASSIFICATION_LOGIC.md' \
    --exclude 'DEPLOYMENT*.md' \
    --exclude 'INTEGRATION*.md' \
    "$FFORD_DIR/" "$LEDGER_DIR/"

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

echo -e "${YELLOW}Step 2: Building Ledger...${NC}"
cd "$LEDGER_DIR"
npm install
BASE_PATH=/ledger STATIC_EXPORT=true npm run build

echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${YELLOW}Step 3: Updating Flask app.py...${NC}"
cd "$DARKAI_DIR"

# Check if route already exists
if grep -q "@app.route('/ledger" app.py; then
    echo -e "${YELLOW}⚠ Ledger route already exists in app.py${NC}"
else
    # Add route before the health check
    python3 << 'PYTHON_SCRIPT'
import re

with open('app.py', 'r') as f:
    content = f.read()

# Route to add (before health check)
ledger_route = '''
# Serve Ledger static files at /ledger path
@app.route('/ledger')
@app.route('/ledger/')
@app.route('/ledger/<path:path>')
def serve_ledger(path='index.html'):
    """Serve the Ledger static files at /ledger path"""
    ledger_dir = os.path.join(os.path.dirname(__file__), 'ledger', 'out')
    if path == 'index.html' or not path:
        return send_from_directory(ledger_dir, 'index.html')
    return send_from_directory(ledger_dir, path)


'''

# Insert before health check
pattern = r'(# Health check endpoint for Render)'
replacement = ledger_route + r'\1'
content = re.sub(pattern, replacement, content)

with open('app.py', 'w') as f:
    f.write(content)

print("✓ Added /ledger route to app.py")
PYTHON_SCRIPT
fi

echo ""

echo -e "${YELLOW}Step 4: Updating render.yaml...${NC}"

# Update render.yaml build command
python3 << 'PYTHON_SCRIPT'
import yaml
import os

yaml_file = 'render.yaml'

# Read current render.yaml
with open(yaml_file, 'r') as f:
    config = yaml.safe_load(f)

# Update build command
if 'services' in config and len(config['services']) > 0:
    current_build = config['services'][0].get('buildCommand', '')
    
    # Check if ledger build is already included
    if 'ledger' not in current_build.lower():
        # Add ledger build
        new_build = current_build + '\n  # Build ledger\n  cd ledger && npm install && BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd ..'
        config['services'][0]['buildCommand'] = new_build
        
        # Write back
        with open(yaml_file, 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
        print("✓ Updated render.yaml build command")
    else:
        print("⚠ Ledger build already in render.yaml")
else:
    print("⚠ Could not find services in render.yaml")

PYTHON_SCRIPT

echo ""
echo -e "${GREEN}=== Integration Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes:"
echo "   - Check app.py for the /ledger route"
echo "   - Check render.yaml for the build command"
echo ""
echo "2. Test locally:"
echo "   cd $DARKAI_DIR"
echo "   python3 app.py"
echo "   Visit: http://localhost:5000/ledger"
echo ""
echo "3. Commit and deploy:"
echo "   cd $DARKAI_DIR"
echo "   git add ledger/ app.py render.yaml"
echo "   git commit -m 'Add Ledger project at /ledger path'"
echo "   git push"
echo ""
