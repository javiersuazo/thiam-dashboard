# Backend Requirements for Menu Builder

## Overview
This document specifies the API endpoints needed for the Menu Builder feature to work with a real backend.

**⚠️ IMPORTANT**: Read `DATA_CONTRACTS.md` first for detailed JSON structures, validation rules, and edge cases.

**Migration**: Change `USE_MOCK_DATA = false` in `hooks/useMenuBuilder.ts:6` once these endpoints are implemented.

## Related Documentation
- **DATA_CONTRACTS.md** - Detailed JSON structures, validation rules, field specifications, edge cases
- **BACKEND_REQUIREMENTS.md** (this file) - Endpoint overview, database schema, OpenAPI spec
- **PAGINATION_AND_FILTERS.md** - Frontend filtering behavior and requirements

---

## Required Endpoints

### 1. Get Available Menu Items (Inventory)
**Purpose**: Fetch all available menu items that can be added to menus

```http
GET /v1/accounts/{accountId}/menu-items
```

**Path Parameters**:
- `accountId` (string, required): Account identifier

**Query Parameters** (optional, for future enhancement):
- `category` (string): Filter by category (appetizers, mains, sides, desserts, beverages)
- `dietaryTags` (string[]): Filter by dietary tags
- `search` (string): Search by name or description
- `limit` (number): Pagination limit
- `offset` (number): Pagination offset

