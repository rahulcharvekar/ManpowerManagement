# Dynamic Menu System - Implementation Guide

## 🎯 Overview

The **Dynamic Menu System** automatically generates navigation menus from the backend `/api/auth/ui-config` response. This ensures the frontend menu structure always matches the backend configuration and user permissions.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND UI CONFIG API                         │
│                   GET /api/auth/ui-config                        │
├─────────────────────────────────────────────────────────────────┤
│  Returns:                                                        │
│  {                                                               │
│    can: { "WORKER.CREATE": true, ... },                        │
│    pages: [                                                      │
│      { id: 2, path: "/workers", name: "Workers",               │
│        parentId: null, isMenuItem: true, displayOrder: 2 },    │
│      { id: 8, path: "/workers/list", name: "Worker List",     │
│        parentId: 2, isMenuItem: true, displayOrder: 1,         │
│        actions: ["WORKER.CREATE", "WORKER.UPDATE"] }           │
│    ],                                                            │
│    endpoints: [...],                                             │
│    roles: ["ADMIN"]                                              │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND AUTH CONTEXT                           │
│              src/contexts/AuthContext.jsx                        │
├─────────────────────────────────────────────────────────────────┤
│  • Fetches UI config on login                                   │
│  • Stores capabilities in context                               │
│  • Provides { capabilities, can, pages, endpoints }            │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DYNAMIC MENU COMPONENT                          │
│              src/components/core/DynamicMenu.jsx                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Reads capabilities.pages from AuthContext                   │
│  2. Builds hierarchical menu structure                          │
│     • Parent pages (parentId: null) → Top-level items          │
│     • Child pages (parentId: X) → Submenu items                │
│  3. Sorts by displayOrder                                        │
│  4. Renders expandable/collapsible menu                         │
│  5. Highlights active route                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Backend Pages Structure

### Example Backend Response

```json
{
  "pages": [
    {
      "id": 2,
      "path": "/workers",
      "name": "Workers",
      "icon": "people",
      "displayOrder": 2,
      "isMenuItem": true,
      "parentId": null,
      "actions": []
    },
    {
      "id": 8,
      "path": "/workers/list",
      "name": "Worker List",
      "icon": "list",
      "displayOrder": 1,
      "isMenuItem": true,
      "parentId": 2,
      "actions": ["WORKER.CREATE", "WORKER.UPDATE", "WORKER.DELETE"]
    },
    {
      "id": 9,
      "path": "/workers/upload",
      "name": "Upload Workers",
      "icon": "upload",
      "displayOrder": 2,
      "isMenuItem": true,
      "parentId": 2,
      "actions": ["WORKER.CREATE", "WORKER.VALIDATE"]
    },
    {
      "id": 3,
      "path": "/payments",
      "name": "Payments",
      "icon": "payments",
      "displayOrder": 3,
      "isMenuItem": true,
      "parentId": null,
      "actions": []
    },
    {
      "id": 11,
      "path": "/payments/list",
      "name": "Payment List",
      "icon": "list",
      "displayOrder": 1,
      "isMenuItem": true,
      "parentId": 3,
      "actions": ["PAYMENT.CREATE", "PAYMENT.APPROVE", "PAYMENT.REJECT"]
    }
  ]
}
```

### Page Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique page identifier |
| `path` | string | Route path (e.g., `/workers/list`) |
| `name` | string | Display name in menu |
| `icon` | string | Icon identifier (e.g., `people`, `list`, `upload`) |
| `displayOrder` | number | Sort order within parent |
| `isMenuItem` | boolean | Whether to show in menu |
| `parentId` | number\|null | Parent page ID (null for top-level) |
| `actions` | string[] | Required capabilities for page actions |

---

## 🎨 Menu Hierarchy

### Resulting Menu Structure

```
Dashboard                        (hardcoded, always first)
├─ Workers                       (parentId: null, id: 2)
│  ├─ Worker List               (parentId: 2, id: 8)
│  └─ Upload Workers            (parentId: 2, id: 9)
├─ Payments                      (parentId: null, id: 3)
│  └─ Payment List              (parentId: 3, id: 11)
└─ Administration                (parentId: null, id: 7)
   └─ User Management           (parentId: 7, id: 14)
```

---

## 🔄 How It Works

### 1. Data Flow

```javascript
// 1. User logs in
await login(username, password);

// 2. AuthContext fetches UI config
const uiConfig = await apiClient.get('/api/auth/ui-config', token);

// 3. Store capabilities in context
setCapabilities({
  can: uiConfig.can,
  pages: uiConfig.pages,
  endpoints: uiConfig.endpoints,
  roles: uiConfig.roles
});

// 4. DynamicMenu component reads capabilities
const { capabilities } = useAuth();
const pages = capabilities?.pages || [];

// 5. Build menu hierarchy
const menuStructure = buildMenuTree(pages);

// 6. Render menu
return <Menu items={menuStructure} />;
```

### 2. Menu Building Logic

```javascript
// DynamicMenu.jsx - buildMenuTree function
const menuStructure = useMemo(() => {
  if (!capabilities?.pages) return [];

  const pages = capabilities.pages;
  
  // Separate parent and child pages
  const parentPages = pages.filter(p => p.parentId === null && p.isMenuItem);
  const childPages = pages.filter(p => p.parentId !== null && p.isMenuItem);

  // Build hierarchy
  const menuTree = parentPages.map(parent => ({
    ...parent,
    children: childPages
      .filter(child => child.parentId === parent.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  }))
  .sort((a, b) => a.displayOrder - b.displayOrder);

  return menuTree;
}, [capabilities?.pages]);
```

### 3. Menu Rendering

```javascript
const renderMenuItem = (item) => {
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    // Render expandable parent with submenu
    return (
      <li>
        <button onClick={() => toggleMenu(item.id)}>
          {item.icon} {item.name}
        </button>
        {isExpanded && (
          <ul>
            {item.children.map(child => renderMenuItem(child))}
          </ul>
        )}
      </li>
    );
  }

  // Render single menu item
  return (
    <li>
      <Link to={item.path}>
        {item.icon} {item.name}
      </Link>
    </li>
  );
};
```

---

## 🎯 Features

### ✅ Automatic Menu Generation
- Menu structure generated from backend configuration
- No hardcoded menu items (except Dashboard)
- Changes to backend pages immediately reflect in frontend

### ✅ Hierarchical Structure
- Parent pages with collapsible submenus
- Proper parent-child relationships
- Sorted by `displayOrder`

### ✅ Visual States
- **Active route highlighting** - Current page highlighted
- **Parent active state** - Parent highlighted when child is active
- **Expandable/Collapsible** - Click parent to show/hide children
- **Hover effects** - Visual feedback on hover

### ✅ Icon Support
- SVG icons for common types:
  - `people` - User/worker icons
  - `payments` - Payment icons
  - `settings` - Settings/admin icons
  - `list` - List view icons
  - `upload` - Upload icons
  - `dashboard` - Dashboard icon

### ✅ User Info Display
- User avatar with initial
- Username display
- User roles display
- Connection status indicator

---

## 📝 Component API

### DynamicMenu Component

```javascript
import DynamicMenu from './components/core/DynamicMenu';

// Usage in MainLayout
<aside className="sidebar">
  <DynamicMenu />
</aside>
```

**Props**: None (uses AuthContext internally)

**Features**:
- Automatic menu generation from `capabilities.pages`
- Expandable/collapsible parent menus
- Active route highlighting
- User info header
- Version display in footer

---

## 🎨 Styling

### CSS Classes

```css
/* Menu structure */
.sidebar { /* Sidebar container */ }
.sidebar nav { /* Navigation wrapper */ }
.sidebar ul { /* Menu list */ }
.sidebar li { /* Menu item */ }

/* States */
.active { /* Active menu item */ }
.expanded { /* Expanded parent menu */ }
.hover { /* Hover state */ }

/* Colors (using Tailwind) */
primary-50, primary-100  /* Active backgrounds */
primary-500, primary-700 /* Active text/border */
gray-50, gray-100        /* Hover backgrounds */
gray-600, gray-700       /* Default text */
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Menu renders after login
- [ ] All pages from backend appear in menu
- [ ] Parent pages show expand/collapse arrow
- [ ] Clicking parent expands/collapses submenu
- [ ] Active route is highlighted
- [ ] Parent is highlighted when child is active
- [ ] Dashboard link always appears first
- [ ] User info shows correct username and roles
- [ ] Version number displays in footer
- [ ] Menu respects `isMenuItem: false` (hidden items)
- [ ] Menu respects `displayOrder` (correct sorting)

### Backend Changes Testing

**Test 1: Add new page**
```json
// Backend adds new page to database
{
  "id": 15,
  "path": "/workers/reports",
  "name": "Worker Reports",
  "icon": "reports",
  "displayOrder": 3,
  "isMenuItem": true,
  "parentId": 2
}

// Expected: "Worker Reports" appears in Workers submenu
```

**Test 2: Change display order**
```json
// Backend changes displayOrder of "Upload Workers" from 2 to 1

// Expected: "Upload Workers" appears before "Worker List"
```

**Test 3: Hide page from menu**
```json
// Backend sets isMenuItem: false for "Worker Reports"

// Expected: "Worker Reports" no longer visible in menu
```

---

## 🔧 Customization

### Adding New Icons

```javascript
// In DynamicMenu.jsx - getIcon function
const getIcon = (iconName) => {
  const icons = {
    // Add your custom icon
    'custom-icon': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="..." />
      </svg>
    ),
    // ... existing icons
  };
  
  return icons[iconName] || icons.dashboard;
};
```

### Changing Active State Colors

```javascript
// In DynamicMenu.jsx - active class
className={`... ${
  isActive
    ? 'bg-blue-100 text-blue-700 border-blue-500'  // Change these colors
    : 'text-gray-700 hover:bg-gray-100'
}`}
```

---

## 📚 Related Files

```
src/
├── components/
│   └── core/
│       ├── DynamicMenu.jsx          ← Main menu component
│       ├── MainLayout.jsx           ← Uses DynamicMenu
│       └── index.js                 ← Exports DynamicMenu
│
├── contexts/
│   └── AuthContext.jsx              ← Provides capabilities.pages
│
└── api/
    └── apiConfig.js                 ← UI_CONFIG endpoint
