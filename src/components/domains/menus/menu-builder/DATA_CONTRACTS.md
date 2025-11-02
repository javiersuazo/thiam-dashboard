# Data Contracts - Menu Builder API

## Overview
This document specifies the **exact** JSON structures, data types, validation rules, and edge cases for the Menu Builder API. Following these contracts ensures zero integration issues between frontend and backend.

---

## 🔴 Critical Contract Rules

1. **All IDs must be strings** (UUIDs recommended, but any unique string works)
2. **All prices are in CENTS** (integers, not decimals) - e.g., $28.50 = 2850
3. **All timestamps must be ISO 8601 format** - e.g., `"2025-06-01T10:30:00Z"`
4. **Category values are lowercase** - `"appetizers"`, NOT `"Appetizers"`
5. **Empty arrays are valid** - `[]`, NOT `null`
6. **Optional fields can be `null` or omitted** - Both are acceptable
7. **Boolean fields must be explicit** - `true` or `false`, NOT `1` or `0`

---

## 📊 Data Type Reference

| Type | Example | Notes |
|------|---------|-------|
| `string` | `"Grilled Salmon"` | UTF-8, max lengths specified per field |
| `number (int)` | `2850` | Always integers for cents, positions |
| `boolean` | `true` | Lowercase, not `"true"` string |
| `string (ISO date)` | `"2025-06-01T10:30:00Z"` | UTC timezone recommended |
| `string (UUID)` | `"550e8400-e29b-41d4-a716-446655440000"` | UUID v4 recommended |
| `string[]` | `["vegetarian", "gluten-free"]` | Array of strings |
| `null` | `null` | Explicit null for optional fields |

---

## 📋 Contract 1: MenuItem (Inventory Item)

### Purpose
Represents an individual dish/item that can be added to menus.

### GET /accounts/{accountId}/menu-items Response

**Array of MenuItem objects:**

```json
[
  {
    "id": "item_abc123",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
    "category": "mains",
    "dietaryTags": ["gluten-free", "dairy-free"],
    "ingredients": ["salmon", "lemon", "butter", "herbs", "vegetables"],
    "priceCents": 2850,
    "currency": "USD",
    "imageUrl": "https://cdn.example.com/images/salmon.jpg",
    "isAvailable": true
  }
]
```

### Field Specifications

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | string | ✅ Yes | Unique, max 255 chars | Primary key |
| `name` | string | ✅ Yes | 1-200 chars | Display name |
| `description` | string \| null | ❌ No | Max 1000 chars | Can be `null` or omitted |
| `category` | string | ✅ Yes | Must be one of: `"appetizers"`, `"mains"`, `"sides"`, `"desserts"`, `"beverages"` | Lowercase only |
| `dietaryTags` | string[] \| null | ❌ No | Array of strings, max 20 tags | Can be `[]`, `null`, or omitted |
| `ingredients` | string[] \| null | ❌ No | Array of strings, max 50 ingredients | Can be `[]`, `null`, or omitted |
| `priceCents` | number (int) | ✅ Yes | >= 0, max 10000000 (=$100k) | Price in cents (2850 = $28.50) |
| `currency` | string | ✅ Yes | ISO 4217 code, exactly 3 chars | `"USD"`, `"EUR"`, `"GBP"`, etc. |
| `imageUrl` | string \| null | ❌ No | Valid HTTPS URL, max 2048 chars | Can be `null` or omitted |
| `isAvailable` | boolean | ✅ Yes | `true` or `false` | Controls visibility in browse modal |

### Validation Rules

**Category values (case-sensitive, lowercase):**
```typescript
enum Category {
  appetizers = "appetizers",
  mains = "mains",
  sides = "sides",
  desserts = "desserts",
  beverages = "beverages"
}
```

**Dietary tag examples** (free-form strings, but common values):
- `"vegetarian"`
- `"vegan"`
- `"gluten-free"`
- `"dairy-free"`
- `"nut-free"`
- `"halal"`
- `"kosher"`
- `"shellfish-free"`
- `"soy-free"`
- `"egg-free"`

**Price validation:**
```typescript
// Valid
priceCents: 0        // Free item
priceCents: 500      // $5.00
priceCents: 2850     // $28.50
priceCents: 12345    // $123.45

// Invalid
priceCents: -100     // ❌ Negative not allowed
priceCents: 28.50    // ❌ Must be integer, not decimal
priceCents: "2850"   // ❌ Must be number, not string
```

### Edge Cases