**Response** (200 OK):
```json
[
  {
    "id": "item_abc123",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon with lemon butter sauce",
    "category": "mains",
    "dietaryTags": ["gluten-free", "dairy-free"],
    "ingredients": ["salmon", "lemon", "butter", "herbs"],
    "priceCents": 2800,
    "currency": "USD",
    "imageUrl": "https://cdn.example.com/salmon.jpg",
    "isAvailable": true
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Account access denied
- `404 Not Found`: Account not found

---

### 2. List Menus
**Purpose**: Get all menus for an account

```http
GET /v1/accounts/{accountId}/menus
```

**Path Parameters**:
- `accountId` (string, required): Account identifier

**Query Parameters** (optional):
- `isActive` (boolean): Filter by active status
- `limit` (number): Pagination limit
- `offset` (number): Pagination offset

**Response** (200 OK):
```json
[
  {
    "id": "menu_xyz789",
    "accountId": "acc_123",
    "name": "Summer Wedding Menu",
    "description": "Elegant menu for summer weddings",
    "imageUrl": "https://cdn.example.com/menu.jpg",
    "availableFrom": "2025-06-01T00:00:00Z",
    "availableTo": "2025-08-31T23:59:59Z",
    "tags": ["wedding", "summer", "formal"],
    "courses": [
      {
        "id": "course_1",
        "name": "Appetizers",
        "icon": "🥗",
        "position": 0,
        "items": [
          {
            "id": "course_item_1",
            "menuItemId": "item_abc123",
            "position": 0,
            "priceCents": 2800,
            "isAvailable": true
          }
        ]
      }
    ],
    "isActive": true,
    "pricingStrategy": "sum-of-items",
    "fixedPriceCents": null,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-20T14:45:00Z"
  }
]
```

---

### 3. Get Single Menu
**Purpose**: Get details of a specific menu

```http
GET /v1/accounts/{accountId}/menus/{menuId}
```

**Path Parameters**:
- `accountId` (string, required)
- `menuId` (string, required)

**Response** (200 OK): Same structure as single item in List Menus response

**Error Responses**:
- `404 Not Found`: Menu or account not found

---

### 4. Create Menu
**Purpose**: Create a new menu

```http
POST /v1/accounts/{accountId}/menus
```

**Path Parameters**:
- `accountId` (string, required)

**Request Body**:
```json
{
  "name": "Summer Wedding Menu",
  "description": "Elegant menu for summer weddings",
  "imageUrl": "https://cdn.example.com/menu.jpg",
  "availableFrom": "2025-06-01T00:00:00Z",
  "availableTo": "2025-08-31T23:59:59Z",
  "tags": ["wedding", "summer"],
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "items": [
        {
          "menuItemId": "item_abc123",
          "position": 0,
          "priceCents": 2800,
          "isAvailable": true
        }
      ]
    }
  ],
  "isActive": true,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null
}
```

**Field Validation**:
- `name`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `courses`: Required, at least 1 course
- `pricingStrategy`: Required, one of ["fixed", "sum-of-items"]
- `fixedPriceCents`: Required if pricingStrategy is "fixed", must be >= 0
- `courses[].items[].priceCents`: Must be >= 0
- `courses[].items[].position`: Must be >= 0

**Response** (201 Created): Same structure as Get Single Menu

**Error Responses**:
- `400 Bad Request`: Validation errors
- `404 Not Found`: Referenced menuItemId doesn't exist

---

### 5. Update Menu
**Purpose**: Update an existing menu

```http
PUT /v1/accounts/{accountId}/menus/{menuId}
```

**Path Parameters**:
- `accountId` (string, required)
- `menuId` (string, required)

**Request Body**: Same as Create Menu, but includes `id` field

**Response** (200 OK): Updated menu object

**Error Responses**:
- `400 Bad Request`: Validation errors
- `404 Not Found`: Menu or menuItemId not found
- `409 Conflict`: Concurrent modification (check `updatedAt` timestamp)

---

### 6. Delete Menu
**Purpose**: Delete a menu

```http
DELETE /v1/accounts/{accountId}/menus/{menuId}
```

**Path Parameters**:
- `accountId` (string, required)
- `menuId` (string, required)

**Response** (204 No Content): Empty body

**Error Responses**:
- `404 Not Found`: Menu not found
- `409 Conflict`: Cannot delete menu in use (e.g., referenced in active orders)

---

### 7. Duplicate Menu
**Purpose**: Create a copy of an existing menu

```http
POST /v1/accounts/{accountId}/menus/{menuId}/duplicate
```

**Path Parameters**:
- `accountId` (string, required)
- `menuId` (string, required)

**Query Parameters** (optional):
- `name` (string): Name for the duplicated menu (default: "{original_name} (Copy)")

**Response** (201 Created): New menu object with new IDs

**Error Responses**:
- `404 Not Found`: Source menu not found

---

## Data Models

### MenuItem
```typescript
{
  id: string                    // Unique identifier
  name: string                  // Display name
  description?: string          // Optional description
  category: string              // Category: appetizers, mains, sides, desserts, beverages
  dietaryTags?: string[]        // ["vegetarian", "vegan", "gluten-free", "dairy-free", etc.]
  ingredients?: string[]        // List of ingredient names
  priceCents: number            // Price in cents (e.g., 2800 = $28.00)
  currency: string              // ISO currency code (e.g., "USD", "EUR")
  imageUrl?: string             // Optional image URL
  isAvailable: boolean          // Availability status
}
```

### MenuBuilder
```typescript
{
  id: string                          // Unique identifier (generated by backend)
  accountId: string                   // Owner account
  name: string                        // Menu name
  description?: string                // Optional description
  imageUrl?: string                   // Optional menu image
  availableFrom?: string              // ISO 8601 datetime (e.g., "2025-06-01T00:00:00Z")
  availableTo?: string                // ISO 8601 datetime
  tags?: string[]                     // Free-form tags for filtering
  courses: Course[]                   // Array of courses
  isActive: boolean                   // Whether menu is currently active
  pricingStrategy: "fixed" | "sum-of-items"
  fixedPriceCents?: number            // Required if pricingStrategy is "fixed"
  createdAt: string                   // ISO 8601 datetime (generated by backend)
  updatedAt: string                   // ISO 8601 datetime (generated by backend)
}
```

### Course
```typescript
{
  id: string                    // Unique identifier (generated by backend)
  name: string                  // Course name (e.g., "Appetizers")
  icon: string                  // Emoji icon (e.g., "🥗")
  position: number              // Display order (0-indexed)
  items: CourseItem[]           // Items in this course
}
```

### CourseItem
```typescript
{
  id: string                    // Unique identifier (generated by backend)
  menuItemId: string            // Foreign key to MenuItem
  position: number              // Display order within course (0-indexed)
  priceCents: number            // Price override (defaults to MenuItem.priceCents)
  isAvailable: boolean          // Availability override
}
```

---

## Business Rules

### Pricing Strategy
1. **"sum-of-items"**: Menu total = sum of all course item prices
   - Use `CourseItem.priceCents` for each item
   - Frontend calculates total in real-time

2. **"fixed"**: Menu has one flat price
   - Use `MenuBuilder.fixedPriceCents`
   - Individual item prices are ignored in total calculation
   - Items still show individual prices for reference

### Course Management
- Default courses are created client-side using `DEFAULT_COURSES`
- Backend should preserve custom course names and icons
- Empty courses (no items) are allowed but typically hidden in UI
- Course `position` determines display order (0 = first)

### Item Availability
- `MenuItem.isAvailable = false`: Item is globally unavailable (don't show in browse modal)
- `CourseItem.isAvailable = false`: Item is unavailable in this specific menu
- Frontend filters unavailable items when browsing

### Validation Rules
- Menu must have at least 1 course when saved
- At least 1 course should have items (warning, not error)
- `fixedPriceCents` is required when `pricingStrategy = "fixed"`
- `fixedPriceCents` must be ignored when `pricingStrategy = "sum-of-items"`
- Course item positions should be unique within a course
- Course positions should be unique within a menu

---

## Database Schema (Go Backend)

### Recommended Tables

#### `menu_items`
```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  dietary_tags TEXT[],
  ingredients TEXT[],
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_menu_items_account (account_id),
  INDEX idx_menu_items_category (category),
  INDEX idx_menu_items_available (is_available)
);
```

#### `menus`
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  available_from TIMESTAMP WITH TIME ZONE,
  available_to TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT false,
  pricing_strategy VARCHAR(20) NOT NULL CHECK (pricing_strategy IN ('fixed', 'sum-of-items')),
  fixed_price_cents INTEGER CHECK (fixed_price_cents >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_menus_account (account_id),
  INDEX idx_menus_active (is_active),
  CONSTRAINT check_fixed_price CHECK (
    (pricing_strategy = 'fixed' AND fixed_price_cents IS NOT NULL) OR
    (pricing_strategy = 'sum-of-items')
  )
);
```

