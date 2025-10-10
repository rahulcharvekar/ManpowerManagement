-- ============================================================================
-- AUTHORIZATION DATA SYNCHRONIZATION SCRIPT
-- Purpose: Fix gaps and ensure Policy-Capability-Endpoint consistency
-- Ensures that ANY Policy granting a Capability ALSO grants required Endpoints
-- ============================================================================

-- NOTE: Database selection should be handled by the calling script
-- This allows the same SQL to work across different environments (dev, staging, prod)

-- ============================================================================
-- CORE PRINCIPLE:
-- If Policy → grants → Capability (via policy_capabilities)
-- Then Policy → MUST grant → Endpoint (via endpoint_policies)
-- ============================================================================

SET @sync_count = 0;

-- ============================================================================
-- STEP 1: SYNC USER_MANAGEMENT Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'user'
WHERE c.module = 'USER_MANAGEMENT' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND e.method = 'POST' AND e.path = '/api/auth/register')
    OR (c.action = 'READ' AND e.method = 'GET' AND e.path IN ('/api/auth/users/{id}'))
    OR (c.action = 'UPDATE' AND e.method = 'PUT' AND e.path = '/api/auth/users/{id}')
    OR (c.action = 'DELETE' AND e.method = 'DELETE' AND e.path = '/api/auth/users/{id}')
    OR (c.action = 'LIST' AND e.method = 'GET' AND e.path = '/api/auth/users')
    OR (c.action = 'ACTIVATE' AND e.method = 'PATCH' AND e.path IN ('/api/auth/users/{id}/activate', '/api/auth/users/{id}/deactivate'))
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 2: SYNC ROLE_MANAGEMENT Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'role'
WHERE c.module = 'ROLE_MANAGEMENT' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND e.method = 'POST' AND e.path = '/api/admin/roles')
    OR (c.action = 'READ' AND e.method = 'GET' AND e.path = '/api/admin/roles/{id}')
    OR (c.action = 'UPDATE' AND e.method = 'PUT' AND e.path = '/api/admin/roles/{id}')
    OR (c.action = 'DELETE' AND e.method = 'DELETE' AND e.path = '/api/admin/roles/{id}')
    OR (c.action = 'LIST' AND e.method = 'GET' AND e.path = '/api/admin/roles')
    OR (c.action = 'ASSIGN_USERS' AND e.method = 'POST' AND e.path IN ('/api/admin/roles/{roleId}/users/{userId}'))
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 3: SYNC WORKER Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e 
WHERE c.module = 'WORKER' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND LOWER(e.service) = 'worker' AND e.method = 'POST' AND e.path = '/api/worker/uploaded-data/upload')
    OR (c.action = 'READ' AND LOWER(e.service) = 'worker' AND e.method = 'GET' AND (e.path LIKE '/api/worker/uploaded-data/%' OR e.path LIKE '/api/v1/worker-payments%'))
    OR (c.action = 'UPDATE' AND LOWER(e.service) = 'payment' AND e.method = 'PUT' AND e.path = '/api/v1/worker-payments/{id}')
    OR (c.action = 'DELETE' AND LOWER(e.service) IN ('worker', 'payment') AND e.method = 'DELETE' AND (e.path = '/api/worker/uploaded-data/files/{id}' OR e.path = '/api/v1/worker-payments/{id}'))
    OR (c.action = 'LIST' AND LOWER(e.service) IN ('worker', 'payment') AND e.method = 'GET' AND (e.path = '/api/worker/uploaded-data/files' OR e.path = '/api/v1/worker-payments'))
    OR (c.action = 'VALIDATE' AND LOWER(e.service) = 'worker' AND e.method = 'POST' AND e.path = '/api/worker/uploaded-data/files/{id}/validate')
    OR (c.action = 'DOWNLOAD' AND LOWER(e.service) = 'worker' AND e.method = 'GET' AND e.path = '/api/worker/uploaded-data/files/{id}/download')
    OR (c.action = 'GENERATE_PAYMENTS' AND LOWER(e.service) = 'payment' AND e.method = 'POST' AND e.path = '/api/v1/worker-payments/generate-batch')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 4: SYNC PAYMENT Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e 
