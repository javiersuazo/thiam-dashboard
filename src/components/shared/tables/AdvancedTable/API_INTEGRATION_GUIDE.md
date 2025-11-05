# API Integration Guide - How to Connect AdvancedTable to Your Backend

## How the Table Calls Your API

The AdvancedTable uses a **DataSource** pattern to communicate with your API. Here's exactly how it works:

### 1. The DataSource Interface

```typescript
interface IDataSource<TRow = any> {
  fetch(params: DataSourceParams): Promise<DataSourceResult<TRow>>

  create?(data: Partial<TRow>): Promise<TRow>
  update?(id: string, data: Partial<TRow>): Promise<TRow>
  delete?(id: string): Promise<void>

  bulkDelete?(ids: string[]): Promise<BulkOperationResult>
  batchUpdate?(updates: Record<string, Partial<TRow>>): Promise<BulkOperationResult>
}
```

### 2. What the Table Sends (DataSourceParams)

When the table needs data, it calls `dataSource.fetch(params)` with this structure:

```typescript
interface DataSourceParams {
  pagination?: {
    page: number        // Current page (1-indexed)
    pageSize: number    // Items per page (10, 20, 50, etc.)
  }
  sorting?: Array<{
    field: string       // Column key (e.g., "category", "price")
    direction: 'asc' | 'desc'
  }>
  filters?: Record<string, any>  // Filter values by column key
  search?: string      // Global search term
}
```

### 3. What Your API Should Return (DataSourceResult)

Your API endpoint must return this structure:

```typescript
interface DataSourceResult<TRow = any> {
  data: TRow[]         // Array of items for current page
  total: number        // Total count of all items (for pagination)
  page: number         // Current page number
  pageSize: number     // Items per page
  totalPages: number   // Total number of pages
}
```

---

## Real-World Example: Products Table

### Frontend Setup

```typescript
import { api } from '@/lib/api'
import type { IDataSource, DataSourceParams, DataSourceResult } from '@/components/shared/tables/AdvancedTable'

interface Product {
  id: string
  name: string
  category: string      // API returns key: "electronics"
  status: string        // API returns key: "active"
  price: number
  stock: number
  createdAt: string
}

class ProductsDataSource implements IDataSource<Product> {
  async fetch(params: DataSourceParams): Promise<DataSourceResult<Product>> {
    // Convert table params to API query parameters
    const queryParams: Record<string, any> = {}

    // 1. Pagination
    if (params.pagination) {
      queryParams.page = params.pagination.page
      queryParams.limit = params.pagination.pageSize
    }

    // 2. Sorting
    if (params.sorting && params.sorting.length > 0) {
      const sort = params.sorting[0]
      queryParams.sort_by = sort.field       // e.g., "price"
      queryParams.sort_order = sort.direction // "asc" or "desc"
    }

    // 3. Filters (column-specific)
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle different filter types
          if (Array.isArray(value)) {
            // Multi-select: ["electronics", "clothing"]
            queryParams[field] = value.join(',')
          } else if (typeof value === 'object' && 'min' in value) {
            // Range filter: { min: 10, max: 100 }
            queryParams[`${field}_min`] = value.min
            queryParams[`${field}_max`] = value.max
          } else {
            // Single value: "electronics"
            queryParams[field] = value
          }
        }
      })
    }

    // 4. Global search
    if (params.search) {
      queryParams.q = params.search
    }

    // Make API call
    const { data, error } = await api.GET('/products', {
      params: { query: queryParams }
    })

    if (error) throw new Error(error.message)

    // Transform API response to DataSourceResult format
    return {
      data: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.limit || 10,
      totalPages: Math.ceil((data.total || 0) / (data.limit || 10))
    }
  }

  async create(data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await api.POST('/products', { body: data })
    if (error) throw new Error(error.message)
    return product
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await api.PATCH('/products/{id}', {
      params: { path: { id } },
      body: data
    })
    if (error) throw new Error(error.message)
    return product
  }

  async delete(id: string): Promise<void> {
    const { error } = await api.DELETE('/products/{id}', {
      params: { path: { id } }
    })
    if (error) throw new Error(error.message)
  }
}

// Use in your component
const dataSource = useMemo(() => new ProductsDataSource(), [])

<AdvancedTablePlugin
  dataSource={dataSource}
  // ... other props
/>
```

---

## API Call Examples

### Example 1: Initial Load

**Table State:**
- Page 1
- 10 items per page
- No filters
- No sorting

**DataSourceParams:**
```typescript
{
  pagination: { page: 1, pageSize: 10 }
}
```

**API Call:**
```http
GET /products?page=1&limit=10
```