**Empty dietary tags:**
```json
// All valid:
"dietaryTags": []
"dietaryTags": null
// Field omitted entirely
```

**Missing description:**
```json
// All valid:
"description": null
"description": ""
// Field omitted entirely
```

**No image:**
```json
// All valid:
"imageUrl": null
// Field omitted entirely

// Invalid:
"imageUrl": ""  // ❌ Empty string not allowed, use null
```

### Example Responses

**Minimal valid item:**
```json
{
  "id": "item_1",
  "name": "Water",
  "category": "beverages",
  "priceCents": 0,
  "currency": "USD",
  "isAvailable": true
}
```

**Full item with all optional fields:**
```json
{
  "id": "item_2",
  "name": "Vegan Buddha Bowl",
  "description": "Quinoa, roasted vegetables, chickpeas, tahini dressing",
  "category": "mains",
  "dietaryTags": ["vegan", "vegetarian", "gluten-free", "dairy-free"],
  "ingredients": ["quinoa", "chickpeas", "kale", "sweet potato", "tahini"],
  "priceCents": 1650,
  "currency": "USD",
  "imageUrl": "https://cdn.example.com/buddha-bowl.jpg",
  "isAvailable": true
}
```

---

## 📋 Contract 2: CreateMenuRequest

### Purpose
Payload sent from frontend when creating a new menu.

### POST /accounts/{accountId}/menus Request Body

```json
{
  "name": "Summer Wedding Menu 2025",
  "description": "Elegant 3-course menu for outdoor summer weddings",
  "imageUrl": "https://cdn.example.com/menus/summer-wedding.jpg",
  "availableFrom": "2025-06-01T00:00:00Z",
  "availableTo": "2025-08-31T23:59:59Z",
  "tags": ["wedding", "summer", "formal", "outdoor"],
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_abc123",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true
        },
        {
          "menuItemId": "item_xyz789",
          "position": 1,
          "priceCents": 1500,
          "isAvailable": true
        }
      ]
    },
    {
      "name": "Main Courses",
      "icon": "🍽️",
      "items": [
        {
          "menuItemId": "item_def456",
          "position": 0,
          "priceCents": 2850,
          "isAvailable": true
        }
      ]
    },
    {
      "name": "Desserts",
      "icon": "🍰",
      "items": []
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null
}
```

### Field Specifications

#### Menu Level

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `name` | string | ✅ Yes | 1-200 chars | Menu display name |
| `description` | string \| null | ❌ No | Max 1000 chars | |
| `imageUrl` | string \| null | ❌ No | Valid HTTPS URL, max 2048 chars | |
| `availableFrom` | string \| null | ❌ No | ISO 8601 datetime | Start date for menu availability |
| `availableTo` | string \| null | ❌ No | ISO 8601 datetime | End date for menu availability |
| `tags` | string[] \| null | ❌ No | Max 20 tags, each max 50 chars | Free-form strings |
| `courses` | Course[] | ✅ Yes | Min 1 course required | Array of course objects |
| `isActive` | boolean | ✅ Yes | `true` or `false` | Whether menu is currently active |
| `pricingStrategy` | string | ✅ Yes | `"fixed"` or `"sum-of-items"` | Pricing calculation method |
| `fixedPriceCents` | number \| null | ⚠️ Conditional | Required if `pricingStrategy === "fixed"`, >= 0 | Fixed menu price in cents |

#### Course Level

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `name` | string | ✅ Yes | 1-100 chars | Course display name |
| `icon` | string | ✅ Yes | 1-10 chars (emoji) | Display icon (e.g., "🥗") |
| `items` | CourseItem[] | ✅ Yes | Can be empty array `[]` | Items in this course |

#### CourseItem Level

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `menuItemId` | string | ✅ Yes | Must exist in MenuItem table | Foreign key reference |
| `position` | number (int) | ✅ Yes | >= 0, unique within course | Display order |
| `priceCents` | number (int) | ✅ Yes | >= 0 | Price override (can match or differ from MenuItem price) |
| `isAvailable` | boolean | ✅ Yes | `true` or `false` | Availability in this menu |

### Validation Rules

**Pricing strategy validation:**
```typescript
// Valid combinations:
{
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null  // or omitted
}

{
  "pricingStrategy": "fixed",
  "fixedPriceCents": 5000  // Required!
}

// Invalid:
{
  "pricingStrategy": "fixed",
  "fixedPriceCents": null  // ❌ Must provide price!
}

{
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": 5000  // ⚠️ Will be ignored (not error, but wasteful)
}
```