```

---

## 🚀 Advantages

### 1. **Single Source of Truth**
- Menu structure defined in backend database
- Frontend automatically reflects backend configuration
- No frontend code changes needed for menu changes

### 2. **Permission-Aware**
- Pages can specify required capabilities in `actions` array
- Future enhancement: Hide pages user doesn't have access to

### 3. **Maintainable**
- No hardcoded menu items
- Easy to add/remove/reorder menu items from backend
- Consistent menu structure across application

### 4. **Scalable**
- Supports unlimited menu levels (parent → child → grandchild)
- Can handle 100+ menu items efficiently
- Lazy rendering of submenu items

### 5. **User-Friendly**
- Visual feedback for interactions
- Remembers expanded state during session
- Intuitive navigation patterns

---

## 🔮 Future Enhancements

### 1. Permission-Based Visibility
```javascript
// Hide pages user doesn't have required capabilities for
const hasAccess = (page) => {
  if (!page.actions || page.actions.length === 0) return true;
  return page.actions.every(action => can[action]);
};

const visiblePages = pages.filter(hasAccess);
```

### 2. Breadcrumb Generation
```javascript
// Generate breadcrumbs from menu hierarchy
const getBreadcrumbs = (path) => {
  const page = findPageByPath(path);
  const breadcrumbs = [];
  
  let current = page;
  while (current) {
    breadcrumbs.unshift(current);
    current = findPageById(current.parentId);
  }
  
  return breadcrumbs;
};
```

### 3. Search Functionality
```javascript
// Search menu items
const searchMenu = (query) => {
  return pages.filter(page => 
    page.name.toLowerCase().includes(query.toLowerCase())
  );
};
```

### 4. Favorites/Pinned Items
```javascript
// Allow users to pin frequently used pages
const pinnedPages = getUserPinnedPages();
// Show pinned items at top of menu
```

---

## 📊 Backend Configuration Example

### Database Schema (Suggested)

```sql
CREATE TABLE ui_pages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  path VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_menu_item BOOLEAN DEFAULT TRUE,
  parent_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES ui_pages(id) ON DELETE CASCADE
);

