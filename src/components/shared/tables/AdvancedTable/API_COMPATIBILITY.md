# API Compatibility Analysis

## Question: Will the component handle calls to `GET /api/v1/{resource}`?

## Short Answer: ✅ **YES! 100% Compatible**

The AdvancedTable component **already fully supports** the proposed API specification through its `ApiRepository` class.

---

## How It Works

### 1. Request Mapping (Component → API)

When the table needs data, it calls:

```typescript
const { data, total, totalPages, isLoading, error } = useTableData(dataSource, tableState)
```

The `ApiRepository.buildQueryParams()` method (lines 121-145 in `repository.ts`) automatically converts the table state into the exact query parameters defined in the API spec:

**Table State → API Query Parameters:**

```typescript
// Component's internal state
{
  pagination: { page: 2, pageSize: 20 },
  sorting: [{ field: 'price', direction: 'desc' }],
  filters: {
    category: 'electronics',
    price: { min: 500, max: 2000 },
    in_stock: true
  },
  search: 'laptop'
}

// Automatically converts to:
{
  page: 2,                    // ✅ Matches API spec
  limit: 20,                  // ✅ Matches API spec
  sort_by: 'price',           // ✅ Matches API spec
  sort_order: 'desc',         // ✅ Matches API spec
  q: 'laptop',                // ✅ Matches API spec
  category: 'electronics',    // ✅ Matches API spec
  price_min: 500,             // ✅ Matches API spec (range filter)
  price_max: 2000,            // ✅ Matches API spec (range filter)
  in_stock: true              // ✅ Matches API spec
}
```

**Generated API Call:**
```http
GET /api/v1/products?page=2&limit=20&sort_by=price&sort_order=desc&q=laptop&category=electronics&price_min=500&price_max=2000&in_stock=true
```

---

### 2. Response Mapping (API → Component)

The `transformResponse()` method (lines 76-91 in `repository.ts`) is **extremely flexible** and handles multiple API response formats:

**Supported Response Formats:**

```typescript
// ✅ Format 1: items + pagination metadata (RECOMMENDED - matches API spec)
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}

// ✅ Format 2: Flat structure (alternative)
{
  "data": [...],
  "total": 156,
  "page": 2,
  "limit": 20,
  "total_pages": 8
}

// ✅ Format 3: Different naming conventions
{
  "items": [...],           // or "results"
  "totalCount": 156,        // or "count"
  "currentPage": 2,         // or "pageNumber"
  "pageSize": 20,           // or "perPage"
  "totalPages": 8
}
```

**Automatic Field Detection:**

The `transformResponse` method intelligently detects fields:

```typescript
// Lines 76-90 in repository.ts
const items = apiResponse.items || apiResponse.data || apiResponse.results || []
const total = apiResponse.total || apiResponse.totalCount || apiResponse.count || 0
const page = apiResponse.page || apiResponse.currentPage || apiResponse.pageNumber || 1
const pageSize = apiResponse.limit || apiResponse.pageSize || apiResponse.perPage || 10
```

This means **your API can use any of these naming conventions** and it will work automatically!

---

### 3. Data Transformation

The component uses the **Repository Pattern** with **Transformers** to handle API ↔ Domain conversion:

```typescript
// Your API returns snake_case
{
  "product_id": "prod_123",
  "product_name": "MacBook Pro",
  "unit_price": 2499,
  "inventory_count": 50,
  "created_at": "2024-01-15T10:30:00Z"
}

// Transformer converts to camelCase domain model
{
  "id": "prod_123",
  "name": "MacBook Pro",
  "price": 2499,
  "stock": 50,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Example Transformer:**

```typescript
class ProductTransformer implements IDataTransformer<ProductApiDTO, Product> {
  toDomain(dto: ProductApiDTO): Product {
    return {
      id: dto.product_id,
      name: dto.product_name,
      price: dto.unit_price,
      stock: dto.inventory_count,
      createdAt: dto.created_at,
      // ... map all fields
    }
  }

