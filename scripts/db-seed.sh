#!/bin/bash

# Database Seeding
# Loads seed data files in correct order
# Note: DATABASE_URL from docker/.env (task db)

set -e  # Exit on any error

echo "🌱 Loading seed data..."

for file in src/database/seeds/*.sql; do
    if [ -f "$file" ]; then
        echo "Loading $(basename "$file")..."
        psql $DATABASE_URL -f "$file"
    fi
done

echo "✅ Data loaded successfully!"
