┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION & AUTHORIZATION                │
│                         DATABASE DESIGN                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     USERS        │ ← Main authentication table
├──────────────────┤
│ • id (PK)        │
│ • username ⭐    │
│ • email ⭐       │
│ • password       │
│ • full_name      │
│ • role (ENUM)    │ ← Legacy role (backward compatibility)
│ • permission_version │ ← For JWT invalidation 🔥 NEW
│ • is_enabled     │
│ • is_account_non_expired │
│ • is_account_non_locked  │
│ • is_credentials_non_expired │
│ • created_at     │
│ • updated_at     │
│ • last_login     │
└──────────────────┘
         │
         │ Many-to-Many
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐  ┌────────────────┐
│ USER_ROLES   │  │    ROLES       │
├──────────────┤  ├────────────────┤
│• user_id(FK) │  │ • id (PK)      │
│• role_id(FK) │  │ • name ⭐      │
│  PK(user,    │  │ • description  │
│     role)    │  │ • created_at   │
└──────────────┘  │ • updated_at   │
                  └────────────────┘
                           │
                           │ Many-to-Many
                           ├──────────────┐
                           │              │
                           ▼              ▼
                  ┌──────────────────┐  ┌─────────────────┐
                  │ ROLE_PERMISSIONS │  │  PERMISSIONS    │
                  ├──────────────────┤  ├─────────────────┤
                  │• role_id (FK)    │  │ • id (PK)       │
                  │• permission_id   │  │ • name ⭐       │
                  │  (FK)            │  │ • description   │
                  │  PK(role,perm)   │  │ • module        │
                  └──────────────────┘  │ • created_at    │
                                        │ • updated_at    │
                                        └─────────────────┘
                                                 │
                                                 │ One-to-Many
                                                 │
                                                 ▼
                                    ┌───────────────────────────┐
                                    │ PERMISSION_API_ENDPOINTS  │
                                    ├───────────────────────────┤
                                    │ • id (PK)                 │
                                    │ • permission_id (FK) ⭐   │
                                    │ • api_endpoint            │
                                    │ • http_method             │
                                    │ • description             │
                                    │ • is_active               │
                                    │ • created_at              │
                                    │ • updated_at              │
                                    │ UNIQUE(perm,endpoint,method)│
                                    └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT-BASED PERMISSION SYSTEM (UI)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   UI_COMPONENTS     │ ← Frontend components/pages
├─────────────────────┤
│ • id (PK)           │
│ • component_key ⭐  │ (e.g., 'user-management')
│ • display_name      │
│ • description       │
│ • category          │
│ • route             │ (e.g., '/admin/users')
│ • icon              │ (e.g., '👥')
│ • display_order     │
│ • is_active         │
└─────────────────────┘
         │
         │ One-to-Many
         │
         ▼
┌──────────────────────┐
│ COMPONENT_PERMISSIONS│ ← Actions on UI components
├──────────────────────┤
│ • id (PK)            │
│ • component_id (FK)  │
│ • action             │ (VIEW, CREATE, EDIT, DELETE)
│ • description        │
│ • is_active          │
│ UNIQUE(component,action)│
└──────────────────────┘
         │
         │ Many-to-Many
         ├──────────────┐
         │              │
         ▼              ▼
┌────────────────────────┐  ┌────────────────┐
│ ROLE_COMPONENT_PER...  │  │    ROLES       │
├────────────────────────┤  │  (same table)  │
│• role_id (FK)          │  └────────────────┘
│• component_permission_ │
│  id (FK)               │
│• is_active             │
│  PK(role,comp_perm)    │
└────────────────────────┘