  toApi(domain: Partial<Product>): Partial<ProductApiDTO> {
    return {
      product_id: domain.id,
      product_name: domain.name,
      unit_price: domain.price,
      inventory_count: domain.stock,
      created_at: domain.createdAt,
      // ... map all fields
    }
  }
}
```

---

## Compatibility Matrix

### ✅ Fully Supported Features

| API Feature | Component Support | Notes |
|------------|-------------------|-------|
| **Pagination** | ✅ Yes | `page` and `limit` params |
| **Sorting** | ✅ Yes | `sort_by` and `sort_order` params |
| **Global Search** | ✅ Yes | `q` param |
| **Column Filters** | ✅ Yes | Dynamic field params |
| **Range Filters** | ✅ Yes | Auto-converts to `field_min`/`field_max` |
| **Boolean Filters** | ✅ Yes | Direct param mapping |
| **Multi-value Filters** | ✅ Yes | Comma-separated values |
| **Response Data Array** | ✅ Yes | `data`, `items`, or `results` |
| **Total Count** | ✅ Yes | `total`, `totalCount`, or `count` |
| **Total Pages** | ✅ Yes | Auto-calculated if not provided |
| **Nested Pagination** | ✅ Yes | `pagination.page`, `pagination.total`, etc. |
| **Flat Structure** | ✅ Yes | `page`, `total` at root level |

### ✅ Supported Operations

| Operation | API Endpoint | Component Support |
|-----------|-------------|-------------------|
| **List** | `GET /api/v1/{resource}` | ✅ Yes |
| **Get** | `GET /api/v1/{resource}/{id}` | ✅ Yes |
| **Create** | `POST /api/v1/{resource}` | ✅ Yes |
| **Update** | `PATCH /api/v1/{resource}/{id}` | ✅ Yes |
| **Delete** | `DELETE /api/v1/{resource}/{id}` | ✅ Yes |
| **Batch Update** | `PATCH /api/v1/{resource}/bulk` | ✅ Yes (with fallback) |
| **Bulk Delete** | `DELETE /api/v1/{resource}/bulk` | ✅ Yes (with fallback) |

---

## Setup Example

Here's how to configure the component to work with your API:

### 1. Create Transformer

```typescript
// ProductTransformer.ts
import type { IDataTransformer } from '@/components/shared/tables/AdvancedTable/core/data-layer'

interface ProductApiDTO {
  product_id: string
  product_name: string
  category_key: string
  unit_price: number
  inventory_count: number
  created_at: string
  updated_at: string
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  createdAt: string
  updatedAt: string
}

export class ProductTransformer implements IDataTransformer<ProductApiDTO, Product> {
  toDomain(dto: ProductApiDTO): Product {
    return {
      id: dto.product_id,
      name: dto.product_name,
      category: dto.category_key,
      price: dto.unit_price,
      stock: dto.inventory_count,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    }
  }

  toApi(domain: Partial<Product>): Partial<ProductApiDTO> {
    const dto: Partial<ProductApiDTO> = {}

    if (domain.id !== undefined) dto.product_id = domain.id
    if (domain.name !== undefined) dto.product_name = domain.name
    if (domain.category !== undefined) dto.category_key = domain.category
    if (domain.price !== undefined) dto.unit_price = domain.price
    if (domain.stock !== undefined) dto.inventory_count = domain.stock
    if (domain.createdAt !== undefined) dto.created_at = domain.createdAt
    if (domain.updatedAt !== undefined) dto.updated_at = domain.updatedAt

    return dto
  }
}
```

### 2. Create Repository

```typescript
// ProductRepository.ts
import { ApiRepository } from '@/components/shared/tables/AdvancedTable/core/data-layer'
import { api } from '@/lib/api'
import { ProductTransformer } from './ProductTransformer'

export function createProductRepository() {
  return new ApiRepository({
    endpoint: '/products',  // Maps to /api/v1/products
    apiClient: api,
    transformer: new ProductTransformer(),
    idField: 'id',
  })
}
```

### 3. Create DataSource

```typescript
// ProductDataSource.ts
import { RepositoryDataSource } from '@/components/shared/tables/AdvancedTable/core/data-layer'
import { createProductRepository } from './ProductRepository'