WHERE c.module = 'PAYMENT' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND LOWER(e.service) = 'payment' AND e.method = 'POST' AND e.path = '/api/v1/worker-payments')
    OR (c.action = 'READ' AND LOWER(e.service) = 'payment' AND e.method = 'GET' AND (e.path LIKE '/api/v1/worker-payments%' OR e.path LIKE '/api/payment-processing/%'))
    OR (c.action = 'UPDATE' AND LOWER(e.service) = 'payment' AND e.method = 'PUT' AND e.path = '/api/v1/worker-payments/{id}')
    OR (c.action = 'DELETE' AND LOWER(e.service) = 'payment' AND e.method = 'DELETE' AND e.path = '/api/v1/worker-payments/{id}')
    OR (c.action = 'LIST' AND LOWER(e.service) = 'payment' AND e.method = 'GET' AND e.path = '/api/v1/worker-payments')
    OR (c.action = 'APPROVE' AND LOWER(e.service) = 'payment' AND e.method = 'POST' AND (e.path = '/api/v1/worker-payments/{id}/approve' OR e.path LIKE '/api/payment-processing/%/approve'))
    OR (c.action = 'REJECT' AND LOWER(e.service) = 'payment' AND e.method = 'POST' AND (e.path = '/api/v1/worker-payments/{id}/reject' OR e.path LIKE '/api/payment-processing/%/reject'))
    OR (c.action = 'PROCESS' AND LOWER(e.service) = 'payment' AND e.method = 'POST' AND e.path LIKE '/api/payment-processing/%')
    OR (c.action = 'GENERATE_REPORTS' AND LOWER(e.service) = 'payment' AND e.method = 'GET' AND (e.path = '/api/v1/worker-payments/reports' OR e.path LIKE '/api/payment-processing/reports%'))
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 5: SYNC EMPLOYER Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'employer'
WHERE c.module = 'EMPLOYER' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND e.method = 'POST' AND e.path = '/api/employer/receipts')
    OR (c.action = 'READ' AND e.method = 'GET' AND (e.path = '/api/employer/receipts/{id}' OR e.path = '/api/employer/receipts'))
    OR (c.action = 'UPDATE' AND e.method = 'PUT' AND e.path = '/api/employer/receipts/{id}')
    OR (c.action = 'DELETE' AND e.method = 'DELETE' AND e.path = '/api/employer/receipts/{id}')
    OR (c.action = 'LIST' AND e.method = 'GET' AND e.path = '/api/employer/receipts')
    OR (c.action = 'VALIDATE_RECEIPTS' AND e.method = 'POST' AND e.path = '/api/employer/receipts/{id}/validate')
    OR (c.action = 'SEND_TO_BOARD' AND e.method = 'POST' AND e.path = '/api/employer/receipts/{id}/send-to-board')
    OR (c.action = 'VIEW_RECEIPTS' AND e.method = 'GET' AND e.path = '/api/employer/receipts')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 6: SYNC BOARD Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'board'
WHERE c.module = 'BOARD' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'CREATE' AND e.method = 'POST' AND e.path = '/api/v1/board-receipts')
    OR (c.action = 'READ' AND e.method = 'GET' AND (e.path = '/api/v1/board-receipts/{id}' OR e.path = '/api/v1/board-receipts'))
    OR (c.action = 'UPDATE' AND e.method = 'PUT' AND e.path = '/api/v1/board-receipts/{id}')
    OR (c.action = 'DELETE' AND e.method = 'DELETE' AND e.path = '/api/v1/board-receipts/{id}')
    OR (c.action = 'LIST' AND e.method = 'GET' AND e.path = '/api/v1/board-receipts')
    OR (c.action = 'APPROVE' AND e.method = 'POST' AND (e.path = '/api/v1/board-receipts/{id}/approve' OR e.path = '/api/v1/board-receipts/bulk-approve'))
    OR (c.action = 'REJECT' AND e.method = 'POST' AND (e.path = '/api/v1/board-receipts/{id}/reject' OR e.path = '/api/v1/board-receipts/bulk-reject'))
    OR (c.action = 'VIEW_RECEIPTS' AND e.method = 'GET' AND e.path = '/api/v1/board-receipts')
    OR (c.action = 'GENERATE_REPORTS' AND e.method = 'GET' AND e.path = '/api/v1/board-receipts/reports')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 7: SYNC RECONCILIATION Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'reconciliation'
WHERE c.module = 'RECONCILIATION' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'READ' AND e.method = 'GET' AND (e.path = '/api/v1/reconciliations/{id}' OR e.path = '/api/v1/reconciliations'))
    OR (c.action = 'LIST' AND e.method = 'GET' AND e.path = '/api/v1/reconciliations')
    OR (c.action = 'PERFORM' AND e.method = 'POST' AND (e.path = '/api/v1/reconciliations/auto-reconcile' OR e.path = '/api/v1/reconciliations/manual-reconcile'))
    OR (c.action = 'GENERATE_REPORTS' AND e.method = 'GET' AND (e.path LIKE '/api/v1/reconciliations/reports%' OR e.path = '/api/v1/reconciliations/export'))
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 8: SYNC DASHBOARD Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'dashboard'
WHERE c.module = 'DASHBOARD' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'VIEW' AND e.method = 'GET' AND e.path = '/api/dashboard')
    OR (c.action = 'VIEW_STATS' AND e.method = 'GET' AND e.path = '/api/dashboard/stats')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 9: SYNC AUDIT Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'audit'
WHERE c.module = 'AUDIT' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'VIEW_LOGS' AND e.method = 'GET' AND e.path = '/api/audit/logs')
    OR (c.action = 'VIEW_AUTH_LOGS' AND e.method = 'GET' AND e.path = '/api/audit/auth-logs')
    OR (c.action = 'EXPORT' AND e.method = 'GET' AND e.path = '/api/audit/export')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 10: SYNC AUTH Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'auth'