**API Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "Laptop Pro 15",
      "category": "electronics",
      "status": "active",
      "price": 1299,
      "stock": 45,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "total": 127,
  "page": 1,
  "limit": 10
}
```

**What Table Displays:**
- Shows "Laptop Pro 15" with category translated to "Electronics" (EN) or "Electrónica" (ES)
- Shows "Showing 1 to 10 of 127 entries"

---

### Example 2: User Filters by Category

**User Actions:**
1. Opens category filter dropdown
2. Selects "Electronics" (value: "electronics")

**DataSourceParams:**
```typescript
{
  pagination: { page: 1, pageSize: 10 },
  filters: {
    category: "electronics"  // ← Filter by key, not translated label
  }
}
```

**API Call:**
```http
GET /products?page=1&limit=10&category=electronics
```

**IMPORTANT:** The API receives `"electronics"` (the key), NOT `"Electronics"` or `"Electrónica"` (the translated labels). This ensures filters work regardless of user language.

---

### Example 3: Multiple Filters + Sorting + Search

**User Actions:**
1. Searches for "laptop"
2. Filters by category = "electronics"
3. Filters by price range = $500-$2000
4. Filters by status = "active" OR "pending"
5. Sorts by price descending
6. Goes to page 2

**DataSourceParams:**
```typescript
{
  pagination: { page: 2, pageSize: 10 },
  sorting: [{ field: 'price', direction: 'desc' }],
  filters: {
    category: "electronics",
    price: { min: 500, max: 2000 },
    status: ["active", "pending"]
  },
  search: "laptop"
}
```

**API Call:**
```http
GET /products?page=2&limit=10&sort_by=price&sort_order=desc&q=laptop&category=electronics&price_min=500&price_max=2000&status=active,pending
```

**API Response:**
```json
{
  "items": [
    {
      "id": "11",
      "name": "Gaming Laptop Pro",
      "category": "electronics",
      "status": "active",
      "price": 1899,
      "stock": 12,
      "createdAt": "2024-02-10T00:00:00Z"
    }
  ],
  "total": 23,
  "page": 2,
  "limit": 10
}
```

---

## Backend Implementation Example (Node.js/Express)

```typescript
import { Request, Response } from 'express'
import { db } from './database'

export async function getProducts(req: Request, res: Response) {
  // 1. Extract query parameters
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const sortBy = req.query.sort_by as string
  const sortOrder = req.query.sort_order as 'asc' | 'desc'
  const search = req.query.q as string

  // 2. Build database query
  let query = db('products').select('*')

  // 3. Apply search
  if (search) {
    query = query.where('name', 'ilike', `%${search}%`)
  }

  // 4. Apply filters
  if (req.query.category) {
    query = query.where('category', req.query.category)
  }

  if (req.query.status) {
    const statuses = (req.query.status as string).split(',')
    query = query.whereIn('status', statuses)
  }

  if (req.query.price_min) {
    query = query.where('price', '>=', parseFloat(req.query.price_min as string))
  }

  if (req.query.price_max) {
    query = query.where('price', '<=', parseFloat(req.query.price_max as string))
  }

  // 5. Get total count (before pagination)
  const [{ count }] = await query.clone().count('* as count')
  const total = parseInt(count)

  // 6. Apply sorting
  if (sortBy) {
    query = query.orderBy(sortBy, sortOrder || 'asc')
  }

  // 7. Apply pagination
  const offset = (page - 1) * limit
  query = query.limit(limit).offset(offset)

  // 8. Execute query
  const items = await query

  // 9. Return response in expected format
  res.json({
    items,
    total,
    page,
    limit
  })
}
```

---

## Backend Implementation Example (Go)

```go
package handlers

import (
    "net/http"
    "strconv"
    "strings"

    "github.com/gin-gonic/gin"
)

type ProductsResponse struct {
    Items      []Product `json:"items"`
    Total      int       `json:"total"`
    Page       int       `json:"page"`
    Limit      int       `json:"limit"`
}

func GetProducts(c *gin.Context) {
    // 1. Extract query parameters
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    sortBy := c.Query("sort_by")
    sortOrder := c.DefaultQuery("sort_order", "asc")
    search := c.Query("q")

    // 2. Build database query
    query := db.Model(&Product{})

    // 3. Apply search
    if search != "" {
        query = query.Where("name ILIKE ?", "%"+search+"%")
    }

    // 4. Apply filters
    if category := c.Query("category"); category != "" {
        query = query.Where("category = ?", category)
    }

    if status := c.Query("status"); status != "" {
        statuses := strings.Split(status, ",")
        query = query.Where("status IN ?", statuses)
    }

    if priceMin := c.Query("price_min"); priceMin != "" {
        min, _ := strconv.ParseFloat(priceMin, 64)
        query = query.Where("price >= ?", min)
    }

    if priceMax := c.Query("price_max"); priceMax != "" {
        max, _ := strconv.ParseFloat(priceMax, 64)
        query = query.Where("price <= ?", max)
    }

    // 5. Get total count
    var total int64
    query.Count(&total)

    // 6. Apply sorting
    if sortBy != "" {
        query = query.Order(sortBy + " " + sortOrder)
    }

    // 7. Apply pagination
    offset := (page - 1) * limit
    query = query.Limit(limit).Offset(offset)

    // 8. Execute query
    var items []Product
    if err := query.Find(&items).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 9. Return response
    c.JSON(http.StatusOK, ProductsResponse{
        Items: items,
        Total: int(total),
        Page:  page,
        Limit: limit,
    })
}
```

---

## Filter Type Handling

### Single Select Filter
```typescript
// User selects one option
filters: {
  category: "electronics"
}

