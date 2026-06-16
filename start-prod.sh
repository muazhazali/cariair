#!/bin/bash
# Start CariAir production server locally

# Load environment variables from .env.local
export $(grep -v '^#' .env.local | grep '=' | xargs)

# Export DB variables without quotes
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASS=postgres
export DB_NAME=cariair
export AUTH_SECRET="XFU1yZOehebBWuOMlF0kZclx6XGVyVK0xHrCX+ywM6s="

echo "Starting CariAir production server..."
echo "Database: $DB_HOST:$DB_PORT"

node .next/standalone/server.js
