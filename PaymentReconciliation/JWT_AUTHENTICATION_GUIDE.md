# JWT Authentication - Troubleshooting Guide

## ⚠️ IMPORTANT: Bean Conflict Fix Applied

**Issue Resolved**: Duplicate `filterChain` bean conflict
- **Old Config**: `WebSecurityConfig.java` - Now disabled with `@Profile("disabled")`
- **New Config**: `EnhancedSecurityConfig.java` - Now active

The application should now start without bean definition conflicts.

---

## Current Status
✅ JWT authentication is working correctly
✅ Security filters are properly protecting endpoints
✅ Error handling has been improved
✅ Bean conflict resolved - using EnhancedSecurityConfig

## Recent Fixes Applied

### 1. Enhanced Security Configuration
- **File**: `EnhancedSecurityConfig.java`
- **Changes**:
  - Added `/error` endpoint to public access list
  - Properly configured exception handling
  - Stateless session management for JWT
  - Clear separation of public vs protected endpoints

### 2. Custom Error Controller
- **File**: `CustomErrorController.java`
- **Purpose**: Handle Spring Boot's `/error` endpoint gracefully
- **Features**:
  - Returns consistent JSON error responses
  - Provides helpful error messages for 401, 403, 404
  - No authentication required for error endpoint

### 3. JWT Token Security
- **File**: `AuthEntryPointJwt.java`
- **Changes**: Removed JWT token from log messages (security fix)
- **File**: `JwtUtils.java`
- **Changes**: Updated error handling to not expose tokens

## Understanding the Error

The error you're seeing is **NORMAL** and **EXPECTED**:

```
ERROR [...] AuthEntryPointJwt : Unauthorized error at path /error: 
Full authentication is required to access this resource
```

### Why This Happens:
1. A request comes in without a valid JWT token
2. Spring Security denies access (401 Unauthorized)
3. Spring forwards to `/error` endpoint
4. The error is logged (this is just informational)
5. CustomErrorController returns proper JSON response

### This is NOT a problem because:
- ✅ The authentication is working correctly
- ✅ Protected endpoints are being secured
- ✅ Error responses are being returned properly
- ✅ The system is functioning as designed

## Testing Authentication

### 1. Login and Get JWT Token

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "your_password"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "username": "superadmin",
  "email": "superadmin@example.com",
  "roles": ["ROLE_ADMIN"]
}
```

### 2. Use Token to Access Protected Endpoint

**Request:**
```bash
curl -X GET http://localhost:8080/api/system/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "status": "UP",
  "timestamp": "2025-01-07T20:04:43"
}
```

### 3. Test Without Token (Should Fail)

**Request:**
```bash
curl -X GET http://localhost:8080/api/system/health
```

**Expected Response (401):**
```json
{
  "timestamp": "2025-01-07T20:04:43",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required. Please provide a valid JWT token."
}
```

## Public vs Protected Endpoints

### Public Endpoints (No JWT Required):
- `POST /api/auth/signin` - Login
- `POST /api/auth/signup` - Registration
- `GET /api/public/**` - Public APIs
- `GET /swagger-ui/**` - API Documentation
- `GET /v3/api-docs/**` - OpenAPI Spec
- `GET /actuator/health` - Health Check
- `GET /error` - Error Handling

### Protected Endpoints (JWT Required):
- `GET /api/system/**` - System APIs
- `GET /api/worker/**` - Worker APIs
- `GET /api/employer/**` - Employer APIs
- `GET /api/reconciliation/**` - Reconciliation APIs
- All other `/api/**` endpoints

## JWT Token Structure

Your JWT token includes:
- **Header**: Algorithm and token type
- **Payload**: User details (username, roles, expiration)
- **Signature**: Cryptographic signature for verification

Example payload:
```json
{
  "sub": "superadmin",
  "iat": 1704652483,
  "exp": 1704738883,
  "roles": ["ROLE_ADMIN"]
}
```

## Common Authentication Issues

### Issue 1: "Full authentication is required"
**Cause**: No JWT token provided or invalid token
**Solution**: Include `Authorization: Bearer <token>` header

### Issue 2: "JWT token is expired"
**Cause**: Token has exceeded its expiration time
**Solution**: Login again to get a new token

### Issue 3: "Invalid JWT signature"
**Cause**: Token has been tampered with or wrong secret key
**Solution**: 
- Ensure `JWT_SECRET` is consistent
- Don't modify the token manually
- Get a fresh token from `/api/auth/signin`

### Issue 4: "Unauthorized error at path /error"
**Cause**: Normal behavior when authentication fails
**Solution**: This is just a log message, not an actual error

## Security Configuration Summary

```
┌─────────────────┐
│   Client        │
└────────┬────────┘
         │ 1. Request with JWT
         ▼
┌─────────────────┐
│ AuthTokenFilter │ ◄── Extracts & validates JWT
└────────┬────────┘
         │ 2. Valid token?
         ▼
┌─────────────────┐
│ SecurityContext │ ◄── Sets authentication
└────────┬────────┘
         │ 3. Has permission?
         ▼
┌─────────────────┐
│   Controller    │ ◄── Executes business logic
└────────┬────────┘
         │ 4. Returns response
         ▼
┌─────────────────┐
│   Client        │
└─────────────────┘

If authentication fails at any step:
→ AuthEntryPointJwt → CustomErrorController → 401 Response
```

## Configuration Files

### JWT Secret Configuration
**File**: `application.properties` or `application.yml`
```properties
# JWT Configuration
jwt.secret=your-very-long-and-secure-secret-key-here-at-least-256-bits
jwt.expiration=86400000
# 86400000 ms = 24 hours
```

⚠️ **IMPORTANT**: 
- Never commit JWT secret to version control
- Use environment variables in production
- Use different secrets for dev/staging/prod

### Example Environment Variable:
```bash
export JWT_SECRET="your-production-secret-key"
export JWT_EXPIRATION=86400000
```

## Debugging Tips

### Enable JWT Debug Logging
Add to `application.properties`:
```properties
logging.level.com.example.paymentreconciliation.auth=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Check Token Expiration
Decode your JWT token at https://jwt.io to see:
- When it was issued (iat)
- When it expires (exp)
- What claims it contains

### Test with Postman
1. Create a login request to `/api/auth/signin`
2. Save the token from response
3. Set up Authorization → Bearer Token
4. Use `{{token}}` variable in subsequent requests

## Next Steps

1. ✅ JWT authentication is working
2. ✅ Error handling is improved
3. ✅ Security vulnerabilities fixed
4. 📝 Consider adding:
   - Refresh token mechanism
   - Token blacklist for logout
   - Rate limiting on login endpoint
   - IP-based access restrictions (optional)

## Summary

Your authentication system is **working correctly**. The error message you see is normal logging behavior when an unauthenticated request is made. The system is properly:

✅ Protecting endpoints
✅ Validating JWT tokens  
✅ Handling errors gracefully
✅ Not exposing sensitive information
✅ Providing clear error messages

No action required unless you want to:
- Suppress the error logging (change log level)
- Add refresh token support
- Implement additional security features
