# AdvancedTable API Specification

## Overview
This document defines the REST API endpoints needed to fully support all features of the AdvancedTable component.

## Base Assumptions
- **Base URL**: `/api/v1`
- **Authentication**: All endpoints require authentication via Bearer token
- **Content-Type**: `application/json`
- **Response Format**: Consistent JSON structure with metadata

---

## Core Endpoints

### 1. List/Search Resources (with Pagination, Sorting, Filtering)

**Endpoint**: `GET /api/v1/{resource}`

**Description**: Fetch a paginated, sorted, and filtered list of resources.

**Query Parameters**:

```typescript
interface ListQueryParams {
  // Pagination
  page?: number           // Page number (1-based), default: 1
  limit?: number          // Items per page, default: 20

  // Sorting
  sort_by?: string        // Field to sort by (e.g., "name", "created_at")
  sort_order?: 'asc' | 'desc'  // Sort direction, default: 'asc'

  // Global Search
  q?: string              // Search query across all searchable fields

  // Column Filters (dynamic based on columns)
  [key: string]: any      // e.g., status=active, price_min=100, price_max=500
}
```

**Example Request**:
```http
GET /api/v1/products?page=2&limit=20&sort_by=price&sort_order=desc&q=laptop&category=electronics&price_min=500&price_max=2000&in_stock=true
```

**Response Structure**:
```typescript
interface ListResponse<T> {
  data: T[]               // Array of resources
  pagination: {
    page: number          // Current page
    limit: number         // Items per page
    total: number         // Total items matching filters
    total_pages: number   // Total number of pages
    has_next: boolean     // Whether there's a next page
    has_prev: boolean     // Whether there's a previous page
  }
  sort?: {
    field: string         // Field sorted by
    order: 'asc' | 'desc' // Sort direction
  }
  filters?: Record<string, any>  // Applied filters
  search?: string         // Search query applied
}
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "MacBook Pro 16\"",
      "category": "electronics",
      "price": 2499,
      "in_stock": true,
      "rating": 4.8,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-03-20T14:22:00Z"
    },
    // ... more items
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true
  },
  "sort": {
    "field": "price",
    "order": "desc"
  },
  "filters": {
    "category": "electronics",
    "price_min": 500,
    "price_max": 2000,
    "in_stock": true
  },
  "search": "laptop"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Missing/invalid auth token
- `422 Unprocessable Entity` - Invalid filter values

---

### 2. Get Single Resource

**Endpoint**: `GET /api/v1/{resource}/{id}`

**Description**: Fetch a single resource by ID.

**Example Request**:
```http
GET /api/v1/products/prod_123
```

**Response**:
```json
{
  "data": {
    "id": "prod_123",
    "name": "MacBook Pro 16\"",
    "category": "electronics",
    "price": 2499,
    "in_stock": true,
    "rating": 4.8,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-03-20T14:22:00Z"
  }
}
```

**Status Codes**:
- `200 OK` - Success
- `404 Not Found` - Resource doesn't exist

---

### 3. Create Resource

**Endpoint**: `POST /api/v1/{resource}`

**Description**: Create a new resource.

**Request Body**:
```typescript
interface CreateRequest {
  [key: string]: any  // Resource fields (validated against schema)
}
```

**Example Request**:
```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "category": "electronics",
  "price": 999,
  "in_stock": true,
  "description": "Latest iPhone model"
}
```

**Response**:
```json
{
  "data": {
    "id": "prod_789",
    "name": "iPhone 15 Pro",
    "category": "electronics",
    "price": 999,
    "in_stock": true,
    "description": "Latest iPhone model",
    "rating": null,
    "created_at": "2024-03-21T09:15:00Z",
    "updated_at": "2024-03-21T09:15:00Z"
  },
  "message": "Product created successfully"
}
```

**Status Codes**:
- `201 Created` - Resource created
- `400 Bad Request` - Validation errors
- `409 Conflict` - Resource already exists (e.g., duplicate SKU)

---

### 4. Update Resource (Partial)

**Endpoint**: `PATCH /api/v1/{resource}/{id}`

**Description**: Partially update a resource (only fields provided).

**Request Body**:
```typescript
interface UpdateRequest {
  [key: string]: any  // Only fields to update
}
```

**Example Request**:
```http
PATCH /api/v1/products/prod_123
Content-Type: application/json

