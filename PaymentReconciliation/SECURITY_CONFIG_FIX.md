# Security Configuration Update Guide

## Issue: Duplicate Security Configuration

You have two security configurations:
1. `WebSecurityConfig.java` (existing)
2. `EnhancedSecurityConfig.java` (new, improved version)

## Solution Options

### Option 1: Disable Old Configuration (Recommended)

Add `@Profile("disabled")` to the old configuration:

**File**: `src/main/java/com/example/paymentreconciliation/auth/security/WebSecurityConfig.java`

```java
@Profile("disabled")  // Add this line
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {
    // ...existing code...
}
```

### Option 2: Delete Old Configuration

Simply delete or rename the file:
```bash
# Backup the old config
mv src/main/java/com/example/paymentreconciliation/auth/security/WebSecurityConfig.java \
   src/main/java/com/example/paymentreconciliation/auth/security/WebSecurityConfig.java.backup

# Or delete it
rm src/main/java/com/example/paymentreconciliation/auth/security/WebSecurityConfig.java
```

### Option 3: Use Old Config and Delete New One

If you prefer to keep the old configuration:
```bash
rm src/main/java/com/example/paymentreconciliation/config/EnhancedSecurityConfig.java
```

Then update the old config to include:
```java
.requestMatchers("/error").permitAll()
```

## Recommended: Use Enhanced Config

The new `EnhancedSecurityConfig` is better because it:
- ✅ Properly handles `/error` endpoint
- ✅ Has better organization of public/protected endpoints
- ✅ Includes comments for clarity
- ✅ Follows Spring Security 6+ patterns

## Quick Fix Command

Run this to disable the old config:

```bash
# Navigate to your project
cd /Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation

# Add @Profile("disabled") to WebSecurityConfig.java
# This will be done in the next edit
```

## What Each Config Does

### EnhancedSecurityConfig (NEW - RECOMMENDED)
- Modern Spring Security 6+ syntax
- Clear endpoint organization
- Includes `/error` endpoint fix
- Better documentation

### WebSecurityConfig (OLD)
- May be missing `/error` configuration
- Might not have all public endpoints listed
- Can be replaced safely

## After Applying Fix

1. Restart your application
2. Test authentication:
   ```bash
   curl -X POST http://localhost:8080/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"username": "superadmin", "password": "your_password"}'
   ```
3. Verify protected endpoints work with JWT token
4. Confirm error handling works properly

## Summary

✅ **Action Required**: Choose Option 1 or 2 above
✅ **Recommended**: Use Option 1 (disable old config with @Profile)
✅ **Result**: Application will start without bean conflict