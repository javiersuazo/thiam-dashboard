# Menu Builder API Contract

This document defines the expected API endpoints and data structures for backend integration.

## Base URL

```
/v1/accounts/{accountId}
```

## Authentication

All endpoints require authentication. Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. List Menu Items

Get all available menu items that can be added to menus.

```
GET /accounts/{accountId}/menu-items
```

**Query Parameters:**
```typescript
{
  category?: string          // Filter by category
  isAvailable?: boolean      // Filter by availability
  search?: string           // Search by name/description
  limit?: number           // Pagination limit (default: 100)
  offset?: number          // Pagination offset (default: 0)
}
```

**Response: 200 OK**
```json
{
  "items": [
    {
      "id": "item_123",
      "name": "Caesar Salad",
      "description": "Classic romaine lettuce with parmesan...",
      "category": "appetizers",
      "dietaryTags": ["vegetarian"],
      "priceCents": 1200,
      "currency": "USD",
      "imageUrl": "https://...",
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 100,
  "offset": 0
}
```

---

### 2. List Menus

Get all menus for an account.

```
GET /accounts/{accountId}/menus
```

**Query Parameters:**
```typescript
{
  isActive?: boolean        // Filter by status
  search?: string          // Search by name
  limit?: number
  offset?: number
}
```

**Response: 200 OK**
```json
{
  "menus": [
    {
      "id": "menu_123",
      "accountId": "account_456",
      "name": "Summer Menu 2024",
      "description": "Fresh seasonal dishes",
      "imageUrl": "https://...",
      "isActive": true,
      "pricingStrategy": "sum-of-items",
      "fixedPriceCents": null,
      "tags": ["seasonal", "summer"],
      "availableFrom": "2024-06-01T00:00:00Z",
      "availableTo": "2024-08-31T23:59:59Z",
      "courseCount": 4,
      "itemCount": 25,
      "totalPriceCents": 15000,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "total": 10,
  "limit": 100,
  "offset": 0
}
```

---

### 3. Get Menu Details

Get a specific menu with all courses and items.

```
GET /accounts/{accountId}/menus/{menuId}
```