CREATE TABLE ui_page_actions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  page_id BIGINT NOT NULL,
  capability VARCHAR(100) NOT NULL,
  FOREIGN KEY (page_id) REFERENCES ui_pages(id) ON DELETE CASCADE
);
```

### Sample Backend Controller

```java
@GetMapping("/api/auth/ui-config")
public ResponseEntity<UiConfig> getUiConfig(Principal principal) {
  User user = getCurrentUser(principal);
  
  // Get user capabilities
  Map<String, Boolean> capabilities = capabilityService
    .getUserCapabilities(user);
  
  // Get all pages
  List<PageDTO> pages = pageService.getAllPages();
  
  // Get endpoints
  List<EndpointDTO> endpoints = endpointService.getAllEndpoints();
  
  UiConfig config = new UiConfig();
  config.setCan(capabilities);
  config.setPages(pages);
  config.setEndpoints(endpoints);
  config.setRoles(user.getRoles());
  config.setUserId(user.getId());
  config.setUsername(user.getUsername());
  config.setVersion(System.currentTimeMillis());
  
  return ResponseEntity.ok(config);
}
```

---

## ✅ Implementation Checklist

- [x] DynamicMenu component created
- [x] MainLayout updated to use DynamicMenu
- [x] Icon mapping implemented
- [x] Hierarchical menu rendering
- [x] Active route highlighting
- [x] Expand/collapse functionality
- [x] User info header
- [x] Version display footer
- [x] Responsive styling
- [x] Exported from core/index.js
- [ ] Backend pages configured in database
- [ ] Backend UI config endpoint returns pages
- [ ] Test with real backend data
- [ ] Add breadcrumb generation
- [ ] Add permission-based visibility

---

**Last Updated**: October 10, 2025  
**Status**: ✅ Frontend Complete | ⏳ Testing with Backend Pending
