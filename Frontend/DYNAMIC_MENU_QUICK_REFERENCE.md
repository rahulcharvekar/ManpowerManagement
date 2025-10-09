# Dynamic Menu System - Quick Reference

## 🎯 What Changed

**Before**: Hardcoded menu items in Navigation component  
**After**: Dynamic menu generated from backend `/api/auth/ui-config` response

---

## 📋 Key Files

| File | Purpose |
|------|---------|
| `src/components/core/DynamicMenu.jsx` | New dynamic menu component |
| `src/components/core/MainLayout.jsx` | Updated to use DynamicMenu |
| `src/contexts/AuthContext.jsx` | Provides `capabilities.pages` |
| `DYNAMIC_MENU_SYSTEM.md` | Complete documentation |

---

## 🔄 How It Works

```
Backend Response → AuthContext → DynamicMenu → Rendered Menu
```

### 1. Backend Response Structure

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
      "parentId": null
    },
    {
      "id": 8,
      "path": "/workers/list",
      "name": "Worker List",
      "icon": "list",
      "displayOrder": 1,
      "isMenuItem": true,
      "parentId": 2,
      "actions": ["WORKER.CREATE", "WORKER.UPDATE"]
    }
  ]
}
```

### 2. Menu Hierarchy

```
Dashboard (hardcoded)
└─ Workers (parentId: null)
   ├─ Worker List (parentId: 2)
   └─ Upload Workers (parentId: 2)
```

---

## ✅ Features

- ✅ **Automatic generation** from backend pages
- ✅ **Hierarchical structure** (parent → child)
- ✅ **Expandable/collapsible** parent menus
- ✅ **Active route highlighting**
- ✅ **Icon support** (people, payments, settings, list, upload, etc.)
- ✅ **Sorted by displayOrder**
- ✅ **User info header**
- ✅ **Version display**

---

## 🎨 Usage

### In Your Components

```javascript
import { useAuth } from '../../contexts/AuthContext';

const MyComponent = () => {
  const { capabilities } = useAuth();
  
  // Access pages data
  const pages = capabilities?.pages || [];
  
  // Find specific page
  const workerPage = pages.find(p => p.path === '/workers/list');
  
  // Check page actions
  const requiredCapabilities = workerPage?.actions || [];
};
```

### Menu Automatically Updates

```javascript
// No code needed! Menu automatically reflects backend changes:

// Backend adds new page → Appears in menu
// Backend changes displayOrder → Menu reorders
// Backend sets isMenuItem: false → Hidden from menu
```

---

## 🔧 Backend Integration

### Required Backend Response

```json
GET /api/auth/ui-config

{
  "can": { "WORKER.CREATE": true, ... },
  "pages": [
    {
      "id": number,
      "path": string,
      "name": string,
      "icon": string,
      "displayOrder": number,
      "isMenuItem": boolean,
      "parentId": number | null,
      "actions": string[]
    }
  ],
  "endpoints": [...],
  "roles": ["ADMIN"],
  "userId": 1,
  "username": "admin",
  "version": timestamp
}
```

### Page Properties

| Property | Required | Description |
|----------|----------|-------------|
| `id` | Yes | Unique page ID |
| `path` | Yes | Route path (e.g., `/workers/list`) |
| `name` | Yes | Display name |
| `icon` | No | Icon name (`people`, `list`, etc.) |
| `displayOrder` | Yes | Sort order |
| `isMenuItem` | Yes | Show in menu? |
| `parentId` | No | Parent page ID (null for top-level) |
| `actions` | No | Required capabilities array |

---

## 🎯 Examples

### Example 1: Top-Level Menu Item

```json
{
  "id": 2,
  "path": "/workers",
  "name": "Workers",
  "icon": "people",
  "displayOrder": 2,
  "isMenuItem": true,
  "parentId": null,
  "actions": []
}
```

**Result**: "Workers" appears as main menu item

### Example 2: Submenu Item

```json
{
  "id": 8,
  "path": "/workers/list",
  "name": "Worker List",
  "icon": "list",
  "displayOrder": 1,
  "isMenuItem": true,
  "parentId": 2,
  "actions": ["WORKER.CREATE", "WORKER.UPDATE"]
}
```

**Result**: "Worker List" appears under "Workers"

### Example 3: Hidden Page

```json
{
  "id": 99,
  "path": "/hidden-page",
  "name": "Hidden Page",
  "isMenuItem": false,
  "parentId": null
}
```

**Result**: Page accessible via URL but not in menu

---

## 🐛 Troubleshooting

### Menu Not Appearing

**Issue**: Menu is empty or not rendering

**Solutions**:
1. Check browser console for errors
2. Verify `capabilities.pages` is populated:
   ```javascript
   console.log('Pages:', capabilities?.pages);
   ```
3. Check backend response includes `pages` array
4. Verify user is authenticated

### Menu Item Not Showing

**Issue**: Specific page not appearing in menu

**Check**:
- `isMenuItem: true`?
- Valid `parentId`?
- Parent page exists?

### Wrong Order

**Issue**: Menu items in wrong order

**Check**:
- `displayOrder` values
- Lower numbers appear first
- Sort within parent groups

### Active Highlighting Not Working

**Issue**: Current page not highlighted

**Check**:
- Route path matches `page.path` exactly
- Location.pathname equals page.path
- No trailing slashes mismatch

---

## 💡 Tips

### 1. Keep Display Orders Sequential

```json
// Good
{ "displayOrder": 1 },
{ "displayOrder": 2 },
{ "displayOrder": 3 }