**Course validation:**
```typescript
// Valid - at least 1 course
"courses": [
  {
    "name": "Appetizers",
    "icon": "🥗",
    "items": []  // Empty is OK
  }
]

// Invalid - empty courses array
"courses": []  // ❌ Must have at least 1 course
```

**Position uniqueness:**
```typescript
// Valid - positions are unique within course
"items": [
  { "menuItemId": "item_1", "position": 0, ... },
  { "menuItemId": "item_2", "position": 1, ... },
  { "menuItemId": "item_3", "position": 2, ... }
]

// Invalid - duplicate positions
"items": [
  { "menuItemId": "item_1", "position": 0, ... },
  { "menuItemId": "item_2", "position": 0, ... }  // ❌ Duplicate position
]
```

### Edge Cases

**Empty course (no items):**
```json
{
  "name": "Beverages",
  "icon": "🥤",
  "items": []  // ✅ Valid - course exists but has no items yet
}
```

**Menu without date range:**
```json
{
  "name": "Year-Round Menu",
  "availableFrom": null,  // ✅ Valid - always available
  "availableTo": null,
  "..."
}
```

**Item with overridden price:**
```json
{
  "menuItemId": "item_salmon",  // Original price: $28.50 (2850 cents)
  "position": 0,
  "priceCents": 2500,  // ✅ Valid - discounted to $25.00 for this menu
  "isAvailable": true
}
```

### Example Requests