#### `menu_courses`
```sql
CREATE TABLE menu_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(menu_id, position),
  INDEX idx_menu_courses_menu (menu_id)
);
```

#### `menu_course_items`
```sql
CREATE TABLE menu_course_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES menu_courses(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(course_id, position),
  INDEX idx_course_items_course (course_id),
  INDEX idx_course_items_menu_item (menu_item_id)
);
```

---

## Go Structs (Example)

```go
package models

import (
    "time"
    "github.com/google/uuid"
)

type MenuItem struct {
    ID          uuid.UUID  `json:"id" db:"id"`
    AccountID   uuid.UUID  `json:"accountId" db:"account_id"`
    Name        string     `json:"name" db:"name" validate:"required,min=1,max=200"`
    Description *string    `json:"description,omitempty" db:"description"`
    Category    string     `json:"category" db:"category" validate:"required,oneof=appetizers mains sides desserts beverages"`
    DietaryTags []string   `json:"dietaryTags,omitempty" db:"dietary_tags"`
    Ingredients []string   `json:"ingredients,omitempty" db:"ingredients"`
    PriceCents  int        `json:"priceCents" db:"price_cents" validate:"gte=0"`
    Currency    string     `json:"currency" db:"currency" validate:"required,len=3"`
    ImageURL    *string    `json:"imageUrl,omitempty" db:"image_url"`
    IsAvailable bool       `json:"isAvailable" db:"is_available"`
    CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
    UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
}

type Menu struct {
    ID              uuid.UUID       `json:"id" db:"id"`
    AccountID       uuid.UUID       `json:"accountId" db:"account_id"`
    Name            string          `json:"name" db:"name" validate:"required,min=1,max=200"`
    Description     *string         `json:"description,omitempty" db:"description"`
    ImageURL        *string         `json:"imageUrl,omitempty" db:"image_url"`
    AvailableFrom   *time.Time      `json:"availableFrom,omitempty" db:"available_from"`
    AvailableTo     *time.Time      `json:"availableTo,omitempty" db:"available_to"`
    Tags            []string        `json:"tags,omitempty" db:"tags"`
    Courses         []MenuCourse    `json:"courses"`
    IsActive        bool            `json:"isActive" db:"is_active"`
    PricingStrategy string          `json:"pricingStrategy" db:"pricing_strategy" validate:"required,oneof=fixed sum-of-items"`
    FixedPriceCents *int            `json:"fixedPriceCents,omitempty" db:"fixed_price_cents" validate:"omitempty,gte=0"`
    CreatedAt       time.Time       `json:"createdAt" db:"created_at"`
    UpdatedAt       time.Time       `json:"updatedAt" db:"updated_at"`
}

type MenuCourse struct {
    ID        uuid.UUID        `json:"id" db:"id"`
    MenuID    uuid.UUID        `json:"menuId" db:"menu_id"`
    Name      string           `json:"name" db:"name" validate:"required,min=1,max=100"`
    Icon      string           `json:"icon" db:"icon" validate:"required"`
    Position  int              `json:"position" db:"position" validate:"gte=0"`
    Items     []MenuCourseItem `json:"items"`
    CreatedAt time.Time        `json:"createdAt" db:"created_at"`
}

type MenuCourseItem struct {
    ID          uuid.UUID  `json:"id" db:"id"`
    CourseID    uuid.UUID  `json:"courseId" db:"course_id"`
    MenuItemID  uuid.UUID  `json:"menuItemId" db:"menu_item_id"`
    Position    int        `json:"position" db:"position" validate:"gte=0"`
    PriceCents  int        `json:"priceCents" db:"price_cents" validate:"gte=0"`
    IsAvailable bool       `json:"isAvailable" db:"is_available"`
    CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
}
```

