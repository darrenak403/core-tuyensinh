#!/bin/bash

# Database Schema Initialization
# Loads schema files in correct order
# Note: DATABASE_URL from docker/.env (task db)

set -e  # Exit on any error

echo "🚀 Loading database schema..."

# Load main schema files
for file in src/database/schema/*.sql; do
    if [ -f "$file" ]; then
        echo "Loading $(basename "$file")..."
        psql $DATABASE_URL -f "$file"
    fi
done

# Load views directory (if exists)
if [ -d "src/database/schema/05_views" ]; then
    echo "Loading views..."
    for file in src/database/schema/05_views/*.sql; do
        if [ -f "$file" ]; then
            echo "Loading $(basename "$file")..."
            psql $DATABASE_URL -f "$file"
        fi
    done
fi

echo "✅ Schema loaded successfully!"
