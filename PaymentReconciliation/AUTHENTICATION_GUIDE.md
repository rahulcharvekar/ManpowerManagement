# User Registration and Login Implementation

This document describes the implementation of user registration and login functionality for the Payment Reconciliation application.

## Overview

The authentication system is built using:
- **Spring Security** for authentication and authorization
- **JWT (JSON Web Tokens)** for stateless authentication
- **BCrypt** for password hashing
- **Role-based access control** for different user types

## User Roles

The system supports the following user roles:

1. **ADMIN** - System administrators with full access
2. **WORKER** - Worker management and payment operations
3. **BOARD** - Board receipt management
4. **EMPLOYER** - Employer-related operations
5. **RECONCILIATION_OFFICER** - Payment reconciliation operations

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "role": "WORKER"
}
```

**Response:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "WORKER"
}
```

#### POST `/api/auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "password123"
}
```

**Response:** Same as registration response.

#### GET `/api/auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "WORKER",
    "enabled": true
}
```

### Admin Endpoints (Requires ADMIN role)

#### GET `/api/auth/users`
Get all users in the system.

#### GET `/api/auth/users/role/{role}`
Get users by specific role.

#### PUT `/api/auth/users/{userId}/status?enabled=true`
Enable or disable a user account.

#### GET `/api/auth/roles`
Get available user roles.

## Security Configuration

### Protected Endpoints

The system implements role-based access control:

- **Public endpoints:** `/api/auth/**`, `/api/v1/health`, Swagger UI
- **Admin only:** `/api/auth/users/**`
- **Worker/Admin/Reconciliation Officer:** `/api/worker/**`
- **Employer/Admin/Reconciliation Officer:** `/api/employer/**`
- **Board/Admin/Reconciliation Officer:** `/api/v1/board-receipts/**`
- **Reconciliation Officer/Admin:** `/api/v1/reconciliations/**`

### JWT Configuration

- **Secret:** Configurable via `app.jwt.secret`
- **Expiration:** 24 hours (86400 seconds)
- **Algorithm:** HS256

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'WORKER', 'BOARD', 'EMPLOYER', 'RECONCILIATION_OFFICER') NOT NULL DEFAULT 'WORKER',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    is_account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    is_credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);
```

## Default Admin Account

The system creates a default admin account:
- **Username:** admin
- **Password:** admin123
- **Email:** admin@example.com
- **Role:** ADMIN

## How to Use

### 1. Start the Application

```bash
mvn spring-boot:run
```

### 2. Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "WORKER"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 4. Access Protected Endpoints

Use the JWT token from login response:

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Frontend Integration

### Authentication Context

For React frontend, create an authentication context:

```javascript
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      setUser(data);
      localStorage.setItem('token', data.token);
      return data;
    }
    throw new Error('Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### HTTP Interceptor

Add JWT token to all API requests:

```javascript
// api.js
const API_BASE = '/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return response;
};
```

## Testing

### Integration Tests

Test authentication endpoints:

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AuthControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testUserRegistration() {
        RegisterRequest request = new RegisterRequest(
            "testuser", "test@example.com", "password123", "Test User", UserRole.WORKER
        );
        
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/register", request, AuthResponse.class
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getToken());
    }
}
```

## Security Considerations

1. **JWT Secret:** Use a strong, randomly generated secret in production
2. **Password Policy:** Implement strong password requirements
3. **Rate Limiting:** Add rate limiting for login attempts
4. **HTTPS:** Always use HTTPS in production
5. **Token Refresh:** Consider implementing refresh tokens for better security
6. **Input Validation:** All inputs are validated using Bean Validation
7. **CORS:** Configured for cross-origin requests

## Configuration

### Application Properties

```yaml
app:
  jwt:
    secret: "your-256-bit-secret-key"
    expiration: 86400  # 24 hours in seconds

spring:
  security:
    user:
      name: admin
      password: admin123
```

This implementation provides a complete, production-ready authentication system with proper security practices and role-based access control.