---

## OpenAPI Spec (Swagger 2.0)

Add these to your existing `api/swagger.yaml`:

```yaml
paths:
  /accounts/{accountId}/menu-items:
    get:
      summary: Get available menu items
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: category
          in: query
          type: string
          enum: [appetizers, mains, sides, desserts, beverages]
        - name: search
          in: query
          type: string
      responses:
        200:
          description: Success
          schema:
            type: array
            items:
              $ref: '#/definitions/MenuItem'

  /accounts/{accountId}/menus:
    get:
      summary: List menus
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
      responses:
        200:
          schema:
            type: array
            items:
              $ref: '#/definitions/Menu'
    post:
      summary: Create menu
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: body
          in: body
          required: true
          schema:
            $ref: '#/definitions/CreateMenuRequest'
      responses:
        201:
          schema:
            $ref: '#/definitions/Menu'

  /accounts/{accountId}/menus/{menuId}:
    get:
      summary: Get menu by ID
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: menuId
          in: path
          required: true
          type: string
      responses:
        200:
          schema:
            $ref: '#/definitions/Menu'
    put:
      summary: Update menu
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: menuId
          in: path
          required: true
          type: string
        - name: body
          in: body
          required: true
          schema:
            $ref: '#/definitions/UpdateMenuRequest'
      responses:
        200:
          schema:
            $ref: '#/definitions/Menu'
    delete:
      summary: Delete menu
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: menuId
          in: path
          required: true
          type: string
      responses:
        204:
          description: Deleted successfully

  /accounts/{accountId}/menus/{menuId}/duplicate:
    post:
      summary: Duplicate menu
      tags: [Menu Builder]
      parameters:
        - name: accountId
          in: path
          required: true
          type: string
        - name: menuId
          in: path
          required: true
          type: string
        - name: name
          in: query
          type: string
      responses:
        201:
          schema:
            $ref: '#/definitions/Menu'

definitions:
  MenuItem:
    type: object
    required: [id, name, category, priceCents, currency, isAvailable]
    properties:
      id:
        type: string
      name:
        type: string
      description:
        type: string
      category:
        type: string
        enum: [appetizers, mains, sides, desserts, beverages]
      dietaryTags:
        type: array
        items:
          type: string
      ingredients:
        type: array
        items:
          type: string
      priceCents:
        type: integer
        minimum: 0
      currency:
        type: string
        minLength: 3
        maxLength: 3
      imageUrl:
        type: string
      isAvailable:
        type: boolean

  Menu:
    type: object
    required: [id, accountId, name, courses, isActive, pricingStrategy, createdAt, updatedAt]
    properties:
      id:
        type: string
      accountId:
        type: string
      name:
        type: string
      description:
        type: string
      imageUrl:
        type: string
      availableFrom:
        type: string
        format: date-time
      availableTo:
        type: string
        format: date-time
      tags:
        type: array
        items:
          type: string
      courses:
        type: array
        items:
          $ref: '#/definitions/MenuCourse'
      isActive:
        type: boolean
      pricingStrategy:
        type: string
        enum: [fixed, sum-of-items]
      fixedPriceCents:
        type: integer
        minimum: 0
      createdAt:
        type: string
        format: date-time
      updatedAt:
        type: string
        format: date-time

  MenuCourse:
    type: object
    required: [id, name, icon, position, items]
    properties:
      id:
        type: string
      name:
        type: string
      icon:
        type: string
      position:
        type: integer
        minimum: 0
      items:
        type: array
        items:
          $ref: '#/definitions/MenuCourseItem'

  MenuCourseItem:
    type: object
    required: [id, menuItemId, position, priceCents, isAvailable]
    properties:
      id:
        type: string
      menuItemId:
        type: string
      position:
        type: integer
        minimum: 0
      priceCents:
        type: integer
        minimum: 0
      isAvailable:
        type: boolean

  CreateMenuRequest:
    type: object
    required: [name, courses, isActive, pricingStrategy]
    properties:
      name:
        type: string
        minLength: 1
        maxLength: 200
      description:
        type: string
      imageUrl:
        type: string
      availableFrom:
        type: string
        format: date-time
      availableTo:
        type: string
        format: date-time
      tags:
        type: array
        items:
          type: string
      courses:
        type: array
        items:
          $ref: '#/definitions/CreateMenuCourse'
      isActive:
        type: boolean
      pricingStrategy:
        type: string
        enum: [fixed, sum-of-items]
      fixedPriceCents:
        type: integer
        minimum: 0

  CreateMenuCourse:
    type: object
    required: [name, icon, items]
    properties:
      name:
        type: string
      icon:
        type: string
      items:
        type: array
        items:
          $ref: '#/definitions/CreateMenuCourseItem'

  CreateMenuCourseItem:
    type: object
    required: [menuItemId, position, priceCents, isAvailable]
    properties:
      menuItemId:
        type: string
      position:
        type: integer
        minimum: 0
      priceCents:
        type: integer
        minimum: 0
      isAvailable:
        type: boolean

  UpdateMenuRequest:
    allOf:
      - $ref: '#/definitions/CreateMenuRequest'
      - type: object
        required: [id]
        properties:
          id:
            type: string
```

