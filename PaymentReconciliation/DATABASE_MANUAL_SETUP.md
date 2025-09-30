# Manual Database Setup Guide for Azure MySQL

## Option 1: Using the Automated Script (Recommended)

### Prerequisites
- MySQL client installed on your machine
- Access to your Azure MySQL Flexible Server
- Appropriate firewall rules configured

### Steps
1. **Update the script configuration** in `setup-database.sh`:
   ```bash
   MYSQL_HOST="paymentreconciliation.mysql.database.azure.com"
   MYSQL_USER="your_actual_username"  # Replace with your MySQL username
   ```

2. **Run the automated setup**:
   ```bash
   ./setup-database.sh
   ```

3. **Enter your MySQL password** when prompted

## Option 2: Manual Execution via MySQL Console

### Step 1: Connect to Azure MySQL
```bash
mysql \
  --host=paymentreconciliation.mysql.database.azure.com \
  --port=3306 \
  --user=your_username \
  --password \
  --ssl-mode=REQUIRED
```

### Step 2: Create Database (if it doesn't exist)
```sql
CREATE DATABASE IF NOT EXISTS paymentreconciliation_prod 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE paymentreconciliation_prod;
```

### Step 3: Execute the Schema Script
```sql
-- Copy and paste the entire content of database-schema.sql
-- Or use the source command if you have the file accessible:
source /path/to/database-schema.sql;
```

## Option 3: Using Azure CLI with MySQL Commands

### Step 1: Connect using Azure CLI
```bash
az mysql flexible-server connect \
  --name paymentreconciliation \
  --admin-user your_username \
  --database-name paymentreconciliation_prod
```

### Step 2: Execute the schema
Once connected, you can paste the SQL commands from `database-schema.sql`

## Option 4: Using Azure Portal Query Editor

1. **Go to Azure Portal** → Your MySQL Flexible Server
2. **Navigate to "Query editor"** in the left sidebar
3. **Login** with your credentials
4. **Select database**: `paymentreconciliation_prod`
5. **Copy and paste** the SQL from `database-schema.sql`
6. **Execute** the queries

## Verification Commands

After running the schema, verify with these commands:

```sql
-- Check if all tables exist
SHOW TABLES;

-- Expected output:
-- +----------------------------------------+
-- | Tables_in_paymentreconciliation_prod   |
-- +----------------------------------------+
-- | board_receipts                         |
-- | employer_payment_receipts              |
-- | uploaded_files                         |
-- | worker_payment_receipts                |
-- | worker_payments                        |
-- +----------------------------------------+

-- Check table structures
DESCRIBE worker_payments;
DESCRIBE worker_payment_receipts;
DESCRIBE employer_payment_receipts;
DESCRIBE board_receipts;
DESCRIBE uploaded_files;

-- Check indexes
SHOW INDEXES FROM worker_payments;
```

## Tables Created

| Table Name | Purpose |
|------------|---------|
| `uploaded_files` | Tracks file uploads and processing status |
| `worker_payments` | Individual worker payment records |
| `worker_payment_receipts` | Aggregated worker payment receipts |
| `employer_payment_receipts` | Employer validation and payment receipts |
| `board_receipts` | Board payment confirmation receipts |

## Important Notes

1. **Character Set**: All tables use `utf8mb4` for full Unicode support
2. **Engine**: All tables use `InnoDB` for ACID compliance and foreign keys
3. **Indexes**: Proper indexes are created for query performance
4. **Auto Increment**: All primary keys use `AUTO_INCREMENT`
5. **Constraints**: Foreign key constraints are commented out (can be enabled if needed)

## Troubleshooting

### Common Issues:

1. **Connection refused**: Check firewall rules in Azure MySQL
2. **Access denied**: Verify username/password and user permissions
3. **SSL required**: Always use `--ssl-mode=REQUIRED`
4. **Database doesn't exist**: Run the CREATE DATABASE command first

### Firewall Configuration:
Make sure your IP is allowed in the MySQL server firewall:
```bash
az mysql flexible-server firewall-rule create \
  --resource-group your-resource-group \
  --name paymentreconciliation \
  --rule-name "AllowMyIP" \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

## Security Best Practices

1. **Use SSL/TLS**: Always connect with `--ssl-mode=REQUIRED`
2. **Principle of Least Privilege**: Create a dedicated app user with minimal permissions
3. **Strong Passwords**: Use complex passwords for database users
4. **Network Security**: Restrict firewall rules to necessary IPs only

## Next Steps

After successful database creation:
1. ✅ Update your application configuration
2. ✅ Deploy your container app
3. ✅ Test database connectivity via health endpoint
4. ✅ Monitor application logs for any database issues