**Response: 200 OK**
```json
{
  "id": "menu_123",
  "accountId": "account_456",
  "name": "Summer Menu 2024",
  "description": "Fresh seasonal dishes",
  "imageUrl": "https://...",
  "isActive": true,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null,
  "tags": ["seasonal", "summer"],
  "availableFrom": "2024-06-01T00:00:00Z",
  "availableTo": "2024-08-31T23:59:59Z",
  "courses": [
    {
      "id": "course_1",
      "name": "Appetizers",
      "icon": "🥗",
      "position": 0,
      "items": [
        {
          "id": "course_item_1",
          "menuItemId": "item_123",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true,
          "menuItem": {
            "id": "item_123",
            "name": "Caesar Salad",
            "description": "Classic romaine...",
            "category": "appetizers",
            "imageUrl": "https://..."
          }
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

**Response: 404 Not Found**
```json
{
  "error": "menu_not_found",
  "message": "Menu with ID menu_123 not found"
}
```

---

### 4. Create Menu

Create a new menu.

```
POST /accounts/{accountId}/menus
```

**Request Body:**
```json
{
  "name": "Summer Menu 2024",
  "description": "Fresh seasonal dishes",
  "imageUrl": "https://...",
  "isActive": false,
  "pricingStrategy": "sum-of-items",
  "fixedPriceCents": null,
  "tags": ["seasonal", "summer"],
  "availableFrom": "2024-06-01T00:00:00Z",
  "availableTo": "2024-08-31T23:59:59Z",
  "courses": [
    {
      "name": "Appetizers",
      "icon": "🥗",
      "position": 0,
      "items": [
        {
          "menuItemId": "item_123",
          "position": 0,
          "priceCents": 1200,
          "isAvailable": true
        }
      ]
    }
  ]
}
```

**Validation Rules:**
- `name`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `imageUrl`: Optional, valid URL
- `pricingStrategy`: Required, enum ["fixed", "sum-of-items"]
- `fixedPriceCents`: Required if pricingStrategy is "fixed", must be > 0
- `tags`: Optional, max 10 tags
- `courses`: Required, min 1 course
- `courses[].items`: At least one course must have items
- `courses[].items[].menuItemId`: Must reference existing menu item
- `courses[].items[].priceCents`: Must be >= 0

**Response: 201 Created**
```json
{
  "id": "menu_123",
  "accountId": "account_456",
  // ... full menu object
}
```

**Response: 400 Bad Request**
```json
{
  "error": "validation_error",
  "message": "Invalid menu data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

---

### 5. Update Menu

Update an existing menu.

```
PUT /accounts/{accountId}/menus/{menuId}
```

**Request Body:** Same as Create Menu

**Response: 200 OK**
```json
{
  "id": "menu_123",
  // ... full menu object
}
```

**Response: 404 Not Found**
```json
{
  "error": "menu_not_found",
  "message": "Menu with ID menu_123 not found"
}
```

**Response: 409 Conflict**
```json
{
  "error": "conflict",
  "message": "Menu has been modified by another user",
  "currentVersion": "2024-01-15T10:30:00Z"
}
```

---

### 6. Delete Menu

Delete a menu.

```
DELETE /accounts/{accountId}/menus/{menuId}
```

**Response: 204 No Content**

**Response: 404 Not Found**
```json
{
  "error": "menu_not_found",
  "message": "Menu with ID menu_123 not found"
}
```

**Response: 409 Conflict**
```json
{
  "error": "menu_in_use",
  "message": "Cannot delete menu that is currently in use",
  "activeOrders": 5
}
```

---

### 7. Duplicate Menu

Create a copy of an existing menu.

```
POST /accounts/{accountId}/menus/{menuId}/duplicate
```

**Request Body (Optional):**
```json
{
  "name": "Copy of Summer Menu"
}
```

**Response: 201 Created**
```json
{
  "id": "menu_456",
  "name": "Copy of Summer Menu 2024",
  // ... full menu object
}
```

---

### 8. Publish/Unpublish Menu

Toggle menu active status.

```
PATCH /accounts/{accountId}/menus/{menuId}/status
```

**Request Body:**
```json
{
  "isActive": true
}
```

**Response: 200 OK**
```json
{
  "id": "menu_123",
  "isActive": true,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Data Types

### MenuItem

```typescript
interface MenuItem {
  id: string
  name: string
  description?: string
  category: string  // appetizers, mains, sides, desserts, beverages
  dietaryTags?: string[]  // vegetarian, vegan, gluten-free, etc.
  priceCents: number
  currency: string  // ISO 4217 (USD, EUR, etc.)
  imageUrl?: string
  isAvailable: boolean
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}
```

### Course

```typescript
interface Course {
  id: string
  name: string
  icon?: string  // Emoji or icon identifier
  position: number  // Display order
  items: CourseItem[]
}
```

### CourseItem

```typescript
interface CourseItem {
  id: string
  menuItemId: string
  position: number
  priceCents: number  // Override price
  isAvailable: boolean  // Override availability
  menuItem?: MenuItem  // Populated in GET responses
}
```

### Menu

```typescript
interface Menu {
  id: string
  accountId: string
  name: string
  description?: string
  imageUrl?: string
  isActive: boolean
  pricingStrategy: 'fixed' | 'sum-of-items'
  fixedPriceCents?: number
  tags?: string[]
  availableFrom?: string  // ISO 8601
  availableTo?: string    // ISO 8601
  courses: Course[]
  createdAt: string  // ISO 8601
  updatedAt: string  // ISO 8601
}
```

---

## Error Responses

All error responses follow this format:

```typescript
interface ErrorResponse {
  error: string        // Machine-readable error code
  message: string      // Human-readable error message
  details?: any        // Additional context (validation errors, etc.)
  requestId?: string   // For support/debugging
}
```

### Common Error Codes

- `validation_error` - Request body validation failed
- `not_found` - Resource not found
- `unauthorized` - Authentication required
- `forbidden` - Insufficient permissions
- `conflict` - Resource state conflict
- `rate_limited` - Too many requests
- `internal_error` - Server error

---

## Rate Limiting

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

Limits:
- 1000 requests per hour per account
- 100 write operations per hour per account

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /accounts/{accountId}/menus?limit=20&offset=40
```

**Response Headers:**
```
X-Total-Count: 150
X-Limit: 20
X-Offset: 40
Link: <https://api.example.com/accounts/123/menus?limit=20&offset=60>; rel="next",
      <https://api.example.com/accounts/123/menus?limit=20&offset=20>; rel="prev"
```

---

## Filtering and Sorting

### Filtering

```
GET /accounts/{accountId}/menus?isActive=true&search=summer
```

### Sorting

```
GET /accounts/{accountId}/menus?sort=-updatedAt,name
```

Format: `{field}` for ascending, `-{field}` for descending

Supported fields:
- `name`
- `createdAt`
- `updatedAt`
- `itemCount`
- `totalPrice`

---

## Webhooks (Optional)

Backend can send webhooks for menu events:

```json
{
  "event": "menu.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "accountId": "account_456",
  "data": {
    "menuId": "menu_123",
    "name": "Summer Menu 2024"
  }
}
```

Events:
- `menu.created`
- `menu.updated`
- `menu.deleted`
- `menu.published`
- `menu.unpublished`

---

## Testing

### Mock Server

For development, use mock server with sample data:

```bash
npm run api:mock
```

### Sample Requests

```bash
# Get menu items
curl -X GET http://localhost:8080/v1/accounts/test-account/menu-items \
  -H "Authorization: Bearer <token>"

# Create menu
curl -X POST http://localhost:8080/v1/accounts/test-account/menus \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @sample-menu.json
```

---

## Versioning

API versioned via URL path: `/v1/`, `/v2/`, etc.

Breaking changes require new version. Non-breaking changes can be added to existing version.

---

## Support

For API questions or issues:
- Backend team: #backend-api Slack channel
- API docs: https://api.example.com/docs
- Status page: https://status.example.com
