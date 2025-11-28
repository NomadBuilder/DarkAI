#!/bin/bash

# Update .env file to support both local and remote

set -e

ENV_FILE=".env"
BACKUP_FILE=".env.backup"

echo "🔄 Updating .env file for local + remote support..."
echo ""

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✅ Backed up existing .env to $BACKUP_FILE"
fi

# Create new .env with both local and remote settings
cat > "$ENV_FILE" << 'EOF'
# ============================================
# DarkAI Consolidated Platform - Environment Variables
# ============================================
# This file supports BOTH local and remote (Render) environments
# 
# HOW IT WORKS:
# - LOCAL: When DATABASE_URL is NOT set, uses individual POSTGRES_* vars below
# - REMOTE (Render): When DATABASE_URL IS set (by Render), uses that instead
# 
# The app automatically detects which environment and uses the right settings!

# ============================================
# ENVIRONMENT DETECTION
# ============================================
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=change-this-secret-key-in-production

# ============================================
# REMOTE (RENDER) DATABASE SETTINGS
# ============================================
# These are kept for reference but won't be used locally
# On Render, DATABASE_URL is set automatically when database is linked
# DATABASE_URL=postgresql://user:pass@host:port/db  # Set by Render automatically

# Render PostgreSQL (for reference - not used locally)
# POSTGRES_HOST=dpg-d42kod95pdvs73d5nt30-a.oregon-postgres.render.com
# POSTGRES_PORT=5432
# POSTGRES_USER=ncii_user
# POSTGRES_PASSWORD=Zu1uJcsJjAfN3ZAx4N9aN9vjwFqKrj91
# POSTGRES_DB=ncii

# ============================================
# LOCAL DATABASE SETTINGS (Used when DATABASE_URL is not set)
# ============================================
# These are used for local development with Docker containers
# Match docker-compose.yml settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=darkai_user
POSTGRES_PASSWORD=darkai123password
POSTGRES_DB=darkai

# ============================================
# NEO4J CONFIGURATION
# ============================================
# LOCAL: Uses Docker Neo4j container
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j123password

# REMOTE (Render): Uncomment and set your Neo4j Aura instance
# NEO4J_URI=neo4j+s://e4e27046.databases.neo4j.io
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=Zrw9-8lRlOILYEJb8nTaGkYYNiBL-g2VrWEufgOweWM

# ============================================
# API KEYS (Work in both local and remote)
# ============================================
# These API keys work in both environments

# SerpAPI (for PersonaForge discovery)
SERPAPI_API_KEY=d9154c01fe60a22f97ec5c0545d6f9b090fa52f690a5c518ad6a29af6f54935a

# IP Location & Hosting (1,000/day free without key)
IPLOCATE_API_KEY=

# CMS Detection (limited free lookups)
WHATCMS_API_KEY=

# Advanced Tech Stack Detection (optional)
# BuiltWith: 10 requests/day free - https://api.builtwith.com/
BUILTWITH_API_KEY=

# Wappalyzer: Paid only ($99+/month) - https://www.wappalyzer.com/
WAPPALYZER_API_KEY=

# Shodan: 100 requests/month free - https://account.shodan.io/
SHODAN_API_KEY=

# OpenAI (for AI-powered features)
OPENAI_API_KEY=

# BlackWire API Keys
IPAPI_KEY=
VIRUSTOTAL_API_KEY=
NUMLOOKUP_API_KEY=
ETHERSCAN_API_KEY=

# ============================================
# NOTES
# ============================================
# - Local development: Start databases with `docker-compose up -d`
# - Remote (Render): DATABASE_URL is set automatically
# - The app automatically uses the right database based on environment
# - To use Render database locally, set DATABASE_URL manually
# - To use local database on Render, don't link a database (not recommended)
EOF

echo "✅ Updated .env file!"
echo ""
echo "📋 What's configured:"
echo "   ✅ Local database settings (active when DATABASE_URL not set)"
echo "   ✅ Render database settings (commented, for reference)"
echo "   ✅ Local Neo4j settings (Docker container)"
echo "   ✅ All API keys preserved"
echo ""
echo "💡 How it works:"
echo "   - LOCAL: Uses POSTGRES_HOST=localhost (from .env)"
echo "   - REMOTE: Uses DATABASE_URL (set by Render automatically)"
echo "   - App automatically detects which to use!"
echo ""
echo "📝 Original .env backed up to: $BACKUP_FILE"

