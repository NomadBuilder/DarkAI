#!/bin/bash

# DarkAI Consolidated Platform - Local Setup Script
# This script sets up the local development environment

set -e

echo "🚀 Setting up DarkAI Consolidated Platform for local development..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "   You can edit .env to customize settings"
else
    echo "✅ .env file already exists"
fi
echo ""

# Start databases
echo "🐳 Starting PostgreSQL and Neo4j containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for databases to be ready..."
sleep 5

# Check PostgreSQL
echo "🔍 Checking PostgreSQL connection..."
if docker exec darkai-postgres pg_isready -U darkai_user &> /dev/null; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL might still be starting..."
fi

# Check Neo4j
echo "🔍 Checking Neo4j connection..."
if docker exec darkai-neo4j cypher-shell -u neo4j -p neo4j123password "RETURN 1" &> /dev/null; then
    echo "✅ Neo4j is ready"
else
    echo "⚠️  Neo4j might still be starting..."
fi

echo ""
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the app: python3 app.py"
echo "   2. Visit: http://localhost:5000"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop databases: docker-compose down"
echo "   - Restart databases: docker-compose restart"
echo "   - View database: docker exec -it darkai-postgres psql -U darkai_user -d darkai"
echo "   - View Neo4j: http://localhost:7474 (username: neo4j, password: neo4j123password)"
echo ""