---

## Testing the Migration

### Step 1: Verify Backend Endpoints
Test each endpoint with curl or Postman:

```bash
# Get menu items
curl -X GET http://localhost:8080/v1/accounts/{accountId}/menu-items \
  -H "Authorization: Bearer {token}"

# Create a menu
curl -X POST http://localhost:8080/v1/accounts/{accountId}/menus \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d @menu-payload.json

# Get menus
curl -X GET http://localhost:8080/v1/accounts/{accountId}/menus \
  -H "Authorization: Bearer {token}"
```

### Step 2: Update Frontend
1. Update OpenAPI spec: `npm run api:update`
2. Change flag: `USE_MOCK_DATA = false` in `hooks/useMenuBuilder.ts`
3. Restart dev server: `npm run dev`

### Step 3: Test in UI
- Browse available items (should load from backend)
- Create a menu and save
- Reload page (menu should persist)
- Edit menu
- Duplicate menu
- Delete menu

---

## Migration Checklist

- [ ] Database tables created
- [ ] Go models defined
- [ ] OpenAPI spec updated
- [ ] All 7 endpoints implemented
- [ ] Authentication middleware applied
- [ ] Validation rules enforced
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Frontend types regenerated (`npm run api:update`)
- [ ] `USE_MOCK_DATA` flag changed to `false`
- [ ] Manual testing completed
- [ ] E2E tests updated

---

## Performance Considerations

### Caching
- Cache `GET /menu-items` response (5 minutes, invalidate on item create/update)
- Use `updatedAt` timestamp for optimistic locking
- Consider ETags for menu responses

### Pagination
Current implementation is client-side. For 1000+ items, consider:
```http
GET /menu-items?limit=100&offset=0
```
Return:
```json
{
  "data": [...],
  "pagination": {
    "total": 1245,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

### Optimization
- Use JOIN queries to fetch menu with courses + items in one query
- Index foreign keys (menuItemId, courseId, menuId)
- Use database transactions for create/update operations
- Consider soft deletes for menus (add `deleted_at` column)

---

## Security Considerations

- Validate `accountId` matches authenticated user's account
- Prevent cross-account data access
- Sanitize user inputs (menu names, descriptions)
- Validate image URLs (whitelist domains or upload to own CDN)
- Rate limit menu creation (prevent abuse)
- Audit log menu changes (who created/updated/deleted)

---

## Summary

**Minimum Requirements to Migrate**:
1. Implement **7 endpoints** (see above)
2. Create **4 database tables**
3. Update **OpenAPI spec**
4. Run `npm run api:update`
5. Change **1 line**: `USE_MOCK_DATA = false`

**That's it!** The frontend is fully ready for backend integration.