{
  "price": 2299,
  "in_stock": false
}
```

**Response**:
```json
{
  "data": {
    "id": "prod_123",
    "name": "MacBook Pro 16\"",
    "category": "electronics",
    "price": 2299,
    "in_stock": false,
    "rating": 4.8,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-03-21T10:00:00Z"
  },
  "message": "Product updated successfully"
}
```

**Status Codes**:
- `200 OK` - Updated successfully
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Validation errors

---

### 5. Delete Resource

**Endpoint**: `DELETE /api/v1/{resource}/{id}`

**Description**: Delete a single resource.

**Example Request**:
```http
DELETE /api/v1/products/prod_123
```

**Response**:
```json
{
  "message": "Product deleted successfully",
  "deleted_id": "prod_123"
}
```

**Status Codes**:
- `200 OK` - Deleted successfully
- `204 No Content` - Deleted (alternative)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Cannot delete (e.g., has dependencies)

---

## Bulk Operations

### 6. Bulk Update

**Endpoint**: `PATCH /api/v1/{resource}/bulk`

**Description**: Update multiple resources at once.

**Request Body**:
```typescript
interface BulkUpdateRequest {
  updates: Array<{
    id: string
    changes: Record<string, any>
  }>
}
```

**Example Request**:
```http
PATCH /api/v1/products/bulk
Content-Type: application/json

{
  "updates": [
    {
      "id": "prod_123",
      "changes": { "price": 2199 }
    },
    {
      "id": "prod_456",
      "changes": { "in_stock": false }
    }
  ]
}
```

**Response**:
```json
{
  "success": 2,
  "failed": 0,
  "results": [
    {
      "id": "prod_123",
      "status": "success",
      "data": { "id": "prod_123", "price": 2199, "updated_at": "..." }
    },
    {
      "id": "prod_456",
      "status": "success",
      "data": { "id": "prod_456", "in_stock": false, "updated_at": "..." }
    }
  ]
}
```

**Status Codes**:
- `200 OK` - Processed (may have partial failures)
- `207 Multi-Status` - Some succeeded, some failed

---

### 7. Bulk Delete

**Endpoint**: `DELETE /api/v1/{resource}/bulk`

**Description**: Delete multiple resources at once.

**Request Body**:
```typescript
interface BulkDeleteRequest {
  ids: string[]
}
```

**Example Request**:
```http
DELETE /api/v1/products/bulk
Content-Type: application/json

