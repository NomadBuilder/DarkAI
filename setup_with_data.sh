#!/bin/bash

# DarkAI Consolidated Platform - Complete Setup with Data
# This script sets up everything and imports real data

set -e

echo "🚀 Setting up DarkAI Consolidated Platform with real data..."
echo ""

# Run basic setup first
./setup_local.sh

echo ""
echo "📊 Setting up data for all three services..."
echo ""

# Wait for databases to be fully ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Import ShadowStack data
echo "📥 Importing ShadowStack data (110 domains)..."
python3 import_shadowstack_data_local.py

echo ""
echo "✅ Setup complete with data!"
echo ""
echo "📋 What's available:"
echo ""
echo "   PersonaForge:"
echo "   - Dummy data will be seeded automatically on first run"
echo "   - Visit: http://localhost:5000/personaforge"
echo ""
echo "   BlackWire:"
echo "   - Trace functionality ready (Neo4j connected)"
echo "   - Visit: http://localhost:5000/blackwire/trace"
echo ""
echo "   ShadowStack:"
echo "   - 110 real domains imported"
echo "   - Visit: http://localhost:5000/shadowstack/dashboard"
echo ""
echo "🚀 Start the app:"
echo "   python3 app.py"
echo ""

