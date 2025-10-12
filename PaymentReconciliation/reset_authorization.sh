#!/bin/bash

# ========================================================================================
# AUTHORIZATION SYSTEM RESET SCRIPT EXECUTOR
# This script safely executes the authorization reset SQL file
# ========================================================================================

set -e  # Exit on any error

# Configuration
DOCKER_CONTAINER="paymentreconciliation"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="paymentreconciliation_dev"
DB_USER="root"
DB_PASSWORD="root"  # MySQL root password (set if needed)
USE_DOCKER=true  # Set to true if running MySQL in Docker

SQL_FILE="reset_authorization_to_admin_only.sql"
BACKUP_DIR="./backups"
LOG_FILE="./reset_authorization_$(date +%Y%m%d_%H%M%S).log"

# MySQL command wrapper
mysql_cmd() {
    if [ "$USE_DOCKER" = true ]; then
        docker exec -i "$DOCKER_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    else
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    fi
}

# MySQL dump command wrapper
mysqldump_cmd() {
    if [ "$USE_DOCKER" = true ]; then
        docker exec "$DOCKER_CONTAINER" mysqldump -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    else
        mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    fi
}

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    error "SQL file '$SQL_FILE' not found in current directory"
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check MySQL connection
log "Checking MySQL connection..."
if ! echo "SELECT 1;" | mysql_cmd > /dev/null 2>&1; then
    error "Cannot connect to MySQL database. Please check your credentials and Docker container."
fi
success "MySQL connection successful"

# Create database backup before making changes
log "Creating full database backup before reset..."
BACKUP_FILE="$BACKUP_DIR/pre_reset_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump_cmd > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    success "Database backup created: $BACKUP_FILE"
else
    error "Failed to create database backup"
fi

# Confirm execution
warning "⚠️  WARNING: This will DELETE ALL authorization data and reset to admin-only setup!"
echo ""
echo "The following will happen:"
echo "1. All current authorization data will be backed up to timestamped tables"
echo "2. All authorization tables will be flushed"
echo "3. A single admin user will be created with full system access"
echo "4. Full database backup: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log "Operation cancelled by user"
    exit 0
fi

# Execute the reset script
log "Executing authorization reset script..."
mysql_cmd < "$SQL_FILE"

if [ $? -eq 0 ]; then
    success "Authorization reset script executed successfully"
else
    error "Failed to execute authorization reset script"
fi

# Run verification queries
log "Running verification queries..."
echo ""
echo "=== VERIFICATION RESULTS ===" | tee -a "$LOG_FILE"

mysql_cmd << 'EOF' | tee -a "$LOG_FILE"
-- Verify admin user exists
SELECT 'Admin user created:' as info, username, email, role FROM users WHERE username = 'admin';

-- Verify admin role exists
SELECT 'Admin role created:' as info, name, description FROM roles WHERE name = 'ADMIN';

-- Verify role assignment
SELECT 'Role assignment:' as info, u.username, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';

-- Count capabilities created
SELECT 'Capabilities created:' as info, COUNT(*) as count FROM capabilities;

-- Count policies created
SELECT 'Policies created:' as info, COUNT(*) as count FROM policies;

-- Count endpoints created
SELECT 'Endpoints created:' as info, COUNT(*) as count FROM endpoints;

-- Count UI pages created
SELECT 'UI pages created:' as info, COUNT(*) as count FROM ui_pages;

-- Count page actions created
SELECT 'Page actions created:' as info, COUNT(*) as count FROM page_actions;

-- Show backup tables created
SHOW TABLES LIKE '%_backup%';
EOF

echo ""
success "Authorization system reset completed successfully!"
echo ""
echo "=== NEXT STEPS ==="
echo "1. Change the admin password immediately (current: AdminPass123!)"
echo "2. Test admin login at: POST /api/auth/login"
echo "3. Verify admin has access to all endpoints"
echo "4. If needed, restore data from backup tables or $BACKUP_FILE"
echo ""
echo "=== BACKUP INFORMATION ==="
echo "Full database backup: $BACKUP_FILE"
echo "Table-specific backups created with '_backup' suffix"
echo "Log file: $LOG_FILE"
echo ""
warning "Remember to change the default admin password immediately!"
<parameter name="filePath">/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/reset_authorization.sh