// Also Good (allows insertions)
{ "displayOrder": 10 },
{ "displayOrder": 20 },
{ "displayOrder": 30 }
```

### 2. Use Consistent Icons

```javascript
// Standard icons
"people"    - User/worker related
"payments"  - Payment related
"settings"  - Admin/config related
"list"      - List views
"upload"    - Upload functions
"dashboard" - Dashboard/overview
```

### 3. Group Related Pages

```json
// Workers module
{ "id": 2, "path": "/workers", "name": "Workers", "parentId": null }
{ "id": 8, "path": "/workers/list", "parentId": 2 }
{ "id": 9, "path": "/workers/upload", "parentId": 2 }

// Payments module
{ "id": 3, "path": "/payments", "name": "Payments", "parentId": null }
{ "id": 11, "path": "/payments/list", "parentId": 3 }
```

---

## ✅ Testing Checklist

### Frontend
- [ ] Menu renders after login
- [ ] All pages appear correctly
- [ ] Parent menus expand/collapse
- [ ] Active route highlighted
- [ ] User info displays correctly
- [ ] No console errors

### Backend
- [ ] UI config endpoint returns pages
- [ ] Pages include all required properties
- [ ] Parent-child relationships correct
- [ ] Display orders correct
- [ ] Icons specified for all pages

### Integration
- [ ] Adding page in backend shows in frontend
- [ ] Changing display order updates menu
- [ ] Setting isMenuItem:false hides page
- [ ] Menu updates on user login
- [ ] Different users see appropriate pages (future)

---

## 📊 Current Implementation Status

### ✅ Complete
- [x] DynamicMenu component
- [x] Hierarchical menu rendering
- [x] Expand/collapse functionality
- [x] Active route highlighting
- [x] Icon support
- [x] User info display
- [x] Integration with AuthContext
- [x] MainLayout integration
- [x] Documentation

### ⏳ Pending
- [ ] Backend pages configuration
- [ ] Test with real backend data
- [ ] Permission-based page visibility
- [ ] Breadcrumb generation
- [ ] Menu search functionality

---

## 🚀 Next Steps

1. **Backend Team**: Configure pages in database and return in `/api/auth/ui-config`
2. **Test**: Verify menu generates correctly from backend data
3. **Enhance**: Add permission-based visibility filtering
4. **Extend**: Add breadcrumbs, search, favorites

---

## 📞 Quick Help

**Issue**: Menu not updating after backend changes  
**Fix**: Logout and login again to fetch fresh UI config

**Issue**: Need to add custom icon  
**Fix**: Edit `getIcon()` function in `DynamicMenu.jsx`

**Issue**: Want to change menu colors  
**Fix**: Modify Tailwind classes in `DynamicMenu.jsx`

---

**Last Updated**: October 10, 2025  
**Component**: DynamicMenu v1.0  
**Status**: ✅ Ready for Testing