// API receives
?category=electronics
```

### Multi-Select Filter
```typescript
// User selects multiple options
filters: {
  status: ["active", "pending", "draft"]
}

// API receives
?status=active,pending,draft

// Backend parses
const statuses = req.query.status.split(',')
query.whereIn('status', statuses)
```

### Range Filter (Numbers)
```typescript
// User sets min and max
filters: {
  price: { min: 500, max: 2000 }
}

// API receives
?price_min=500&price_max=2000

// Backend applies
WHERE price >= 500 AND price <= 2000
```

### Range Filter (Dates)
```typescript
// User picks date range
filters: {
  createdAt: { min: '2024-01-01', max: '2024-12-31' }
}

// API receives
?createdAt_min=2024-01-01&createdAt_max=2024-12-31

// Backend applies
WHERE created_at >= '2024-01-01' AND created_at <= '2024-12-31'
```

### Boolean Filter
```typescript
// User toggles checkbox
filters: {
  inStock: true
}

// API receives
?inStock=true

// Backend applies
WHERE in_stock = true
```

---

## Important: Filters Use Keys, Not Translated Labels

### ✅ Correct Pattern

```typescript
// Column definition
{
  key: 'category',
  valueTranslationKey: 'categories',
  options: [
    { value: 'electronics', label: 'Electronics', translationKey: 'categories.electronics' }
  ]
}

// User sees in dropdown (EN): "Electronics"
// User sees in dropdown (ES): "Electrónica"

// But API always receives the key
filters: { category: "electronics" }
```

This ensures:
1. Filters work regardless of user language
2. Database queries use consistent values
3. Backend doesn't need to handle translations

---

## Testing Your Integration

### 1. Test Initial Load
```bash
curl "http://localhost:8080/api/products?page=1&limit=10"
```

### 2. Test Filters
```bash
curl "http://localhost:8080/api/products?page=1&limit=10&category=electronics"
```

### 3. Test Multiple Filters
```bash
curl "http://localhost:8080/api/products?page=1&limit=10&category=electronics&status=active,pending&price_min=500&price_max=2000"
```

### 4. Test Sorting
```bash
curl "http://localhost:8080/api/products?page=1&limit=10&sort_by=price&sort_order=desc"
```

### 5. Test Search
```bash
curl "http://localhost:8080/api/products?page=1&limit=10&q=laptop"
```

### 6. Test Everything Combined
```bash
curl "http://localhost:8080/api/products?page=2&limit=20&sort_by=price&sort_order=desc&q=laptop&category=electronics&status=active&price_min=500&price_max=2000"
```

---

## Common Patterns

### Pattern 1: Simple REST API

```typescript
class RestDataSource<T> implements IDataSource<T> {
  constructor(private endpoint: string) {}

  async fetch(params: DataSourceParams): Promise<DataSourceResult<T>> {
    const url = new URL(`${API_BASE_URL}${this.endpoint}`)

    if (params.pagination) {
      url.searchParams.set('page', params.pagination.page.toString())
      url.searchParams.set('limit', params.pagination.pageSize.toString())
    }

    if (params.search) {
      url.searchParams.set('q', params.search)
    }

    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        url.searchParams.set(key, String(value))
      })
    }

    const response = await fetch(url.toString())
    return response.json()
  }
}

// Use it
const dataSource = new RestDataSource('/products')
```

### Pattern 2: GraphQL API

```typescript
class GraphQLDataSource<T> implements IDataSource<T> {
  async fetch(params: DataSourceParams): Promise<DataSourceResult<T>> {
    const query = `
      query Products($page: Int, $limit: Int, $filters: ProductFilters) {
        products(page: $page, limit: $limit, filters: $filters) {
          items { id name category price }
          total
          page
          pageSize
        }
      }
    `

    const response = await graphqlClient.query({
      query,
      variables: {
        page: params.pagination?.page,
        limit: params.pagination?.pageSize,
        filters: params.filters
      }
    })

    return response.data.products
  }
}
```

---

## Summary

1. **Table sends params** via `dataSource.fetch(params)`
2. **You convert params** to your API's query format
3. **API returns data** in `DataSourceResult` format
4. **Table renders data** with translations applied
5. **Filters always use keys**, never translated labels
6. **API receives consistent values** regardless of user language