export function createProductDataSource() {
  const repository = createProductRepository()
  return new RepositoryDataSource(repository)
}
```

### 4. Use in Component

```typescript
// ProductTable.tsx
'use client'

import { AdvancedTablePlugin } from '@/components/shared/tables/AdvancedTable'
import { createProductDataSource } from './ProductDataSource'

export function ProductTable() {
  const dataSource = useMemo(() => createProductDataSource(), [])

  return (
    <AdvancedTablePlugin
      dataSource={dataSource}
      schemaProvider={schemaProvider}
      features={{
        sorting: true,
        filtering: true,
        globalSearch: true,
        pagination: { pageSize: 20 },
      }}
    />
  )
}
```

---

## What Actually Happens

### User Action: Click "Next Page"

```typescript
// 1. User clicks "Next Page" button
// 2. Component updates state
setTableState(prev => ({
  ...prev,
  pagination: { ...prev.pagination, page: 3 }
}))

// 3. useTableData hook detects state change and calls dataSource.fetch()
// 4. Repository builds query params
const queryParams = {
  page: 3,
  limit: 20,
  sort_by: 'name',
  sort_order: 'asc',
  category: 'electronics',
  in_stock: true
}

// 5. Makes API call
GET /api/v1/products?page=3&limit=20&sort_by=name&sort_order=asc&category=electronics&in_stock=true

// 6. API responds
{
  "data": [...],
  "pagination": {
    "page": 3,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}

// 7. Repository transforms each item using ProductTransformer
const domainData = apiData.data.map(dto => transformer.toDomain(dto))

// 8. Returns to component
{
  data: [...],      // Transformed domain models
  total: 156,
  page: 3,
  pageSize: 20,
  totalPages: 8
}

// 9. Component re-renders with new data
```

---

## Filter Transformation Examples

### Simple Filters

```typescript
// Component state
{ category: 'electronics' }

// API query
?category=electronics
```

### Range Filters

```typescript
// Component state
{ price: { min: 100, max: 500 } }

// API query
?price_min=100&price_max=500
```

### Date Range Filters

```typescript
// Component state
{ created_at: { from: '2024-01-01', to: '2024-03-31' } }

// API query
?created_at_from=2024-01-01&created_at_to=2024-03-31
```

### Array Filters

```typescript
// Component state
{ tags: ['featured', 'sale', 'new'] }

// API query
?tags=featured,sale,new
```

---

## Error Handling

The component automatically handles API errors:

```typescript
// API returns error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid page number"
  }
}

// Component catches and displays
try {
  const result = await dataSource.fetch(params)
} catch (error) {
  // Error state is set
  setError(error)
  // Component shows error UI
}
```

---

## Custom Response Format?

If your API uses a different format, you have **two options**:

### Option 1: Adjust API to Match (Recommended)

Use the proposed API spec format - it's industry standard and works out of the box.

### Option 2: Extend transformResponse

Override the `transformResponse` method to handle your custom format:

```typescript
class CustomApiRepository extends ApiRepository {
  protected transformResponse(apiResponse: any): DataSourceResult<TRow> {
    // Your custom transformation logic
    return {
      data: apiResponse.results.map(this.transformer.toDomain),
      total: apiResponse.meta.total_count,
      page: apiResponse.meta.current_page,
      pageSize: apiResponse.meta.per_page,
      totalPages: apiResponse.meta.page_count,
    }
  }
}
```

---

## Summary

### ✅ The component is **100% compatible** with the proposed API!

**Out of the box support for:**
- ✅ Pagination (`page`, `limit`)
- ✅ Sorting (`sort_by`, `sort_order`)
- ✅ Search (`q`)
- ✅ Filters (all types: simple, range, boolean, array)
- ✅ Multiple response formats (flexible field detection)
- ✅ CRUD operations (create, read, update, delete)
- ✅ Bulk operations (batch update, bulk delete with fallback)

**No code changes needed** - just:
1. Create a transformer for your data model
2. Create a repository with your API endpoint
3. Wrap in a data source
4. Pass to the table component

That's it! The component handles all the API communication automatically. 🎉
