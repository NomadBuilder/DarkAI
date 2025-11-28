#!/bin/bash
# Start the consolidated DarkAI app
cd "$(dirname "$0")"
PORT=5001 python3 app.py
