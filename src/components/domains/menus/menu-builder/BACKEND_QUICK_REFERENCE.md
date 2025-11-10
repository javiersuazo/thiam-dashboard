# Backend Quick Reference - Menu Builder API

## 🎯 TL;DR

**Read first:** `DATA_CONTRACTS.md` (has all JSON examples)

**Implement:** 7 endpoints + 4 database tables

**Test:** Change `USE_MOCK_DATA = false` in frontend

**Time estimate:** 8-16 hours

---

## 📋 7 Endpoints Required

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/accounts/:accountId/menu-items` | Get available items | `MenuItem[]` |
| GET | `/accounts/:accountId/menus` | List all menus | `Menu[]` |
| GET | `/accounts/:accountId/menus/:menuId` | Get single menu | `Menu` |
| POST | `/accounts/:accountId/menus` | Create menu | `Menu` (201) |
| PUT | `/accounts/:accountId/menus/:menuId` | Update menu | `Menu` (200) |
| DELETE | `/accounts/:accountId/menus/:menuId` | Delete menu | Empty (204) |
| POST | `/accounts/:accountId/menus/:menuId/duplicate` | Duplicate menu | `Menu` (201) |

---

## 🗄️ 4 Database Tables

```sql
-- 1. Menu items (inventory)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,  -- appetizers, mains, sides, desserts, beverages
  dietary_tags TEXT[],
  price_cents INTEGER NOT NULL,  -- In cents! $28.50 = 2850
  currency VARCHAR(3) DEFAULT 'USD',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menus
