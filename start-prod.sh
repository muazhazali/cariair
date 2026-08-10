#!/bin/bash
# Start CariAir production server locally

# Load environment variables from .env.local (optional)
[ -f .env.local ] && export $(grep -v '^#' .env.local | grep '=' | xargs)

echo "Starting CariAir production server..."
node .next/standalone/server.js