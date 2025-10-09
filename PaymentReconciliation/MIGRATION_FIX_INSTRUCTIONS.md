# Database Migration Fix for page_actions Table

## Problem
The error indicates that the `page_actions` table is missing the `capability_id` column that the JPA entity expects.

```
Unknown column 'pa1_0.capability_id' in 'field list'
```

## Current Database Schema (Incorrect)
```sql
| Field               | Type         |
|---------------------|--------------|
| id                  | bigint       |
| key                 | varchar(100) |
| label               | varchar(128) |
| action_name         | varchar(64)  |  ← Should be 'action'
| required_capability | varchar(100) |  ← Should be 'capability_id' (BIGINT FK)
| page_id             | bigint       |
| endpoint_id         | bigint       |
| ...                 | ...          |
```

## Expected Schema (Per JPA Entity)
```sql
| Field          | Type   | Description                           |
|----------------|--------|---------------------------------------|
| id             | bigint | Primary key                           |
| label          | varchar(128) | Button/action label             |
| action         | varchar(64) | Action name (not action_name)    |
| capability_id  | bigint | Foreign key to capabilities table     |
| page_id        | bigint | Foreign key to ui_pages table         |
| endpoint_id    | bigint | Foreign key to endpoints table        |
| icon           | varchar(64) | Icon name                         |
| variant        | varchar(32) | UI variant                        |
| display_order  | int    | Display order                         |
| is_active      | boolean| Active status                         |
```

## Solution

### Step 1: Migration File Created
A new migration file `V23__add_capability_id_to_page_actions.sql` has been created that will:

1. ✅ Add `capability_id` column (BIGINT)
2. ✅ Migrate data from `required_capability` (string) to `capability_id` (FK)
3. ✅ Add foreign key constraint to `capabilities` table
4. ✅ Drop the old `required_capability` column
5. ✅ Drop the `key` column (not used by entity)
6. ✅ Rename `action_name` to `action`

### Step 2: Apply Migration
Simply **restart your Spring Boot application**. Flyway will automatically:
- Detect the new V23 migration
- Execute it against your database
- Update the `flyway_schema_history` table

### Step 3: Verify
After restart, verify the changes:

```sql
-- Check table structure
DESCRIBE page_actions;

-- Should show:
-- - action (not action_name)
-- - capability_id (not required_capability)
-- - No 'key' column

-- Check foreign key constraint
SHOW CREATE TABLE page_actions;

-- Should include:
-- FOREIGN KEY (capability_id) REFERENCES capabilities(id)
```

## Why This Happened

Your database schema doesn't match the migration files in your codebase:
- V14 creates the table with `capability_id`
- V15 inserts data using `capability_id`
- But your actual database has `required_capability`

This suggests your database was either:
1. Created manually with a different schema
2. Created from an older version of migration files
3. Partially migrated

## Expected Result After Fix

The `/api/me/authorizations` endpoint will return:

```json
{
  "can": { "USER_CREATE": true, ... },
  "pages": [
    {
      "id": 1,
      "name": "Dashboard",
      "path": "/dashboard",
      "icon": "dashboard",
      "actions": [
        {
          "name": "VIEW",
          "label": "View Dashboard",
          "capability": "DASHBOARD.VIEW",
          "endpoint": {
            "method": "GET",
            "path": "/api/dashboard"
          }
        }
      ]
    },
    ...
  ],
  "endpoints": [...],
  "roles": ["ADMIN"]
}
```

Each page action will include:
- ✅ The action details (name, label, icon, variant)
- ✅ The required capability
- ✅ The associated endpoint (method + path) for the action

## Next Steps

1. **Restart your Spring Boot application** to apply the migration
2. Check the logs for migration success
3. Test the `/api/me/authorizations` endpoint
4. Verify that `pages` array is populated with actions and endpoints