{
  "ids": ["prod_123", "prod_456", "prod_789"]
}
```

**Response**:
```json
{
  "deleted": 3,
  "failed": 0,
  "results": [
    { "id": "prod_123", "status": "success" },
    { "id": "prod_456", "status": "success" },
    { "id": "prod_789", "status": "success" }
  ],
  "message": "3 products deleted successfully"
}
```

**Status Codes**:
- `200 OK` - Processed
- `207 Multi-Status` - Partial success

---

## Export Endpoints

### 8. Export Data (CSV/JSON)

**Endpoint**: `GET /api/v1/{resource}/export`

**Description**: Export filtered data in various formats.

**Query Parameters**:
```typescript
interface ExportParams extends ListQueryParams {
  format: 'csv' | 'json' | 'xlsx'  // Export format
  fields?: string[]                 // Specific fields to export
}
```

**Example Request**:
```http
GET /api/v1/products/export?format=csv&category=electronics&fields=id,name,price&q=laptop
```

**Response** (CSV):
```csv
id,name,price
prod_123,"MacBook Pro 16""",2499
prod_456,"Dell XPS 15",1899
```

**Response** (JSON):
```json
{
  "format": "json",
  "exported_at": "2024-03-21T10:30:00Z",
  "filters": {
    "category": "electronics",
    "q": "laptop"
  },
  "total_records": 2,
  "data": [
    { "id": "prod_123", "name": "MacBook Pro 16\"", "price": 2499 },
    { "id": "prod_456", "name": "Dell XPS 15", "price": 1899 }
  ]
}
```

**Headers**:
- `Content-Type: text/csv` for CSV
- `Content-Type: application/json` for JSON
- `Content-Disposition: attachment; filename="products_export_2024-03-21.csv"`

**Status Codes**:
- `200 OK` - Export successful

---

## Metadata Endpoints

### 9. Get Schema/Column Definitions

**Endpoint**: `GET /api/v1/{resource}/schema`

**Description**: Get column definitions for dynamic table configuration.

**Example Request**:
```http
GET /api/v1/products/schema
```

**Response**:
```json
{
  "resource": "products",
  "columns": [
    {
      "key": "id",
      "label": "Product ID",
      "type": "text",
      "sortable": false,
      "filterable": false,
      "editable": false,
      "required": true
    },
    {
      "key": "name",
      "label": "Product Name",
      "type": "text",
      "sortable": true,
      "filterable": true,
      "editable": true,
      "required": true,
      "validation": {
        "min_length": 3,
        "max_length": 255
      }
    },
    {
      "key": "category",
      "label": "Category",
      "type": "select",
      "sortable": true,
      "filterable": true,
      "editable": true,
      "required": true,
      "options": [
        { "value": "electronics", "label": "Electronics" },
        { "value": "clothing", "label": "Clothing" },
        { "value": "food", "label": "Food & Beverage" }
      ]
    },
    {
      "key": "price",
      "label": "Price",
      "type": "currency",
      "sortable": true,
      "filterable": true,
      "editable": true,
      "required": true,
      "validation": {
        "min": 0,
        "max": 999999
      }
    },
    {
      "key": "in_stock",
      "label": "In Stock",
      "type": "boolean",
      "sortable": true,
      "filterable": true,
      "editable": true,
      "default": true
    },
    {
      "key": "rating",
      "label": "Rating",
      "type": "number",
      "sortable": true,
      "filterable": false,
      "editable": false,
      "validation": {
        "min": 0,
        "max": 5
      }
    },
    {
      "key": "created_at",
      "label": "Created Date",
      "type": "datetime",
      "sortable": true,
      "filterable": true,
      "editable": false
    }
  ],
  "default_sort": {
    "field": "created_at",
    "order": "desc"
  },
  "default_page_size": 20,
  "searchable_fields": ["name", "description"]
}
```

---

### 10. Get Filter Options

**Endpoint**: `GET /api/v1/{resource}/filters/{field}`

**Description**: Get available filter options for a specific field (useful for dynamic filters).

**Example Request**:
```http
GET /api/v1/products/filters/category
```

**Response**:
```json
{
  "field": "category",
  "type": "select",
  "options": [
    {
      "value": "electronics",
      "label": "Electronics",
      "count": 145
    },
    {
      "value": "clothing",
      "label": "Clothing",
      "count": 89
    },
    {
      "value": "food",
      "label": "Food & Beverage",
      "count": 67
    }
  ],
  "total": 3
}
```

---

## Advanced Features

### 11. Save Table State (User Preferences)

**Endpoint**: `POST /api/v1/users/me/table-preferences`

**Description**: Save user's table preferences (column widths, visibility, order, filters).

**Request Body**:
```typescript
interface TablePreferences {
  resource: string
  preferences: {
    column_order?: string[]
    column_widths?: Record<string, number>
    column_visibility?: Record<string, boolean>
    default_filters?: Record<string, any>
    default_sort?: {
      field: string
      order: 'asc' | 'desc'
    }
    page_size?: number
  }
}
```

**Example Request**:
```http
POST /api/v1/users/me/table-preferences
Content-Type: application/json