**Minimal menu (required fields only):**
```json
{
  "name": "Quick Lunch Menu",
  "courses": [
    {
      "name": "Mains",
      "icon": "🍽️",
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

**Fixed-price menu:**
```json
{
  "name": "Prix Fixe Dinner - $50",
  "description": "Three-course dinner with wine pairing",
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        { "menuItemId": "item_1", "position": 0, "priceCents": 0, "isAvailable": true }
      ]
    },
    {
      "name": "Main Courses",
      "icon": "🍽️",
      "items": [
        { "menuItemId": "item_2", "position": 0, "priceCents": 0, "isAvailable": true }
      ]
    },
    {
      "name": "Desserts",
      "icon": "🍰",
      "items": [
        { "menuItemId": "item_3", "position": 0, "priceCents": 0, "isAvailable": true }
      ]
    }
  ],
  "isActive": true,
  "pricingStrategy": "fixed",
  "fixedPriceCents": 5000
}
```
**Note**: With fixed pricing, individual item prices are ignored but still required in the schema.

---

## 📋 Contract 3: MenuBuilderResponse

### Purpose
Menu object returned by backend after create/update/get operations.

### Response Structure

```json
{
  "id": "menu_xyz789",
  "accountId": "acc_123456",
  "name": "Summer Wedding Menu 2025",
  "description": "Elegant 3-course menu for outdoor summer weddings",
  "imageUrl": "https://cdn.example.com/menus/summer-wedding.jpg",
  "availableFrom": "2025-06-01T00:00:00Z",
  "availableTo": "2025-08-31T23:59:59Z",
  "tags": ["wedding", "summer", "formal", "outdoor"],
  "courses": [
    {
      "id": "course_abc123",
      "name": "Appetizers",
      "icon": "🥗",
      "position": 0,
      "items": [
        {
          "id": "course_item_1",
          "menuItemId": "item_abc123",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true
        },
        {
          "id": "course_item_2",
          "menuItemId": "item_xyz789",
          "position": 1,
          "priceCents": 1500,
          "isAvailable": true
        }
      ]
    },
    {
      "id": "course_def456",
      "name": "Main Courses",
      "icon": "🍽️",
      "position": 1,
      "items": [
        {
          "id": "course_item_3",
          "menuItemId": "item_def456",
          "position": 0,
          "priceCents": 2850,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:45:00Z"
}
```

### Field Specifications

**Additional fields compared to CreateMenuRequest:**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | string | ✅ Yes | Unique | Generated by backend |
| `accountId` | string | ✅ Yes | FK to accounts table | Generated by backend |
| `courses[].id` | string | ✅ Yes | Unique | Generated by backend |
| `courses[].position` | number | ✅ Yes | >= 0, unique within menu | Generated by backend |
| `courses[].items[].id` | string | ✅ Yes | Unique | Generated by backend |
| `createdAt` | string | ✅ Yes | ISO 8601 datetime | Generated by backend |
| `updatedAt` | string | ✅ Yes | ISO 8601 datetime | Updated on each save |

### Key Differences from Request

1. **IDs are added** - Backend generates IDs for menu, courses, and course items
2. **accountId is added** - Derived from path parameter
3. **position is added to courses** - Derived from array order (0, 1, 2...)
4. **Timestamps are added** - `createdAt` and `updatedAt`
5. **Empty courses are preserved** - If request had empty course, response includes it

### Timestamp Format

**Must be ISO 8601 with timezone:**
```typescript
// Valid formats:
"2025-06-01T10:30:00Z"           // UTC (recommended)
"2025-06-01T10:30:00.000Z"       // UTC with milliseconds
"2025-06-01T10:30:00+00:00"      // UTC with offset
"2025-06-01T06:30:00-04:00"      // EDT with offset

// Invalid formats:
"2025-06-01 10:30:00"            // ❌ Missing 'T' separator
"2025-06-01T10:30:00"            // ❌ Missing timezone
"06/01/2025 10:30 AM"            // ❌ Not ISO 8601
```

---

## 📋 Contract 4: UpdateMenuRequest

### Purpose
Payload sent when updating an existing menu.

### PUT /accounts/{accountId}/menus/{menuId} Request Body

**Identical to CreateMenuRequest but includes `id` field:**

```json
{
  "id": "menu_xyz789",
  "name": "Updated Menu Name",
  "description": "Updated description",
  "imageUrl": null,
  "availableFrom": "2025-07-01T00:00:00Z",
  "availableTo": "2025-09-30T23:59:59Z",
  "tags": ["updated", "new-tag"],
  "courses": [
    {
      "id": "course_abc123",
      "name": "Starters",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_abc123",
          "position": 0,
          "priceCents": 1300,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": true,
  "pricingStrategy": "fixed",
  "fixedPriceCents": 6000
}
```

### Field Specifications

**Required additional fields:**

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `id` | string | ✅ Yes | Must match URL `{menuId}` | Menu being updated |
| `courses[].id` | string | ⚠️ Conditional | Required if updating existing course | Omit if adding new course |

### Update Semantics

**Full replacement (recommended approach):**
- Frontend sends complete menu structure
- Backend replaces entire menu with new data
- Simpler to implement, no partial update logic needed

**Example update flow:**
1. Frontend fetches current menu: `GET /menus/123`
2. User modifies menu in UI
3. Frontend sends entire updated menu: `PUT /menus/123`
4. Backend replaces menu completely

**Course handling:**
```typescript
// Existing course (has ID) - update it
{
  "id": "course_abc123",  // ✅ Existing course ID
  "name": "Updated Name",
  "icon": "🥗",
  "items": [...]
}

// New course (no ID) - create it
{
  // ID omitted - backend generates new ID
  "name": "New Course",
  "icon": "🍰",
  "items": [...]
}

// Deleted course - omit from array
// If course was in original menu but not in update request,
// backend should delete it
```

### Validation Rules

**ID matching:**
```typescript
// Request URL: PUT /accounts/acc_1/menus/menu_123
// Request body must have:
{
  "id": "menu_123"  // ✅ Must match URL parameter
}

// Invalid:
{
  "id": "menu_999"  // ❌ Doesn't match URL
}
```

**Concurrency control (optional but recommended):**
```typescript
// Include updatedAt from original fetch
{
  "id": "menu_123",
  "updatedAt": "2025-01-20T14:45:00Z",  // From original GET
  ...
}

// Backend checks if updatedAt matches current value
// If mismatch, return 409 Conflict (menu was modified by someone else)
```

---

## 📋 Contract 5: Error Responses

### Purpose
Standardized error format for all endpoints.

### Error Response Structure

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "pricingStrategy",
        "message": "fixedPriceCents is required when pricingStrategy is 'fixed'"
      },
      {
        "field": "courses[0].items[1].position",
        "message": "Duplicate position 0 in course items"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Message | When to Use |
|-------------|------|---------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data | Validation failures |
| 400 | `INVALID_MENU_ITEM` | Referenced menu item not found | `menuItemId` doesn't exist |
| 401 | `UNAUTHORIZED` | Authentication required | Missing or invalid token |
| 403 | `FORBIDDEN` | Access denied | User doesn't own this account |
| 404 | `NOT_FOUND` | Resource not found | Menu/account doesn't exist |
| 409 | `CONFLICT` | Resource conflict | Concurrent modification detected |
| 422 | `UNPROCESSABLE_ENTITY` | Business rule violation | e.g., Menu in use, can't delete |
| 500 | `INTERNAL_ERROR` | Internal server error | Unexpected backend error |

### Validation Error Examples

**Missing required field:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": [
      {
        "field": "name",
        "message": "name is required"
      }
    ]
  }
}
```

**Invalid enum value:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid field value",
    "details": [
      {
        "field": "pricingStrategy",
        "message": "pricingStrategy must be 'fixed' or 'sum-of-items', got 'per-person'"
      }
    ]
  }
}
```

**Foreign key violation:**
```json
{
  "error": {
    "code": "INVALID_MENU_ITEM",
    "message": "Referenced menu items not found",
    "details": [
      {
        "field": "courses[1].items[0].menuItemId",
        "message": "Menu item 'item_nonexistent' does not exist"
      }
    ]
  }
}
```

**Business rule violation:**
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

## 🔧 Filter Query Parameters (for GET /menu-items)

### Purpose
Backend support for filtering menu items (for large inventories).

### Query Parameter Contract

```http
GET /accounts/{accountId}/menu-items?category=mains&search=salmon&dietaryTags=gluten-free,dairy-free&limit=24&offset=0
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `category` | string | ❌ No | Filter by category | `appetizers`, `mains`, `sides`, `desserts`, `beverages` |
| `search` | string | ❌ No | Search in name OR description (case-insensitive) | `salmon`, `chocolate` |
| `dietaryTags` | string | ❌ No | Comma-separated tags (AND logic) | `vegan,gluten-free` |
| `isAvailable` | boolean | ❌ No | Filter by availability | `true`, `false` |
| `limit` | number | ❌ No | Page size (default: 100, max: 100) | `24` |
| `offset` | number | ❌ No | Page offset (default: 0) | `0`, `24`, `48` |

### Filter Behavior

**Category filter:**
```typescript
// Returns only mains
GET /menu-items?category=mains

// Invalid category - return 400 error
GET /menu-items?category=invalid
```

**Search filter (searches both name AND description):**
```typescript
// Matches "Grilled Salmon" (name) or "Fresh salmon with herbs" (description)
GET /menu-items?search=salmon

// Case-insensitive
GET /menu-items?search=SALMON  // Same results
```

**Dietary tags filter (AND logic):**
```typescript
// Item must have BOTH tags
GET /menu-items?dietaryTags=vegan,gluten-free

// Matches:
// ✅ { dietaryTags: ["vegan", "gluten-free", "organic"] }
// ❌ { dietaryTags: ["vegan"] }  // Missing gluten-free
// ❌ { dietaryTags: ["gluten-free"] }  // Missing vegan
```

**Combining filters:**
```typescript
// All filters applied together (AND logic)
GET /menu-items?category=mains&search=chicken&dietaryTags=gluten-free&isAvailable=true

// Returns: Gluten-free chicken mains that are available
```

### Pagination Response

**Without pagination (simple array):**
```json
[
  { "id": "item_1", ... },
  { "id": "item_2", ... }
]
```

**With pagination (recommended for 100+ items):**
```json
{
  "data": [
    { "id": "item_1", ... },
    { "id": "item_2", ... }
  ],
  "pagination": {
    "total": 156,
    "limit": 24,
    "offset": 0,
    "hasMore": true
  }
}
```

### Current Frontend Behavior

**Important**: The frontend currently does **client-side filtering**:
- Frontend fetches ALL items: `GET /menu-items` (no query params)
- Frontend filters in browser using JavaScript
- Works fine for < 500 items
- For 1000+ items, backend filtering is recommended

**Migration path:**
1. **Phase 1** (current): Backend returns all items, frontend filters
2. **Phase 2** (future): Frontend sends filters to backend

**Backend should support both:**
- `GET /menu-items` - Returns all items (for Phase 1)
- `GET /menu-items?category=mains&...` - Returns filtered items (for Phase 2)

---

## 🧪 Test Cases for Backend

### Test Case 1: Create Menu - Success
```http
POST /accounts/acc_1/menus
Content-Type: application/json

{
  "name": "Test Menu",
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_1",
          "position": 0,
          "priceCents": 1000,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items"
}
```

**Expected: 201 Created**
```json
{
  "id": "menu_generated_id",
  "accountId": "acc_1",
  "name": "Test Menu",
  "courses": [
    {
      "id": "course_generated_id",
      "name": "Appetizers",
      "icon": "🥗",
      "position": 0,
      "items": [
        {
          "id": "course_item_generated_id",
          "menuItemId": "item_1",
          "position": 0,
          "priceCents": 1000,
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

### Test Case 2: Create Menu - Invalid menuItemId
```http
POST /accounts/acc_1/menus
{
  "name": "Test Menu",
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_nonexistent",
          "position": 0,
          "priceCents": 1000,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": false,
  "pricingStrategy": "sum-of-items"
}
```

**Expected: 400 Bad Request**
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

### Test Case 3: Create Menu - Missing fixedPriceCents
```http
POST /accounts/acc_1/menus
{
  "name": "Fixed Price Menu",
  "courses": [...],
  "isActive": false,
  "pricingStrategy": "fixed"
  // fixedPriceCents is missing!
}
```

**Expected: 400 Bad Request**
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

### Test Case 4: Update Menu - Concurrency Conflict
```http
PUT /accounts/acc_1/menus/menu_123
{
  "id": "menu_123",
  "name": "Updated Name",
  "updatedAt": "2025-01-20T10:00:00Z",  // Old timestamp
  ...
}
```

**Expected: 409 Conflict** (if menu was modified after this timestamp)
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Menu has been modified by another user",
    "details": [
      {
        "field": "updatedAt",
        "message": "Expected '2025-01-20T10:00:00Z' but current value is '2025-01-20T14:30:00Z'"
      }
    ]
  }
}
```

### Test Case 5: Delete Menu - In Use
```http
DELETE /accounts/acc_1/menus/menu_123
```

**Expected: 422 Unprocessable Entity**
```json
{
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Cannot delete menu",
    "details": [
      {
        "field": "id",
        "message": "Menu is referenced by 5 active orders"
      }
    ]
  }
}
```

### Test Case 6: Get Menu Items - Filtered
```http
GET /accounts/acc_1/menu-items?category=mains&dietaryTags=vegan&limit=10
```

**Expected: 200 OK**
```json
[
  {
    "id": "item_1",
    "name": "Vegan Pasta",
    "category": "mains",
    "dietaryTags": ["vegan", "vegetarian"],
    ...
  }
]
```

---

## 📝 Summary Checklist

### For Backend Developers

- [ ] All IDs are strings (UUIDs recommended)
- [ ] All prices are integers in cents (2850 = $28.50)
- [ ] All timestamps are ISO 8601 with timezone
- [ ] Category values are lowercase (`"mains"`, not `"Mains"`)
- [ ] Empty arrays return `[]`, not `null`
- [ ] Optional fields can be `null` or omitted
- [ ] Booleans are `true`/`false`, not `1`/`0`
- [ ] `fixedPriceCents` is required when `pricingStrategy === "fixed"`
- [ ] Error responses follow standardized format
- [ ] Foreign key validation (menuItemId must exist)
- [ ] Position uniqueness within courses
- [ ] GET /menu-items supports filters (category, search, dietaryTags)
- [ ] Pagination support (limit, offset) for large inventories
- [ ] Concurrency control (updatedAt timestamp check)

### For Frontend Developers

- [ ] Send prices as integers in cents
- [ ] Include all required fields in requests
- [ ] Handle all error response codes (400, 401, 403, 404, 409, 422, 500)
- [ ] Parse ISO 8601 timestamps correctly
- [ ] Use lowercase category values
- [ ] Send `fixedPriceCents` only when `pricingStrategy === "fixed"`
- [ ] Handle empty arrays (`[]`) and `null` values
- [ ] Validate data before sending to backend
- [ ] Display user-friendly error messages from `error.details`

---

## 🚀 Quick Reference

### Valid Category Values
```typescript
"appetizers" | "mains" | "sides" | "desserts" | "beverages"
```

### Valid Pricing Strategies
```typescript
"fixed" | "sum-of-items"
```

### Common Dietary Tags
```typescript
"vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free" |
"halal" | "kosher" | "shellfish-free" | "soy-free" | "egg-free"
```

### Price Conversion
```typescript
// Frontend display → Backend storage
$28.50 → 2850 cents
$5.00  → 500 cents
$0.99  → 99 cents

// Backend storage → Frontend display
2850 cents → $28.50
500 cents  → $5.00
99 cents   → $0.99
```

### Date Formatting
```typescript
// Frontend (JavaScript)
const isoDate = new Date().toISOString()
// "2025-01-15T10:30:00.000Z"

// Backend (Go)
time.Now().UTC().Format(time.RFC3339)
// "2025-01-15T10:30:00Z"
```

---

**This contract ensures zero integration issues between frontend and backend! 🎉**
