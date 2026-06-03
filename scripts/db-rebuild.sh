#!/bin/bash

# =====================================================
# DATABASE REBUILD SCRIPT
# Purpose: Complete database rebuild for development
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting complete database rebuild...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo -e "${YELLOW}💡 Run: task db:rebuild (loads docker/.env) or export DATABASE_URL${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  This will completely reset your database!${NC}"
echo -e "${YELLOW}⚠️  All existing data will be lost!${NC}"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}ℹ️  Operation cancelled${NC}"
    exit 0
fi

# Step 1: Reset database
echo -e "${RED}🗑️  Dropping all tables...${NC}"
./scripts/db-reset.sh

# Step 2: Initialize schema
echo -e "${BLUE}🏗️  Creating database schema...${NC}"
./scripts/db-init.sh

# Step 3: Load seed data
echo -e "${GREEN}🌱 Loading seed data...${NC}"
./scripts/db-seed.sh

echo -e "${GREEN}✅ Database rebuild completed successfully!${NC}"
echo -e "${BLUE}📊 Database statistics:${NC}"

# Show some statistics
psql "$DATABASE_URL" -c "
SELECT 
    'Departments' as table_name, COUNT(*) as records FROM departments
UNION ALL
SELECT 
    'Programs' as table_name, COUNT(*) as records FROM programs
UNION ALL
SELECT 
    'Campuses' as table_name, COUNT(*) as records FROM campuses
UNION ALL
SELECT 
    'Progressive Tuition' as table_name, COUNT(*) as records FROM progressive_tuition
UNION ALL
SELECT 
    'Program Availability' as table_name, COUNT(*) as records FROM program_campus_availability
UNION ALL
SELECT 
    'Admission Quotas' as table_name, COUNT(*) as records FROM admission_quotas
UNION ALL
SELECT 
    'Scholarships' as table_name, COUNT(*) as records FROM scholarships
ORDER BY table_name;
"

echo -e "${GREEN}🎉 Ready for development!${NC}"
