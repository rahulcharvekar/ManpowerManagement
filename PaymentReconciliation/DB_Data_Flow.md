┌─────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   ┌──────┐
   │ User │ → POST /api/auth/login {username, password}
   └──────┘
       ↓
   ┌─────────────────┐
   │ AuthService     │ → Query users table
   │ • Authenticate  │ → Validate password
   │ • Load User     │ → Get permission_version
   └─────────────────┘
       ↓
   ┌─────────────────┐
   │ JwtUtils        │ → Generate JWT with:
   │ • generateToken │    • sub: username
   └─────────────────┘    • iss: issuer
                          • aud: audience
                          • iat: issued at
                          • exp: expiration
                          • pv: permission_version 🔥
       ↓
   Return JWT token to frontend

2. AUTHORIZATION (Every API Request)
   ┌──────┐
   │ User │ → API Request + Bearer Token
   └──────┘
       ↓
   ┌──────────────────────┐
   │ JwtAuthenticationFilter│ → Validate JWT
   └──────────────────────┘ → Extract username
       ↓
   ┌──────────────────────┐
   │ UserDetailsService   │ → Query: users table
   └──────────────────────┘ → Load user with roles/permissions
       ↓
   ┌──────────────────────┐
   │ Load Permissions     │ → Query chain:
   └──────────────────────┘    users → user_roles → roles 
                                → role_permissions → permissions
                                → permission_api_endpoints
       ↓
   ┌──────────────────────┐
   │ AuthorizationInterceptor│ → Check if user has permission
   └──────────────────────┘    for requested API endpoint
       ↓
   Allow/Deny (200/403)

3. GET USER INFO (Frontend)
   ┌──────┐
   │ User │ → GET /api/auth/me + Bearer Token
   └──────┘
       ↓
   Return:
   {
     "username": "john",
     "roles": ["USER_MANAGER", "PAYMENT_VIEWER"],
     "permissions": {
       "USER": ["GET /api/auth/users", "PUT /api/auth/users/{id}"],
       "PAYMENT": ["GET /api/payments"]
     },
     "permissionVersion": 1,
     "menus": [...]  // UI components user can access
   }