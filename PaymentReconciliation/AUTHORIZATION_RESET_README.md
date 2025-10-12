# Authorization System Reset to Admin-Only Setup

This guide provides scripts to safely reset your authorization system to a minimal admin-only configuration.

## ⚠️ WARNING

**This operation will DELETE ALL existing authorization data** including:
- All roles (except ADMIN role)
- All capabilities, policies, endpoints, UI pages, and page actions
- All role assignments and policy configurations

**Users table is PRESERVED AS-IS** - your existing user will be assigned the ADMIN role.

**Backup tables will be created** for potential restoration, but proceed with caution!

## Files

- `reset_authorization_to_admin_only.sql` - The main SQL script that performs the reset
- `reset_authorization.sh` - Executable shell script that safely runs the SQL script
- `backups/` - Directory where full database backups are stored

## Prerequisites

1. **MySQL/MariaDB** running and accessible
2. **Database credentials** configured in the shell script
3. **Backup of important data** (the script creates backups, but better safe than sorry)

## Configuration

Edit `reset_authorization.sh` and set your database credentials:

```bash
DOCKER_CONTAINER="paymentreconciliation"  # Your Docker container name (check with: docker ps)
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="paymentreconciliation_dev"
DB_USER="root"
DB_PASSWORD="root"  # MySQL root password (from application-dev.yml)
USE_DOCKER=true  # Set to true if running MySQL in Docker
```

**Note:** The password is set to "root" based on your `application-dev.yml` configuration.

### Docker Setup
If your MySQL database is running in Docker:
1. Set `USE_DOCKER=true`
2. Set `DOCKER_CONTAINER` to your container name (usually "paymentreconciliation")
3. Ensure the container is running: `docker ps`
4. The script will automatically use `docker exec` commands

## Usage

### Option 1: Use the Safe Shell Script (Recommended)

```bash
# Make sure you're in the project directory
cd /path/to/your/project

# Run the reset script
./reset_authorization.sh
```

The script will:
1. Check MySQL connection
2. Create a full database backup
3. Ask for confirmation
4. Execute the reset SQL script
5. Run verification queries
6. Show results and next steps

### Option 2: Run SQL Directly

```bash
# Connect to MySQL and run the script
mysql -u root -p your_database_name < reset_authorization_to_admin_only.sql
```

## What Gets Created

### Existing User Assigned ADMIN Role
- Your existing user (ID: 1) will be assigned the ADMIN role
- Full access to all system functions
- No new user is created

### ADMIN Role
- Full access to all system functions
- Single role for simplicity

### Comprehensive Capabilities
- **Authentication:** Login, logout, profile management
- **User Management:** CRUD operations on users
- **Role Management:** CRUD operations on roles
- **Capability Management:** CRUD operations on capabilities
- **Policy Management:** CRUD operations on policies
- **Endpoint Management:** CRUD operations on endpoints
- **UI Management:** CRUD operations on pages and actions
- **System:** Maintenance, logs, backup operations

### Single Policy
- **Name:** `policy.admin.full_access`
- **Expression:** `{"roles": ["ADMIN"]}`
- **Grants:** All capabilities to ADMIN role

### Essential Endpoints
- All `/api/auth/*` endpoints
- All `/api/admin/*` endpoints
- All `/api/system/*` endpoints

### Basic UI Structure
- Dashboard
- Administration section with sub-pages
- System section with logs and backup

## Verification

After running the script, verify the setup:

```bash
# Test login with your existing user credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_existing_username", "password": "your_existing_password"}'
```

Expected response includes JWT token and full authorization data (should show ADMIN role).

## Next Steps

1. **Ensure your existing user has a strong password!**
   ```bash
   # If needed, change password via API
   curl -X PUT http://localhost:8080/api/auth/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"password": "NewSecurePassword123!"}'
   ```

2. **Test admin access** to various endpoints
3. **Rebuild authorization system** as needed using the existing admin account
4. **Clean up backup tables** when satisfied with the new setup

## Restoration (If Needed)

If you need to restore data:

### Option 1: Restore from SQL Backup
```bash
mysql -u root -p your_database_name < backups/pre_reset_backup_20231201_120000.sql
```

### Option 2: Restore from Table Backups
```sql
-- Drop current tables and rename backups
DROP TABLE users;
ALTER TABLE users_backup RENAME TO users;

-- Repeat for all authorization tables...
```

## Security Notes

- **User password** should be strong and changed if needed
- **Backup files** contain sensitive data - secure them appropriately
- **Existing user** now has ADMIN access to everything - use carefully
- **In production**, use proper password policies and multi-factor authentication

## Troubleshooting

### Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in the script
- Ensure user has proper permissions on the database

### Docker Issues
- Verify container is running: `docker ps`
- Check container name: `docker ps --format "table {{.Names}}"`
- Test Docker MySQL connection: `docker exec -it paymentreconciliation mysql -u root -p`
- Ensure SQL file is accessible from host: `ls -la reset_authorization_to_admin_only.sql`

### Script Fails
- Check the log file: `reset_authorization_*.log`
- Verify SQL syntax: `mysql -u root -p < reset_authorization_to_admin_only.sql`
- Check for foreign key constraint issues

### Data Issues
- Verify backup tables exist: `SHOW TABLES LIKE '%_backup%';`
- Check row counts: `SELECT COUNT(*) FROM users_backup;`

## Support

If you encounter issues:
1. Check the log files for detailed error messages
2. Verify all prerequisites are met
3. Ensure you have database administrator privileges
4. Test MySQL connection separately before running the script</content>
<parameter name="filePath">/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/AUTHORIZATION_RESET_README.md