{
  "resource": "products",
  "preferences": {
    "column_order": ["name", "category", "price", "in_stock"],
    "column_widths": {
      "name": 300,
      "category": 150,
      "price": 120
    },
    "column_visibility": {
      "created_at": false,
      "updated_at": false
    },
    "default_filters": {
      "in_stock": true
    },
    "default_sort": {
      "field": "name",
      "order": "asc"
    },
    "page_size": 50
  }
}
```

**Response**:
```json
{
  "message": "Preferences saved successfully",
  "resource": "products",
  "saved_at": "2024-03-21T11:00:00Z"
}
```

---

### 12. Get Table State (User Preferences)

**Endpoint**: `GET /api/v1/users/me/table-preferences/{resource}`

**Description**: Retrieve saved table preferences.

**Example Request**:
```http
GET /api/v1/users/me/table-preferences/products
```

**Response**:
```json
{
  "resource": "products",
  "preferences": {
    "column_order": ["name", "category", "price", "in_stock"],
    "column_widths": {
      "name": 300,
      "category": 150,
      "price": 120
    },
    "column_visibility": {
      "created_at": false,
      "updated_at": false
    },
    "default_filters": {
      "in_stock": true
    },
    "default_sort": {
      "field": "name",
      "order": "asc"
    },
    "page_size": 50
  },
  "saved_at": "2024-03-21T11:00:00Z"
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string           // Machine-readable error code
    message: string        // Human-readable error message
    details?: any          // Additional error details
    field_errors?: Record<string, string[]>  // Validation errors per field
  }
  request_id?: string      // For debugging/support
  timestamp: string        // ISO 8601 timestamp
}
```

**Example Error**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "field_errors": {
      "price": ["Price must be a positive number"],
      "name": ["Name is required", "Name must be at least 3 characters"]
    }
  },
  "request_id": "req_abc123xyz",
  "timestamp": "2024-03-21T10:30:15Z"
}
```

---

## Filter Syntax

### Supported Filter Operators

The API supports various filter operators through query parameters:

```typescript
// Exact match
?status=active

// Range filters (numbers, dates)
?price_min=100&price_max=500
?created_after=2024-01-01&created_before=2024-03-31

// Boolean filters
?in_stock=true
?is_featured=false

// Multiple values (OR)
?category=electronics,clothing,food

// Negation
?status_not=archived

// Contains (text search)
?name_contains=laptop

// Starts with
?sku_starts_with=PROD

// Null checks
?description_null=true
?description_null=false
```

---

## Rate Limiting

**Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1616342400
```

**Response when rate limited**:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Summary

### Required Endpoints (Minimum)
1. ✅ `GET /api/v1/{resource}` - List with filters
2. ✅ `GET /api/v1/{resource}/{id}` - Get single
3. ✅ `POST /api/v1/{resource}` - Create
4. ✅ `PATCH /api/v1/{resource}/{id}` - Update
5. ✅ `DELETE /api/v1/{resource}/{id}` - Delete

### Recommended Endpoints
6. ✅ `PATCH /api/v1/{resource}/bulk` - Bulk update
7. ✅ `DELETE /api/v1/{resource}/bulk` - Bulk delete
8. ✅ `GET /api/v1/{resource}/export` - Export data

### Optional/Advanced Endpoints
9. ✅ `GET /api/v1/{resource}/schema` - Column definitions
10. ✅ `GET /api/v1/{resource}/filters/{field}` - Filter options
11. ✅ `POST /api/v1/users/me/table-preferences` - Save preferences
12. ✅ `GET /api/v1/users/me/table-preferences/{resource}` - Get preferences

This API specification supports ALL AdvancedTable features including pagination, sorting, filtering, searching, bulk operations, exports, and user preferences! 🎉
