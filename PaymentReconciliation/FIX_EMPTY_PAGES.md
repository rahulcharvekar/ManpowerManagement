# Fix for Empty Pages Array

## Issue
The `/api/me/authorizations` endpoint returns an empty `pages` array because all `capability_id` values in the `page_actions` table are NULL.

## Root Cause
The `getAccessiblePages()` method filters actions where:
```java
.filter(action -> action.getCapability() != null && 
                 hasCapability(action.getCapability().getName(), roleNames))
```

Since all `capability_id` values are NULL, `action.getCapability()` returns NULL, and all actions are filtered out, resulting in no pages being returned.

## Database State
```sql
-- Current state: All capability_id are NULL
SELECT id, label, action, capability_id FROM page_actions;
+----+---------------+----------+---------------+
| id | label         | action   | capability_id |
+----+---------------+----------+---------------+
|  1 | Upload File   | CREATE   |          NULL |
|  2 | Validate Data | VALIDATE |          NULL |
|  3 | Add Worker    | CREATE   |          NULL |
...
```

## Solution

Two new migrations have been created:

### V24: Populate capability_id
Maps page actions to appropriate capabilities based on:
- Page name (Worker, Payment, User, etc.)
- Action type (CREATE, UPDATE, DELETE, READ, etc.)

Example mappings:
- Worker page + CREATE action → WORKER.CREATE capability
- Worker page + UPDATE action → WORKER.UPDATE capability
- Worker page + VALIDATE action → WORKER.READ capability (special case)

### V25: Make capability_id NOT NULL
Enforces the NOT NULL constraint to match the JPA entity definition.

## Steps to Fix

1. **Restart your Spring Boot application**
   - Flyway will automatically run V24 and V25 migrations
   
2. **Verify the fix**
   ```sql
   -- Check that all capability_id values are populated
   SELECT 
       pa.label,
       pa.action,
       p.label as page_name,
       c.name as capability
   FROM page_actions pa
   LEFT JOIN ui_pages p ON p.id = pa.page_id
   LEFT JOIN capabilities c ON c.id = pa.capability_id;
   ```

3. **Test the endpoint**
   ```bash
   curl -H "Authorization: Bearer <your-token>" \
        http://localhost:8080/api/me/authorizations
   ```

## Expected Result

After the migrations, you should see:

```json
{
  "can": { "WORKER.CREATE": true, ... },
  "pages": [
    {
      "id": 8,
      "name": "Worker Management",
      "path": "/workers",
      "icon": "people",
      "actions": [
        {
          "name": "CREATE",
          "label": "Add Worker",
          "icon": "add",
          "variant": "primary",
          "capability": "WORKER.CREATE",
          "endpoint": {
            "method": "POST",
            "path": "/api/workers"
          }
        },
        {
          "name": "UPDATE",
          "label": "Edit",
          "capability": "WORKER.UPDATE"
        }
      ]
    },
    {
      "id": 9,
      "name": "Worker Payments",
      "path": "/worker-payments",
      "actions": [
        {
          "name": "CREATE",
          "label": "Upload File",
          "capability": "WORKER.CREATE",
          "endpoint": {
            "method": "POST",
            "path": "/api/worker-payments/upload"
          }
        }
      ]
    }
  ],
  "endpoints": [...],
  "roles": ["ADMIN"]
}
```

## Why This Happened

The V23 migration successfully:
- ✅ Added the `capability_id` column
- ✅ Dropped the old `required_capability` column
- ✅ Renamed `action_name` to `action`

But it failed to populate the `capability_id` values because:
- The `required_capability` column was already gone or empty
- The UPDATE statement couldn't find matching data to migrate

## Alternative: Manual Population

If the automatic mapping doesn't work perfectly, you can manually update specific actions:

```sql
-- Example: Set capability for specific page actions
UPDATE page_actions pa
INNER JOIN capabilities c ON c.name = 'WORKER.CREATE'
SET pa.capability_id = c.id
WHERE pa.page_id = 8 AND pa.action = 'CREATE';

UPDATE page_actions pa
INNER JOIN capabilities c ON c.name = 'WORKER.UPDATE'
SET pa.capability_id = c.id
WHERE pa.page_id = 8 AND pa.action = 'UPDATE';
```