CREATE TABLE menus (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  pricing_strategy VARCHAR(20) NOT NULL,  -- 'fixed' or 'sum-of-items'
  fixed_price_cents INTEGER,  -- Required if pricing_strategy = 'fixed'
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu courses
CREATE TABLE menu_courses (
  id UUID PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(menu_id, position)
);

-- 4. Course items (junction table)
CREATE TABLE menu_course_items (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES menu_courses(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  position INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(course_id, position)
);
```

---

## 🔑 Critical Data Rules

### 1. Prices = Cents (Integer)
```json
✅ "priceCents": 2850  // $28.50
❌ "priceCents": 28.50  // Must be integer
❌ "priceCents": "2850"  // Must be number
```

### 2. Category = Lowercase
```json
✅ "category": "appetizers"
✅ "category": "mains"
✅ "category": "sides"
✅ "category": "desserts"
✅ "category": "beverages"
❌ "category": "Appetizers"  // Must be lowercase
```

### 3. Timestamps = ISO 8601
```json
✅ "createdAt": "2025-06-01T10:30:00Z"
❌ "createdAt": "2025-06-01 10:30:00"
```

### 4. Pricing Strategy Validation
```json
// If pricingStrategy is "fixed", fixedPriceCents is REQUIRED
✅ { "pricingStrategy": "fixed", "fixedPriceCents": 5000 }
❌ { "pricingStrategy": "fixed", "fixedPriceCents": null }  // 400 error

// If pricingStrategy is "sum-of-items", fixedPriceCents is ignored
✅ { "pricingStrategy": "sum-of-items", "fixedPriceCents": null }
```

### 5. IDs = Strings
```json
✅ "id": "menu_abc123"
✅ "id": "550e8400-e29b-41d4-a716-446655440000"  // UUID
❌ "id": 12345  // Must be string
```

---

## 📨 Example Request/Response

### POST /accounts/acc_1/menus

**Request:**
```json
{
  "name": "Summer Wedding Menu",
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_1",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items"
}
```

**Response (201 Created):**
```json
{
  "id": "menu_generated_123",
  "accountId": "acc_1",
  "name": "Summer Wedding Menu",
  "courses": [
    {
      "id": "course_generated_456",
      "name": "Appetizers",
      "icon": "🥗",
      "position": 0,
      "items": [
        {
          "id": "course_item_generated_789",
          "menuItemId": "item_1",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## ❌ Error Responses

### 400 - Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "fixedPriceCents",
        "message": "fixedPriceCents is required when pricingStrategy is 'fixed'"
      }
    ]
  }
}
```

### 400 - Invalid Menu Item
```json
{
  "error": {
    "code": "INVALID_MENU_ITEM",
    "message": "Referenced menu items not found",
    "details": [
      {
        "field": "courses[0].items[0].menuItemId",
        "message": "Menu item 'item_nonexistent' does not exist"
      }
    ]
  }
}
```

### 404 - Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Menu not found"
  }
}
```

### 422 - Business Rule Violation
```json
{
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot delete menu",
    "details": [
      {
        "field": "id",
        "message": "Menu is referenced by 3 active orders"
      }
    ]
  }
}
```

---

## 🔍 Filter Query Parameters (GET /menu-items)

```http
GET /menu-items?category=mains&search=salmon&dietaryTags=vegan,gluten-free&limit=24&offset=0
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category | `appetizers`, `mains` |
| `search` | string | Search name OR description | `salmon` |
| `dietaryTags` | string | Comma-separated (AND logic) | `vegan,gluten-free` |
| `isAvailable` | boolean | Filter by availability | `true` |
| `limit` | number | Page size (max 100) | `24` |
| `offset` | number | Page offset | `0`, `24`, `48` |

**Note:** Frontend currently does client-side filtering. Backend filters are optional but recommended for 1000+ items.

---

## ✅ Validation Checklist

- [ ] All prices stored as integers (cents)
- [ ] Category values are lowercase
- [ ] Timestamps are ISO 8601 with timezone
- [ ] IDs are strings (UUIDs recommended)
- [ ] `fixedPriceCents` required when `pricingStrategy === "fixed"`
- [ ] Foreign key validation (menuItemId must exist)
- [ ] Position uniqueness within courses
- [ ] Empty arrays return `[]`, not `null`
- [ ] Error responses match standardized format
- [ ] Authentication checks account ownership

---

## 🧪 Quick Test

```bash
# 1. Create a menu item
curl -X POST http://localhost:8080/v1/accounts/acc_1/menu-items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "category": "mains",
    "priceCents": 1000,
    "currency": "USD",
    "isAvailable": true
  }'

# 2. Get menu items
curl -X GET http://localhost:8080/v1/accounts/acc_1/menu-items \
  -H "Authorization: Bearer TOKEN"

# 3. Create a menu
curl -X POST http://localhost:8080/v1/accounts/acc_1/menus \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d @menu-payload.json

# 4. Get menus
curl -X GET http://localhost:8080/v1/accounts/acc_1/menus \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚀 Frontend Integration

```bash
# After backend is ready:
cd thiam-dashboard

# 1. Update OpenAPI spec (get latest from backend)
npm run api:update

# 2. Change mock data flag
# File: src/components/domains/menus/menu-builder/hooks/useMenuBuilder.ts
# Line 6: const USE_MOCK_DATA = false

# 3. Start frontend
npm run dev

# 4. Test in browser at http://localhost:3000
```

---

## 📚 Detailed Documentation

- **DATA_CONTRACTS.md** - Complete JSON structures, validation rules, edge cases (READ THIS FIRST!)
- **BACKEND_REQUIREMENTS.md** - Full endpoint specs, database schema, OpenAPI spec
- **INTEGRATION_GUIDE.md** - Step-by-step integration guide
- **PAGINATION_AND_FILTERS.md** - Filter implementation details

---

## ⏱️ Time Estimates

| Task | Estimate |
|------|----------|
| Read documentation | 30 min |
| Database schema | 1-2 hours |
| Implement endpoints | 4-8 hours |
| Update OpenAPI spec | 30 min |
| Testing | 2-4 hours |
| Bug fixes | 1-2 hours |
| **Total** | **8-16 hours** |

---

## 🎯 Success = Frontend Works Without Changes

The frontend requires **ZERO refactoring** for backend integration. Just:

1. Implement 7 endpoints following DATA_CONTRACTS.md
2. Update OpenAPI spec
3. Run `npm run api:update` on frontend
4. Change `USE_MOCK_DATA = false`

That's it! 🎉

---

## 💡 Common Pitfalls

1. ❌ Sending prices as decimals → ✅ Send as integer cents
2. ❌ Capitalized categories → ✅ Lowercase only
3. ❌ Missing fixedPriceCents on fixed pricing → ✅ Always include
4. ❌ Returning numbers for IDs → ✅ Return strings
5. ❌ Wrong timestamp format → ✅ Use ISO 8601
6. ❌ Empty string for null → ✅ Use `null` or omit field
7. ❌ Not validating foreign keys → ✅ Check menuItemId exists

---

**Questions? Check DATA_CONTRACTS.md for examples!**
