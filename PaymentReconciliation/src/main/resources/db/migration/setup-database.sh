#!/bin/bash

# Script to execute DDL script on Azure MySQL Flexible Server
# This script connects to Azure MySQL and creates the required tables

set -e

# Configuration - UPDATE THESE VALUES
MYSQL_HOST="paymentreconciliation.mysql.database.azure.com"
MYSQL_PORT="3306"
MYSQL_DATABASE="paymentreconciliation_prod"
MYSQL_USER="your_mysql_username"  # Replace with your actual username
MYSQL_PASSWORD=""  # Will be prompted for security

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🗄️  Azure MySQL Database Schema Setup${NC}"
echo "=============================================="
echo "Host: ${MYSQL_HOST}"
echo "Database: ${MYSQL_DATABASE}"
echo "Username: ${MYSQL_USER}"
echo

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL client is not installed.${NC}"
    echo "Please install MySQL client:"
    echo "  - macOS: brew install mysql-client"
    echo "  - Ubuntu: sudo apt-get install mysql-client"
    echo "  - Windows: Download from https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/database-schema-comprehensive.sql"

# Check if schema file exists
if [ ! -f "${SCHEMA_FILE}" ]; then
    echo -e "${RED}❌ database-schema-comprehensive.sql file not found!${NC}"
    echo "Expected location: ${SCHEMA_FILE}"
    echo "Please ensure the database-schema-comprehensive.sql file is in the same directory as this script."
    exit 1
fi

echo -e "${YELLOW}📋 Before proceeding, make sure:${NC}"
echo "1. Your MySQL server allows connections from your IP"
echo "2. You have the correct username and password"
echo "3. The database 'paymentreconciliation_prod' exists (or will be created)"
echo "4. You have appropriate permissions to create tables"
echo

read -p "Continue with database setup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Prompt for password securely
echo -e "${YELLOW}🔐 Enter MySQL password for user '${MYSQL_USER}':${NC}"
read -s MYSQL_PASSWORD

if [ -z "$MYSQL_PASSWORD" ]; then
    echo -e "${RED}❌ Password cannot be empty${NC}"
    exit 1
fi

echo
echo -e "${YELLOW}🔌 Testing connection to Azure MySQL...${NC}"

# Test connection first
mysql \
    --host="${MYSQL_HOST}" \
    --port="${MYSQL_PORT}" \
    --user="${MYSQL_USER}" \
    --password="${MYSQL_PASSWORD}" \
    --ssl-mode=REQUIRED \
    --execute="SELECT 'Connection successful!' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connection successful!${NC}"
else
    echo -e "${RED}❌ Connection failed! Please check your credentials and network connectivity.${NC}"
    exit 1
fi

echo
echo -e "${YELLOW}🏗️  Creating database schema...${NC}"

# Execute the schema creation script
mysql \
    --host="${MYSQL_HOST}" \
    --port="${MYSQL_PORT}" \
    --user="${MYSQL_USER}" \
    --password="${MYSQL_PASSWORD}" \
    --ssl-mode=REQUIRED \
    --database="${MYSQL_DATABASE}" \
    --execute="source ${SCHEMA_FILE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database schema created successfully!${NC}"
else
    echo -e "${RED}❌ Schema creation failed! Check the error messages above.${NC}"
    exit 1
fi

echo
echo -e "${YELLOW}🔍 Verifying table creation...${NC}"

# Verify tables were created
TABLE_COUNT=$(mysql \
    --host="${MYSQL_HOST}" \
    --port="${MYSQL_PORT}" \
    --user="${MYSQL_USER}" \
    --password="${MYSQL_PASSWORD}" \
    --ssl-mode=REQUIRED \
    --database="${MYSQL_DATABASE}" \
    --silent \
    --execute="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${MYSQL_DATABASE}';" 2>/dev/null)

echo -e "${GREEN}📊 Total tables created: ${TABLE_COUNT}${NC}"

if [ "$TABLE_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✅ All tables created successfully!${NC}"
    
    echo
    echo -e "${YELLOW}📋 Created tables:${NC}"
    mysql \
        --host="${MYSQL_HOST}" \
        --port="${MYSQL_PORT}" \
        --user="${MYSQL_USER}" \
        --password="${MYSQL_PASSWORD}" \
        --ssl-mode=REQUIRED \
        --database="${MYSQL_DATABASE}" \
        --execute="SHOW TABLES;" 2>/dev/null
    
    echo
    echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Update your application configuration with the database details"
    echo "2. Deploy your container app"
    echo "3. Test the database connectivity"
    
else
    echo -e "${RED}❌ Some tables may not have been created properly.${NC}"
    echo "Please check the error messages and retry."
fi