WHERE c.module = 'AUTH' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'LOGIN' AND e.method = 'POST' AND e.path = '/api/auth/login')
    OR (c.action = 'LOGOUT' AND e.method = 'POST' AND e.path = '/api/auth/logout')
    OR (c.action = 'REFRESH_TOKEN' AND e.method = 'POST' AND e.path = '/api/auth/refresh')
    OR (c.action = 'VIEW_PROFILE' AND e.method = 'GET' AND e.path = '/api/auth/me')
    OR (c.action = 'UPDATE_PROFILE' AND e.method = 'PUT' AND e.path = '/api/auth/me')
    OR (c.action = 'CHANGE_PASSWORD' AND e.method = 'PUT' AND e.path = '/api/auth/change-password')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 11: SYNC SYSTEM Capabilities to Endpoints
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e ON LOWER(e.service) = 'system'
WHERE c.module = 'SYSTEM' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND (
    (c.action = 'VIEW_CONFIG' AND e.method = 'GET' AND e.path = '/api/system/config')
    OR (c.action = 'UPDATE_CONFIG' AND e.method = 'PUT' AND e.path = '/api/system/config')
    OR (c.action = 'MAINTENANCE' AND e.method = 'POST')
    OR (c.action = 'DATABASE_CLEANUP' AND e.method = 'POST' AND e.path = '/api/system/database/cleanup')
  );

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 12: SYNC PERMISSION_MANAGEMENT Capabilities to Endpoints (if exist)
-- ============================================================================

INSERT IGNORE INTO endpoint_policies (endpoint_id, policy_id)
SELECT DISTINCT e.id, pc.policy_id
FROM policy_capabilities pc
JOIN capabilities c ON pc.capability_id = c.id
JOIN endpoints e 
WHERE c.module = 'PERMISSION_MANAGEMENT' 
  AND c.is_active = 1
  AND e.is_active = 1
  AND LOWER(e.service) IN ('permission', 'admin');

SET @sync_count = @sync_count + ROW_COUNT();

-- ============================================================================
-- STEP 13: UPDATE PAGE ACTIONS TO LINK TO ENDPOINTS
-- ============================================================================

-- This ensures PageActions have endpoint_id set based on their capability
-- Handles module-to-service name mapping (e.g., USER_MANAGEMENT -> user)
UPDATE page_actions pa
JOIN capabilities c ON pa.capability_id = c.id
LEFT JOIN endpoints e ON (
    LOWER(e.service) = CASE 
        WHEN c.module = 'USER_MANAGEMENT' THEN 'user'
        WHEN c.module = 'ROLE_MANAGEMENT' THEN 'role'
        ELSE LOWER(c.module)
    END
)
    AND e.method = CASE 
        WHEN c.action = 'CREATE' THEN 'POST'
        WHEN c.action = 'READ' THEN 'GET'
        WHEN c.action = 'UPDATE' THEN 'PUT'
        WHEN c.action = 'DELETE' THEN 'DELETE'
        WHEN c.action = 'LIST' THEN 'GET'
        WHEN c.action = 'VIEW' THEN 'GET'
        WHEN c.action = 'UPDATE_CONFIG' THEN 'PUT'
        ELSE 'GET'
    END
    AND e.is_active = 1
SET pa.endpoint_id = e.id
WHERE pa.endpoint_id IS NULL
  AND pa.is_active = 1
  AND e.id IS NOT NULL;

-- ============================================================================
-- STEP 14: VERIFICATION & SUMMARY
-- ============================================================================

SELECT '=== SYNCHRONIZATION RESULTS ===' as status;

SELECT 
    'Total endpoint-policy links added' as metric,
    @sync_count as count;

SELECT 
    'Capabilities with complete endpoint coverage' as metric,
    COUNT(DISTINCT c.id) as count
FROM capabilities c
WHERE c.is_active = 1
  AND EXISTS (
      SELECT 1 
      FROM policy_capabilities pc
      JOIN endpoint_policies ep ON pc.policy_id = ep.policy_id
      JOIN endpoints e ON ep.endpoint_id = e.id
      WHERE pc.capability_id = c.id
  );

SELECT 
    'Page actions with linked endpoints' as metric,
    COUNT(*) as count
FROM page_actions
WHERE endpoint_id IS NOT NULL
  AND is_active = 1;

SELECT 
    'Policies with both capabilities AND endpoints' as metric,
    COUNT(DISTINCT p.id) as count
FROM policies p
WHERE p.is_active = 1
  AND EXISTS (SELECT 1 FROM policy_capabilities pc WHERE pc.policy_id = p.id)
  AND EXISTS (SELECT 1 FROM endpoint_policies ep WHERE ep.policy_id = p.id);

SELECT '=== SYNCHRONIZATION COMPLETE ===' as status;
